import pytest

from theses.models import Thesis

pytestmark = pytest.mark.django_db


def test_empty_results(api_client):
    response = api_client.get("/api/search/", {"q": "zzzznomatch"})
    assert response.status_code == 200
    assert response.data["count"] == 0


def test_keyword_search_ranks_matches(make_thesis, researcher):
    thesis_a = make_thesis(owner=researcher, title="Machine Learning in Agriculture")
    make_thesis(owner=researcher, title="A Different Topic")

    response = _search("machine learning")
    assert response.status_code == 200
    assert response.data["count"] == 1
    row = response.data["results"][0]
    assert row["thesis"]["id"] == thesis_a.id
    assert row["relevance_score"] == pytest.approx(1.0, abs=0.01)


def test_search_never_leaks_drafts_or_restricted(make_thesis, researcher, student):
    make_thesis(owner=researcher, title="Draft Secret", status=Thesis.Status.DRAFT)
    make_thesis(owner=researcher, title="Restricted Secret", access_policy=Thesis.AccessPolicy.RESTRICTED)

    response = _search("secret")
    assert response.data["count"] == 0


def test_filter_by_department_and_year(make_thesis, researcher):
    make_thesis(owner=researcher, title="Agri Paper", department="Agricultural Engineering", year=2023)
    make_thesis(owner=researcher, title="Comp Paper", department="Computer Science", year=2024)

    response = _search({"department": "Computer Science"})
    titles = [r["thesis"]["title"] for r in response.data["results"]]
    assert titles == ["Comp Paper"]


def test_filter_by_tag(make_thesis, researcher):
    make_thesis(owner=researcher, title="ML Thing", tags=["Machine Learning"])
    make_thesis(owner=researcher, title="Other Thing")

    response = _search({"tag": "Machine Learning"})
    titles = [r["thesis"]["title"] for r in response.data["results"]]
    assert titles == ["ML Thing"]


def test_relevance_prioritizes_title_match(make_thesis, researcher):
    title_one = make_thesis(owner=researcher, title="Quantum Computing Basics")
    abstract_only = make_thesis(
        owner=researcher, title="Something Else", abstract="Quantum Computing is explored deeply here."
    )

    response = _search("quantum computing")
    results = response.data["results"]
    assert len(results) == 2
    scores = {r["thesis"]["id"]: r["relevance_score"] for r in results}
    assert scores[title_one.id] > scores[abstract_only.id]


def _search(params):
    from rest_framework.test import APIClient

    client = APIClient()
    if isinstance(params, str):
        params = {"q": params}
    return client.get("/api/search/", params)