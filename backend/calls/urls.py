from django.urls import path

from .views import CallInfoView

urlpatterns = [
    path(
        "calls/<int:appointment_id>/info/",
        CallInfoView.as_view(),
        name="call-info",
    ),
]
