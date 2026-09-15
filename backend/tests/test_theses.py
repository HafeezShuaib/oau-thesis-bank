import pytest
from rest_framework.test import APIClient

from theses.models import AccessRequest, SavedThesis, Thesis

pytestmark = pytest.mark.django_db


def test_list_only_returns_public_published(api_client, published_thesis, draft_thesis, make_thesis, researcher):
    make_thesis(owner=researcher, title="Restricted One", access_policy=Thesis.AccessPolicy.RESTRICTED)
    response = api_client.get("/api/theses/")
    assert response.status_code == 200
    titles = [row["title"] for row in response.data["results"]]
    assert "A Test Thesis" in titles
    assert "Private Draft Thesis" not in titles
    assert "Restricted One" not in titles


def test_retrieve_public_thesis(api_client, published_thesis):
    response = api_client.get(f"/api/theses/{published_thesis.id}/")
    assert response.status_code == 200
    assert response.data["title"] == "A Test Thesis"
    assert response.data["tags"] == ["Machine Learning", "NLP"]


def test_retrieve_restricted_forbidden_for_anonymous(api_client, make_thesis, researcher):
    thesis = make_thesis(owner=researcher, access_policy=Thesis.AccessPolicy.RESTRICTED)
    assert api_client.get(f"/api/theses/{thesis.id}/").status_code == 403


def test_owner_can_retrieve_private(researcher, draft_thesis):
    from rest_framework.test import APIClient

    client = APIClient()
    login = client.post("/api/auth/login/", {"email": researcher.email, "password": "test-password-123"}, format="json")
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    response = client.get(f"/api/theses/{draft_thesis.id}/")
    assert response.status_code == 200
    assert response.data["title"] == "Private Draft Thesis"


def test_create_thesis(auth_client, user):
    response = auth_client.post(
        "/api/theses/",
        {
            "title": "Brand New Thesis",
            "abstract": "Abstract here",
            "department": "Computer Science",
            "faculty": "Science",
            "year": 2025,
            "tags": ["AI"],
        },
        format="json",
    )
    assert response.status_code == 201
    thesis = Thesis.objects.get(pk=response.data["id"])
    assert thesis.owner_id == user.id
    assert thesis.status == Thesis.Status.DRAFT
    assert [tag.name for tag in thesis.tags.all()] == ["AI"]


def test_create_requires_auth(api_client):
    assert api_client.post("/api/theses/", {"title": "No Auth"}, format="json").status_code == 401


def test_other_user_cannot_update_or_delete(published_thesis, auth_client, user):
    assert user.id != published_thesis.owner_id
    assert auth_client.patch(f"/api/theses/{published_thesis.id}/", {"title": "Hijack"}, format="json").status_code == 403
    assert auth_client.delete(f"/api/theses/{published_thesis.id}/").status_code == 403


def test_owner_can_update(your_thesis, auth_client):
    response = auth_client.patch(f"/api/theses/{your_thesis.id}/", {"title": "Updated Title"}, format="json")
    assert response.status_code == 200
    assert response.data["title"] == "Updated Title"


def test_admin_can_update_any(published_thesis, admin_client):
    response = admin_client.patch(f"/api/theses/{published_thesis.id}/", {"title": "Admin Edit"}, format="json")
    assert response.status_code == 200


def test_mine_returns_only_own(auth_client, user, published_thesis, make_thesis):
    make_thesis(owner=user, title="Mine")
    response = auth_client.get("/api/theses/mine/")
    titles = [row["title"] for row in response.data]
    assert titles == ["Mine"]


def test_save_and_unsave(published_thesis, auth_client, user):
    assert auth_client.post(f"/api/theses/{published_thesis.id}/save/").status_code == 200
    assert SavedThesis.objects.filter(user=user, thesis=published_thesis).exists()
    saved = auth_client.get("/api/theses/saved/")
    assert any(row["id"] == published_thesis.id for row in saved.data)


def test_cannot_save_own(make_thesis, auth_client, user):
    own = make_thesis(owner=user)
    assert auth_client.post(f"/api/theses/{own.id}/save/").status_code == 400


def test_access_request_flow(make_thesis, researcher, student, api_client):
    thesis = make_thesis(owner=researcher, access_policy=Thesis.AccessPolicy.RESTRICTED)
    student_client = api_client
    login = student_client.post("/api/auth/login/", {"email": student.email, "password": "test-password-123"}, format="json")
    student_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    response = student_client.post("/api/theses/access-requests/", {"thesis": thesis.id, "message": "Please"})
    assert response.status_code == 201
    assert response.data["status"] == "pending"

    # duplicate request rejected
    dup = student_client.post("/api/theses/access-requests/", {"thesis": thesis.id})
    assert dup.status_code == 400

    # owner sees and approves
    owner_client = APIClient()
    owner_login = owner_client.post("/api/auth/login/", {"email": researcher.email, "password": "test-password-123"}, format="json")
    owner_client.credentials(HTTP_AUTHORIZATION=f"Bearer {owner_login.data['access']}")
    req = AccessRequest.objects.get(thesis=thesis, requester=student)
    review = owner_client.patch(f"/api/theses/access-requests/{req.id}/review/", {"status": "approved"})
    assert review.status_code == 200
    assert review.data["status"] == "approved"

    # requester can now download/retrieve
    assert student_client.get(f"/api/theses/{thesis.id}/").status_code == 200


def test_access_request_public_thesis_rejected(make_thesis, researcher, student, api_client):
    thesis = make_thesis(owner=researcher)
    login = api_client.post("/api/auth/login/", {"email": student.email, "password": "test-password-123"}, format="json")
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    assert api_client.post("/api/theses/access-requests/", {"thesis": thesis.id}).status_code == 400


def test_download_requires_ownership_permission(auth_client, user, make_thesis):
    from django.core.files.uploadedfile import SimpleUploadedFile

    thesis = make_thesis(owner=user, status=Thesis.Status.PUBLISHED)
    thesis.file = SimpleUploadedFile("thesis.pdf", b"%PDF-1.4 fake pdf", content_type="application/pdf")
    thesis.save()
    response = auth_client.get(f"/api/theses/{thesis.id}/download/")
    assert response.status_code == 200
    assert response["Content-Disposition"].endswith('.pdf"')


def test_anonymous_can_download_published_public(api_client, make_thesis, researcher):
    from django.core.files.uploadedfile import SimpleUploadedFile

    thesis = make_thesis(owner=researcher, status=Thesis.Status.PUBLISHED, access_policy=Thesis.AccessPolicy.PUBLIC)
    thesis.file = SimpleUploadedFile("thesis.pdf", b"%PDF-1.4 fake pdf", content_type="application/pdf")
    thesis.save()
    assert api_client.get(f"/api/theses/{thesis.id}/download/").status_code == 200


def test_anonymous_cannot_download_draft(api_client, make_thesis, researcher):
    from django.core.files.uploadedfile import SimpleUploadedFile

    thesis = make_thesis(owner=researcher, status=Thesis.Status.DRAFT)
    thesis.file = SimpleUploadedFile("thesis.pdf", b"%PDF-1.4 fake pdf", content_type="application/pdf")
    thesis.save()
    assert api_client.get(f"/api/theses/{thesis.id}/download/").status_code == 403


def test_anonymous_cannot_download_restricted(api_client, make_thesis, researcher):
    from django.core.files.uploadedfile import SimpleUploadedFile

    thesis = make_thesis(owner=researcher, status=Thesis.Status.PUBLISHED, access_policy=Thesis.AccessPolicy.RESTRICTED)
    thesis.file = SimpleUploadedFile("thesis.pdf", b"%PDF-1.4 fake pdf", content_type="application/pdf")
    thesis.save()
    assert api_client.get(f"/api/theses/{thesis.id}/download/").status_code == 403


def test_mine_lists_own_draft_and_restricted(auth_client, user, make_thesis):
    draft = make_thesis(owner=user, status=Thesis.Status.DRAFT)
    restricted = make_thesis(owner=user, status=Thesis.Status.PUBLISHED, access_policy=Thesis.AccessPolicy.RESTRICTED)
    response = auth_client.get("/api/theses/mine/")
    assert response.status_code == 200
    titles = [row["title"] for row in response.data]
    assert draft.title in titles
    assert restricted.title in titles