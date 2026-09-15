from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CollaborationOpportunityViewSet, MentorshipRequestViewSet

router = DefaultRouter()
router.register("opportunities", CollaborationOpportunityViewSet, basename="collaboration-opportunity")
router.register("mentorship", MentorshipRequestViewSet, basename="mentorship-request")

urlpatterns = [path("", include(router.urls))]