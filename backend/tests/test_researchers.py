import pytest

from researchers.models import ResearcherProfile

pytestmark = pytest.mark.django_db


@pytest.fixture
def profile_for_faculty(faculty):
    return ResearcherProfile.objects.create(user=faculty, bio="Faculty bio", is_available_for_mentoring=True)


def test_list_requires_auth(api_client):
    assert api_client.get("/api/researchers/profiles/").status_code == 401


def test_user_can_create_and_update_own_profile(auth_client, user):
    response = auth_client.post(
        "/api/researchers/profiles/",
        {"bio": "Hello", "github": "devhafeez", "research_interests": "NLP"},
        format="json",
    )
    assert response.status_code == 201, response.data

    response = auth_client.patch(
        f"/api/researchers/profiles/{user.id}/",
        {"github": "updated-user"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["github"] == "updated-user"


def test_retrieve_own_via_me(auth_client, user):
    response = auth_client.get("/api/researchers/profiles/me/")
    assert response.status_code == 200
    assert response.data["user"]["id"] == user.id


def test_user_cannot_modify_others_profile(auth_client, researcher):
    ResearcherProfile.objects.create(user=researcher, bio="Other bio")
    response = auth_client.patch(
        f"/api/researchers/profiles/{researcher.id}/",
        {"bio": "hacked"},
        format="json",
    )
    assert response.status_code == 403


def test_admin_can_modify_any_profile(admin_client, researcher):
    ResearcherProfile.objects.create(user=researcher, bio="Other bio")
    response = admin_client.patch(
        f"/api/researchers/profiles/{researcher.id}/",
        {"bio": "edited by admin"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["bio"] == "edited by admin"


def test_filter_by_mentoring(researcher, faculty):
    ResearcherProfile.objects.create(user=researcher, is_available_for_mentoring=True)
    ResearcherProfile.objects.create(user=faculty, is_available_for_mentoring=False)

    from rest_framework.test import APIClient

    client = APIClient()
    response = client.post(
        "/api/auth/login/",
        {"email": researcher.email, "password": "test-password-123"},
        format="json",
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    response = client.get("/api/researchers/profiles/", {"mentoring": "true"})
    assert response.status_code == 200
    ids = [r["user"]["id"] for r in response.data["results"]]
    assert ids == [researcher.id]