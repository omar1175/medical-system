from rest_framework import serializers

from appointments.models import Appointment
from core.choices import (
    APPOINTMENT_STATUS_CONFIRMED,
    APPOINTMENT_STATUS_PENDING,
    PAYMENT_STATUS_PENDING,
)
from doctors.models import DoctorProfile

from .models import DoctorSubscription, Payment, SubscriptionPlan


class PaymentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    appointment_id = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "appointment_id", "amount", "currency", "status", "status_display",
            "stripe_checkout_session_id", "checkout_url", "receipt_url",
            "paid_at", "created_at", "updated_at", "doctor_name", "patient_name",
        ]
        read_only_fields = [
            "id", "amount", "currency", "status", "stripe_checkout_session_id",
            "checkout_url", "receipt_url", "paid_at", "created_at", "updated_at",
            "doctor_name", "patient_name",
        ]

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name() or obj.doctor.user.username

    def get_patient_name(self, obj):
        return obj.patient.get_full_name() or obj.patient.username


class PaymentCreateSerializer(serializers.Serializer):
    appointment_id = serializers.IntegerField()

    def validate_appointment_id(self, value):
        request = self.context["request"]
        user = request.user

        try:
            appointment = Appointment.objects.select_related("doctor", "patient").get(pk=value)
        except Appointment.DoesNotExist:
            raise serializers.ValidationError("Appointment not found.")

        if user.is_admin_role:
            profile = appointment.doctor
        else:
            try:
                profile = user.doctorprofile
            except DoctorProfile.DoesNotExist:
                raise serializers.ValidationError("Only doctors can request payments.")

            if appointment.doctor_id != profile.id:
                raise serializers.ValidationError("This appointment does not belong to you.")

        if appointment.status not in (APPOINTMENT_STATUS_PENDING, APPOINTMENT_STATUS_CONFIRMED):
            raise serializers.ValidationError(
                "Payments can only be requested for pending or confirmed appointments."
            )

        if Payment.objects.filter(
            appointment=appointment,
            status=PAYMENT_STATUS_PENDING,
        ).exists():
            raise serializers.ValidationError("A pending payment already exists for this appointment.")

        self._appointment = appointment
        return value

    def create(self, validated_data):
        appointment = self._appointment
        doctor = appointment.doctor
        amount = doctor.consultation_fee
        if not amount or amount <= 0:
            raise serializers.ValidationError(
                "This doctor has no consultation fee set; cannot create a payment."
            )
        payment = Payment(
            appointment=appointment,
            amount=amount,
            currency="USD",
        )
        payment.save()
        return payment


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ["id", "name", "description", "price", "duration_days", "is_active"]


class DoctorSubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = DoctorSubscription
        fields = [
            "id", "doctor", "doctor_name", "plan", "plan_name",
            "status", "start_date", "end_date", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "doctor", "status", "start_date", "end_date", "created_at", "updated_at"]

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name() or obj.doctor.user.username


class SubscribeSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()

    def validate_plan_id(self, value):
        try:
            plan = SubscriptionPlan.objects.get(pk=value, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive plan.")
        self._plan = plan
        return value
