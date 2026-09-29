from django.conf import settings
from django.db import models

from theses.models import Thesis


class ModerationItem(models.Model):
    """A flagged thesis awaiting admin review (content moderation queue)."""

    class FlagType(models.TextChoices):
        HIGH_SIMILARITY = "high_similarity", "High similarity"
        STANDARD_REVIEW = "standard_review", "Standard review"
        METADATA = "metadata", "Metadata"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        DISMISSED = "dismissed", "Dismissed"

    thesis = models.ForeignKey(Thesis, related_name="moderation_items", on_delete=models.CASCADE)
    flag_type = models.CharField(max_length=20, choices=FlagType.choices)
    similarity_score = models.FloatField(null=True, blank=True, help_text="AI similarity score (optional).")
    note = models.TextField(blank=True)
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="moderation_reports",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="moderation_reviews",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["flag_type"]),
        ]

    def __str__(self):
        return f"{self.flag_type} — {self.thesis.title}"


class AuditEvent(models.Model):
    """Read-only trail of platform activity for the admin control center."""

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="audit_events",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    action = models.CharField(max_length=100)
    subject_type = models.CharField(max_length=100, blank=True, default="")
    subject_id = models.PositiveIntegerField(null=True, blank=True)
    detail = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["action"]),
            models.Index(fields=["subject_type", "subject_id"]),
        ]

    def __str__(self):
        return f"{self.action} by {self.actor_id}"