from django.db.models import Max, Count, Q, Subquery, OuterRef
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.choices import DOCTOR, PATIENT
from doctors.models import DoctorProfile

from .models import ChatMessage, Conversation
from .serializers import (
    ChatMessageSerializer,
    ConversationDetailSerializer,
    ConversationSerializer,
    SendMessageSerializer,
    EditMessageSerializer,
)


def _annotate_conversations(qs, user):
    last_msg_sub = Subquery(
        ChatMessage.objects.filter(conversation=OuterRef("pk"))
        .order_by("-created_at")
        .values("pk")[:1]
    )
    unread_filter = Q(messages__is_read=False) & ~Q(messages__sender=user)
    return qs.annotate(
        _last_msg_id=last_msg_sub,
        _unread_count=Count("messages", filter=unread_filter),
    )


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_role:
            qs = Conversation.objects.all()
        elif user.role == PATIENT:
            qs = Conversation.objects.filter(patient=user)
        elif user.role == DOCTOR:
            qs = Conversation.objects.filter(doctor__user=user)
        else:
            return Conversation.objects.none()
        return _annotate_conversations(qs.select_related("patient", "doctor__user"), user)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ConversationDetailSerializer
        return ConversationSerializer

    def create(self, request, *args, **kwargs):
        user = request.user
        doctor_id = request.data.get("doctor_id")

        if not doctor_id:
            return Response(
                {"detail": "doctor_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            doctor_profile = DoctorProfile.objects.get(pk=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response(
                {"detail": "Doctor not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.role == PATIENT:
            patient = user
        elif user.role == DOCTOR:
            if doctor_profile.user != user:
                return Response(
                    {"detail": "Doctors can only create conversations for their own profile."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            patient_id = request.data.get("patient")
            if not patient_id:
                return Response(
                    {"detail": "patient user id is required for doctors."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                patient = User.objects.get(pk=patient_id, role=PATIENT)
            except Exception:
                return Response(
                    {"detail": "Invalid patient id."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {"detail": "Only patients and doctors can create conversations."},
                status=status.HTTP_403_FORBIDDEN,
            )

        conversation, created = Conversation.objects.get_or_create(
            patient=patient,
            doctor=doctor_profile,
        )

        serializer = ConversationSerializer(conversation, context={"request": request})
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def _check_participant(self, conversation, user):
        if user.is_admin_role:
            return True
        if user.role == PATIENT and conversation.patient_id == user.id:
            return True
        if user.role == DOCTOR and conversation.doctor.user_id == user.id:
            return True
        return False

    @action(detail=True, methods=["post"])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        user = request.user

        if not self._check_participant(conversation, user):
            return Response(
                {"detail": "Not your conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = ChatMessage.objects.create(
            conversation=conversation,
            sender=user,
            body=serializer.validated_data["body"],
        )

        return Response(
            ChatMessageSerializer(message, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def send_file(self, request, pk=None):
        conversation = self.get_object()
        user = request.user

        if not self._check_participant(conversation, user):
            return Response(
                {"detail": "Not your conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        file = request.FILES.get("attachment")
        if not file:
            return Response(
                {"detail": "No file provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if file.size > 10 * 1024 * 1024:
            return Response(
                {"detail": "File size exceeds 10MB limit."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        body = request.data.get("body", "")

        message = ChatMessage.objects.create(
            conversation=conversation,
            sender=user,
            body=body,
            attachment=file,
        )

        return Response(
            ChatMessageSerializer(message, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path=r"messages/(?P<message_id>\d+)/edit")
    def edit_message(self, request, pk=None, message_id=None):
        conversation = self.get_object()
        user = request.user

        if not self._check_participant(conversation, user):
            return Response(
                {"detail": "Not your conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            message = conversation.messages.get(pk=message_id, sender=user)
        except ChatMessage.DoesNotExist:
            return Response(
                {"detail": "Message not found or not yours."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = EditMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from django.utils import timezone
        message.body = serializer.validated_data["body"]
        message.edited_at = timezone.now()
        message.save(update_fields=["body", "edited_at"])

        return Response(
            ChatMessageSerializer(message, context={"request": request}).data,
        )

    @action(detail=True, methods=["post"], url_path=r"messages/(?P<message_id>\d+)/delete")
    def delete_message(self, request, pk=None, message_id=None):
        conversation = self.get_object()
        user = request.user

        if not self._check_participant(conversation, user):
            return Response(
                {"detail": "Not your conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            message = conversation.messages.get(pk=message_id, sender=user)
        except ChatMessage.DoesNotExist:
            return Response(
                {"detail": "Message not found or not yours."},
                status=status.HTTP_404_NOT_FOUND,
            )

        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        conversation = self.get_object()
        user = request.user

        if not self._check_participant(conversation, user):
            return Response(
                {"detail": "Not your conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        updated = ChatMessage.objects.filter(
            conversation=conversation,
            is_read=False,
        ).exclude(sender=user).update(is_read=True)

        return Response({"marked_read": updated})

    @action(detail=True, methods=["get"])
    def unread_count(self, request, pk=None):
        conversation = self.get_object()
        user = request.user

        if not self._check_participant(conversation, user):
            return Response(
                {"detail": "Not your conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        count = conversation.messages.filter(is_read=False).exclude(sender=user).count()
        return Response({"unread_count": count})

    @action(detail=True, methods=["get"], url_path="messages")
    def list_messages(self, request, pk=None):
        conversation = self.get_object()
        user = request.user

        if not self._check_participant(conversation, user):
            return Response(
                {"detail": "Not your conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        qs = conversation.messages.select_related("sender").order_by("-created_at")

        before_id = request.query_params.get("before")
        if before_id:
            try:
                qs = qs.filter(pk__lt=int(before_id))
            except (ValueError, TypeError):
                pass

        limit = int(request.query_params.get("limit", 50))
        limit = min(max(limit, 1), 100)

        messages = list(qs[:limit])

        return Response({
            "messages": ChatMessageSerializer(messages, many=True, context={"request": request}).data,
            "has_more": len(messages) == limit,
        })
