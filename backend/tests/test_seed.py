from io import StringIO

import pytest
from django.core.management import call_command

from accounts.models import User
from theses.models import Thesis

pytestmark = pytest.mark.django_db


def test_seed_creates_demo_data():
    out = StringIO()
    call_command("seed", stdout=out)
    assert "Seeded 5 theses" in out.getvalue()
    assert Thesis.objects.count() == 5
    assert User.objects.filter(email__endswith="demo.local").count() == 3


def test_seed_is_idempotent():
    call_command("seed", stdout=StringIO())
    call_command("seed", stdout=StringIO())
    assert Thesis.objects.count() == 5
    assert User.objects.count() <= 8


def test_seeded_theses_are_searchable(api_client):
    call_command("seed", stdout=StringIO())
    response = api_client.get("/api/search/", {"q": "yield prediction"})
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert "Crop Yield" in response.data["results"][0]["thesis"]["title"]