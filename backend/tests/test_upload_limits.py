import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from theses.serializers import MAX_PDF_SIZE
from theses.models import Thesis

pytestmark = pytest.mark.django_db


def _upload(auth_client, filename, data, content_type):
    file = SimpleUploadedFile(filename, data, content_type=content_type)
    return auth_client.post(
        "/api/theses/",
        {
            "title": "Uploaded Thesis",
            "abstract": "Abstract",
            "author": "Uploader",
            "file": file,
        },
        format="multipart",
    )


def test_accepts_valid_pdf(auth_client, user):
    response = _upload(auth_client, "thesis.pdf", b"%PDF-1.4 valid pdf", "application/pdf")
    assert response.status_code == 201, response.data
    assert Thesis.objects.filter(owner=user, title="Uploaded Thesis").exists()


def test_rejects_non_pdf_extension(auth_client):
    response = _upload(auth_client, "thesis.txt", b"hello", "application/pdf")
    assert response.status_code == 400
    assert "file" in response.data


def test_rejects_wrong_mime_type(auth_client):
    response = _upload(auth_client, "thesis.pdf", b"not really a pdf", "application/octet-stream")
    assert response.status_code == 400
    assert "file" in response.data


def test_rejects_oversized_pdf(auth_client):
    oversized = b"%PDF" + b"\0" * (MAX_PDF_SIZE + 1)
    response = _upload(auth_client, "big.pdf", oversized, "application/pdf")
    assert response.status_code == 400
    assert "file" in response.data


def test_size_limit_applies_on_update(your_thesis, auth_client):
    oversized = b"%PDF" + b"\0" * (MAX_PDF_SIZE + 1)
    file = SimpleUploadedFile("big.pdf", oversized, content_type="application/pdf")
    response = auth_client.patch(
        f"/api/theses/{your_thesis.id}/", {"file": file}, format="multipart"
    )
    assert response.status_code == 400
    assert "file" in response.data


def test_valid_pdf_accepted_on_update(your_thesis, auth_client):
    file = SimpleUploadedFile("new.pdf", b"%PDF-1.4 updated", content_type="application/pdf")
    response = auth_client.patch(
        f"/api/theses/{your_thesis.id}/", {"file": file}, format="multipart"
    )
    assert response.status_code == 200, response.data
    your_thesis.refresh_from_db()
    assert your_thesis.file is not None