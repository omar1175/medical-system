import json
import uuid
from django.utils import timezone
from django.conf import settings
from rest_framework.exceptions import PermissionDenied
from core.choices import DOCTOR, PATIENT
from users.permissions import IsPatient, IsDoctor
from doctors.models import DoctorProfile
from appointments.models import Appointment
from appointments.serializers import (
    AppointmentCreateSerializer,
    AppointmentStatusSerializer,
    _validate_no_overlap,
    _validate_availability,
)
from core import emails


def _role(user):
    return user.role


def _doctor_for(user):
    if _role(user) != DOCTOR:
        return None
    return getattr(user, "doctorprofile", None)


def _format_dt(dt):
    if not dt:
        return None
    return dt.astimezone(timezone.get_current_timezone()).isoformat()


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "list_doctors",
            "description": "List approved doctors, optionally filtered by specialty or name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "specialty": {
                        "type": "string",
                        "description": "Optional specialty name to filter by.",
                    },
                    "name": {
                        "type": "string",
                        "description": "Optional name fragment to filter by.",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_availability",
            "description": "Get weekly availability slots for a specific doctor.",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {
                        "type": "integer",
                        "description": "ID of the doctor profile.",
                    },
                },
                "required": ["doctor_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_my_appointments",
            "description": "List the current user's appointments, optionally filtered by status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "description": "Optional status filter: PENDING, CONFIRMED, COMPLETED, CANCELLED.",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "propose_booking",
            "description": "Propose a new appointment booking (validates but does NOT create). Returns a proposal_id and summary for the user to confirm.",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {"type": "integer", "description": "Doctor profile ID."},
                    "scheduled_at": {"type": "string", "description": "ISO-8601 datetime for the appointment."},
                    "duration_minutes": {"type": "integer", "description": "Duration in minutes, default 30."},
                    "appointment_type": {"type": "string", "description": "IN_PERSON, ONLINE_CHAT, or ONLINE_VIDEO. Default IN_PERSON."},
                    "notes": {"type": "string", "description": "Optional notes."},
                },
                "required": ["doctor_id", "scheduled_at"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "confirm_booking",
            "description": "Execute a previously proposed booking using its proposal_id. This actually creates the appointment.",
            "parameters": {
                "type": "object",
                "properties": {
                    "proposal_id": {"type": "string", "description": "The proposal_id returned by propose_booking."},
                },
                "required": ["proposal_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "propose_reschedule",
            "description": "Propose rescheduling an existing appointment (validates but does NOT save). Returns a proposal_id and summary.",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_id": {"type": "integer", "description": "ID of the appointment to reschedule."},
                    "scheduled_at": {"type": "string", "description": "New ISO-8601 datetime."},
                    "duration_minutes": {"type": "integer", "description": "Optional new duration in minutes."},
                },
                "required": ["appointment_id", "scheduled_at"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "confirm_reschedule",
            "description": "Execute a previously proposed reschedule using its proposal_id.",
            "parameters": {
                "type": "object",
                "properties": {
                    "proposal_id": {"type": "string", "description": "The proposal_id returned by propose_reschedule."},
                },
                "required": ["proposal_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_appointment",
            "description": "Cancel an appointment (sets status to CANCELLED). Patients can cancel their own; doctors can cancel their own.",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_id": {"type": "integer", "description": "ID of the appointment to cancel."},
                },
                "required": ["appointment_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_doctor_schedule",
            "description": "Get the doctor's upcoming appointments (doctor role only).",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {"type": "string", "description": "Optional date filter YYYY-MM-DD."},
                },
            },
        },
    },
]

_PROPOSALS = {}


def _enforce_appointment_permission(user, appointment):
    if user.role == PATIENT:
        if appointment.patient != user:
            raise PermissionDenied("Not your appointment.")
    elif user.role == DOCTOR:
        if appointment.doctor.user != user:
            raise PermissionDenied("Not your appointment.")
    else:
        if not user.is_admin_role:
            raise PermissionDenied("Not authorized.")


def _normalize_scheduled_at(value):
    from django.utils.dateparse import parse_datetime
    from django.utils import timezone as tz
    dt = parse_datetime(value)
    if dt is None:
        raise ValueError(f"Invalid datetime: {value}")
    if tz.is_naive(dt):
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(tz.get_current_timezone())


def list_doctors(user, specialty=None, name=None):
    qs = DoctorProfile.objects.filter(is_approved=True)
    if specialty:
        qs = qs.filter(specialty__name__icontains=specialty)
    if name:
        qs = qs.filter(user__first_name__icontains=name) | qs.filter(user__last_name__icontains=name)
    results = []
    for d in qs.select_related("user", "specialty"):
        results.append({
            "id": d.id,
            "name": d.user.get_full_name() or d.user.username,
            "specialty": d.specialty.name if d.specialty else "",
            "rating": float(d.rating),
            "fee": float(d.consultation_fee),
        })
    return {"doctors": results}


def get_availability(user, doctor_id):
    try:
        doctor = DoctorProfile.objects.get(pk=doctor_id, is_approved=True)
    except DoctorProfile.DoesNotExist:
        return {"error": "Doctor not found."}
    slots = []
    for a in doctor.availability.filter(is_active=True).order_by("day_of_week", "start_time"):
        slots.append({
            "day_of_week": a.day_of_week,
            "day_name": dict(a.DAYS).get(a.day_of_week, ""),
            "start_time": str(a.start_time),
            "end_time": str(a.end_time),
        })
    return {"doctor_id": doctor.id, "doctor_name": doctor.user.get_full_name() or doctor.user.username, "slots": slots}


def list_my_appointments(user, status=None):
    if user.role == PATIENT:
        qs = Appointment.objects.filter(patient=user)
    elif user.role == DOCTOR:
        doctor = _doctor_for(user)
        if not doctor:
            return {"error": "No doctor profile found."}
        qs = Appointment.objects.filter(doctor=doctor)
    else:
        qs = Appointment.objects.all()
    if status:
        qs = qs.filter(status=status)
    appts = []
    for a in qs.select_related("doctor", "specialty", "patient").order_by("-scheduled_at")[:50]:
        appts.append({
            "id": a.id,
            "doctor": a.doctor.user.get_full_name() or a.doctor.user.username,
            "scheduled_at": _format_dt(a.scheduled_at),
            "duration_minutes": a.duration_minutes,
            "status": a.status,
            "notes": a.notes,
        })
    return {"appointments": appts}


def propose_booking(user, doctor_id, scheduled_at, duration_minutes=30, appointment_type="IN_PERSON", notes=""):
    if _role(user) != PATIENT:
        return {"error": "Only patients can book appointments."}
    try:
        doctor = DoctorProfile.objects.get(pk=doctor_id, is_approved=True)
    except DoctorProfile.DoesNotExist:
        return {"error": "Doctor not found or not approved."}
    dt = _normalize_scheduled_at(scheduled_at)
    try:
        _validate_no_overlap(doctor, dt, duration_minutes)
    except Exception as e:
        return {"error": str(e)}
    if appointment_type == "IN_PERSON":
        try:
            _validate_availability(doctor, dt, duration_minutes)
        except Exception as e:
            return {"error": str(e)}
    if dt < timezone.now():
        return {"error": "Cannot book an appointment in the past."}
    proposal_id = str(uuid.uuid4())
    _PROPOSALS[proposal_id] = {
        "action": "booking",
        "user_id": user.pk,
        "doctor_id": doctor_id,
        "scheduled_at": dt.isoformat(),
        "duration_minutes": duration_minutes,
        "appointment_type": appointment_type,
        "notes": notes,
    }
    return {
        "proposal_id": proposal_id,
        "summary": f"Book appointment with {doctor.user.get_full_name() or doctor.user.username} on {dt.strftime('%Y-%m-%d %H:%M')} for {duration_minutes} minutes ({appointment_type}).",
    }


def confirm_booking(user, proposal_id):
    proposal = _PROPOSALS.get(proposal_id)
    if not proposal:
        return {"error": "Invalid or expired proposal. Please try again."}
    if proposal["action"] != "booking" or proposal["user_id"] != user.pk:
        raise PermissionDenied("This proposal does not belong to you.")
    dt = _normalize_scheduled_at(proposal["scheduled_at"])
    serializer = AppointmentCreateSerializer(data={
        "doctor": proposal["doctor_id"],
        "scheduled_at": dt,
        "duration_minutes": proposal["duration_minutes"],
        "appointment_type": proposal["appointment_type"],
        "notes": proposal["notes"],
    }, context={"request": type("req", (), {"user": user})()})
    try:
        serializer.is_valid(raise_exception=True)
    except Exception as e:
        return {"error": str(e)}
    appointment = serializer.save()
    del _PROPOSALS[proposal_id]
    return {
        "success": True,
        "appointment_id": appointment.id,
        "message": f"Appointment booked successfully with {appointment.doctor.user.get_full_name() or appointment.doctor.user.username} on {appointment.scheduled_at.strftime('%Y-%m-%d %H:%M')}.",
    }


def propose_reschedule(user, appointment_id, scheduled_at, duration_minutes=30):
    try:
        appointment = Appointment.objects.get(pk=appointment_id)
    except Appointment.DoesNotExist:
        return {"error": "Appointment not found."}
    _enforce_appointment_permission(user, appointment)
    if appointment.status not in ("PENDING", "CONFIRMED"):
        return {"error": "Cannot reschedule a completed or cancelled appointment."}
    dt = _normalize_scheduled_at(scheduled_at)
    if dt < timezone.now():
        return {"error": "Cannot reschedule to the past."}
    try:
        _validate_no_overlap(appointment.doctor, dt, duration_minutes, exclude_pk=appointment.pk)
    except Exception as e:
        return {"error": str(e)}
    try:
        _validate_availability(appointment.doctor, dt, duration_minutes)
    except Exception as e:
        return {"error": str(e)}
    proposal_id = str(uuid.uuid4())
    _PROPOSALS[proposal_id] = {
        "action": "reschedule",
        "user_id": user.pk,
        "appointment_id": appointment_id,
        "scheduled_at": dt.isoformat(),
        "duration_minutes": duration_minutes,
    }
    return {
        "proposal_id": proposal_id,
        "summary": f"Reschedule appointment #{appointment_id} to {dt.strftime('%Y-%m-%d %H:%M')} for {duration_minutes} minutes.",
    }


def confirm_reschedule(user, proposal_id):
    proposal = _PROPOSALS.get(proposal_id)
    if not proposal:
        return {"error": "Invalid or expired proposal. Please try again."}
    if proposal["action"] != "reschedule" or proposal["user_id"] != user.pk:
        raise PermissionDenied("This proposal does not belong to you.")
    try:
        appointment = Appointment.objects.get(pk=proposal["appointment_id"])
    except Appointment.DoesNotExist:
        return {"error": "Appointment no longer exists."}
    _enforce_appointment_permission(user, appointment)
    if appointment.status not in ("PENDING", "CONFIRMED"):
        return {"error": "Cannot reschedule a completed or cancelled appointment."}
    dt = _normalize_scheduled_at(proposal["scheduled_at"])
    try:
        _validate_no_overlap(appointment.doctor, dt, proposal["duration_minutes"], exclude_pk=appointment.pk)
    except Exception as e:
        return {"error": str(e)}
    try:
        _validate_availability(appointment.doctor, dt, proposal["duration_minutes"])
    except Exception as e:
        return {"error": str(e)}
    appointment.scheduled_at = dt
    if proposal["duration_minutes"] != appointment.duration_minutes:
        appointment.duration_minutes = proposal["duration_minutes"]
    appointment.save(update_fields=["scheduled_at", "duration_minutes", "updated_at"])
    del _PROPOSALS[proposal_id]
    return {
        "success": True,
        "appointment_id": appointment.id,
        "message": f"Appointment #{appointment.id} rescheduled to {appointment.scheduled_at.strftime('%Y-%m-%d %H:%M')}.",
    }


def cancel_appointment(user, appointment_id):
    try:
        appointment = Appointment.objects.get(pk=appointment_id)
    except Appointment.DoesNotExist:
        return {"error": "Appointment not found."}
    _enforce_appointment_permission(user, appointment)
    if user.role == PATIENT and appointment.patient != user:
        raise PermissionDenied("Not your appointment.")
    if user.role == PATIENT and appointment.status not in ("PENDING", "CONFIRMED"):
        return {"error": "Can only cancel pending or confirmed appointments."}
    old_status = appointment.status
    appointment.status = "CANCELLED"
    appointment.save(update_fields=["status", "updated_at"])
    try:
        from django.db import transaction
        transaction.on_commit(lambda: emails.send_status_change_email(appointment))
    except Exception:
        pass
    return {
        "success": True,
        "appointment_id": appointment.id,
        "message": f"Appointment #{appointment.id} cancelled (was {old_status}).",
    }


def get_doctor_schedule(user, date=None):
    doctor = _doctor_for(user)
    if not doctor:
        raise PermissionDenied("Only doctors can view this schedule.")
    qs = Appointment.objects.filter(doctor=doctor, status__in=["PENDING", "CONFIRMED"])
    if date:
        qs = qs.filter(scheduled_at__date=date)
    appts = []
    for a in qs.select_related("patient").order_by("scheduled_at"):
        appts.append({
            "id": a.id,
            "patient": a.patient.get_full_name() or a.patient.username,
            "scheduled_at": _format_dt(a.scheduled_at),
            "duration_minutes": a.duration_minutes,
            "status": a.status,
            "notes": a.notes,
        })
    return {"appointments": appts}


HANDLERS = {
    "list_doctors": list_doctors,
    "get_availability": get_availability,
    "list_my_appointments": list_my_appointments,
    "propose_booking": propose_booking,
    "confirm_booking": confirm_booking,
    "propose_reschedule": propose_reschedule,
    "confirm_reschedule": confirm_reschedule,
    "cancel_appointment": cancel_appointment,
    "get_doctor_schedule": get_doctor_schedule,
}
