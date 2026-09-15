import pytest
from rest_framework.test import APIClient

from notifications.models import Notification
from theses.models import Thesis

pytestmark = pytest.mark.django_db

PASSWORD = "test-password-123"


def _client_for(user):
    client = APIClient()
    login = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": PASSWORD},
        format="json",
    )
    assert login.status_code == 200, login.data
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    return client


def test_anonymous_view_counts(api_client, make_thesis, researcher):
    thesis = make_thesis(owner=researcher, title="Counted Views")
    api_client.get(f"/api/theses/{thesis.id}/")
    thesis.refresh_from_db()
    assert thesis.views == 1


def test_owner_view_does_not_count(researcher, make_thesis):
    thesis = make_thesis(owner=researcher, title="Owner Views")
    _client_for(researcher).get(f"/api/theses/{thesis.id}/")
    thesis.refresh_from_db()
    assert thesis.views == 0


def test_access_request_notifies_owner(researcher, student, make_thesis):
    thesis = make_thesis(owner=researcher, title="Restricted", access_policy=Thesis.AccessPolicy.RESTRICTED)
    response = _client_for(student).post(
        "/api/theses/access-requests/",
        {"thesis": thesis.id, "message": "May I have access?"},
        format="json",
    )
    assert response.status_code == 201, response.data
    notification = Notification.objects.filter(recipient=researcher, notification_type="access_request").first()
    assert notification is not None
    assert "Restricted" in notification.message


def test_access_request_review_notifies_requester(researcher, student, make_thesis):
    thesis = make_thesis(owner=researcher, title="Restricted", access_policy=Thesis.AccessPolicy.RESTRICTED)
    access_request = _client_for(student).post(
        "/api/theses/access-requests/",
        {"thesis": thesis.id},
        format="json",
    ).data
    review = _client_for(researcher).patch(
        f"/api/theses/access-requests/{access_request['id']}/review/",
        {"status": "approved"},
        format="json",
    )
    assert review.status_code == 200
    notification = Notification.objects.filter(recipient=student, notification_type="access_request").first()
    assert notification is not None
    assert notification.title == "Access request approved"