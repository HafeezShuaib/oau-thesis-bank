from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models import F
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from theses.models import Thesis
from theses.serializers import ThesisListSerializer


class SearchView(generics.ListAPIView):
    """Full-text search of published public theses with optional filters."""

    serializer_class = ThesisListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Thesis.objects.filter(status=Thesis.Status.PUBLISHED, access_policy=Thesis.AccessPolicy.PUBLIC)
        qs = qs.select_related("owner").prefetch_related("tags")

        params = self.request.query_params
        filters = {
            "department": "department__iexact",
            "faculty": "faculty__iexact",
            "year": "year",
            "tag": "tags__name__iexact",
        }
        for param, lookup in filters.items():
            value = params.get(param)
            if value:
                qs = qs.filter(**{lookup: value})

        return qs.distinct()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        raw_query = (request.query_params.get("q") or "").strip()

        if not raw_query:
            serializer = self.get_serializer(queryset, many=True)
            return Response(
                {
                    "count": len(serializer.data),
                    "results": [{"thesis": item, "matched_concepts": [], "relevance_score": None} for item in serializer.data],
                }
            )

        query = SearchQuery(raw_query, config="english")
        # Rank weights (ordered D, C, B, A): abstract+tags D, supervisor C, author B, title A.
        rank_weights = [0.1, 0.3, 0.6, 1.0]
        ranked = list(
            queryset.annotate(rank=SearchRank(F("search_vector"), query, weights=rank_weights))
            .filter(search_vector=query)
            .order_by("-rank")
        )
        max_rank = ranked[0].rank if ranked else 0

        terms = raw_query.lower().split()
        results = []
        for thesis in ranked:
            match_fields = {
                "title": thesis.title,
                "author": thesis.author,
                "supervisor": thesis.supervisor,
                "abstract": thesis.abstract,
                "tags": " ".join(tag.name for tag in thesis.tags.all()),
                "department": thesis.department,
                "faculty": thesis.faculty,
            }
            matched = sorted(
                {term for term in terms if any(term in field.lower() for field in match_fields.values())}
            )
            raw_rank = float(getattr(thesis, "rank", 0.0))
            relevance_score = round(raw_rank / max_rank, 4) if max_rank else 1.0
            results.append(
                {
                    "thesis": self.get_serializer(thesis).data,
                    "matched_concepts": matched,
                    "relevance_score": relevance_score,
                }
            )

        return Response({"count": len(results), "results": results})