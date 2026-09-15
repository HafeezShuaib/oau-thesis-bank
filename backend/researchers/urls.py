from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ResearcherProfileViewSet

router = DefaultRouter()
router.register("profiles", ResearcherProfileViewSet, basename="researcher-profile")

urlpatterns = [path("", include(router.urls))]