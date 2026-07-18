from unittest.mock import patch

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from core.choices import DOCTOR, PATIENT, ADMIN
from doctors.models import DoctorProfile, Specialty
from .models import Conversation, ChatMessage

User = get_user_model()


class ChatSetUpMixin:
    def setUp(self):
        self.client = APIClient()

        self.patient = User.objects.create_user(
            username="patient1", email="patient1@test.com",
            password="testpass123", role=PATIENT,
            first_name="John", last_name="Doe",
        )
        self.patient2 = User.objects.create_user(
            username="patient2", email="patient2@test.com",
            password="testpass123", role=PATIENT,
            first_name="Jane", last_name="Smith",
        )

        self.doctor_user = User.objects.create_user(
            username="doctor1", email="doctor1@test.com",
            password="testpass123", role=DOCTOR,
            first_name="Dr. Ahmed", last_name="Ali",
        )
        self.doctor_profile = DoctorProfile.objects.get(user=self.doctor_user)
        self.doctor_profile.bio = "Cardiologist"
        self.doctor_profile.consultation_fee = 100
        self.doctor_profile.save(update_fields=["bio", "consultation_fee"])

        self.doctor_user2 = User.objects.create_user(
            username="doctor2", email="doctor2@test.com",
            password="testpass123", role=DOCTOR,
            first_name="Dr. Sara", last_name="Hassan",
        )
        self.doctor_profile2 = DoctorProfile.objects.get(user=self.doctor_user2)
        self.doctor_profile2.bio = "Dermatologist"
        self.doctor_profile2.consultation_fee = 150
        self.doctor_profile2.save(update_fields=["bio", "consultation_fee"])

        self.admin_user = User.objects.create_user(
            username="admin1", email="admin1@test.com",
            password="testpass123", role=ADMIN,
        )

        self.conversation = Conversation.objects.create(
            patient=self.patient, doctor=self.doctor_profile,
        )
        self.msg1 = ChatMessage.objects.create(
            conversation=self.conversation, sender=self.patient, body="Hello Doctor",
        )
        self.msg2 = ChatMessage.objects.create(
            conversation=self.conversation, sender=self.doctor_user, body="Hello patient",
        )


class ConversationCreateTests(ChatSetUpMixin, TestCase):
    def test_patient_creates_conversation(self):
        self.client.force_authenticate(self.patient)
        res = self.client.post("/api/v1/conversations/", {"doctor_id": self.doctor_profile2.pk})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Conversation.objects.count(), 2)

    def test_duplicate_conversation_returns_200(self):
        self.client.force_authenticate(self.patient)
        res = self.client.post("/api/v1/conversations/", {"doctor_id": self.doctor_profile.pk})
        self.assertEqual(res.status_code, 200)

    def test_doctor_creates_conversation(self):
        self.client.force_authenticate(self.doctor_user)
        res = self.client.post("/api/v1/conversations/", {
            "doctor_id": self.doctor_profile.pk,
            "patient": self.patient2.pk,
        })
        self.assertEqual(res.status_code, 201)
        conv = Conversation.objects.get(pk=res.data["id"])
        self.assertEqual(conv.patient, self.patient2)

    def test_doctor_cannot_create_for_another_doctor_profile(self):
        self.client.force_authenticate(self.doctor_user)
        res = self.client.post("/api/v1/conversations/", {
            "doctor_id": self.doctor_profile2.pk,
            "patient": self.patient.pk,
        })
        self.assertEqual(res.status_code, 403)

    def test_missing_doctor_id_returns_400(self):
        self.client.force_authenticate(self.patient)
        res = self.client.post("/api/v1/conversations/", {})
        self.assertEqual(res.status_code, 400)

    def test_unauthenticated_returns_401(self):
        res = self.client.post("/api/v1/conversations/", {"doctor_id": self.doctor_profile.pk})
        self.assertEqual(res.status_code, 401)


class ConversationListTests(ChatSetUpMixin, TestCase):
    def test_patient_sees_own_conversations(self):
        self.client.force_authenticate(self.patient)
        res = self.client.get("/api/v1/conversations/")
        self.assertEqual(res.status_code, 200)
        results = res.data.get("results", res.data)
        self.assertEqual(len(results), 1)

    def test_doctor_sees_own_conversations(self):
        self.client.force_authenticate(self.doctor_user)
        res = self.client.get("/api/v1/conversations/")
        self.assertEqual(res.status_code, 200)
        results = res.data.get("results", res.data)
        self.assertEqual(len(results), 1)

    def test_admin_sees_all_conversations(self):
        self.client.force_authenticate(self.admin_user)
        res = self.client.get("/api/v1/conversations/")
        self.assertEqual(res.status_code, 200)
        results = res.data.get("results", res.data)
        self.assertEqual(len(results), 1)


class ConversationRetrieveTests(ChatSetUpMixin, TestCase):
    def test_participant_can_retrieve(self):
        self.client.force_authenticate(self.patient)
        res = self.client.get(f"/api/v1/conversations/{self.conversation.pk}/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("messages", res.data)

    def test_non_participant_cannot_retrieve(self):
        self.client.force_authenticate(self.patient2)
        res = self.client.get(f"/api/v1/conversations/{self.conversation.pk}/")
        self.assertIn(res.status_code, [403, 404])


class SendMessageTests(ChatSetUpMixin, TestCase):
    def test_patient_sends_message(self):
        self.client.force_authenticate(self.patient)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/send_message/",
            {"body": "New message"},
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["body"], "New message")
        self.assertEqual(ChatMessage.objects.count(), 3)

    def test_doctor_sends_message(self):
        self.client.force_authenticate(self.doctor_user)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/send_message/",
            {"body": "Doctor reply"},
        )
        self.assertEqual(res.status_code, 201)

    def test_empty_body_returns_400(self):
        self.client.force_authenticate(self.patient)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/send_message/",
            {"body": ""},
        )
        self.assertEqual(res.status_code, 400)

    def test_non_participant_cannot_send(self):
        self.client.force_authenticate(self.patient2)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/send_message/",
            {"body": "Hack attempt"},
        )
        self.assertIn(res.status_code, [403, 404])


class SendFileTests(ChatSetUpMixin, TestCase):
    @patch("chats.serializers.ChatMessageSerializer.get_attachment_url", return_value="https://res.cloudinary.com/demo/upload/test.txt")
    @patch("cloudinary.models.CloudinaryField.pre_save", return_value="test_file")
    def test_send_file(self, mock_pre_save, mock_url):
        self.client.force_authenticate(self.patient)
        file = SimpleUploadedFile("test.txt", b"file content", content_type="text/plain")
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/send_file/",
            {"attachment": file, "body": "Here is the file"},
        )
        self.assertEqual(res.status_code, 201)
        self.assertIsNotNone(res.data["attachment_url"])

    def test_no_file_returns_400(self):
        self.client.force_authenticate(self.patient)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/send_file/",
        )
        self.assertEqual(res.status_code, 400)


class EditMessageTests(ChatSetUpMixin, TestCase):
    def test_sender_can_edit_own_message(self):
        self.client.force_authenticate(self.patient)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/messages/{self.msg1.pk}/edit/",
            {"body": "Edited message"},
        )
        self.assertEqual(res.status_code, 200)
        self.msg1.refresh_from_db()
        self.assertEqual(self.msg1.body, "Edited message")
        self.assertIsNotNone(self.msg1.edited_at)

    def test_cannot_edit_others_message(self):
        self.client.force_authenticate(self.doctor_user)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/messages/{self.msg1.pk}/edit/",
            {"body": "Hacked"},
        )
        self.assertEqual(res.status_code, 404)

    def test_edit_nonexistent_message_returns_404(self):
        self.client.force_authenticate(self.patient)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/messages/99999/edit/",
            {"body": "Edit"},
        )
        self.assertEqual(res.status_code, 404)


class DeleteMessageTests(ChatSetUpMixin, TestCase):
    def test_sender_can_delete_own_message(self):
        self.client.force_authenticate(self.patient)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/messages/{self.msg1.pk}/delete/",
        )
        self.assertEqual(res.status_code, 204)
        self.assertFalse(ChatMessage.objects.filter(pk=self.msg1.pk).exists())

    def test_cannot_delete_others_message(self):
        self.client.force_authenticate(self.doctor_user)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/messages/{self.msg1.pk}/delete/",
        )
        self.assertEqual(res.status_code, 404)
        self.assertTrue(ChatMessage.objects.filter(pk=self.msg1.pk).exists())


class MarkReadTests(ChatSetUpMixin, TestCase):
    def test_mark_read(self):
        self.client.force_authenticate(self.doctor_user)
        res = self.client.post(
            f"/api/v1/conversations/{self.conversation.pk}/mark_read/",
        )
        self.assertEqual(res.status_code, 200)
        self.msg1.refresh_from_db()
        self.assertTrue(self.msg1.is_read)

    def test_unread_count(self):
        self.client.force_authenticate(self.doctor_user)
        res = self.client.get(
            f"/api/v1/conversations/{self.conversation.pk}/unread_count/",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["unread_count"], 1)


class ListMessagesTests(ChatSetUpMixin, TestCase):
    def test_list_messages(self):
        self.client.force_authenticate(self.patient)
        res = self.client.get(
            f"/api/v1/conversations/{self.conversation.pk}/messages/",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data["messages"]), 2)
        self.assertFalse(res.data["has_more"])

    def test_list_messages_pagination(self):
        for i in range(5):
            ChatMessage.objects.create(
                conversation=self.conversation, sender=self.patient, body=f"msg {i}",
            )
        self.client.force_authenticate(self.patient)
        res = self.client.get(
            f"/api/v1/conversations/{self.conversation.pk}/messages/?limit=3",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data["messages"]), 3)
        self.assertTrue(res.data["has_more"])

    def test_list_messages_before_cursor(self):
        for i in range(5):
            ChatMessage.objects.create(
                conversation=self.conversation, sender=self.patient, body=f"msg {i}",
            )
        self.client.force_authenticate(self.patient)
        messages = list(ChatMessage.objects.filter(conversation=self.conversation).order_by("created_at"))
        before_id = messages[2].pk
        res = self.client.get(
            f"/api/v1/conversations/{self.conversation.pk}/messages/?before={before_id}&limit=50",
        )
        self.assertEqual(res.status_code, 200)
        self.assertTrue(all(m["id"] < before_id for m in res.data["messages"]))
