"""Thin wrapper around the Stripe SDK used by the payments app.

Keeps all Stripe-specific concerns (API keys, creating a hosted Checkout
Session, and verifying incoming webhook signatures) in one place so the rest
of the code base stays payment-provider agnostic.
"""

import logging
import stripe

from django.conf import settings

logger = logging.getLogger(__name__)


def _api_key():
    key = getattr(settings, "STRIPE_SECRET_KEY", "")
    if not key:
        raise RuntimeError("STRIPE_SECRET_KEY is not configured.")
    return key


def create_checkout_session(payment, patient_email=None):
    """Create a Stripe Checkout Session for *payment*.

    Returns the created ``stripe.checkout.Session``. The hosted URL is what the
    patient uses to pay (and we email it to them).
    """
    stripe.api_key = _api_key()

    doctor_name = payment.doctor.user.get_full_name() or payment.doctor.user.username
    description = f"Consultation fee — Dr. {doctor_name}"

    session = stripe.checkout.Session.create(
        mode="payment",
        success_url=f"{settings.FRONTEND_URL}/payments/success?payment_id={payment.pk}",
        cancel_url=f"{settings.FRONTEND_URL}/payments/cancel?payment_id={payment.pk}",
        line_items=[
            {
                "price_data": {
                    "currency": payment.currency.lower(),
                    "product_data": {"name": description},
                    "unit_amount": int(payment.amount * 100),
                },
                "quantity": 1,
            }
        ],
        customer_email=patient_email or (payment.patient.email or None),
        metadata={
            "payment_id": str(payment.pk),
            "appointment_id": str(payment.appointment_id),
        },
    )
    return session


def create_subscription_session(plan, doctor):
    """Create a Stripe Checkout Session for a doctor's subscription plan.

    Uses ``mode="subscription"`` so Stripe handles recurring billing.
    """
    stripe.api_key = _api_key()

    doctor_name = doctor.user.get_full_name() or doctor.user.username

    if plan.stripe_price_id:
        line_items = [{"price": plan.stripe_price_id, "quantity": 1}]
    else:
        line_items = [
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": f"{plan.name} — Dr. {doctor_name}"},
                    "unit_amount": int(plan.price * 100),
                    "recurring": {"interval": "month", "interval_count": 1},
                },
                "quantity": 1,
            }
        ]

    session = stripe.checkout.Session.create(
        mode="subscription",
        success_url=f"{settings.FRONTEND_URL}/subscription/success",
        cancel_url=f"{settings.FRONTEND_URL}/subscription/cancel",
        line_items=line_items,
        customer_email=doctor.user.email or None,
        metadata={
            "doctor_id": str(doctor.pk),
            "plan_id": str(plan.pk),
        },
    )
    return session


def refund_payment(payment):
    """Refund a previously paid payment via Stripe."""
    stripe.api_key = _api_key()
    if not payment.stripe_payment_intent_id:
        raise RuntimeError("No Stripe payment intent to refund.")
    return stripe.Refund.create(payment_intent=payment.stripe_payment_intent_id)


def cancel_stripe_subscription(stripe_subscription_id):
    """Cancel a Stripe subscription by its ID."""
    stripe.api_key = _api_key()
    return stripe.Subscription.delete(stripe_subscription_id)


def verify_webhook_signature(payload: bytes, signature: str) -> dict:
    """Verify and parse a Stripe webhook payload.

    Raises ``stripe.error.SignatureVerificationError`` when the signature is
    invalid (the view should return HTTP 400 in that case).
    """
    secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")
    if not secret:
        raise RuntimeError("STRIPE_WEBHOOK_SECRET is not configured.")
    return stripe.Webhook.construct_event(payload, signature, secret)
