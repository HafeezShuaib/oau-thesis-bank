import pytest

from messaging.models import Conversation, Message
from notifications.models import Notification

pytestmark = pytest.mark.django_db


def test_conversation_list_requires_auth(api_client):
    assert api_client.get("/api/messages/conversations/").status_code == 401


def test_create_conversation_and_reply(auth_client, user, researcher):
    response = auth_client.post(
        "/api/messages/conversations/",
        {"participant_ids": [researcher.id]},
        format="json",
    )
    assert response.status_code == 201, response.data
    conversation_id = response.data["id"]
    participant_ids = {p["id"] for p in response.data["participants"]}
    assert participant_ids == {user.id, researcher.id}

    reply = auth_client.post(
        f"/api/messages/conversations/{conversation_id}/reply/",
        {"body": "Hello there"},
        format="json",
    )
    assert reply.status_code == 201, reply.data
    assert Message.objects.filter(conversation_id=conversation_id, sender=user).count() == 1
    assert Notification.objects.filter(recipient=researcher, notification_type="message").count() == 1


def test_existing_conversation_is_reused(auth_client, user, researcher):
    first = auth_client.post(
        "/api/messages/conversations/", {"participant_ids": [researcher.id]}, format="json"
    )
    second = auth_client.post(
        "/api/messages/conversations/", {"participant_ids": [researcher.id]}, format="json"
    )
    assert second.status_code == 201
    assert first.data["id"] == second.data["id"]
    assert Conversation.objects.count() == 1


def test_cannot_message_self(auth_client, user):
    response = auth_client.post(
        "/api/messages/conversations/", {"participant_ids": [user.id]}, format="json"
    )
    assert response.status_code == 400


def test_retrieve_includes_messages_and_marks_read(user, researcher):
    conversation = Conversation.objects.create()
    conversation.participants.add(user, researcher)
    Message.objects.create(conversation=conversation, sender=researcher, body="For you")

    from rest_framework.test import APIClient

    client = APIClient()
    login = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": "test-password-123"},
        format="json",
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    response = client.get(f"/api/messages/conversations/{conversation.id}/")
    assert response.status_code == 200
    assert len(response.data["messages"]) == 1
    membership = conversation.memberships.get(user=user)
    assert membership.last_read_at is not None


def test_cannot_access_others_conversation(auth_client, researcher, faculty):
    conversation = Conversation.objects.create()
    conversation.participants.add(researcher, faculty)
    response = auth_client.get(f"/api/messages/conversations/{conversation.id}/")
    assert response.status_code == 404