from django.urls import path

from .views import BreakdownView, OverviewView, TopThesesView, ViewsTrendView

urlpatterns = [
    path("overview/", OverviewView.as_view(), name="analytics-overview"),
    path("top-theses/", TopThesesView.as_view(), name="analytics-top-theses"),
    path("breakdown/", BreakdownView.as_view(), name="analytics-breakdown"),
    path("views-trend/", ViewsTrendView.as_view(), name="analytics-views-trend"),
]