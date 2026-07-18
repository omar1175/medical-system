from django.conf import settings
from django.db import models
from django.utils import timezone

from core.choices import (
    PAYMENT_STATUS_CHOICES,
    PAYMENT_STATUS_FAILED,
    PAYMENT_STATUS_PAID,
    PAYMENT_STATUS_PENDING,
    PAYMENT_STATUS_REFUNDED,
    SUBSCRIPTION_STATUS_CHOICES,
    SUBSCRIPTION_STATUS_ACTIVE,
    SUBSCRIPTION_STATUS_EXPIRED,
    SUBSCRIPTION_STATUS_CANCELLED,
)


class Payment(models.Model):
    """A payment request a doctor raises against one of their appointments.

    The amount is sourced from the appointment's doctor consultation fee when
    the request is created, and the lifecycle is driven by Stripe webhooks.
    """

    appointment = models.ForeignKey(
        "appointments.Appointment",
        on_delete=models.CASCADE,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    status = models.CharField(
        max_length=12,
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_STATUS_PENDING,
    )
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True, default="")
    stripe_checkout_session_id = models.CharField(max_length=100, blank=True, default="")
    checkout_url = models.URLField(blank=True, default="")
    receipt_url = models.URLField(blank=True, default="")
    failure_reason = models.TextField(blank=True, default="")
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments_payment"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["appointment", "status"]),
            models.Index(fields=["stripe_payment_intent_id"]),
        ]

    def __str__(self):
        return f"Payment #{self.pk} {self.amount} {self.currency} [{self.status}]"

    @property
    def doctor(self):
        return self.appointment.doctor

    @property
    def patient(self):
        return self.appointment.patient

    def mark_paid(self, receipt_url=None):
        self.status = PAYMENT_STATUS_PAID
        self.paid_at = timezone.now()
        if receipt_url:
            self.receipt_url = receipt_url
        self.save(update_fields=["status", "paid_at", "receipt_url", "updated_at"])

    def mark_failed(self, reason=""):
        self.status = PAYMENT_STATUS_FAILED
        self.failure_reason = reason
        self.save(update_fields=["status", "failure_reason", "updated_at"])

    def mark_refunded(self):
        self.status = PAYMENT_STATUS_REFUNDED
        self.save(update_fields=["status", "updated_at"])


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField(default=30)
    is_active = models.BooleanField(default=True)
    stripe_price_id = models.CharField(max_length=100, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments_subscription_plan"
        ordering = ["price"]

    def __str__(self):
        return f"{self.name} — ${self.price}/{self.duration_days} days"


class DoctorSubscription(models.Model):
    doctor = models.ForeignKey(
        "doctors.DoctorProfile",
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        null=True,
        related_name="subscriptions",
    )
    stripe_subscription_id = models.CharField(max_length=100, blank=True, default="")
    stripe_customer_id = models.CharField(max_length=100, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=SUBSCRIPTION_STATUS_CHOICES,
        default=SUBSCRIPTION_STATUS_ACTIVE,
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments_doctor_subscription"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.doctor} — {self.status} ({self.start_date.date()} to {self.end_date.date()})"

    @property
    def is_active(self):
        return self.status == SUBSCRIPTION_STATUS_ACTIVE and self.end_date >= timezone.now()

    def mark_expired(self):
        self.status = SUBSCRIPTION_STATUS_EXPIRED
        self.save(update_fields=["status", "updated_at"])

    def mark_cancelled(self):
        self.status = SUBSCRIPTION_STATUS_CANCELLED
        self.save(update_fields=["status", "updated_at"])
