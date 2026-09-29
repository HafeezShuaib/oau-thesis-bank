from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AccessRequestViewSet, ThesisViewSet

router = DefaultRouter()
router.register("", ThesisViewSet, basename="thesis")
router.register("access-requests", AccessRequestViewSet, basename="access-request")

urlpatterns = [path("", include(router.urls))]