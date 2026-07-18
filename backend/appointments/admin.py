from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ["id", "patient", "doctor", "specialty", "scheduled_at", "status", "created_at"]
    list_filter = ["status", "specialty"]
    search_fields = [
        "patient__first_name", "patient__last_name", "patient__email",
        "doctor__user__first_name", "doctor__user__last_name",
    ]
    readonly_fields = ["created_at", "updated_at"]
