import json
import logging

from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response

from core.choices import DOCTOR, PATIENT
from core import emails
from users.permissions import IsDoctor

from .models import DoctorSubscription, Payment, SubscriptionPlan
from .serializers import (
    DoctorSubscriptionSerializer,
    PaymentCreateSerializer,
    PaymentSerializer,
    SubscribeSerializer,
    SubscriptionPlanSerializer,
)
from . import stripe_service

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related(
            "appointment", "appointment__doctor", "appointment__doctor__user",
            "appointment__patient",
        )
        if user.is_admin_role:
            return qs
        if user.role == DOCTOR:
            try:
                profile = user.doctorprofile
                return qs.filter(appointment__doctor=profile)
            except Exception:
                return Payment.objects.none()
        if user.role == PATIENT:
            return qs.filter(appointment__patient=user)
        return Payment.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return PaymentCreateSerializer
        return PaymentSerializer

    def perform_create(self, serializer):
        payment = serializer.save()
        transaction.on_commit(lambda: self._create_stripe_session(payment))

    def _create_stripe_session(self, payment):
        try:
            session = stripe_service.create_checkout_session(
                payment, patient_email=payment.patient.email or None
            )
            payment.stripe_checkout_session_id = session.id
            payment.stripe_payment_intent_id = session.payment_intent or ""
            payment.checkout_url = session.url or ""
            payment.save(
                update_fields=[
                    "stripe_checkout_session_id",
                    "stripe_payment_intent_id",
                    "checkout_url",
                    "updated_at",
                ]
            )
            emails.send_payment_request_email(payment)
        except Exception:
            logger.exception("Failed to create Stripe Checkout session for payment %s", payment.pk)
            payment.mark_failed(reason="Stripe session creation failed")


class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubscribeView(generics.CreateAPIView):
    serializer_class = SubscribeSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def perform_create(self, serializer):
        doctor = self.request.user.doctorprofile
        plan = serializer._plan
        existing = DoctorSubscription.objects.filter(
            doctor=doctor, status="ACTIVE", end_date__gte=timezone.now()
        ).first()
        if existing:
            raise serializers.ValidationError("You already have an active subscription.")
        try:
            session = stripe_service.create_subscription_session(plan, doctor)
        except Exception:
            logger.exception("Failed to create subscription session")
            raise serializers.ValidationError("Failed to process subscription.")
        with transaction.atomic():
            subscription = DoctorSubscription.objects.create(
                doctor=doctor,
                plan=plan,
                stripe_subscription_id=session.id,
                stripe_customer_id=session.customer or "",
                status="ACTIVE",
                start_date=timezone.now(),
                end_date=timezone.now() + timezone.timedelta(days=plan.duration_days),
            )
            serializer.instance = subscription


class SubscriptionStatusView(generics.RetrieveAPIView):
    serializer_class = DoctorSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_object(self):
        doctor = self.request.user.doctorprofile
        subscription = DoctorSubscription.objects.filter(
            doctor=doctor,
        ).order_by("-created_at").first()
        if not subscription:
            from rest_framework.exceptions import NotFound
            raise NotFound("No subscription found.")
        if subscription.is_active:
            subscription.status = "ACTIVE"
        elif not subscription.is_active:
            subscription.mark_expired()
        return subscription


class CancelSubscriptionView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def delete(self, request, *args, **kwargs):
        doctor = request.user.doctorprofile
        subscription = DoctorSubscription.objects.filter(
            doctor=doctor, status="ACTIVE"
        ).first()
        if not subscription:
            return Response(
                {"detail": "No active subscription found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if subscription.stripe_subscription_id:
            try:
                stripe_service.cancel_stripe_subscription(subscription.stripe_subscription_id)
            except Exception:
                logger.exception("Failed to cancel Stripe subscription %s", subscription.stripe_subscription_id)
        subscription.mark_cancelled()
        return Response({"detail": "Subscription cancelled."})


@csrf_exempt
def stripe_webhook(request):
    """Receive and process Stripe webhook events.

    Verifies the signature, then updates the matching Payment based on the
    event type. Returns 200 to acknowledge, 400 on signature failure.
    """
    signature = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    try:
        event = stripe_service.verify_webhook_signature(request.body, signature)
    except Exception:
        logger.exception("Invalid Stripe webhook signature")
        return HttpResponse(status=400)

    event_type = event.get("type")
    data = event.get("data", {}).get("object", {})

    payment_id = (
        data.get("metadata", {}).get("payment_id")
        or data.get("metadata", {}).get("paymentId")
    )

    if event_type == "checkout.session.completed":
        _update_payment(payment_id, "paid", receipt_url=data.get("receipt_url"))
    elif event_type in ("payment_intent.payment_failed", "checkout.session.expired"):
        _update_payment(payment_id, "failed", reason=data.get("failure_message", ""))
    elif event_type == "charge.refunded":
        _update_payment(payment_id, "refunded")

    return HttpResponse(status=200)


def _update_payment(payment_id, status, receipt_url=None, reason=""):
    if not payment_id:
        return
    with transaction.atomic():
        try:
            payment = Payment.objects.select_for_update().get(pk=payment_id)
        except Payment.DoesNotExist:
            logger.warning("Webhook referenced unknown payment %s", payment_id)
            return
        if status == "paid" and payment.status != "PAID":
            payment.mark_paid(receipt_url=receipt_url)
            transaction.on_commit(lambda: emails.send_payment_confirmation_email(payment))
        elif status == "failed" and payment.status == "PENDING":
            payment.mark_failed(reason=reason)
        elif status == "refunded" and payment.status == "PAID":
            payment.mark_refunded()
