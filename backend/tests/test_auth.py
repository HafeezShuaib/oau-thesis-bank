import pytest
from rest_framework.test import APIClient

from accounts.models import User

pytestmark = pytest.mark.django_db


def test_register_returns_user_and_tokens(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {"email": "new.user@oauife.edu.ng", "password": "strongpass1", "name": "Jane Doe", "role": "student"},
        format="json",
    )
    assert response.status_code == 201
    body = response.data
    assert body["user"]["email"] == "new.user@oauife.edu.ng"
    assert body["user"]["name"] == "Jane Doe"
    assert body["user"]["avatar"] == "JA"
    assert body["user"]["role"] == "student"
    assert body["access"] and body["refresh"]


def test_register_requires_unique_email(api_client, user):
    response = api_client.post(
        "/api/auth/register/",
        {"email": user.email, "password": "strongpass1"},
        format="json",
    )
    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.parametrize("role", ["admin", "superuser", "faculty-admin"])
def test_register_cannot_create_admin(api_client, role):
    response = api_client.post(
        "/api/auth/register/",
        {"email": f"{role}@oauife.edu.ng", "password": "strongpass1", "role": role},
        format="json",
    )
    assert response.status_code == 400


def test_login_returns_jwt(api_client, user):
    response = api_client.post("/api/auth/login/", {"email": user.email, "password": "test-password-123"}, format="json")
    assert response.status_code == 200
    assert "access" in response.data and "refresh" in response.data


def test_login_rejects_bad_password(api_client, user):
    response = api_client.post("/api/auth/login/", {"email": user.email, "password": "wrong"}, format="json")
    assert response.status_code == 401


def test_me_returns_profile(auth_client, user):
    response = auth_client.get("/api/auth/me/")
    assert response.status_code == 200
    assert response.data["email"] == user.email


def test_me_requires_auth(api_client):
    assert api_client.get("/api/auth/me/").status_code == 401


def test_refresh_token(api_client, user):
    login = api_client.post("/api/auth/login/", {"email": user.email, "password": "test-password-123"}, format="json")
    refresh = login.data["refresh"]
    response = api_client.post("/api/auth/refresh/", {"refresh": refresh}, format="json")
    assert response.status_code == 200
    assert "access" in response.data


def test_change_password(auth_client, user):
    response = auth_client.post(
        "/api/auth/change-password/",
        {"old_password": "test-password-123", "new_password": "brand-new-pass1"},
        format="json",
    )
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.check_password("brand-new-pass1")


def test_change_password_wrong_old(auth_client, user):
    response = auth_client.post(
        "/api/auth/change-password/",
        {"old_password": "nope", "new_password": "brand-new-pass1"},
        format="json",
    )
    assert response.status_code == 400


def test_suspended_user_cannot_authenticate_actions(make_user):
    suspended = make_user(email="suspended@test.local", role="student", status="suspended")
    client = APIClient()
    login = client.post("/api/auth/login/", {"email": suspended.email, "password": "test-password-123"}, format="json")
    assert login.status_code == 200  # token still issues, but permission layer blocks actions
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    assert client.get("/api/theses/").status_code == 403


def test_password_reset_unknown_email_no_leak(api_client):
    response = api_client.post("/api/auth/password-reset/", {"email": "nobody@oauife.edu.ng"}, format="json")
    assert response.status_code == 200
    assert "sent" in response.data["detail"]


@pytest.mark.django_db
def test_password_reset_and_confirm(api_client, user, settings):
    from django.test import override_settings

    with override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend"):
        response = api_client.post("/api/auth/password-reset/", {"email": user.email}, format="json")
        assert response.status_code == 200

        from django.core import mail

        assert len(mail.outbox) == 1
        token = next(line.split("Reset token: ")[1] for line in mail.outbox[0].body.splitlines() if "Reset token: " in line)

        confirm = api_client.post(
            "/api/auth/password-reset/confirm/",
            {"token": token, "new_password": "reset-pass-123"},
            format="json",
        )
        assert confirm.status_code == 200
        user.refresh_from_db()
        assert user.check_password("reset-pass-123")

        # old password no longer works, new one does
        assert api_client.post("/api/auth/login/", {"email": user.email, "password": "test-password-123"}, format="json").status_code == 401
        assert api_client.post("/api/auth/login/", {"email": user.email, "password": "reset-pass-123"}, format="json").status_code == 200


def test_password_reset_confirm_rejects_bad_token(api_client, user):
    response = api_client.post(
        "/api/auth/password-reset/confirm/",
        {"token": "not-a-real-token", "new_password": "reset-pass-123"},
        format="json",
    )
    assert response.status_code == 400
    user.refresh_from_db()
    assert user.check_password("test-password-123")


def test_password_reset_confirm_requires_min_password(api_client):
    response = api_client.post(
        "/api/auth/password-reset/confirm/",
        {"token": "whatever", "new_password": "short"},
        format="json",
    )
    assert response.status_code == 400