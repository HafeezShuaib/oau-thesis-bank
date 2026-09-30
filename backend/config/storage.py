"""Object storage for uploaded thesis PDFs.

Local filesystem in dev, MinIO or Cloudflare R2 when deployed. One set of
credential variables serves both S3-compatible providers; only ``STORAGE_PROVIDER``
changes the backend.

R2 speaks the S3 API but is not configured like MinIO: it rejects canned ACLs
and signs with the ``auto`` region. Those two differences are applied here so
they cannot be misconfigured from the environment.
"""

import os

S3_PROVIDERS = frozenset({"minio", "r2"})

STATICFILES = {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"}


def _env(name, default=None):
    value = os.environ.get(name)
    return value.strip() if value and value.strip() else default


def _s3_options(provider):
    options = {
        "endpoint_url": _env("STORAGE_ENDPOINT_URL"),
        "access_key": _env("STORAGE_ACCESS_KEY"),
        "secret_key": _env("STORAGE_SECRET_KEY"),
        "bucket_name": _env("STORAGE_BUCKET_NAME", "oau-thesis-bank"),
        "signature_version": "s3v4",
        "file_overwrite": False,
        # The bucket is private, so hand out short-lived presigned URLs.
        "querystring_auth": True,
    }
    if provider == "r2":
        options.update(
            default_acl=None,
            region_name=_env("STORAGE_REGION", "auto"),
            addressing_style="virtual",
        )
    else:
        options.update(
            default_acl="private",
            region_name=_env("STORAGE_REGION", "us-east-1"),
        )
    return options


def build_storages():
    """Return the Django ``STORAGES`` setting for the current environment."""
    provider = _env("STORAGE_PROVIDER", "local").lower()
    if provider in S3_PROVIDERS:
        return {
            "default": {
                "BACKEND": "storages.backends.s3.S3Storage",
                "OPTIONS": _s3_options(provider),
            },
            "staticfiles": STATICFILES,
        }
    return {
        "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        "staticfiles": STATICFILES,
    }