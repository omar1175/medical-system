"""Email helpers shared across the project.

All outgoing mail goes through Anymail (configured via ``ANYMAIL``), which in
development simply logs to the console thanks to the console email backend in
``settings_dev``.
"""

import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def _send(subject, recipient, text_body, html_body=None, from_email=None):
    send_mail(
        subject=subject,
        message=text_body,
        from_email=from_email or settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient],
        html_message=html_body,
        fail_silently=False,
    )


def build_confirmation_link(user):
    """Build the email-confirmation link the frontend confirms against."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{settings.FRONTEND_URL}/confirm-email?uid={uid}&token={token}"


def send_confirmation_email(user):
    """Send an account-confirmation email containing a verification link."""
    link = build_confirmation_link(user)
    context = {
        "user": user,
        "link": link,
    }
    text = render_to_string("core/email/confirmation.txt", context)
    html = render_to_string("core/email/confirmation.html", context)
    _send(
        subject="Confirm your Medical Appointment account",
        recipient=user.email,
        text_body=text,
        html_body=html,
    )


def build_password_reset_link(user):
    """Build the password-reset link the frontend uses to confirm identity."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"


def send_password_reset_email(user):
    """Send a password-reset email containing a verification link."""
    link = build_password_reset_link(user)
    context = {"user": user, "link": link}
    text = render_to_string("core/email/password_reset.txt", context)
    html = render_to_string("core/email/password_reset.html", context)
    _send(
        subject="Reset your Medical Appointment password",
        recipient=user.email,
        text_body=text,
        html_body=html,
    )


def send_booking_confirmation_email(appointment):
    """Notify the patient and doctor that an appointment was booked."""
    patient = appointment.patient
    doctor = appointment.doctor
    patient_text = render_to_string(
        "core/email/booking_patient.txt", {"appointment": appointment}
    )
    doctor_text = render_to_string(
        "core/email/booking_doctor.txt", {"appointment": appointment}
    )
    if patient.email:
        try:
            _send(
                subject="Appointment booked",
                recipient=patient.email,
                text_body=patient_text,
            )
        except Exception:
            logger.exception("Failed to send booking email to patient %s", patient.email)
    if doctor.user.email:
        try:
            _send(
                subject="New appointment request",
                recipient=doctor.user.email,
                text_body=doctor_text,
            )
        except Exception:
            logger.exception("Failed to send booking email to doctor %s", doctor.user.email)


def send_payment_request_email(payment):
    """Notify the patient that a doctor has requested a payment."""
    patient = payment.patient
    doctor = payment.doctor
    context = {
        "payment": payment,
        "patient": patient,
        "doctor": doctor,
        "checkout_url": payment.checkout_url,
    }
    text = render_to_string("core/email/payment_request.txt", context)
    if patient.email:
        try:
            _send(
                subject="Payment requested for your appointment",
                recipient=patient.email,
                text_body=text,
            )
        except Exception:
            logger.exception("Failed to send payment request email to patient %s", patient.email)


def send_payment_confirmation_email(payment):
    """Notify the doctor and patient that a payment succeeded."""
    patient = payment.patient
    doctor = payment.doctor
    context = {"payment": payment, "patient": patient, "doctor": doctor}
    patient_text = render_to_string("core/email/payment_confirmation_patient.txt", context)
    doctor_text = render_to_string("core/email/payment_confirmation_doctor.txt", context)
    if patient.email:
        try:
            _send(
                subject="Payment received — thank you",
                recipient=patient.email,
                text_body=patient_text,
            )
        except Exception:
            logger.exception("Failed to send payment confirmation to patient %s", patient.email)
    if doctor.user.email:
        try:
            _send(
                subject="Payment received for an appointment",
                recipient=doctor.user.email,
                text_body=doctor_text,
            )
        except Exception:
            logger.exception("Failed to send payment confirmation to doctor %s", doctor.user.email)


def send_status_change_email(appointment):
    """Notify the patient and doctor when an appointment status changes."""
    patient = appointment.patient
    doctor = appointment.doctor
    context = {"appointment": appointment}
    patient_text = render_to_string("core/email/status_change.txt", context)
    doctor_text = render_to_string("core/email/status_change.txt", context)
    if patient.email:
        try:
            _send(
                subject=f"Appointment {appointment.status.title()}",
                recipient=patient.email,
                text_body=patient_text,
            )
        except Exception:
            logger.exception("Failed to send status change email to patient %s", patient.email)
    if doctor.user.email:
        try:
            _send(
                subject=f"Appointment {appointment.status.title()}",
                recipient=doctor.user.email,
                text_body=doctor_text,
            )
        except Exception:
            logger.exception("Failed to send status change email to doctor %s", doctor.user.email)
