from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        ACCESS_REQUEST = "access_request", "Access request"
        MENTORSHIP = "mentorship", "Mentorship"
        COLLABORATION = "collaboration", "Collaboration"
        MESSAGE = "message", "Message"
        SYSTEM = "system", "System"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="notifications", on_delete=models.CASCADE
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, related_name="+", on_delete=models.SET_NULL
    )
    notification_type = models.CharField(max_length=30, choices=Type.choices, default=Type.SYSTEM)
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.recipient} - {self.title}"