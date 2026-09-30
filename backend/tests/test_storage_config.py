"""Object storage configuration (config/storage.py).

Pure environment -> settings mapping, so no database or network is needed.
"""

import pytest

from config import storage

STORAGE_VARS = [
    "STORAGE_PROVIDER",
    "STORAGE_ENDPOINT_URL",
    "STORAGE_ACCESS_KEY",
    "STORAGE_SECRET_KEY",
    "STORAGE_BUCKET_NAME",
    "STORAGE_REGION",
]


@pytest.fixture(autouse=True)
def _clear_storage_env(monkeypatch):
    for name in STORAGE_VARS:
        monkeypatch.delenv(name, raising=False)


def test_default_provider_uses_filesystem():
    storages = storage.build_storages()
    assert storages["default"]["BACKEND"] == "django.core.files.storage.FileSystemStorage"


def test_blank_provider_uses_filesystem(monkeypatch):
    monkeypatch.setenv("STORAGE_PROVIDER", "  ")
    assert storage.build_storages()["default"]["BACKEND"] == (
        "django.core.files.storage.FileSystemStorage"
    )


def test_minio_uses_private_acl_and_its_own_region(monkeypatch):
    monkeypatch.setenv("STORAGE_PROVIDER", "minio")
    monkeypatch.setenv("STORAGE_ENDPOINT_URL", "http://minio:9000")
    default = storage.build_storages()["default"]
    assert default["BACKEND"] == "storages.backends.s3.S3Storage"

    options = default["OPTIONS"]
    assert options["endpoint_url"] == "http://minio:9000"
    assert options["default_acl"] == "private"
    assert options["region_name"] == "us-east-1"


def test_r2_uses_no_acl_and_the_auto_region(monkeypatch):
    monkeypatch.setenv("STORAGE_PROVIDER", "r2")
    monkeypatch.setenv("STORAGE_ENDPOINT_URL", "https://acct123.r2.cloudflarestorage.com")
    options = storage.build_storages()["default"]["OPTIONS"]
    # R2 rejects canned ACLs and only signs with "auto".
    assert options["default_acl"] is None
    assert options["region_name"] == "auto"
    assert options["addressing_style"] == "virtual"


def test_region_can_be_overridden(monkeypatch):
    monkeypatch.setenv("STORAGE_PROVIDER", "r2")
    monkeypatch.setenv("STORAGE_REGION", "wnam")
    assert storage.build_storages()["default"]["OPTIONS"]["region_name"] == "wnam"


def test_blank_region_falls_back_to_the_provider_default(monkeypatch):
    monkeypatch.setenv("STORAGE_PROVIDER", "r2")
    monkeypatch.setenv("STORAGE_REGION", "   ")
    assert storage.build_storages()["default"]["OPTIONS"]["region_name"] == "auto"


def test_same_variables_serve_both_providers(monkeypatch):
    monkeypatch.setenv(
        "STORAGE_ENDPOINT_URL", "https://acct123.r2.cloudflarestorage.com"
    )
    monkeypatch.setenv("STORAGE_ACCESS_KEY", "key")
    monkeypatch.setenv("STORAGE_SECRET_KEY", "secret")

    monkeypatch.setenv("STORAGE_PROVIDER", "r2")
    r2 = storage.build_storages()["default"]["OPTIONS"]
    monkeypatch.setenv("STORAGE_PROVIDER", "minio")
    minio = storage.build_storages()["default"]["OPTIONS"]

    for options in (r2, minio):
        assert options["endpoint_url"] == "https://acct123.r2.cloudflarestorage.com"
        assert options["access_key"] == "key"
        assert options["secret_key"] == "secret"


def test_missing_credentials_are_none_not_empty_strings(monkeypatch):
    monkeypatch.setenv("STORAGE_PROVIDER", "r2")
    options = storage.build_storages()["default"]["OPTIONS"]
    assert options["access_key"] is None
    assert options["secret_key"] is None


def test_bucket_and_presigned_defaults(monkeypatch):
    monkeypatch.setenv("STORAGE_PROVIDER", "r2")
    options = storage.build_storages()["default"]["OPTIONS"]
    assert options["bucket_name"] == "oau-thesis-bank"
    assert options["querystring_auth"] is True
    assert options["signature_version"] == "s3v4"
    assert options["file_overwrite"] is False