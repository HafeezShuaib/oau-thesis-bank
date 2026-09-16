import pytest

pytestmark = pytest.mark.django_db

ANALYTICS_ENDPOINTS = [
    "/api/analytics/overview/",
    "/api/analytics/top-theses/",
    "/api/analytics/breakdown/",
    "/api/analytics/views-trend/",
]


def test_analytics_require_staff(auth_client):
    for url in ANALYTICS_ENDPOINTS:
        assert auth_client.get(url).status_code == 403, url


def test_analytics_require_auth(api_client):
    for url in ANALYTICS_ENDPOINTS:
        assert api_client.get(url).status_code == 401, url


def test_overview_counts(admin_client, make_thesis, researcher):
    make_thesis(owner=researcher)
    overview = admin_client.get("/api/analytics/overview/").data
    assert overview["published_theses"] == 1
    assert overview["total_users"] >= 2
    assert "total_views" in overview and "total_saves" in overview and "total_downloads" in overview


def test_overview_totals_downloads_and_top_by_downloads(admin_client, make_thesis, researcher):
    from theses.models import Thesis

    a = make_thesis(owner=researcher, title="Most Downloaded")
    b = make_thesis(owner=researcher, title="Rarely Downloaded")
    Thesis.objects.filter(pk=a.pk).update(downloads=40)
    Thesis.objects.filter(pk=b.pk).update(downloads=3)
    overview = admin_client.get("/api/analytics/overview/").data
    assert overview["total_downloads"] == 43
    top = admin_client.get("/api/analytics/top-theses/", {"metric": "downloads"}).data
    assert top[0]["id"] == a.id
    assert top[0]["downloads"] == 40


def test_top_theses_by_views(admin_client, make_thesis, researcher):
    a = make_thesis(owner=researcher, title="Popular")
    b = make_thesis(owner=researcher, title="Less popular")
    from theses.models import Thesis

    Thesis.objects.filter(pk=a.pk).update(views=50)
    Thesis.objects.filter(pk=b.pk).update(views=5)
    top = admin_client.get("/api/analytics/top-theses/", {"metric": "views"}).data
    assert top[0]["id"] == a.id
    assert top[0]["views"] == 50


def test_breakdown_by_department(admin_client, make_thesis, researcher):
    make_thesis(owner=researcher, department="Computer Science")
    make_thesis(owner=researcher, department="Computer Science")
    make_thesis(owner=researcher, department="Economics")
    rows = admin_client.get("/api/analytics/breakdown/", {"dimension": "department"}).data
    by_dept = {row["department"]: row["count"] for row in rows}
    assert by_dept == {"Computer Science": 2, "Economics": 1}


def test_breakdown_rejects_bad_dimension(admin_client):
    response = admin_client.get("/api/analytics/breakdown/", {"dimension": "bogus"})
    assert response.status_code == 400


def test_views_trend(admin_client, make_thesis, researcher):
    make_thesis(owner=researcher)
    trend = admin_client.get("/api/analytics/views-trend/", {"months": 2}).data
    assert isinstance(trend, list)
    assert trend[0]["theses"] >= 1