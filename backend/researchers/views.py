from rest_framework import mixins, permissions, viewsets

from accounts.models import User

from .models import ResearcherProfile
from .serializers import ResearcherProfileSerializer


class CanManageProfile(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if view.action in ("retrieve", "list"):
            return True
        if user.role == "admin":
            return True
        return obj.user_id == user.id


class ResearcherProfileViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Public directory of researcher profiles; only the owner (or admin) can edit."""

    serializer_class = ResearcherProfileSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageProfile]
    lookup_field = "user_id"

    def get_queryset(self):
        qs = ResearcherProfile.objects.select_related("user").order_by("user__last_name", "user__first_name")
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(user__role=role)
        mentoring = self.request.query_params.get("mentoring")
        if mentoring in ("true", "1"):
            qs = qs.filter(is_available_for_mentoring=True)
        return qs

    def get_object(self):
        """Support lookup by user id (pk) or by the 'me' keyword."""
        lookup = self.kwargs.get(self.lookup_url_kwarg or self.lookup_field)
        if lookup == "me":
            self.kwargs[self.lookup_url_kwarg or self.lookup_field] = self.request.user.id
            obj, _ = ResearcherProfile.objects.get_or_create(user=self.request.user)
            self.check_object_permissions(self.request, obj)
            return obj
        return super().get_object()