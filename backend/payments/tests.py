from unittest import mock

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from core.choices import (
    ADMIN,
    APPOINTMENT_STATUS_CONFIRMED,
    DOCTOR,
    PATIENT,
    PAYMENT_STATUS_PAID,
    PAYMENT_STATUS_PENDING,
)
from appointments.models import Appointment
from doctors.models import DoctorProfile, Specialty
from users.models import CustomUser


def _make_user(role, username):
    return CustomUser.objects.create_user(
        username=username, email=f"{username}@example.com",
        password="pw", role=role, first_name=username,
    )


class PaymentFlowTests(TestCase):
    def setUp(self):
        self.patient = _make_user(PATIENT, "pat")
        self.doctor_user = _make_user(DOCTOR, "doc")
        self.specialty = Specialty.objects.create(name="Cardiology")
        # A DoctorProfile is auto-created by the post_save signal; set its fee.
        self.profile = self.doctor_user.doctorprofile
        self.profile.specialty = self.specialty
        self.profile.consultation_fee = 50.00
        self.profile.is_approved = True
        self.profile.save()
        self.appointment = Appointment.objects.create(
            patient=self.patient, doctor=self.profile,
            specialty=self.specialty, scheduled_at="2030-01-01T10:00:00Z",
            status=APPOINTMENT_STATUS_CONFIRMED,
        )
        self.client = APIClient()

    def _fake_session(self):
        class FakeSession:
            id = "cs_test_123"
            payment_intent = "pi_test_123"
            url = "https://checkout.stripe.com/c/pay/cs_test_123"
        return FakeSession()

    def test_doctor_creates_payment(self):
        self.client.force_authenticate(self.doctor_user)
        fake = self._fake_session()
        with mock.patch("payments.views.stripe_service.create_checkout_session", return_value=fake):
            with self.captureOnCommitCallbacks(execute=True):
                resp = self.client.post(
                    reverse("payment-list"), {"appointment_id": self.appointment.id}, format="json"
                )
        self.assertEqual(resp.status_code, 201, resp.content)
        payment = self.appointment.payments.get()
        self.assertEqual(payment.status, PAYMENT_STATUS_PENDING)
        self.assertEqual(payment.amount, 50.00)
        self.assertEqual(payment.stripe_checkout_session_id, "cs_test_123")
        self.assertEqual(payment.checkout_url, "https://checkout.stripe.com/c/pay/cs_test_123")

    def test_admin_creates_payment_for_other_doctor(self):
        admin = _make_user(ADMIN, "admin")
        self.client.force_authenticate(admin)
        fake = self._fake_session()
        with mock.patch("payments.views.stripe_service.create_checkout_session", return_value=fake):
            with self.captureOnCommitCallbacks(execute=True):
                resp = self.client.post(
                    reverse("payment-list"), {"appointment_id": self.appointment.id}, format="json"
                )
        self.assertEqual(resp.status_code, 201, resp.content)
        payment = self.appointment.payments.get()
        self.assertEqual(payment.status, PAYMENT_STATUS_PENDING)
        self.assertEqual(payment.amount, 50.00)
        self.assertEqual(payment.stripe_checkout_session_id, "cs_test_123")
        self.assertEqual(payment.checkout_url, "https://checkout.stripe.com/c/pay/cs_test_123")
        self.client.force_authenticate(self.patient)
        resp = self.client.post(
            reverse("payment-list"), {"appointment_id": self.appointment.id}, format="json"
        )
        self.assertEqual(resp.status_code, 400)

    def test_webhook_marks_paid(self):
        payment = self.appointment.payments.create(
            amount=50.00, currency="USD", status=PAYMENT_STATUS_PENDING,
            stripe_payment_intent_id="pi_test_123",
        )

        class FakeEvent(dict):
            def __init__(self, payment):
                super().__init__(
                    type="checkout.session.completed",
                    data={"object": {"metadata": {"payment_id": str(payment.pk)}, "receipt_url": "https://r"}},
                )

        with mock.patch("payments.views.stripe_service.verify_webhook_signature", return_value=FakeEvent(payment)):
            resp = self.client.post(reverse("stripe_webhook"))
        self.assertEqual(resp.status_code, 200)
        payment.refresh_from_db()
        self.assertEqual(payment.status, PAYMENT_STATUS_PAID)
        self.assertEqual(payment.receipt_url, "https://r")

    def test_patient_sees_own_payment(self):
        self.appointment.payments.create(amount=50.00, currency="USD")
        self.client.force_authenticate(self.patient)
        resp = self.client.get(reverse("payment-list"))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["count"], 1)

    def test_doctor_sees_own_payment_only(self):
        other_doc = _make_user(DOCTOR, "doc2")
        other_profile = other_doc.doctorprofile
        other_profile.specialty = self.specialty
        other_profile.consultation_fee = 10
        other_profile.is_approved = True
        other_profile.save()
        self.appointment.payments.create(amount=50.00, currency="USD")
        self.client.force_authenticate(other_doc)
        resp = self.client.get(reverse("payment-list"))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["count"], 0)
