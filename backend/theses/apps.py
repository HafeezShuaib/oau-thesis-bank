from django.apps import AppConfig


class ThesesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "theses"

    def ready(self):
        from . import signals  # noqa: F401