import pytest


def test_schema_renders(api_client):
    response = api_client.get("/api/schema/")
    assert response.status_code == 200
    assert response.data["info"]["title"] == "OAU Thesis Bank API"


def test_swagger_ui_renders(api_client):
    response = api_client.get("/api/docs/")
    assert response.status_code == 200
    assert "swagger" in response.content.decode().lower()


def test_redoc_renders(api_client):
    response = api_client.get("/api/docs/redoc/")
    assert response.status_code == 200
    assert "redoc" in response.content.decode().lower()


def test_schema_registers_all_api_paths(api_client):
    schema = api_client.get("/api/schema/").data
    paths = schema["paths"]
    assert "/api/auth/login/" in paths
    assert "/api/auth/register/" in paths
    assert "/api/theses/" in paths
    assert "/api/theses/{id}/" in paths
    assert "/api/theses/access-requests/" in paths
    assert "/api/search/" in paths