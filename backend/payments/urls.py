from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("payments", views.PaymentViewSet, basename="payment")

urlpatterns = [
    path("payments/webhook/stripe/", views.stripe_webhook, name="stripe_webhook"),
    path("subscriptions/plans/", views.SubscriptionPlanListView.as_view(), name="subscription-plans"),
    path("subscriptions/subscribe/", views.SubscribeView.as_view(), name="subscription-subscribe"),
    path("subscriptions/status/", views.SubscriptionStatusView.as_view(), name="subscription-status"),
    path("subscriptions/cancel/", views.CancelSubscriptionView.as_view(), name="subscription-cancel"),
    path("", include(router.urls)),
]
