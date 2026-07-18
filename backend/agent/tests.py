import json
from datetime import timedelta, datetime, time as dt_time
from unittest.mock import patch, MagicMock

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework.test import APIClient
from rest_framework import status

from doctors.models import DoctorProfile, Specialty, Availability
from appointments.models import Appointment
from core.choices import PATIENT, DOCTOR

User = get_user_model()


def _aware(dt):
    if timezone.is_naive(dt):
        return timezone.make_aware(dt)
    return dt


def _next_weekday_at(hour, minute=0):
    today = timezone.localtime(timezone.now()).date()
    days_ahead = 7
    while (today + timedelta(days=days_ahead)).weekday() != 0:
        days_ahead += 1
    d = today + timedelta(days=days_ahead)
    return _aware(datetime.combine(d, dt_time(hour, minute)))


class AgentToolTests(TestCase):
    def setUp(self):
        self.specialty = Specialty.objects.create(name="Cardiology", description="Heart")
        self.doctor_user = User.objects.create_user(
            username="dr_smith", email="dr@test.com", password="testpass123",
            first_name="Sarah", last_name="Smith", role=DOCTOR, is_email_confirmed=True
        )
        self.doctor, _ = DoctorProfile.objects.get_or_create(
            user=self.doctor_user,
            defaults={"specialty": self.specialty, "is_approved": True}
        )
        self.doctor.specialty = self.specialty
        self.doctor.is_approved = True
        self.doctor.save()
        self.patient_user = User.objects.create_user(
            username="alice_w", email="alice@test.com", password="testpass123",
            first_name="Alice", last_name="Wilson", role=PATIENT, is_email_confirmed=True
        )
        Availability.objects.create(
            doctor=self.doctor, day_of_week=0, start_time="09:00", end_time="17:00", is_active=True
        )
        self.future_dt = _next_weekday_at(10, 0)

    def test_list_doctors(self):
        from agent.services.tools import list_doctors
        result = list_doctors(self.patient_user)
        self.assertIn("doctors", result)
        self.assertTrue(len(result["doctors"]) >= 1)

    def test_list_doctors_filter_by_specialty(self):
        from agent.services.tools import list_doctors
        result = list_doctors(self.patient_user, specialty="Cardiology")
        self.assertEqual(result["doctors"][0]["specialty"], "Cardiology")

    def test_get_availability(self):
        from agent.services.tools import get_availability
        result = get_availability(self.patient_user, self.doctor.id)
        self.assertEqual(result["doctor_id"], self.doctor.id)
        self.assertTrue(len(result["slots"]) >= 1)

    def test_get_availability_not_found(self):
        from agent.services.tools import get_availability
        result = get_availability(self.patient_user, 9999)
        self.assertIn("error", result)

    def test_list_my_appointments_patient(self):
        from agent.services.tools import list_my_appointments
        Appointment.objects.create(
            patient=self.patient_user, doctor=self.doctor, specialty=self.specialty,
            scheduled_at=self.future_dt, status="CONFIRMED"
        )
        result = list_my_appointments(self.patient_user)
        self.assertEqual(len(result["appointments"]), 1)

    def test_list_my_appointments_doctor(self):
        from agent.services.tools import list_my_appointments
        Appointment.objects.create(
            patient=self.patient_user, doctor=self.doctor, specialty=self.specialty,
            scheduled_at=self.future_dt, status="CONFIRMED"
        )
        result = list_my_appointments(self.doctor_user)
        self.assertEqual(len(result["appointments"]), 1)

    def test_propose_booking_success(self):
        from agent.services.tools import propose_booking
        result = propose_booking(self.patient_user, self.doctor.id, self.future_dt.isoformat())
        self.assertIn("proposal_id", result)
        self.assertIn("summary", result)

    def test_propose_booking_past(self):
        from agent.services.tools import propose_booking
        past_dt = _aware(timezone.now() - timedelta(hours=1)).isoformat()
        result = propose_booking(self.patient_user, self.doctor.id, past_dt)
        self.assertIn("error", result)

    def test_propose_booking_doctor_role_rejected(self):
        from agent.services.tools import propose_booking
        result = propose_booking(self.doctor_user, self.doctor.id, self.future_dt.isoformat())
        self.assertIn("error", result)

    def test_confirm_booking_executes(self):
        from agent.services.tools import propose_booking, confirm_booking
        proposed = propose_booking(self.patient_user, self.doctor.id, self.future_dt.isoformat())
        self.assertIn("proposal_id", proposed)
        result = confirm_booking(self.patient_user, proposed["proposal_id"])
        self.assertIn("success", result)
        self.assertTrue(result["success"])
        self.assertEqual(Appointment.objects.count(), 1)

    def test_propose_reschedule_success(self):
        from agent.services.tools import propose_reschedule
        apt = Appointment.objects.create(
            patient=self.patient_user, doctor=self.doctor, specialty=self.specialty,
            scheduled_at=self.future_dt, status="PENDING"
        )
        new_dt = self.future_dt + timedelta(hours=1)
        result = propose_reschedule(self.patient_user, apt.id, new_dt.isoformat())
        self.assertIn("proposal_id", result)

    def test_confirm_reschedule_executes(self):
        from agent.services.tools import propose_reschedule, confirm_reschedule
        apt = Appointment.objects.create(
            patient=self.patient_user, doctor=self.doctor, specialty=self.specialty,
            scheduled_at=self.future_dt, status="PENDING"
        )
        new_dt = self.future_dt + timedelta(hours=1)
        proposed = propose_reschedule(self.patient_user, apt.id, new_dt.isoformat())
        self.assertIn("proposal_id", proposed)
        result = confirm_reschedule(self.patient_user, proposed["proposal_id"])
        self.assertTrue(result["success"])

    def test_cancel_appointment_patient_own(self):
        from agent.services.tools import cancel_appointment
        apt = Appointment.objects.create(
            patient=self.patient_user, doctor=self.doctor, specialty=self.specialty,
            scheduled_at=self.future_dt, status="PENDING"
        )
        result = cancel_appointment(self.patient_user, apt.id)
        self.assertTrue(result["success"])
        apt.refresh_from_db()
        self.assertEqual(apt.status, "CANCELLED")

    def test_cancel_appointment_wrong_patient(self):
        from agent.services.tools import cancel_appointment
        other_patient = User.objects.create_user(
            username="bob", email="bob@test.com", password="testpass123",
            first_name="Bob", last_name="Jones", role=PATIENT, is_email_confirmed=True
        )
        apt = Appointment.objects.create(
            patient=self.patient_user, doctor=self.doctor, specialty=self.specialty,
            scheduled_at=self.future_dt, status="PENDING"
        )
        with self.assertRaises(Exception):
            cancel_appointment(other_patient, apt.id)

    def test_get_doctor_schedule(self):
        from agent.services.tools import get_doctor_schedule
        Appointment.objects.create(
            patient=self.patient_user, doctor=self.doctor, specialty=self.specialty,
            scheduled_at=self.future_dt, status="CONFIRMED"
        )
        result = get_doctor_schedule(self.doctor_user)
        self.assertEqual(len(result["appointments"]), 1)

    def test_get_doctor_schedule_patient_denied(self):
        from agent.services.tools import get_doctor_schedule
        with self.assertRaises(Exception):
            get_doctor_schedule(self.patient_user)


class AgentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.specialty = Specialty.objects.create(name="Cardiology", description="Heart")
        self.doctor_user = User.objects.create_user(
            username="dr_smith", email="dr@test.com", password="testpass123",
            first_name="Sarah", last_name="Smith", role=DOCTOR, is_email_confirmed=True
        )
        self.doctor, _ = DoctorProfile.objects.get_or_create(
            user=self.doctor_user,
            defaults={"specialty": self.specialty, "is_approved": True}
        )
        self.doctor.specialty = self.specialty
        self.doctor.is_approved = True
        self.doctor.save()
        self.patient_user = User.objects.create_user(
            username="alice_w", email="alice@test.com", password="testpass123",
            first_name="Alice", last_name="Wilson", role=PATIENT, is_email_confirmed=True
        )
        Availability.objects.create(
            doctor=self.doctor, day_of_week=0, start_time="09:00", end_time="17:00", is_active=True
        )
        self.future_dt = _aware(timezone.now() + timedelta(days=7, hours=2)).isoformat()

    def _auth_patient(self):
        res = self.client.post("/api/v1/auth/login/", {
            "username": "alice_w", "password": "testpass123"
        }, format="json")
        token = res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def _auth_doctor(self):
        res = self.client.post("/api/v1/auth/login/", {
            "username": "dr_smith", "password": "testpass123"
        }, format="json")
        token = res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    @patch("agent.services.groq_client.get_client")
    def test_chat_unavailable_returns_friendly_message(self, mock_get_client):
        self._auth_patient()
        res = self.client.post("/api/v1/agent/chat/", {"message": "hello"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("unavailable", res.data["reply"].lower())

    @patch("agent.services.groq_client.get_client")
    @patch("agent.services.groq_client.is_available", return_value=True)
    def test_chat_creates_history(self, mock_is_available, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_choice = MagicMock()
        mock_choice.message.content = "Hello! How can I help?"
        mock_choice.message.tool_calls = None
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        self._auth_patient()
        res = self.client.post("/api/v1/agent/chat/", {"message": "hi"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["reply"], "Hello! How can I help?")

    @patch("agent.services.groq_client.get_client")
    @patch("agent.services.groq_client.is_available", return_value=True)
    def test_chat_tool_call_flow(self, mock_is_available, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        tool_call = MagicMock()
        tool_call.id = "call_123"
        tool_call.function.name = "list_doctors"
        tool_call.function.arguments = "{}"
        msg_with_tools = MagicMock()
        msg_with_tools.content = None
        msg_with_tools.tool_calls = [tool_call]
        choice_with_tools = MagicMock()
        choice_with_tools.message = msg_with_tools
        msg_final = MagicMock()
        msg_final.content = "Here are the doctors."
        msg_final.tool_calls = None
        choice_final = MagicMock()
        choice_final.message = msg_final
        mock_client.chat.completions.create.side_effect = [
            MagicMock(choices=[choice_with_tools]),
            MagicMock(choices=[choice_final]),
        ]

        self._auth_patient()
        res = self.client.post("/api/v1/agent/chat/", {"message": "list doctors"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["reply"], "Here are the doctors.")

    def test_history_returns_empty(self):
        self._auth_patient()
        res = self.client.get("/api/v1/agent/history/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["messages"], [])

    @patch("agent.services.groq_client.get_client")
    @patch("agent.services.groq_client.is_available", return_value=True)
    def test_history_returns_messages(self, mock_is_available, mock_get_client):
        self._auth_patient()
        self.client.post("/api/v1/agent/chat/", {"message": "hi"}, format="json")
        res = self.client.get("/api/v1/agent/history/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res.data["messages"]) >= 1)

    def test_unauthorized_chat(self):
        res = self.client.post("/api/v1/agent/chat/", {"message": "hi"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthorized_history(self):
        res = self.client.get("/api/v1/agent/history/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class AgentBookingFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.specialty = Specialty.objects.create(name="Cardiology", description="Heart")
        self.doctor_user = User.objects.create_user(
            username="dr_smith", email="dr@test.com", password="testpass123",
            first_name="Sarah", last_name="Smith", role=DOCTOR, is_email_confirmed=True
        )
        self.doctor, _ = DoctorProfile.objects.get_or_create(
            user=self.doctor_user,
            defaults={"specialty": self.specialty, "is_approved": True}
        )
        self.doctor.specialty = self.specialty
        self.doctor.is_approved = True
        self.doctor.save()
        self.patient_user = User.objects.create_user(
            username="alice_w", email="alice@test.com", password="testpass123",
            first_name="Alice", last_name="Wilson", role=PATIENT, is_email_confirmed=True
        )
        Availability.objects.create(
            doctor=self.doctor, day_of_week=0, start_time="09:00", end_time="17:00", is_active=True
        )
        self.future_dt = _next_weekday_at(10, 0)

    def _auth_patient(self):
        res = self.client.post("/api/v1/auth/login/", {
            "username": "alice_w", "password": "testpass123"
        }, format="json")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")

    @patch("agent.services.groq_client.get_client")
    @patch("agent.services.groq_client.is_available", return_value=True)
    def test_full_booking_propose_then_confirm(self, mock_is_available, mock_get_client):
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        tool_call = MagicMock()
        tool_call.id = "call_abc"
        tool_call.function.name = "propose_booking"
        tool_call.function.arguments = json.dumps({
            "doctor_id": self.doctor.id,
            "scheduled_at": self.future_dt.isoformat(),
            "duration_minutes": 30,
        })
        msg_with_tools = MagicMock()
        msg_with_tools.content = None
        msg_with_tools.tool_calls = [tool_call]
        choice_with_tools = MagicMock()
        choice_with_tools.message = msg_with_tools
        msg_final = MagicMock()
        msg_final.content = "Please confirm this booking."
        msg_final.tool_calls = None
        choice_final = MagicMock()
        choice_final.message = msg_final
        mock_client.chat.completions.create.side_effect = [
            MagicMock(choices=[choice_with_tools]),
            MagicMock(choices=[choice_final]),
        ]

        self._auth_patient()
        res = self.client.post("/api/v1/agent/chat/", {"message": "book Dr. Smith next Monday 10am"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("pending_confirmation", res.data)
        self.assertIsNotNone(res.data["pending_confirmation"])
        proposal_id = res.data["pending_confirmation"]["proposal_id"]

        res2 = self.client.post("/api/v1/agent/chat/", {"confirm_proposal_id": proposal_id}, format="json")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertTrue(res2.data["reply"].lower().startswith("appointment booked"))
        self.assertEqual(Appointment.objects.count(), 1)
