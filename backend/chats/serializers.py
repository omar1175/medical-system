from django.contrib.auth import get_user_model
from django.db.models import Max, Count, Q
from rest_framework import serializers

from .models import ChatMessage, Conversation

User = get_user_model()


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = [
            "id", "conversation", "sender", "sender_id", "sender_name",
            "body", "attachment", "attachment_url", "is_read",
            "edited_at", "created_at",
        ]
        read_only_fields = ["id", "sender", "is_read", "edited_at", "created_at"]

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username

    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return obj.attachment.url
        return None


class ConversationSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id", "patient", "patient_name",
            "doctor", "doctor_name",
            "last_message", "unread_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_patient_name(self, obj):
        return obj.patient.get_full_name() or obj.patient.username

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name() or obj.doctor.user.username

    def get_last_message(self, obj):
        msg = getattr(obj, "_last_message", None)
        if msg is None:
            msg = obj.messages.order_by("-created_at").first()
        if msg:
            return {
                "id": msg.id,
                "body": msg.body,
                "sender_id": msg.sender_id,
                "sender_name": msg.sender.get_full_name() or msg.sender.username,
                "attachment_url": msg.attachment.url if msg.attachment else None,
                "created_at": msg.created_at,
            }
        return None

    def get_unread_count(self, obj):
        if hasattr(obj, "_unread_count"):
            return obj._unread_count
        request = self.context.get("request")
        if request and request.user:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0


class ConversationDetailSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id", "patient", "patient_name",
            "doctor", "doctor_name",
            "messages", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_patient_name(self, obj):
        return obj.patient.get_full_name() or obj.patient.username

    def get_doctor_name(self, obj):
        return obj.doctor.user.get_full_name() or obj.doctor.user.username


class SendMessageSerializer(serializers.Serializer):
    body = serializers.CharField(required=True)


class EditMessageSerializer(serializers.Serializer):
    body = serializers.CharField(required=True)


class MessageListSerializer(serializers.Serializer):
    conversation_id = serializers.IntegerField()
    before = serializers.IntegerField(required=False, help_text="Message ID to paginate before")
    limit = serializers.IntegerField(required=False, default=50, min_value=1, max_value=100)
