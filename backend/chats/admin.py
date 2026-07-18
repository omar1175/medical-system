from django.contrib import admin

from .models import ChatMessage, Conversation


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "patient", "doctor", "created_at", "updated_at"]
    list_filter = ["created_at"]
    search_fields = ["patient__username", "doctor__user__username"]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ["id", "conversation", "sender", "is_read", "edited_at", "has_attachment", "created_at"]
    list_filter = ["is_read", "created_at"]
    search_fields = ["sender__username", "body"]

    def has_attachment(self, obj):
        return bool(obj.attachment)
    has_attachment.boolean = True
