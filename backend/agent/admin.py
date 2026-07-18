from django.contrib import admin
from .models import AgentSession, AgentMessage

admin.site.register(AgentSession)
admin.site.register(AgentMessage)
