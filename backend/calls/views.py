from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from appointments.models import Appointment
from .utils import get_ice_server_config, validate_call_access


class CallInfoView(APIView):
    """Return room information and ICE server config for a video call appointment."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, appointment_id):
        try:
            appointment = Appointment.objects.select_related(
                "patient", "doctor__user"
            ).get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        access = validate_call_access(request.user, appointment)
        if access is not True:
            return Response(
                {"detail": access},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({
            "appointment_id": appointment.id,
            "status": appointment.status,
            "appointment_type": appointment.appointment_type,
            "patient_id": appointment.patient_id,
            "patient_name": appointment.patient.get_full_name() or appointment.patient.username,
            "doctor_id": appointment.doctor.user_id,
            "doctor_name": appointment.doctor.user.get_full_name() or appointment.doctor.user.username,
            "scheduled_at": appointment.scheduled_at.isoformat(),
            "ice_servers": get_ice_server_config(),
        })
