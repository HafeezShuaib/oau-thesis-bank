from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "role", "status", "department", "faculty", "is_active")
    list_filter = ("role", "status", "is_active")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)