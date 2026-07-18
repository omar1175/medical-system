from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("specialties", views.SpecialtyViewSet)
router.register("doctors", views.DoctorProfileViewSet, basename="doctor")
router.register("availability", views.AvailabilityViewSet, basename="availability")

urlpatterns = [
    path("stats/", views.platform_stats, name="platform-stats"),
    path("", include(router.urls)),
]
