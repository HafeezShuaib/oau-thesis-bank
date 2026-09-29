from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from drf_spectacular.utils import extend_schema
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from theses.models import SavedThesis, Thesis

from .serializers import (
    BreakdownRowSerializer,
    OverviewSerializer,
    TopThesisSerializer,
    TrendRowSerializer,
)


class IsAdminOrFaculty(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.role in ("admin", "faculty")


@extend_schema(responses={200: OverviewSerializer})
class OverviewView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        published = Thesis.objects.filter(status=Thesis.Status.PUBLISHED)
        data = {
            "total_users": User.objects.count(),
            "total_theses": Thesis.objects.count(),
            "published_theses": published.count(),
            "draft_theses": Thesis.objects.filter(status=Thesis.Status.DRAFT).count(),
            "restricted_theses": Thesis.objects.filter(access_policy=Thesis.AccessPolicy.RESTRICTED).count(),
            "total_views": published.aggregate(total=Sum("views"))["total"] or 0,
            "total_downloads": published.aggregate(total=Sum("downloads"))["total"] or 0,
            "total_saves": SavedThesis.objects.count(),
            "active_users": User.objects.filter(status=User.Status.ACTIVE).count(),
        }
        return Response(data)


@extend_schema(responses={200: TopThesisSerializer(many=True)})
class TopThesesView(APIView):
    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        metric = request.query_params.get("metric", "views")
        field = {"views": "-views", "downloads": "-downloads", "saves": "-save_count"}[metric]
        theses = (
            Thesis.objects.filter(status=Thesis.Status.PUBLISHED)
            .annotate(save_count=Count("saved_by"))
            .order_by(field)[:10]
            .values("id", "title", "author", "department", "faculty", "views", "downloads", "save_count")
        )
        return Response(list(theses))


@extend_schema(responses={200: BreakdownRowSerializer(many=True)})
class BreakdownView(APIView):
    """Aggregate counts grouped by a dimension (department/faculty/year)."""

    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        dimension = request.query_params.get("dimension", "department")
        if dimension not in ("department", "faculty", "year"):
            return Response({"error": "dimension must be department, faculty or year"}, status=400)
        rows = (
            Thesis.objects.filter(status=Thesis.Status.PUBLISHED)
            .values(dimension)
            .annotate(
                count=Count("id"),
                views=Sum("views"),
                downloads=Sum("downloads"),
                saves=Count("saved_by"),
            )
            .order_by("-count")
        )
        return Response(list(rows))


@extend_schema(responses={200: TrendRowSerializer(many=True)})
class ViewsTrendView(APIView):
    """Views/saves per month over the last N months."""

    permission_classes = [IsAdminOrFaculty]

    def get(self, request):
        months = int(request.query_params.get("months", 6))
        trend = (
            Thesis.objects.filter(status=Thesis.Status.PUBLISHED)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(
                theses=Count("id"),
                views=Sum("views"),
                downloads=Sum("downloads"),
                saves=Count("saved_by"),
            )
            .order_by("-month")[:months]
        )
        return Response(
            [
                {
                    "month": item["month"].isoformat() if item["month"] else None,
                    "theses": item["theses"],
                    "views": item["views"] or 0,
                    "downloads": item["downloads"] or 0,
                    "saves": item["saves"],
                }
                for item in trend
            ]
        )