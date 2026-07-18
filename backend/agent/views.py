import json
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import AgentMessage, AgentSession
from .services import groq_client
from .services.tools import TOOLS, HANDLERS, _PROPOSALS, confirm_booking, confirm_reschedule


MAX_HISTORY = 20
MAX_TOOL_ITERATIONS = 5


class AgentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        session = AgentSession.objects.filter(user=user).first()
        if not session:
            return Response({"messages": []})
        messages = AgentMessage.objects.filter(user=user, session=session).order_by("created_at")[:100]
        data = [
            {
                "role": m.role,
                "content": m.content,
                "tool_name": m.tool_name,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
        return Response({"messages": data})


class AgentChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        message = request.data.get("message", "").strip()
        confirm_proposal_id = request.data.get("confirm_proposal_id", "").strip()

        if not groq_client.is_available():
            reply = "The AI scheduling assistant is currently unavailable. Please try again later."
            if message or confirm_proposal_id:
                AgentMessage.objects.create(user=user, role=AgentMessage.ROLE_USER, content=message or "(confirm attempt)")
                AgentMessage.objects.create(user=user, role=AgentMessage.ROLE_ASSISTANT, content=reply)
            return Response({"reply": reply})

        session = AgentSession.objects.filter(user=user).first()
        if not session:
            session = AgentSession.objects.create(user=user, title=message[:80] if message else "New Chat")

        history_qs = AgentMessage.objects.filter(user=user, session=session).order_by("created_at")
        history = list(history_qs.values_list("role", "content", "tool_name", "tool_call_id"))[:MAX_HISTORY]

        groq_messages = [{"role": "system", "content": (
            "You are a helpful medical appointment scheduling assistant for a clinic in Africa/Cairo timezone. "
            "You help patients book, reschedule, cancel, and list appointments. "
            "You help doctors view their schedules. Always confirm with the user before taking any action. "
            "Use propose_booking and confirm_booking for new appointments. "
            "Use propose_reschedule and confirm_reschedule for changes. "
            "Use cancel_appointment to cancel. "
            "If a tool returns a proposal_id, tell the user to confirm before proceeding."
        )}]

        for role, content, tool_name, tool_call_id in history:
            if role == AgentMessage.ROLE_TOOL:
                groq_messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call_id or "",
                    "content": content,
                })
            else:
                entry = {"role": role, "content": content}
                if role == AgentMessage.ROLE_ASSISTANT and tool_name:
                    entry["tool_calls"] = [{
                        "id": tool_call_id or "",
                        "type": "function",
                        "function": {"name": tool_name, "arguments": content},
                    }]
                groq_messages.append(entry)

        pending_confirmation = None
        final_reply = ""

        if confirm_proposal_id:
            proposal = _PROPOSALS.get(confirm_proposal_id)
            if proposal and proposal["user_id"] == user.pk:
                if proposal["action"] == "booking":
                    result = confirm_booking(user, confirm_proposal_id)
                else:
                    result = confirm_reschedule(user, confirm_proposal_id)
                final_reply = result.get("message", str(result))
                if message:
                    groq_messages.append({"role": "user", "content": message})
                if not final_reply:
                    final_reply = "Action completed."
            else:
                final_reply = "Invalid or expired proposal. Please try again."
        elif message:
            groq_messages.append({"role": "user", "content": message})
        else:
            return Response({"detail": "message or confirm_proposal_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not final_reply:
            client = groq_client.get_client()
            model = groq_client.get_model()

            for iteration in range(MAX_TOOL_ITERATIONS):
                response = client.chat.completions.create(
                    model=model,
                    messages=groq_messages,
                    tools=TOOLS,
                    tool_choice="auto",
                )
                choice = response.choices[0]
                msg = choice.message

                if msg.tool_calls:
                    tool_calls_list = []
                    for tc in msg.tool_calls:
                        tool_calls_list.append({
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments,
                            },
                        })
                    groq_messages.append({
                        "role": "assistant",
                        "content": msg.content or "",
                        "tool_calls": tool_calls_list,
                    })
                    for tc in msg.tool_calls:
                        handler = HANDLERS.get(tc.function.name)
                        if not handler:
                            tool_result = {"error": f"Unknown tool: {tc.function.name}"}
                        else:
                            try:
                                kwargs = json.loads(tc.function.arguments) if tc.function.arguments else {}
                                if tc.function.name in ("confirm_booking", "confirm_reschedule"):
                                    tool_result = handler(user, kwargs.get("proposal_id", ""))
                                else:
                                    tool_result = handler(user, **kwargs)
                            except Exception as e:
                                tool_result = {"error": str(e)}
                        tool_content = json.dumps(tool_result)
                        groq_messages.append({
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": tool_content,
                        })
                        if tool_result.get("proposal_id") and not pending_confirmation:
                            pending_confirmation = tool_result
                    continue

                final_reply = msg.content or ""
                break

            if not final_reply:
                final_reply = "I'm sorry, I couldn't process that request. Please try again."

        if message:
            AgentMessage.objects.create(user=user, session=session, role=AgentMessage.ROLE_USER, content=message)
        if confirm_proposal_id:
            AgentMessage.objects.create(
                user=user, session=session, role=AgentMessage.ROLE_USER,
                content=f"[confirm_proposal_id={confirm_proposal_id}]"
            )
        AgentMessage.objects.create(user=user, session=session, role=AgentMessage.ROLE_ASSISTANT, content=final_reply)

        if not session.title and (message or confirm_proposal_id):
            session.title = (message or "New Chat")[:80]
            session.save()

        return Response({
            "reply": final_reply,
            "pending_confirmation": pending_confirmation,
        })
