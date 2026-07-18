from django.contrib import admin

from .models import Availability, DoctorProfile, Specialty


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "created_at"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name"]


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "specialty", "consultation_fee", "is_approved", "created_at"]
    list_filter = ["is_approved", "specialty"]
    search_fields = ["user__first_name", "user__last_name", "user__email"]
    list_editable = ["is_approved"]


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ["doctor", "day_of_week", "start_time", "end_time", "is_active"]
    list_filter = ["day_of_week", "is_active"]
