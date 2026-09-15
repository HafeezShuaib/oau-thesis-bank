from django.conf import settings
from django.db import models

from theses.models import Tag


class CollaborationOpportunity(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"

    title = models.CharField(max_length=300)
    description = models.TextField()
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="collaboration_opportunities",
        on_delete=models.CASCADE,
    )
    skills = models.ManyToManyField(Tag, related_name="opportunities", blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.title


class MentorshipRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        DENIED = "denied", "Denied"

    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="mentorship_requests_received",
        on_delete=models.CASCADE,
    )
    mentee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="mentorship_requests_sent",
        on_delete=models.CASCADE,
    )
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        unique_together = ("mentor", "mentee")

    def __str__(self):
        return f"{self.mentee} -> {self.mentor}"