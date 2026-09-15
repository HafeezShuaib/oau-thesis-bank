import pytest

from notifications.models import Notification

pytestmark = pytest.mark.django_db


@pytest.fixture
def notification(user, researcher):
    return Notification.objects.create(
        recipient=user, actor=researcher, notification_type="message", title="New message", message="Hi"
    )


def test_list_requires_auth(api_client):
    assert api_client.get("/api/notifications/").status_code == 401


def test_only_own_notifications_visible(auth_client, user, notification, faculty):
    other = Notification.objects.create(recipient=faculty, title="Someone else's")
    response = auth_client.get("/api/notifications/")
    ids = [n["id"] for n in response.data["results"]]
    assert notification.id in ids
    assert other.id not in ids


def test_read_single(auth_client, notification):
    response = auth_client.post(f"/api/notifications/{notification.id}/read/")
    assert response.status_code == 200
    notification.refresh_from_db()
    assert notification.is_read is True


def test_read_all_and_unread_count(auth_client, user, researcher):
    for i in range(3):
        Notification.objects.create(
            recipient=user, actor=researcher, notification_type="system", title=f"N{i}"
        )
    assert auth_client.get("/api/notifications/unread_count/").data == {"count": 3}
    assert auth_client.post("/api/notifications/read_all/").status_code == 200
    assert auth_client.get("/api/notifications/unread_count/").data == {"count": 0}


def test_summary_groups_by_type(auth_client, user, researcher):
    Notification.objects.create(
        recipient=user, actor=researcher, notification_type="message", title="m1"
    )
    Notification.objects.create(
        recipient=user, actor=researcher, notification_type="message", title="m2"
    )
    Notification.objects.create(
        recipient=user, actor=researcher, notification_type="system", title="s1"
    )
    summary = auth_client.get("/api/notifications/summary/").data
    assert summary == {"message": 2, "system": 1}


def test_notify_ignores_self_actor(user):
    from notifications.services import notify

    created = notify(recipient=user, actor=user, notification_type="system", title="self")
    assert created is None
    assert Notification.objects.count() == 0