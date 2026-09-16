from django.db.models import F, Q
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from accounts.permissions import IsActiveUser
from admin_panel.models import ModerationItem
from admin_panel.serializers import ModerationItemSerializer
from admin_panel.services import log_event
from notifications.models import Notification
from notifications.services import notify

from .models import AccessRequest, SavedThesis, Thesis
from .serializers import AccessRequestSerializer, ThesisListSerializer, ThesisSerializer


def _can_view_thesis(thesis, user):
    """Server-side access policy enforcement."""
    authenticated = bool(user and user.is_authenticated)
    if authenticated and (thesis.owner_id == user.id or user.role == "admin"):
        return True
    if thesis.is_public():
        return thesis.status == Thesis.Status.PUBLISHED
    if authenticated:
        approved = AccessRequest.objects.filter(
            thesis=thesis, requester=user, status=AccessRequest.Status.APPROVED
        ).exists()
        if approved:
            return True
    return False


class ThesisViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly, IsActiveUser]
    lookup_field = "id"
    lookup_value_regex = "[0-9]+"

    def get_serializer_class(self):
        if self.action == "list":
            return ThesisListSerializer
        return ThesisSerializer

    def get_queryset(self):
        """List: only published public theses. Detail/actions: enforce access policy."""
        user = self.request.user
        if self.action in (
            "retrieve",
            "update",
            "partial_update",
            "destroy",
            "download",
            "save",
            "unsave",
            "flag",
        ):
            qs = Thesis.objects.select_related("owner").prefetch_related("tags")
            return qs.prefetch_related("access_requests")
        # Listing never leaks draft/restricted/private content.
        return (
            Thesis.objects.select_related("owner")
            .prefetch_related("tags")
            .filter(status=Thesis.Status.PUBLISHED, access_policy=Thesis.AccessPolicy.PUBLIC)
        )

    def perform_create(self, serializer):
        thesis = serializer.save()
        log_event(
            actor=self.request.user,
            action="thesis.uploaded",
            subject_type="thesis",
            subject_id=thesis.id,
            detail=f"'{thesis.title}' (status={thesis.status})",
        )

    def retrieve(self, request, *args, **kwargs):
        thesis = self.get_object()
        if not _can_view_thesis(thesis, request.user):
            return Response(
                {"detail": "You do not have access to this thesis."}, status=status.HTTP_403_FORBIDDEN
            )
        if not request.user.is_authenticated or request.user.id != thesis.owner_id:
            Thesis.objects.filter(pk=thesis.pk).update(views=F("views") + 1)
        serializer = self.get_serializer(thesis)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        thesis = self.get_object()
        if thesis.owner_id != request.user.id and request.user.role != "admin":
            return Response(
                {"detail": "Only the owner (or an admin) may edit this thesis."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        thesis = self.get_object()
        if thesis.owner_id != request.user.id and request.user.role != "admin":
            return Response(
                {"detail": "Only the owner (or an admin) may delete this thesis."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated, IsActiveUser])
    def mine(self, request):
        theses = (
            Thesis.objects.select_related("owner")
            .prefetch_related("tags")
            .filter(owner=request.user)
            .order_by("-created_at")
        )
        serializer = ThesisSerializer(theses, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsActiveUser])
    def save(self, request, id=None):
        thesis = self.get_object()
        if thesis.owner_id == request.user.id:
            return Response({"detail": "You cannot save your own thesis."}, status=status.HTTP_400_BAD_REQUEST)
        _, created = SavedThesis.objects.get_or_create(user=request.user, thesis=thesis)
        return Response({"saved": True, "created": created})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsActiveUser])
    def flag(self, request, id=None):
        thesis = self.get_object()
        if thesis.owner_id == request.user.id:
            return Response({"detail": "You cannot flag your own thesis."}, status=status.HTTP_400_BAD_REQUEST)
        flag_type = (request.data.get("flag_type") or "").strip()
        if flag_type not in ModerationItem.FlagType.values:
            return Response(
                {"detail": "flag_type must be one of: high_similarity, standard_review, metadata."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if ModerationItem.objects.filter(
            thesis=thesis, status=ModerationItem.Status.PENDING
        ).exists():
            return Response(
                {"detail": "This thesis already has a pending moderation flag."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item = ModerationItem.objects.create(
            thesis=thesis,
            flag_type=flag_type,
            similarity_score=request.data.get("similarity_score"),
            note=request.data.get("note", ""),
            reporter=request.user,
        )
        log_event(
            actor=request.user,
            action="moderation.flagged",
            subject_type="moderation_item",
            subject_id=item.id,
            detail=f"flagged '{thesis.title}' as {flag_type}",
        )
        return Response(ModerationItemSerializer(item).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsActiveUser])
    def unsave(self, request, id=None):
        thesis = self.get_object()
        SavedThesis.objects.filter(user=request.user, thesis=thesis).delete()
        return Response({"saved": False})

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated, IsActiveUser])
    def saved(self, request):
        thesis_ids = SavedThesis.objects.filter(user=request.user).values_list("thesis_id", flat=True)
        theses = (
            Thesis.objects.select_related("owner")
            .prefetch_related("tags")
            .filter(id__in=thesis_ids)
            .order_by("-created_at")
        )
        serializer = ThesisSerializer(theses, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticatedOrReadOnly, IsActiveUser])
    def download(self, request, id=None):
        thesis = self.get_object()
        if not _can_view_thesis(thesis, request.user):
            return Response({"detail": "You do not have access to this thesis."}, status=status.HTTP_403_FORBIDDEN)
        if not thesis.file:
            return Response({"detail": "No file uploaded for this thesis."}, status=status.HTTP_404_NOT_FOUND)
        if not request.user.is_authenticated or request.user.id != thesis.owner_id:
            Thesis.objects.filter(pk=thesis.pk).update(downloads=F("downloads") + 1)
        return FileResponse(thesis.file.open("rb"), as_attachment=True, filename=f"{thesis.slug}.pdf")


class AccessRequestViewSet(viewsets.ModelViewSet):
    serializer_class = AccessRequestSerializer
    permission_classes = [IsAuthenticated, IsActiveUser]
    http_method_names = ["get", "post", "patch"]

    def get_queryset(self):
        user = self.request.user
        # Requesters see their own requests; owners see requests on their theses.
        return AccessRequest.objects.filter(
            Q(requester=user) | Q(thesis__owner=user)
        ).select_related("thesis", "requester")

    def perform_create(self, serializer):
        access_request = serializer.save(requester=self.request.user)
        notify(
            recipient=access_request.thesis.owner,
            actor=self.request.user,
            notification_type=Notification.Type.ACCESS_REQUEST,
            title="New access request",
            message=f"{self.request.user.display_name} requested access to '{access_request.thesis.title}'.",
        )

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated, IsActiveUser])
    def review(self, request, pk=None):
        access_request = get_object_or_404(self.get_queryset(), pk=pk)
        if request.user.id != access_request.thesis.owner_id and request.user.role != "admin":
            return Response(
                {"detail": "Only the thesis owner may review this request."}, status=status.HTTP_403_FORBIDDEN
            )
        decision = request.data.get("status")
        if decision not in ("approved", "denied"):
            return Response(
                {"detail": "status must be 'approved' or 'denied'."}, status=status.HTTP_400_BAD_REQUEST
            )
        access_request.status = AccessRequest.Status.APPROVED if decision == "approved" else AccessRequest.Status.DENIED
        access_request.save()
        log_event(
            actor=request.user,
            action="access_request.reviewed",
            subject_type="access_request",
            subject_id=access_request.id,
            detail=f"{decision} request on '{access_request.thesis.title}'",
        )
        notify(
            recipient=access_request.requester,
            actor=request.user,
            notification_type=Notification.Type.ACCESS_REQUEST,
            title=f"Access request {access_request.status}",
            message=f"Your request for '{access_request.thesis.title}' was {access_request.status}.",
        )
        return Response(self.get_serializer(access_request).data)