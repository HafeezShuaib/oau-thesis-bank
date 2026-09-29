from django.urls import path

from .views import GitHubCallbackView, GitHubLinkView, OrcidCallbackView, OrcidLinkView

urlpatterns = [
    path("github/link/", GitHubLinkView.as_view(), name="github-link"),
    path("github/callback/", GitHubCallbackView.as_view(), name="github-callback"),
    path("orcid/link/", OrcidLinkView.as_view(), name="orcid-link"),
    path("orcid/callback/", OrcidCallbackView.as_view(), name="orcid-callback"),
]