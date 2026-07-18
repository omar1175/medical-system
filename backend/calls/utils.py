from core.choices import (
    APPOINTMENT_STATUS_CONFIRMED,
    APPOINTMENT_TYPE_ONLINE_VIDEO,
)


def get_ice_server_config():
    """Return ICE server configuration.

    To add TURN later, simply append a TURN entry to the iceServers list.
    The signaling consumer and frontend hook consume this dict dynamically,
    so no other code changes are required.
    """
    return [
        {"urls": "stun:stun.l.google.com:19302"},
        # Example TURN entry (uncomment and fill when Coturn is deployed):
        # {
        #     "urls": "turn:your-turn-server.com:3478",
        #     "username": "turnuser",
        #     "credential": "turnpass",
        # },
    ]


def validate_call_access(user, appointment):
    """Check that a user is authorized to join the video call for an appointment.

    Returns True if valid, or a string error message.
    """
    if not user or not user.is_authenticated:
        return "Authentication required."

    if appointment.status != APPOINTMENT_STATUS_CONFIRMED:
        return "Appointment is not confirmed."

    if appointment.appointment_type != APPOINTMENT_TYPE_ONLINE_VIDEO:
        return "This is not a video appointment."

    is_patient = appointment.patient_id == user.id
    is_doctor = appointment.doctor.user_id == user.id

    if not is_patient and not is_doctor:
        return "You are not a participant in this appointment."

    return True
