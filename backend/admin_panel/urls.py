from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ActivityView, AdminSummaryView, HealthView, ModerationViewSet, UserManagementViewSet

router = DefaultRouter()
router.register("moderation", ModerationViewSet, basename="admin-moderation")
router.register("users", UserManagementViewSet, basename="admin-user")

urlpatterns = [
    path("", include(router.urls)),
    path("summary/", AdminSummaryView.as_view(), name="admin-summary"),
    path("activity/", ActivityView.as_view(), name="admin-activity"),
    path("health/", HealthView.as_view(), name="admin-health"),
]