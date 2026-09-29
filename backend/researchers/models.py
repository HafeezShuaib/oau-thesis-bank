from django.conf import settings
from django.db import models


class ResearcherProfile(models.Model):
    """Extended profile for researchers/faculty (ORCID, GitHub, mentoring)."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name="researcher_profile",
        on_delete=models.CASCADE,
    )
    bio = models.TextField(blank=True)
    orcid = models.URLField(blank=True, help_text="https://orcid.org/XXXX-XXXX-XXXX-XXXX")
    github = models.CharField(max_length=80, blank=True, help_text="GitHub username")
    website = models.URLField(blank=True)
    research_interests = models.TextField(blank=True)
    is_available_for_mentoring = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.display_name}'s profile"