import pytest

pytestmark = pytest.mark.django_db


def test_integrations_require_auth(api_client):
    assert api_client.get("/api/integrations/github/link/").status_code == 401
    assert api_client.get("/api/integrations/orcid/link/").status_code == 401


def test_github_link_not_configured(auth_client):
    response = auth_client.get("/api/integrations/github/link/")
    assert response.status_code == 503
    assert response.data["configured"] is False


def test_orcid_link_not_configured(auth_client):
    response = auth_client.get("/api/integrations/orcid/link/")
    assert response.status_code == 503
    assert response.data["configured"] is False