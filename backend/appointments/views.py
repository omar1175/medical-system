from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.choices import (
    APPOINTMENT_STATUS_CANCELLED,
    APPOINTMENT_STATUS_CONFIRMED,
    DOCTOR,
    PATIENT,
)
from core import emails
from users.permissions import IsAdminRole, IsDoctor, IsPatient

from .models import Appointment
from .serializers import (
    AppointmentCreateSerializer,
    AppointmentRescheduleSerializer,
    AppointmentSerializer,
    AppointmentStatusSerializer,
)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsPatient()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_role:
            return Appointment.objects.all()
        if user.role == DOCTOR:
            try:
                profile = user.doctorprofile
                return Appointment.objects.filter(doctor=profile)
            except Exception:
                return Appointment.objects.none()
        if user.role == PATIENT:
            return Appointment.objects.filter(patient=user)
        return Appointment.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return AppointmentCreateSerializer
        if self.action == "update_status":
            return AppointmentStatusSerializer
        if self.action == "reschedule":
            return AppointmentRescheduleSerializer
        return AppointmentSerializer

    def perform_create(self, serializer):
        appointment = serializer.save()
        transaction.on_commit(lambda: emails.send_booking_confirmation_email(appointment))

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        user = request.user

        if user.role == PATIENT:
            new_status = request.data.get("status")
            if new_status != APPOINTMENT_STATUS_CANCELLED:
                return Response(
                    {"detail": "Patients can only cancel appointments."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if appointment.patient != user:
                return Response(
                    {"detail": "Not your appointment."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif user.role == DOCTOR:
            if appointment.doctor.user != user:
                return Response(
                    {"detail": "Not your appointment."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif not user.is_admin_role:
            return Response(
                {"detail": "Not authorized."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AppointmentStatusSerializer(appointment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        transaction.on_commit(lambda: emails.send_status_change_email(appointment))
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def reschedule(self, request, pk=None):
        appointment = self.get_object()
        user = request.user

        if user.role == PATIENT and appointment.patient != user:
            return Response({"detail": "Not your appointment."}, status=status.HTTP_403_FORBIDDEN)
        if user.role == DOCTOR and appointment.doctor.user != user:
            return Response({"detail": "Not your appointment."}, status=status.HTTP_403_FORBIDDEN)
        if user.role not in (PATIENT, DOCTOR) and not user.is_admin_role:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        if appointment.status not in (APPOINTMENT_STATUS_PENDING, APPOINTMENT_STATUS_CONFIRMED):
            return Response(
                {"detail": "Cannot reschedule a completed or cancelled appointment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AppointmentRescheduleSerializer(appointment, data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment.scheduled_at = serializer.validated_data["scheduled_at"]
        if "duration_minutes" in serializer.validated_data:
            appointment.duration_minutes = serializer.validated_data["duration_minutes"]
        appointment.save(update_fields=["scheduled_at", "duration_minutes", "updated_at"])
        return Response(AppointmentSerializer(appointment).data)
