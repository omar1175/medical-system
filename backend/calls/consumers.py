"""
WebSocket consumer for WebRTC signaling in 1:1 video consultations.

Handles:
- Participant join/leave with room validation
- Relay of offer, answer, and ICE candidates
- Media state broadcasting (mute, camera)
- Call end and cleanup
"""

import json
from django.utils import timezone

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.core.cache import cache
from django.db import close_old_connections

from core.choices import APPOINTMENT_TYPE_ONLINE_VIDEO

from .models import CallSession
from .utils import get_ice_server_config, validate_call_access

ROOM_CACHE_TTL = 3600  # 1 hour
ROOM_KEY_PREFIX = "call_room_"  # + appointment_id
ROOM_MAX_PARTICIPANTS = 2


class CallConsumer(AsyncJsonWebsocketConsumer):
    """WebSocket consumer for WebRTC video call signaling."""

    async def connect(self):
        self.appointment_id = self.scope["url_route"]["kwargs"]["appointment_id"]
        self.group_name = f"call_{self.appointment_id}"
        self.user = self.scope["user"]

        if isinstance(self.user, AnonymousUser):
            await self.close(code=4001)
            return

        try:
            self.appointment = await self._get_appointment(int(self.appointment_id))
        except (ValueError, Exception):
            await self.close(code=4003)
            return

        access = validate_call_access(self.user, self.appointment)
        if access is not True:
            await self.close(code=4003)
            return

        room_key = f"{ROOM_KEY_PREFIX}{self.appointment_id}"
        participants = cache.get(room_key, set())
        print(f"[CallConsumer] User {self.user.id} joining room {self.appointment_id}, current participants: {participants}")

        if len(participants) >= ROOM_MAX_PARTICIPANTS:
            print(f"[CallConsumer] Room {self.appointment_id} is full, rejecting user {self.user.id}")
            await self.close(code=4004)
            return

        participants.add(self.user.id)
        cache.set(room_key, participants, ROOM_CACHE_TTL)
        self.participant_ids = participants
        print(f"[CallConsumer] User {self.user.id} added, participants now: {participants}")

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        await self._ensure_call_session()

        participant_list = list(participants)
        role = await self._get_user_role(self.user)
        user_name = await self._get_user_name(self.user)

        is_initiator = len(participants) == ROOM_MAX_PARTICIPANTS

        await self.send_json({
            "type": "room.joined",
            "user_id": self.user.id,
            "user_name": user_name,
            "role": role,
            "is_initiator": is_initiator,
            "participants": participant_list,
            "participant_count": len(participant_list),
            "ice_servers": get_ice_server_config(),
        })

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "call.user_joined",
                "user_id": self.user.id,
                "user_name": user_name,
                "role": role,
                "participants": participant_list,
                "participant_count": len(participant_list),
            },
        )

    async def disconnect(self, close_code):
        user = self.scope.get("user")
        if user and not isinstance(user, AnonymousUser):
            room_key = f"{ROOM_KEY_PREFIX}{self.appointment_id}"
            participants = cache.get(room_key, set())
            participants.discard(user.id)

            if participants:
                cache.set(room_key, participants, ROOM_CACHE_TTL)
            else:
                cache.delete(room_key)

            user_name = ""
            try:
                user_name = await self._get_user_name(user)
            except Exception:
                pass

            if self.group_name and self.channel_name:
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "call.user_left",
                        "user_id": user.id,
                        "user_name": user_name,
                        "participants": list(participants),
                        "participant_count": len(participants),
                    },
                )

            if not participants:
                await self._end_call_session()

        if self.group_name and self.channel_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

        close_old_connections()

    async def receive_json(self, content):
        msg_type = content.get("type", "")
        print(f"[CallConsumer] User {self.user.id} received msg: {msg_type}")

        if msg_type == "call.offer":
            await self._relay_to_peer(content, exclude_self=True)
        elif msg_type == "call.answer":
            await self._relay_to_peer(content, exclude_self=True)
        elif msg_type == "call.ice-candidate":
            await self._relay_to_peer(content, exclude_self=True)
        elif msg_type == "call.mute":
            await self._broadcast_state(content)
        elif msg_type == "call.video-off":
            await self._broadcast_state(content)
        elif msg_type == "call.end":
            await self._handle_call_end()
        elif msg_type == "call.rejoin":
            await self._handle_rejoin()

    # --- Group event handlers (called by channel_layer.group_send) ---

    async def call_user_joined(self, event):
        if event["user_id"] != self.user.id:
            await self.send_json(event)

    async def call_user_left(self, event):
        await self.send_json(event)

    async def call_both_connected(self, event):
        await self.send_json({"type": "call.both_connected"})

    async def call_end(self, event):
        await self.send_json(event)

    # --- Internal helpers ---

    async def _relay_to_peer(self, content, exclude_self=True):
        """Forward a signaling message to all other participants in the room."""
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "call.signaling_event",
                "message": content,
                "sender_id": self.user.id,
            },
        )

    async def call_signaling_event(self, event):
        print(f"[CallConsumer] Relaying signal to user {self.user.id}, sender was {event['sender_id']}, type: {event['message'].get('type')}")
        if event["sender_id"] != self.user.id:
            await self.send_json(event["message"])

    async def _broadcast_state(self, content):
        """Broadcast media state changes (mute/camera) to all participants."""
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "call.state_event",
                "message": {
                    **content,
                    "user_id": self.user.id,
                },
                "sender_id": self.user.id,
            },
        )

    async def call_state_event(self, event):
        if event["sender_id"] != self.user.id:
            await self.send_json(event["message"])

    async def _handle_call_end(self):
        """Handle explicit call end from a participant."""
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "call.end",
                "ended_by": self.user.id,
                "user_name": await self._get_user_name(self.user),
            },
        )
        await self._end_call_session()

    async def _handle_rejoin(self):
        """Handle a participant reconnecting (e.g. after page refresh)."""
        room_key = f"{ROOM_KEY_PREFIX}{self.appointment_id}"
        participants = cache.get(room_key, set())
        participants.add(self.user.id)
        cache.set(room_key, participants, ROOM_CACHE_TTL)
        self.participant_ids = participants

        participant_list = list(participants)
        role = await self._get_user_role(self.user)
        user_name = await self._get_user_name(self.user)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "call.user_joined",
                "user_id": self.user.id,
                "user_name": user_name,
                "role": role,
                "participants": participant_list,
                "participant_count": len(participant_list),
            },
        )

        if len(participants) == ROOM_MAX_PARTICIPANTS:
            await self.channel_layer.group_send(
                self.group_name,
                {"type": "call.both_connected"},
            )

    # --- Database helpers ---

    @database_sync_to_async
    def _get_appointment(self, appointment_id: int):
        from appointments.models import Appointment
        return Appointment.objects.select_related(
            "patient", "doctor__user"
        ).get(id=appointment_id)

    @database_sync_to_async
    def _ensure_call_session(self):
        session, _ = CallSession.objects.get_or_create(
            appointment_id=self.appointment_id,
            defaults={"status": CallSession.STATUS_WAITING},
        )
        if session.status == CallSession.STATUS_WAITING:
            session.status = CallSession.STATUS_ACTIVE
            session.started_at = timezone.now()
            session.save(update_fields=["status", "started_at"])
        return session

    @database_sync_to_async
    def _end_call_session(self):
        try:
            session = CallSession.objects.get(appointment_id=self.appointment_id)
            if session.status != CallSession.STATUS_ENDED:
                session.status = CallSession.STATUS_ENDED
                session.ended_at = timezone.now()
                session.save(update_fields=["status", "ended_at"])
        except CallSession.DoesNotExist:
            pass

    @database_sync_to_async
    def _get_user_role(self, user) -> str:
        return user.role if hasattr(user, "role") else "UNKNOWN"

    @database_sync_to_async
    def _get_user_name(self, user) -> str:
        return user.get_full_name() or user.username
