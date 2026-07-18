from django.utils import timezone
from rest_framework import serializers

from core.choices import (
    APPOINTMENT_STATUS_CANCELLED,
    APPOINTMENT_STATUS_COMPLETED,
    APPOINTMENT_STATUS_CONFIRMED,
    APPOINTMENT_STATUS_PENDING,
    APPOINTMENT_TYPE_IN_PERSON,
)

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.get_full_name", read_only=True)
    doctor_name = serializers.SerializerMethodField()
    specialty_name = serializers.CharField(source="specialty.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    appointment_type_display = serializers.CharField(source="get_appointment_type_display", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id", "patient", "patient_name", "doctor", "doctor_name",
            "specialty", "specialty_name", "scheduled_at", "duration_minutes",
            "appointment_type", "appointment_type_display",
            "status", "status_display", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "patient", "doctor", "status", "created_at", "updated_at"]

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name() or obj.doctor.user.username


def _validate_no_overlap(doctor, scheduled_at, duration, exclude_pk=None):
    """Check that the new appointment doesn't overlap with existing active ones."""
    end_time = scheduled_at + timezone.timedelta(minutes=duration)
    qs = Appointment.objects.filter(doctor=doctor).exclude(status=APPOINTMENT_STATUS_CANCELLED)
    if exclude_pk:
        qs = qs.exclude(pk=exclude_pk)
    for apt in qs:
        apt_end = apt.scheduled_at + timezone.timedelta(minutes=apt.duration_minutes)
        if apt.scheduled_at < end_time and apt_end > scheduled_at:
            raise serializers.ValidationError(
                {"scheduled_at": f"Overlaps with existing appointment at {apt.scheduled_at}."}
            )


def _validate_availability(doctor, scheduled_at, duration_minutes=30):
    """Check the doctor has an availability slot covering the full appointment duration."""
    from django.conf import settings
    from doctors.models import Availability
    clinic_tz = timezone.get_current_timezone()
    local_dt = scheduled_at.astimezone(clinic_tz)
    day_of_week = local_dt.weekday()
    appt_end = (scheduled_at + timezone.timedelta(minutes=duration_minutes)).astimezone(clinic_tz)
    has = Availability.objects.filter(
        doctor=doctor,
        day_of_week=day_of_week,
        start_time__lte=local_dt.time(),
        end_time__gte=appt_end.time(),
        is_active=True,
    ).exists()
    if not has:
        raise serializers.ValidationError(
            {"scheduled_at": "The doctor is not available at this time."}
        )


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["doctor", "specialty", "notes", "appointment_type"]

    def validate_doctor(self, value):
        if not value.is_approved:
            raise serializers.ValidationError("This doctor is not approved yet.")
        return value

    def create(self, validated_data):
        validated_data["patient"] = self.context["request"].user
        if not validated_data.get("specialty"):
            validated_data["specialty"] = validated_data["doctor"].specialty
        return super().create(validated_data)


class AppointmentRescheduleSerializer(serializers.Serializer):
    scheduled_at = serializers.DateTimeField()
    duration_minutes = serializers.IntegerField(required=False, default=30)

    def validate(self, attrs):
        scheduled_at = attrs["scheduled_at"]
        duration = attrs.get("duration_minutes", 30)
        appointment = self.instance

        if scheduled_at < timezone.now():
            raise serializers.ValidationError({"scheduled_at": "Cannot reschedule to the past."})

        _validate_no_overlap(appointment.doctor, scheduled_at, duration, exclude_pk=appointment.pk)
        _validate_availability(appointment.doctor, scheduled_at, duration)

        return attrs


class AppointmentStatusSerializer(serializers.ModelSerializer):
    scheduled_at = serializers.DateTimeField(required=False)
    duration_minutes = serializers.IntegerField(required=False, min_value=15, max_value=120)

    class Meta:
        model = Appointment
        fields = ["status", "notes", "scheduled_at", "duration_minutes"]

    def validate_status(self, value):
        current = self.instance.status
        allowed_transitions = {
            APPOINTMENT_STATUS_CONFIRMED: [APPOINTMENT_STATUS_COMPLETED, APPOINTMENT_STATUS_CANCELLED],
            APPOINTMENT_STATUS_PENDING: [APPOINTMENT_STATUS_CONFIRMED, APPOINTMENT_STATUS_CANCELLED],
        }
        if value not in allowed_transitions.get(current, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current} to {value}."
            )
        return value

    def validate(self, attrs):
        new_status = attrs.get("status")
        if new_status == APPOINTMENT_STATUS_CONFIRMED and self.instance.status == APPOINTMENT_STATUS_PENDING:
            if not attrs.get("scheduled_at"):
                raise serializers.ValidationError(
                    {"scheduled_at": "A date and time is required when confirming an appointment."}
                )
            if attrs["scheduled_at"] < timezone.now():
                raise serializers.ValidationError(
                    {"scheduled_at": "Cannot confirm an appointment in the past."}
                )
        return attrs
