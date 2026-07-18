from django.conf import settings
from django.db import models

from core.choices import (
    APPOINTMENT_STATUS_CONFIRMED,
    APPOINTMENT_TYPE_ONLINE_VIDEO,
)
from appointments.models import Appointment


class CallSession(models.Model):
    """Tracks a video call session tied to an ONLINE_VIDEO appointment."""

    STATUS_WAITING = "WAITING"
    STATUS_ACTIVE = "ACTIVE"
    STATUS_ENDED = "ENDED"

    STATUS_CHOICES = [
        (STATUS_WAITING, "Waiting"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_ENDED, "Ended"),
    ]

    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name="call_session",
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=STATUS_WAITING,
    )
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "calls_session"

    def __str__(self):
        return f"Call #{self.pk} for Appt #{self.appointment_id} ({self.status})"
