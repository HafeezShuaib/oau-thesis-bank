from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils.text import slugify


class Tag(models.Model):
    name = models.CharField(max_length=60, unique=True)

    def __str__(self):
        return self.name


class Thesis(models.Model):
    """Thesis record matching the frontend's data contract."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PROCESSING = "processing", "Processing"
        PUBLISHED = "published", "Published"
        FLAGGED = "flagged", "Flagged"

    class AccessPolicy(models.TextChoices):
        PUBLIC = "public", "Public"
        RESTRICTED = "restricted", "Restricted"
        PRIVATE = "private", "Private"

    class ProcessingStatus(models.TextChoices):
        NONE = "none", "Not processed"
        QUEUED = "queued", "Queued"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    title = models.CharField(max_length=300)
    author = models.CharField(max_length=150)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="theses", on_delete=models.CASCADE)
    department = models.CharField(max_length=150, blank=True)
    faculty = models.CharField(max_length=150, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    abstract = models.TextField(blank=True)
    supervisor = models.CharField(max_length=150, blank=True)
    tags = models.ManyToManyField(Tag, related_name="theses", blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    access_policy = models.CharField(
        max_length=20, choices=AccessPolicy.choices, default=AccessPolicy.PUBLIC
    )
    file = models.FileField(
        upload_to="theses/",
        null=True,
        blank=True,
        validators=[FileExtensionValidator(["pdf"])],
    )
    processing_status = models.CharField(
        max_length=20, choices=ProcessingStatus.choices, default=ProcessingStatus.NONE
    )
    # Denormalized search data (kept in sync by theses.signals).
    tags_text = models.TextField(blank=True, default="")
    search_vector = SearchVectorField(null=True, editable=False)
    views = models.PositiveIntegerField(default=0, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["department"]),
            models.Index(fields=["faculty"]),
            models.Index(fields=["year"]),
            GinIndex(fields=["search_vector"], name="thesis_search_gin"),
        ]

    def __str__(self):
        return self.title

    @property
    def slug(self):
        return slugify(self.title) or "thesis"

    def is_public(self):
        return self.access_policy == self.AccessPolicy.PUBLIC

    def can_view(self, user):
        if self.is_public():
            return self.status == self.Status.PUBLISHED
        if user and self.owner_id == user.id:
            return True
        return bool(user and user.role == "admin")


class SavedThesis(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="saved_theses", on_delete=models.CASCADE)
    thesis = models.ForeignKey(Thesis, related_name="saved_by", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "thesis")


class AccessRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        DENIED = "denied", "Denied"

    thesis = models.ForeignKey(Thesis, related_name="access_requests", on_delete=models.CASCADE)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="access_requests", on_delete=models.CASCADE)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("thesis", "requester")