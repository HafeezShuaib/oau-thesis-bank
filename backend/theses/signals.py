from django.contrib.postgres.search import SearchVector
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver

from .models import Thesis


def _reindex_search(thesis):
    """Rebuild the full-text search vector for a single thesis."""
    tags_text = " ".join(thesis.tags.values_list("name", flat=True))
    vector = (
        SearchVector("title", weight="A", config="english")
        + SearchVector("author", weight="B", config="english")
        + SearchVector("supervisor", weight="C", config="english")
        + SearchVector("abstract", weight="D", config="english")
        + SearchVector("tags_text", weight="B", config="english")
    )
    Thesis.objects.filter(pk=thesis.pk).update(search_vector=vector, tags_text=tags_text)


@receiver(post_save, sender=Thesis)
def _on_thesis_saved(sender, instance, **kwargs):
    _reindex_search(instance)


@receiver(m2m_changed, sender=Thesis.tags.through)
def _on_thesis_tags_changed(sender, instance, action, **kwargs):
    if action in ("post_add", "post_remove", "post_clear"):
        _reindex_search(instance)