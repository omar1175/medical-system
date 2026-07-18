from django.conf import settings
from django.db import models

from core.choices import (
    APPOINTMENT_STATUS_CHOICES,
    APPOINTMENT_STATUS_COMPLETED,
    APPOINTMENT_STATUS_CONFIRMED,
    APPOINTMENT_STATUS_PENDING,
    APPOINTMENT_TYPE_CHOICES,
    APPOINTMENT_TYPE_IN_PERSON,
)
from doctors.models import DoctorProfile, Specialty


class Appointment(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments_as_patient"
    )
    doctor = models.ForeignKey(
        DoctorProfile, on_delete=models.CASCADE, related_name="appointments_as_doctor"
    )
    specialty = models.ForeignKey(
        Specialty, on_delete=models.SET_NULL, null=True, related_name="appointments"
    )
    scheduled_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=30, null=True, blank=True)
    appointment_type = models.CharField(
        max_length=15,
        choices=APPOINTMENT_TYPE_CHOICES,
        default=APPOINTMENT_TYPE_IN_PERSON,
    )
    status = models.CharField(
        max_length=12,
        choices=APPOINTMENT_STATUS_CHOICES,
        default=APPOINTMENT_STATUS_PENDING,
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "appointments_appointment"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["doctor", "scheduled_at"],
                condition=models.Q(
                    status__in=[
                        APPOINTMENT_STATUS_CONFIRMED,
                    ],
                    scheduled_at__isnull=False,
                ),
                name="unique_confirmed_appointment_per_doctor_slot",
            )
        ]
        indexes = [
            models.Index(fields=["doctor", "scheduled_at"]),
            models.Index(fields=["patient", "scheduled_at"]),
        ]

    def __str__(self):
        return f"Appt #{self.pk} {self.patient} -> {self.doctor} @ {self.scheduled_at}"
