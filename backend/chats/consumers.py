"""
Django Channels WebSocket consumer for real-time chat between patients and doctors.
"""

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections

from .models import ChatMessage, Conversation
from .serializers import ChatMessageSerializer


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """WebSocket consumer for 1:1 doctor-patient chat."""

    conversation_id = None
    group_name = None
    presence_group_name = None

    async def connect(self):
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.group_name = f"chat_{self.conversation_id}"
        self.presence_group_name = f"presence_{self.conversation_id}"

        user = self.scope["user"]
        if isinstance(user, AnonymousUser):
            await self.close(code=4001)
            return

        try:
            conversation = await self._get_conversation(int(self.conversation_id))
        except (Conversation.DoesNotExist, ValueError):
            await self.close(code=4003)
            return

        if conversation.patient_id != user.id and conversation.doctor.user_id != user.id:
            if not user.is_admin_role:
                await self.close(code=4003)
                return

        self.conversation = conversation
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add(self.presence_group_name, self.channel_name)
        await self.accept()

        messages = await self._get_recent_messages()
        await self.send_json({
            "type": "chat.reconnect",
            "messages": ChatMessageSerializer(messages, many=True).data,
        })

        await self._add_online_user(user.id)
        online_users = await self._get_online_users()
        sender_name = await self._get_sender_name(user)
        await self.channel_layer.group_send(
            self.presence_group_name,
            {
                "type": "chat.presence",
                "online_users": online_users,
                "user_id": user.id,
                "user_name": sender_name,
                "status": "online",
            },
        )

    async def disconnect(self, close_code):
        user = self.scope.get("user")
        if user and not isinstance(user, AnonymousUser) and hasattr(self, "group_name"):
            await self._remove_online_user(user.id)
            online_users = await self._get_online_users()
            sender_name = await self._get_sender_name(user)
            await self.channel_layer.group_send(
                self.presence_group_name,
                {
                    "type": "chat.presence",
                    "online_users": online_users,
                    "user_id": user.id,
                    "user_name": sender_name,
                    "status": "offline",
                },
            )

        if self.group_name and self.channel_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        if self.presence_group_name and self.channel_name:
            await self.channel_layer.group_discard(self.presence_group_name, self.channel_name)
        close_old_connections()

    async def receive_json(self, content):
        msg_type = content.get("type", "")

        if msg_type == "chat.message":
            await self._handle_send_message(content)
        elif msg_type == "chat.typing":
            await self._handle_typing(content)
        elif msg_type == "chat.mark_read":
            await self._handle_mark_read(content)
        elif msg_type == "chat.edit_message":
            await self._handle_edit_message(content)
        elif msg_type == "chat.delete_message":
            await self._handle_delete_message(content)

    async def chat_message_event(self, event):
        await self.send_json(event["message"])

    async def chat_typing_event(self, event):
        await self.send_json(event)

    async def chat_read_event(self, event):
        await self.send_json(event)

    async def chat_reconnect_event(self, event):
        await self.send_json(event)

    async def chat_message_edited_event(self, event):
        await self.send_json(event)

    async def chat_message_deleted_event(self, event):
        await self.send_json(event)

    async def chat_presence(self, event):
        await self.send_json(event)

    async def _handle_send_message(self, content):
        body = content.get("body", "").strip()
        attachment_url = content.get("attachment_url")

        if not body and not attachment_url:
            return

        message = await self._create_message(body)
        data = ChatMessageSerializer(message).data

        await self.channel_layer.group_send(
            self.group_name,
            {"type": "chat.message_event", "message": data},
        )

    async def _handle_typing(self, content):
        is_typing = content.get("is_typing", False)
        user = self.scope["user"]
        sender_name = await self._get_sender_name(user)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.typing_event",
                "sender_id": user.id,
                "sender_name": sender_name,
                "is_typing": is_typing,
            },
        )

    async def _handle_mark_read(self, content):
        sender_ids = content.get("sender_ids", [])
        count = await self._mark_messages_read(sender_ids)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.read_event",
                "marked_read": count,
                "marked_by": self.scope["user"].id,
            },
        )

    async def _handle_edit_message(self, content):
        message_id = content.get("message_id")
        new_body = content.get("body", "").strip()
        if not message_id or not new_body:
            return

        user = self.scope["user"]
        result = await self._edit_message(int(message_id), new_body, user.id)
        if result:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat.message_edited_event",
                    "message_id": message_id,
                    "body": new_body,
                    "edited_by": user.id,
                },
            )

    async def _handle_delete_message(self, content):
        message_id = content.get("message_id")
        if not message_id:
            return

        user = self.scope["user"]
        result = await self._delete_message(int(message_id), user.id)
        if result:
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat.message_deleted_event",
                    "message_id": message_id,
                    "deleted_by": user.id,
                },
            )

    @database_sync_to_async
    def _get_conversation(self, conversation_id: int):
        return Conversation.objects.select_related("patient", "doctor__user").get(id=conversation_id)

    @database_sync_to_async
    def _create_message(self, body: str):
        return ChatMessage.objects.create(
            conversation=self.conversation,
            sender=self.scope["user"],
            body=body,
        )

    @database_sync_to_async
    def _get_recent_messages(self, limit: int = 30):
        return list(
            ChatMessage.objects.filter(conversation=self.conversation)
            .select_related("sender")
            .order_by("-created_at")[:limit][::-1]
        )

    @database_sync_to_async
    def _mark_messages_read(self, sender_ids: list) -> int:
        qs = ChatMessage.objects.filter(
            conversation=self.conversation, is_read=False,
        )
        if sender_ids:
            qs = qs.filter(sender_id__in=sender_ids)
        return qs.update(is_read=True)

    @database_sync_to_async
    def _edit_message(self, message_id: int, new_body: str, user_id: int) -> bool:
        from django.utils import timezone
        updated = ChatMessage.objects.filter(
            pk=message_id,
            conversation=self.conversation,
            sender_id=user_id,
        ).update(body=new_body, edited_at=timezone.now())
        return updated > 0

    @database_sync_to_async
    def _delete_message(self, message_id: int, user_id: int) -> bool:
        deleted, _ = ChatMessage.objects.filter(
            pk=message_id,
            conversation=self.conversation,
            sender_id=user_id,
        ).delete()
        return deleted > 0

    @database_sync_to_async
    def _add_online_user(self, user_id: int):
        from channels.layers import get_channel_layer
        from django.core.cache import cache
        key = f"online_{self.conversation_id}"
        users = cache.get(key, set())
        users.add(user_id)
        cache.set(key, users, 3600)

    @database_sync_to_async
    def _remove_online_user(self, user_id: int):
        from django.core.cache import cache
        key = f"online_{self.conversation_id}"
        users = cache.get(key, set())
        users.discard(user_id)
        cache.set(key, users, 3600)

    @database_sync_to_async
    def _get_online_users(self) -> list:
        from django.core.cache import cache
        key = f"online_{self.conversation_id}"
        users = cache.get(key, set())
        return list(users)

    @database_sync_to_async
    def _get_sender_name(self, user) -> str:
        return user.get_full_name() or user.username
