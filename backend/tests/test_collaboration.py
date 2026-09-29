import pytest

from collaboration.models import CollaborationOpportunity, MentorshipRequest
from notifications.models import Notification

pytestmark = pytest.mark.django_db


def test_list_opportunities_requires_auth(api_client):
    assert api_client.get("/api/collaboration/opportunities/").status_code == 401


def test_create_and_update_own_opportunity(auth_client):
    response = auth_client.post(
        "/api/collaboration/opportunities/",
        {"title": "Join my research", "description": "Looking for a partner.", "skills": ["ML", "NLP"]},
        format="json",
    )
    assert response.status_code == 201, response.data
    opportunity_id = response.data["id"]

    response = auth_client.patch(
        f"/api/collaboration/opportunities/{opportunity_id}/",
        {"status": "closed"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["status"] == "closed"


def test_only_owner_edits_opportunity(auth_client, researcher):
    opportunity = CollaborationOpportunity.objects.create(
        title="Someone else's project",
        description="Do not touch.",
        owner=researcher,
    )
    response = auth_client.patch(
        f"/api/collaboration/opportunities/{opportunity.id}/",
        {"title": "hacked"},
        format="json",
    )
    assert response.status_code == 403


def test_mentorship_request_flow(user, researcher):
    from rest_framework.test import APIClient

    client = APIClient()
    login = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": "test-password-123"},
        format="json",
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    response = client.post(
        "/api/collaboration/mentorship/",
        {"mentor_id": researcher.id, "message": "Please mentor me."},
        format="json",
    )
    assert response.status_code == 201, response.data
    request_id = response.data["id"]

    review = client.post(f"/api/collaboration/mentorship/{request_id}/review/", {"status": "approved"})
    assert review.status_code == 403  # only the mentor may review

    researcher_login = APIClient().post(
        "/api/auth/login/",
        {"email": researcher.email, "password": "test-password-123"},
        format="json",
    )
    researcher_client = APIClient()
    researcher_client.credentials(HTTP_AUTHORIZATION=f"Bearer {researcher_login.data['access']}")

    review = researcher_client.post(
        f"/api/collaboration/mentorship/{request_id}/review/", {"status": "approved"}
    )
    assert review.status_code == 200
    assert review.data["status"] == "approved"

    mentorship = MentorshipRequest.objects.get(id=request_id)
    assert mentorship.status == MentorshipRequest.Status.APPROVED
    assert Notification.objects.filter(recipient=user, notification_type="mentorship").count() == 1


def test_cannot_request_self_as_mentor(auth_client, user):
    response = auth_client.post(
        "/api/collaboration/mentorship/",
        {"mentor_id": user.id},
        format="json",
    )
    assert response.status_code == 400


def test_cannot_send_duplicate_mentorship_request(user, researcher):
    MentorshipRequest.objects.create(mentor=researcher, mentee=user)
    from rest_framework.test import APIClient

    client = APIClient()
    login = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": "test-password-123"},
        format="json",
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    response = client.post(
        "/api/collaboration/mentorship/",
        {"mentor_id": researcher.id},
        format="json",
    )
    assert response.status_code == 400