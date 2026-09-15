from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/theses/", include("theses.urls")),
    path("api/search/", include("search.urls")),
    path("api/researchers/", include("researchers.urls")),
    path("api/collaboration/", include("collaboration.urls")),
    path("api/messages/", include("messaging.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/integrations/", include("integrations.urls")),
    # OpenAPI docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/docs/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)