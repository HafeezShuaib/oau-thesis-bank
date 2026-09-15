from django.contrib.postgres.search import SearchVector
from django.db import migrations


def backfill_search_vectors(apps, schema_editor):
    Thesis = apps.get_model("theses", "Thesis")
    vector = (
        SearchVector("title", weight="A", config="english")
        + SearchVector("author", weight="B", config="english")
        + SearchVector("supervisor", weight="C", config="english")
        + SearchVector("abstract", weight="D", config="english")
        + SearchVector("tags_text", weight="B", config="english")
    )
    Thesis.objects.update(search_vector=vector)


class Migration(migrations.Migration):
    dependencies = [
        ("theses", "0003_thesis_views"),
    ]

    operations = [
        migrations.RunPython(backfill_search_vectors, migrations.RunPython.noop),
    ]