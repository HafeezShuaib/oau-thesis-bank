import os
import urllib.parse

import requests
from drf_spectacular.utils import extend_schema
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from researchers.models import ResearcherProfile

from .serializers import ProviderStatusSerializer


class OAuthBase(APIView):
    """Common OAuth URL construction. Endpoints ship even when creds are absent;
    token exchange only runs once a client id/secret is configured via env."""

    permission_classes = [permissions.IsAuthenticated]

    provider = ""
    auth_url = ""
    token_url = ""
    client_id_var = ""
    client_secret_var = ""
    accept_header = "application/json"

    def configured(self):
        return bool(os.environ.get(self.client_id_var) and os.environ.get(self.client_secret_var))

    def exchange(self, code, redirect_uri):
        response = requests.post(
            self.token_url,
            data={
                "client_id": os.environ.get(self.client_id_var),
                "client_secret": os.environ.get(self.client_secret_var),
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": self.accept_header},
            timeout=15,
        )
        response.raise_for_status()
        return response.json()


@extend_schema(responses={200: ProviderStatusSerializer, 503: ProviderStatusSerializer})
class GitHubLinkView(OAuthBase):
    provider = "github"
    auth_url = "https://github.com/login/oauth/authorize"
    token_url = "https://github.com/login/oauth/access_token"
    client_id_var = "GITHUB_CLIENT_ID"
    client_secret_var = "GITHUB_CLIENT_SECRET"
    scope = "read:user"

    def get(self, request):
        if not self.configured():
            return Response(
                {"provider": "github", "configured": False, "detail": "GitHub OAuth is not configured."},
                status=503,
            )
        base = request.build_absolute_uri("/api/integrations/github/callback/")
        params = {
            "client_id": os.environ.get(self.client_id_var),
            "redirect_uri": base,
            "scope": self.scope,
        }
        url = f"{self.auth_url}?{urllib.parse.urlencode(params)}"
        return Response({"provider": "github", "configured": True, "authorization_url": url})


@extend_schema(responses={200: ProviderStatusSerializer, 400: ProviderStatusSerializer, 503: ProviderStatusSerializer})
class GitHubCallbackView(OAuthBase):
    provider = "github"
    token_url = "https://github.com/login/oauth/access_token"
    client_id_var = "GITHUB_CLIENT_ID"
    client_secret_var = "GITHUB_CLIENT_SECRET"

    def get(self, request):
        code = request.query_params.get("code")
        if not self.configured():
            return Response(
                {"provider": "github", "detail": "GitHub OAuth is not configured."}, status=503
            )
        if not code:
            return Response({"provider": "github", "detail": "Missing 'code' parameter."}, status=400)
        redirect_uri = request.build_absolute_uri("/api/integrations/github/callback/")
        token = self.exchange(code, redirect_uri)["access_token"]
        profile, _ = ResearcherProfile.objects.get_or_create(user=request.user)
        profile.github = self._fetch_username(token)
        profile.save(update_fields=["github", "updated_at"])
        return Response({"provider": "github", "linked": profile.github})

    def _fetch_username(self, token):
        response = requests.get(
            "https://api.github.com/user", headers={"Authorization": f"Bearer {token}"}, timeout=15
        )
        response.raise_for_status()
        return response.json().get("login", "")


@extend_schema(responses={200: ProviderStatusSerializer, 503: ProviderStatusSerializer})
class OrcidLinkView(OAuthBase):
    provider = "orcid"
    auth_url = "https://orcid.org/oauth/authorize"
    token_url = "https://orcid.org/oauth/token"
    client_id_var = "ORCID_CLIENT_ID"
    client_secret_var = "ORCID_CLIENT_SECRET"
    scope = "/authenticate"

    def get(self, request):
        if not self.configured():
            return Response(
                {"provider": "orcid", "configured": False, "detail": "ORCID OAuth is not configured."},
                status=503,
            )
        base = request.build_absolute_uri("/api/integrations/orcid/callback/")
        params = {
            "client_id": os.environ.get(self.client_id_var),
            "response_type": "code",
            "scope": self.scope,
            "redirect_uri": base,
        }
        url = f"{self.auth_url}?{urllib.parse.urlencode(params)}"
        return Response({"provider": "orcid", "configured": True, "authorization_url": url})


@extend_schema(responses={200: ProviderStatusSerializer, 400: ProviderStatusSerializer, 503: ProviderStatusSerializer})
class OrcidCallbackView(OAuthBase):
    provider = "orcid"
    token_url = "https://orcid.org/oauth/token"
    client_id_var = "ORCID_CLIENT_ID"
    client_secret_var = "ORCID_CLIENT_SECRET"

    def get(self, request):
        code = request.query_params.get("code")
        if not self.configured():
            return Response(
                {"provider": "orcid", "detail": "ORCID OAuth is not configured."}, status=503
            )
        if not code:
            return Response({"provider": "orcid", "detail": "Missing 'code' parameter."}, status=400)
        redirect_uri = request.build_absolute_uri("/api/integrations/orcid/callback/")
        token = self.exchange(code, redirect_uri)
        orcid_id = token.get("orcid", "")
        name = token.get("name", "")
        profile, _ = ResearcherProfile.objects.get_or_create(user=request.user)
        profile.orcid = f"https://orcid.org/{orcid_id}"
        if name and not profile.bio:
            profile.bio = name
        profile.save()
        return Response({"provider": "orcid", "linked": profile.orcid})