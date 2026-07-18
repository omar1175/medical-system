from django.conf import settings
from django.db import models

from doctors.models import DoctorProfile


class MedicalHistory(models.Model):
    """Core medical record tracking a patient's health journey.

    Each entry represents a visit / consultation outcome — created by a doctor
    and linked to an optional appointment for audit trail.
    """

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="medical_records",
    )
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name="medical_records",
    )
    appointment = models.ForeignKey(
        "appointments.Appointment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="medical_records",
    )
    diagnosis = models.TextField(blank=True)
    symptoms = models.TextField(blank=True)
    treatment_plan = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "medical_history_record"
        ordering = ["-created_at"]
        verbose_name_plural = "medical histories"

    def __str__(self):
        patient_name = self.patient.get_full_name() or self.patient.username
        doctor_name = str(self.doctor) if self.doctor else "Unknown"
        return f"Record #{self.pk}: {patient_name} – {doctor_name} @ {self.created_at:%Y-%m-%d}"


class Prescription(models.Model):
    """Medication prescribed during a medical consultation."""

    medical_history = models.ForeignKey(
        MedicalHistory,
        on_delete=models.CASCADE,
        related_name="prescriptions",
    )
    medication_name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100, help_text="e.g. 500mg")
    frequency = models.CharField(
        max_length=200, help_text="e.g. Twice daily after meals"
    )
    duration = models.CharField(
        max_length=100, help_text="e.g. 7 days"
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "medical_history_prescription"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.medication_name} – {self.dosage} ({self.frequency})"


class LabTest(models.Model):
    """Lab / diagnostic test ordered during a consultation."""

    medical_history = models.ForeignKey(
        MedicalHistory,
        on_delete=models.CASCADE,
        related_name="lab_tests",
    )
    test_name = models.CharField(max_length=200)
    result = models.TextField(blank=True)
    normal_range = models.CharField(max_length=200, blank=True)
    test_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "medical_history_labtest"
        ordering = ["-test_date"]

    def __str__(self):
        return f"{self.test_name} ({self.test_date})"
