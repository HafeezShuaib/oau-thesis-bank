import pytest
from rest_framework.test import APIClient

from accounts.models import User
from theses.models import Tag, Thesis

PASSWORD = "test-password-123"


@pytest.fixture
def password():
    return PASSWORD


def _make_user(email=None, role="student", **kwargs):
    email = email or f"{role}@test.local"
    user = User.objects.create_user(email=email, password=PASSWORD, role=role, **kwargs)
    return user


@pytest.fixture
def make_user():
    return _make_user


@pytest.fixture
def user(make_user):
    return make_user()


@pytest.fixture
def student(make_user):
    return make_user(email="student@test.local", role="student")


@pytest.fixture
def researcher(make_user):
    return make_user(email="researcher@test.local", role="researcher")


@pytest.fixture
def faculty(make_user):
    return make_user(email="faculty@test.local", role="faculty")


@pytest.fixture
def admin(make_user):
    return make_user(email="admin@test.local", role="admin")


@pytest.fixture
def api_client():
    return APIClient()


def _jwt_headers(client, user):
    response = client.post("/api/auth/login/", {"email": user.email, "password": PASSWORD}, format="json")
    assert response.status_code == 200, response.data
    return {"HTTP_AUTHORIZATION": f"Bearer {response.data['access']}"}


@pytest.fixture
def auth_client(api_client, user):
    api_client.credentials(**_jwt_headers(api_client, user))
    return api_client


@pytest.fixture
def admin_client(api_client, admin):
    api_client.credentials(**_jwt_headers(api_client, admin))
    return api_client


@pytest.fixture
def make_thesis():
    def _make(owner=None, **kwargs):
        thesis = Thesis.objects.create(
            title=kwargs.get("title", "A Test Thesis"),
            author=kwargs.get("author", "Some Author"),
            owner=owner or _make_user(),
            department=kwargs.get("department", "Computer Science"),
            faculty=kwargs.get("faculty", "Science"),
            year=kwargs.get("year", 2024),
            abstract=kwargs.get("abstract", "Abstract text here."),
            supervisor=kwargs.get("supervisor", "Dr. Smith"),
            status=kwargs.get("status", Thesis.Status.PUBLISHED),
            access_policy=kwargs.get("access_policy", Thesis.AccessPolicy.PUBLIC),
        )
        for tag_name in kwargs.get("tags", ()):
            thesis.tags.add(Tag.objects.get_or_create(name=tag_name)[0])
        return thesis

    return _make


@pytest.fixture
def published_thesis(make_thesis, researcher):
    return make_thesis(owner=researcher, tags=["Machine Learning", "NLP"])


@pytest.fixture
def your_thesis(make_thesis, user):
    return make_thesis(owner=user, title="Your Own Thesis")


@pytest.fixture
def draft_thesis(make_thesis, researcher):
    return make_thesis(owner=researcher, title="Private Draft Thesis", status=Thesis.Status.DRAFT)