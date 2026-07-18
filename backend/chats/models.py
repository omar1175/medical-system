from django.conf import settings
from django.db import models
from cloudinary.models import CloudinaryField


class Conversation(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations_as_patient",
    )
    doctor = models.ForeignKey(
        "doctors.DoctorProfile",
        on_delete=models.CASCADE,
        related_name="conversations_as_doctor",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "chats_conversation"
        ordering = ["-updated_at"]
        unique_together = [("patient", "doctor")]

    def __str__(self):
        return f"Conversation: {self.patient} <-> {self.doctor}"


class ChatMessage(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    body = models.TextField(blank=True, default="")
    attachment = CloudinaryField(
        resource_type="auto",
        blank=True,
        null=True,
    )
    is_read = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chats_message"
        ordering = ["created_at"]

    def __str__(self):
        return f"Message from {self.sender} at {self.created_at}"
