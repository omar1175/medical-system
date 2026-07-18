from rest_framework import viewsets, permissions, filters, status as http_status
from rest_framework.decorators import action, api_view, permission_classes as pm
from rest_framework.response import Response

from users.permissions import IsAdminOrReadOnly, IsAdminRole, IsDoctor
from users.models import CustomUser
from appointments.models import Appointment

from .models import Availability, DoctorProfile, Specialty
from .serializers import (
    AvailabilitySerializer,
    DoctorListSerializer,
    DoctorProfileSerializer,
    SpecialtySerializer,
)


@api_view(["GET"])
@pm([permissions.AllowAny])
def platform_stats(request):
    return Response({
        "total_doctors": DoctorProfile.objects.filter(is_approved=True).count(),
        "total_patients": CustomUser.objects.filter(role="PATIENT").count(),
        "total_appointments": Appointment.objects.count(),
        "total_specialties": Specialty.objects.count(),
    })


class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"


class DoctorProfileViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.select_related("user", "specialty").all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["user__first_name", "user__last_name", "user__username", "specialty__name"]
    ordering_fields = ["consultation_fee", "specialty__name"]

    def get_serializer_class(self):
        if self.action == "list":
            return DoctorListSerializer
        return DoctorProfileSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "approve":
            return qs  # Admin sees all (approved + unapproved)
        qs = qs.filter(is_approved=True)
        specialty = self.request.query_params.get("specialty")
        if specialty:
            qs = qs.filter(specialty__slug=specialty)
        return qs

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        # Admin-only for write operations — prevents non-admin users from creating,
        # updating, or deleting doctor profiles.
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsAdminRole()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=["get", "patch"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        try:
            profile = DoctorProfile.objects.get(user=request.user)
        except DoctorProfile.DoesNotExist:
            return Response({"detail": "No doctor profile found."}, status=404)
        if request.method == "PATCH":
            serializer = DoctorProfileSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = DoctorProfileSerializer(profile)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], permission_classes=[permissions.IsAuthenticated, IsAdminRole])
    def approve(self, request, pk=None):
        profile = self.get_object()
        is_approved = request.data.get("is_approved")
        if is_approved is None:
            return Response({"detail": "is_approved field is required."}, status=http_status.HTTP_400_BAD_REQUEST)
        profile.is_approved = bool(is_approved)
        profile.save(update_fields=["is_approved"])
        return Response({"id": profile.id, "is_approved": profile.is_approved})


class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        user = self.request.user
        if user.is_authenticated and hasattr(user, "doctorprofile"):
            ctx["doctor"] = user.doctorprofile
        return ctx

    def get_queryset(self):
        qs = Availability.objects.all()
        doctor_id = self.request.query_params.get("doctor")
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id, is_active=True)
            return qs
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if user.is_admin_role:
            return qs
        try:
            profile = user.doctorprofile
        except DoctorProfile.DoesNotExist:
            return qs.none()
        return qs.filter(doctor=profile)

    def perform_create(self, serializer):
        try:
            profile = self.request.user.doctorprofile
        except Exception:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only doctors can manage availability.")
        serializer.save(doctor=profile)
