from django.db import connection
from django.db.models import Count, Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from theses.models import AccessRequest, Thesis

from .models import AuditEvent, ModerationItem
from .permissions import IsAdminUser
from .serializers import (
    AdminSummarySerializer,
    AuditEventSerializer,
    ModerationItemSerializer,
    ModerationReviewSerializer,
    UserAdminSerializer,
    UserUpdateSerializer,
)
from .services import log_event


def _check_db():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            return cursor.fetchone()[0] == 1
    except Exception:
        return False


def _check_storage():
    try:
        from django.core.files.storage import default_storage

        default_storage.url("healthcheck")
        return True
    except Exception:
        return False


@extend_schema(responses={200: AdminSummarySerializer})
class AdminSummaryView(APIView):
    """Dashboard totals, moderation queue counts, service health and recent activity."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        moderation_by_type = (
            ModerationItem.objects.filter(status=ModerationItem.Status.PENDING)
            .values("flag_type")
            .annotate(count=Count("id"))
        )
        return Response(
            {
                "total_theses": Thesis.objects.count(),
                "published_theses": Thesis.objects.filter(status=Thesis.Status.PUBLISHED).count(),
                "draft_theses": Thesis.objects.filter(status=Thesis.Status.DRAFT).count(),
                "restricted_theses": Thesis.objects.filter(
                    access_policy=Thesis.AccessPolicy.RESTRICTED
                ).count(),
                "total_users": User.objects.count(),
                "active_users": User.objects.filter(status=User.Status.ACTIVE).count(),
                "suspended_users": User.objects.filter(status=User.Status.SUSPENDED).count(),
                "pending_moderation": ModerationItem.objects.filter(
                    status=ModerationItem.Status.PENDING
                ).count(),
                "pending_access_requests": AccessRequest.objects.filter(
                    status=AccessRequest.Status.PENDING
                ).count(),
                "moderation_by_type": {item["flag_type"]: item["count"] for item in moderation_by_type},
                "health": {
                    "db": "ok" if _check_db() else "error",
                    "storage": "ok" if _check_storage() else "error",
                },
                "recent_activity": AuditEventSerializer(
                    AuditEvent.objects.select_related("actor")[:10], many=True
                ).data,
            }
        )


class ModerationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Review flagged theses (moderation queue)."""

    serializer_class = ModerationItemSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = (
            ModerationItem.objects.select_related("thesis", "reporter", "reviewer")
            .order_by("status", "-created_at")
        )
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        flag_type = self.request.query_params.get("flag_type")
        if flag_type:
            qs = qs.filter(flag_type=flag_type)
        search = (self.request.query_params.get("q") or "").strip()
        if search:
            qs = qs.filter(
                Q(thesis__title__icontains=search)
                | Q(thesis__author__icontains=search)
                | Q(thesis__department__icontains=search)
            )
        return qs

    @extend_schema(request=ModerationReviewSerializer, responses={200: ModerationItemSerializer})
    @action(detail=True, methods=["patch"])
    def review(self, request, pk=None):
        item = self.get_object()
        serializer = ModerationReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        decision = serializer.validated_data["decision"]
        note = serializer.validated_data.get("note", "")
        item.status = (
            ModerationItem.Status.APPROVED if decision == "approved" else ModerationItem.Status.DISMISSED
        )
        item.reviewer = request.user
        item.reviewed_at = timezone.now()
        if note:
            item.note = note
        item.save()
        log_event(
            actor=request.user,
            action="moderation.reviewed",
            subject_type="moderation_item",
            subject_id=item.id,
            detail=f"{decision} '{item.thesis.title}'",
        )
        return Response(self.get_serializer(item).data)


class UserManagementViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """List and update users (roles/status) for the admin user management screen."""

    serializer_class = UserAdminSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = User.objects.all()
        search = (self.request.query_params.get("search") or "").strip()
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        return qs.order_by("-date_joined")

    @extend_schema(request=UserUpdateSerializer, responses={200: UserAdminSerializer})
    @action(detail=True, methods=["patch"])
    def update_access(self, request, pk=None):
        user = self.get_object()
        serializer = UserUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.validated_data.get("role")
        if role is not None and user.role != role:
            if user.id == request.user.id:
                raise ValidationError({"role": "You cannot change your own role."})
            if user.role == User.Role.ADMIN and role != User.Role.ADMIN:
                if User.objects.filter(role=User.Role.ADMIN, status=User.Status.ACTIVE).count() <= 1:
                    raise ValidationError({"role": "Cannot remove the last active admin."})
            user.role = role
        new_status = serializer.validated_data.get("status")
        if new_status is not None and user.status != new_status:
            if user.id == request.user.id and new_status != User.Status.ACTIVE:
                raise ValidationError({"status": "You cannot deactivate your own account."})
            if user.role == User.Role.ADMIN and new_status != User.Status.ACTIVE:
                if User.objects.filter(role=User.Role.ADMIN, status=User.Status.ACTIVE).count() <= 1:
                    raise ValidationError({"status": "Cannot deactivate the last active admin."})
            user.status = new_status
        user.save()
        log_event(
            actor=request.user,
            action="user.updated",
            subject_type="user",
            subject_id=user.id,
            detail=f"role='{role}' status='{new_status}'" if role or new_status else "updated",
        )
        return Response(UserAdminSerializer(user).data)


class ActivityView(ListAPIView):
    """Recent platform activity (admin control center live feed)."""

    serializer_class = AuditEventSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        limit = int(self.request.query_params.get("limit", 25))
        return AuditEvent.objects.select_related("actor")[:max(1, min(limit, 200))]


class HealthView(APIView):
    """Service health for the admin control center."""

    permission_classes = [IsAdminUser]

    @extend_schema(responses={200: {}})
    def get(self, request):
        return Response(
            {
                "status": "ok",
                "checks": {
                    "db": "ok" if _check_db() else "error",
                    "storage": "ok" if _check_storage() else "error",
                },
            }
        )