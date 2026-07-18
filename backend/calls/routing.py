from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(
        r"api/v1/ws/calls/(?P<appointment_id>\d+)/$",
        consumers.CallConsumer.as_asgi(),
    ),
]
