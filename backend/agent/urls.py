from django.urls import path
from . import views

urlpatterns = [
    path("chat/", views.AgentChatView.as_view(), name="agent-chat"),
    path("history/", views.AgentHistoryView.as_view(), name="agent-history"),
]
