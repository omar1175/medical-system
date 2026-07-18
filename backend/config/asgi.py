"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings_dev")

django_asgi_app = get_asgi_application()

from chats.routing import websocket_urlpatterns as chat_ws
from calls.routing import websocket_urlpatterns as call_ws
from chats.middleware import JWTAuthMiddleware

websocket_urlpatterns = chat_ws + call_ws

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JWTAuthMiddleware(
            URLRouter(websocket_urlpatterns)
        ),
    }
)
