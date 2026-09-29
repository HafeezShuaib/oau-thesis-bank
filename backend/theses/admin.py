from django.contrib import admin

from .models import AccessRequest, SavedThesis, Tag, Thesis


class ThesisAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "department", "year", "status", "access_policy", "processing_status")
    list_filter = ("status", "access_policy", "processing_status", "department", "faculty")
    search_fields = ("title", "author", "abstract")
    filter_horizontal = ("tags",)


admin.site.register(Thesis, ThesisAdmin)
admin.site.register(Tag)
admin.site.register(SavedThesis)
admin.site.register(AccessRequest)