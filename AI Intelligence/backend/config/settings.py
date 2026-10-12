"""
Django settings for the OAU Thesis Bank backend.

PostgreSQL only. Credentials come from environment variables with defaults
that match the repo's docker-compose.yml. A local `backend/.env` is loaded when
present; real environment variables (e.g. from docker compose) take priority.
"""

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

from config.storage import build_storages

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Local dev/prod secrets. override=False keeps process env authoritative.
load_dotenv(BASE_DIR / ".env")


def env(name, default=None):
    """Read an environment variable, treating a blank value as unset.

    .env files are templates with blank placeholders, so an empty
    ``DJANGO_SECRET_KEY=`` must fall back to the default rather than
    configuring Django with an empty string.
    """
    value = os.environ.get(name)
    if value is None or not value.strip():
        return default
    return value.strip()


# Quick-start development settings - unsuitable for production
SECRET_KEY = env("DJANGO_SECRET_KEY", "django-insecure-17k=jrztl%t^kv(g)hk2t=^6!h8a525s6!3*97js())rtm0(9w")

DEBUG = env("DJANGO_DEBUG", "1") == "1"

ALLOWED_HOSTS = env("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    # third party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "drf_spectacular",
    "storages",
    # local
    "core",
    "accounts",
    "theses",
    "search",
    "researchers",
    "collaboration",
    "messaging",
    "notifications",
    "analytics",
    "integrations",
    "admin_panel",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database — PostgreSQL only.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB", "oau_thesis_bank"),
        "USER": env("POSTGRES_USER", "oau"),
        "PASSWORD": env("POSTGRES_PASSWORD", "oau"),
        "HOST": env("POSTGRES_HOST", "127.0.0.1"),
        "PORT": env("POSTGRES_PORT", "5432"),
    }
}

AUTH_USER_MODEL = "accounts.User"


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"

# Email — console in dev, swap to SMTP in production via env.
EMAIL_BACKEND = env("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", "localhost")
EMAIL_PORT = int(env("EMAIL_PORT", "1025"))
EMAIL_HOST_USER = env("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env("EMAIL_USE_TLS", "") == "1"
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", "no-reply@oau-thesis-bank.local")

# Fan out notification emails only when explicitly enabled.
EMAIL_NOTIFICATIONS_ENABLED = env("EMAIL_NOTIFICATIONS_ENABLED", "") == "1"

# Uploaded thesis files (PDFs)
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# Object storage — see config/storage.py. Local filesystem, MinIO or
# Cloudflare R2 depending on STORAGE_PROVIDER and the STORAGE_* variables.
STORAGES = build_storages()

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# CORS — allow the Vite dev server.
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

SPECTACULAR_SETTINGS = {
    "TITLE": "OAU Thesis Bank API",
    "DESCRIPTION": "Backend for the OAU Thesis Bank thesis repository platform.",
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}