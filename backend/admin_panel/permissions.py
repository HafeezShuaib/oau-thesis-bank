from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Admin-only access based on the custom role (not django is_staff)."""

    message = "Admin privileges required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")