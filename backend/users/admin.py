from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser, PatientProfile


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "role", "is_email_confirmed", "is_staff")
    list_filter = UserAdmin.list_filter + ("role", "is_email_confirmed")
    fieldsets = UserAdmin.fieldsets + (
        ("Medical System", {"fields": ("role", "is_email_confirmed")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Medical System", {"fields": ("role", "email")}),
    )


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "phone", "date_of_birth", "created_at"]
    search_fields = ["user__first_name", "user__last_name", "user__email"]
