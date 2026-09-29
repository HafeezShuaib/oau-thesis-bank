from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdmin(BasePermission):
    """Allow access only to admin role users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsAdminOrReadOnly(BasePermission):
    """Allow read access to anyone, writes only to admins."""

    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS
            or (request.user and request.user.is_authenticated and request.user.role == "admin")
        )


class IsActiveUser(BasePermission):
    """Block suspended/pending users from acting. Anonymous read access stays open."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return request.method in SAFE_METHODS
        return request.user.status == "active"


def is_admin(user):
    return bool(user and user.is_authenticated and user.role == "admin")