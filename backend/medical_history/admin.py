from django.contrib import admin

from .models import LabTest, MedicalHistory, Prescription


class PrescriptionInline(admin.TabularInline):
    model = Prescription
    extra = 0
    fields = ["medication_name", "dosage", "frequency", "duration", "notes"]


class LabTestInline(admin.TabularInline):
    model = LabTest
    extra = 0
    fields = ["test_name", "result", "normal_range", "test_date", "notes"]


@admin.register(MedicalHistory)
class MedicalHistoryAdmin(admin.ModelAdmin):
    list_display = [
        "id", "patient", "doctor", "appointment",
        "diagnosis_short", "created_at",
    ]
    list_filter = ["created_at", "doctor__specialty"]
    search_fields = [
        "patient__first_name", "patient__last_name", "patient__email",
        "doctor__user__first_name", "doctor__user__last_name",
        "diagnosis", "symptoms",
    ]
    raw_id_fields = ["patient", "doctor", "appointment"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [PrescriptionInline, LabTestInline]
    ordering = ["-created_at"]

    def diagnosis_short(self, obj):
        if obj.diagnosis:
            return obj.diagnosis[:80] + ("..." if len(obj.diagnosis) > 80 else "")
        return "-"
    diagnosis_short.short_description = "Diagnosis"


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ["id", "medication_name", "dosage", "frequency", "duration"]
    search_fields = ["medication_name", "medical_history__patient__first_name"]
    raw_id_fields = ["medical_history"]


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ["id", "test_name", "result", "normal_range", "test_date"]
    list_filter = ["test_date"]
    search_fields = ["test_name", "medical_history__patient__first_name"]
    raw_id_fields = ["medical_history"]
