from django.db.models import Count, Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from appointments.models import Appointment
from core.choices import DOCTOR, PATIENT
from users.permissions import IsDoctor, IsPatient

from .models import MedicalHistory
from .serializers import (
    MedicalHistoryCreateSerializer,
    MedicalHistorySerializer,
    MedicalHistoryUpdateSerializer,
    PatientSummarySerializer,
)


class MedicalHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsDoctor()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsDoctor()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_role:
            return MedicalHistory.objects.select_related(
                "patient", "doctor__user", "doctor__specialty", "appointment"
            ).prefetch_related("prescriptions", "lab_tests").all()

        if user.role == DOCTOR:
            try:
                profile = user.doctorprofile
                return MedicalHistory.objects.select_related(
                    "patient", "doctor__user", "doctor__specialty", "appointment"
                ).prefetch_related("prescriptions", "lab_tests").filter(
                    Q(doctor=profile)
                    | Q(patient__in=Appointment.objects.filter(
                        doctor=profile
                    ).values_list("patient_id", flat=True).distinct())
                ).distinct()
            except Exception:
                return MedicalHistory.objects.none()

        if user.role == PATIENT:
            return MedicalHistory.objects.select_related(
                "patient", "doctor__user", "doctor__specialty", "appointment"
            ).prefetch_related("prescriptions", "lab_tests").filter(
                patient=user
            )

        return MedicalHistory.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return MedicalHistoryCreateSerializer
        if self.action in ("update", "partial_update"):
            return MedicalHistoryUpdateSerializer
        return MedicalHistorySerializer

    def perform_create(self, serializer):
        serializer.save()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        patient_id = request.query_params.get("patient_id")
        if patient_id and request.user.role == DOCTOR:
            queryset = queryset.filter(patient_id=patient_id)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="patient-summary")
    def patient_summary(self, request):
        patient_id = request.query_params.get("patient_id")
        if not patient_id:
            if request.user.role == PATIENT:
                patient_id = request.user.id
            else:
                return Response(
                    {"detail": "patient_id query parameter is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        records = MedicalHistory.objects.filter(patient_id=patient_id)

        if request.user.role == DOCTOR:
            try:
                profile = request.user.doctorprofile
                records = records.filter(
                    Q(doctor=profile)
                    | Q(patient__in=Appointment.objects.filter(
                        doctor=profile
                    ).values_list("patient_id", flat=True))
                )
                if not records.exists():
                    return Response(
                        {"detail": "You do not have access to this patient's records."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            except Exception:
                return Response(
                    {"detail": "Doctor profile not found."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif request.user.role == PATIENT and request.user.id != int(patient_id):
            return Response(
                {"detail": "You can only view your own summary."},
                status=status.HTTP_403_FORBIDDEN,
            )

        totals = records.aggregate(
            total_prescriptions=Count("prescriptions"),
            total_lab_tests=Count("lab_tests"),
        )
        recent_diagnoses = list(
            records.exclude(diagnosis="")
            .values_list("diagnosis", flat=True)[:5]
        )
        recent_records = records[:5]

        data = {
            "total_records": records.count(),
            "total_prescriptions": totals["total_prescriptions"],
            "total_lab_tests": totals["total_lab_tests"],
            "recent_diagnoses": recent_diagnoses,
            "recent_records": MedicalHistorySerializer(recent_records, many=True).data,
        }

        return Response(PatientSummarySerializer(data).data)
