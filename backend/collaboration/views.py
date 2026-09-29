from django.db.models import Q
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from notifications.services import notify
from admin_panel.services import log_event

from .models import CollaborationOpportunity, MentorshipRequest
from .serializers import (
    CollaborationOpportunitySerializer,
    MentorshipRequestSerializer,
)


class CollaborationOpportunityViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Post and browse collaboration opportunities."""

    serializer_class = CollaborationOpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = CollaborationOpportunity.objects.select_related("owner").prefetch_related("skills")
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        return qs

    def get_object(self):
        obj = super().get_object()
        if self.action in ("update", "partial_update", "destroy") and obj.owner_id != self.request.user.id:
            if self.request.user.role != "admin":
                raise PermissionDenied("You can only modify your own opportunities.")
        return obj

    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class MentorshipRequestViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Mentorship requests: sent by students, reviewed by mentors."""

    serializer_class = MentorshipRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if self.action == "list":
            scope = self.request.query_params.get("scope", "inbox")
            if scope == "sent":
                qs = MentorshipRequest.objects.filter(mentee=user)
            else:
                qs = MentorshipRequest.objects.filter(mentor=user)
        else:
            qs = MentorshipRequest.objects.filter(Q(mentor=user) | Q(mentee=user))
        return qs.select_related("mentor", "mentee")

    def perform_create(self, serializer):
        serializer.save(mentee=self.request.user)

    def get_object(self):
        obj = super().get_object()
        if obj.mentor_id != self.request.user.id and obj.mentee_id != self.request.user.id:
            raise PermissionDenied("You are not part of this request.")
        return obj

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        req = self.get_object()
        status = request.data.get("status")
        if status not in ("approved", "denied"):
            raise ValidationError({"status": "Must be 'approved' or 'denied'."})
        if req.mentor_id != request.user.id:
            raise PermissionDenied("Only the mentor can review this request.")
        req.status = status
        req.save(update_fields=["status"])
        log_event(
            actor=request.user,
            action="mentorship.reviewed",
            subject_type="mentorship_request",
            subject_id=req.id,
            detail=f"{status} mentorship request from {req.mentee.display_name}",
        )
        if status == "approved":
            notify(
                recipient=req.mentee,
                actor=req.mentor,
                notification_type="mentorship",
                title="Mentorship request approved",
                message=f"{req.mentor.display_name} approved your mentorship request.",
            )
        return Response(self.get_serializer(req).data)