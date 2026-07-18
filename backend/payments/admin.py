from django.contrib import admin

from .models import DoctorSubscription, Payment, SubscriptionPlan


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["id", "appointment", "amount", "currency", "status", "paid_at", "created_at"]
    list_filter = ["status", "currency"]
    search_fields = ["appointment__id", "stripe_payment_intent_id", "stripe_checkout_session_id"]
    readonly_fields = ["created_at", "updated_at", "stripe_payment_intent_id", "stripe_checkout_session_id"]


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ["name", "price", "duration_days", "is_active"]
    list_filter = ["is_active"]


@admin.register(DoctorSubscription)
class DoctorSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["doctor", "plan", "status", "start_date", "end_date"]
    list_filter = ["status"]
    search_fields = ["doctor__user__username"]
