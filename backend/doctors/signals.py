from django.db.models.signals import post_save
from django.dispatch import receiver

from core.choices import DOCTOR
from users.models import CustomUser

from .models import DoctorProfile


@receiver(post_save, sender=CustomUser)
def create_doctor_profile(sender, instance, created, **kwargs):
    """Automatically create a DoctorProfile when a DOCTOR account is created or role changes."""
    if instance.role == DOCTOR:
        DoctorProfile.objects.get_or_create(user=instance)
    elif hasattr(instance, "doctorprofile"):
        instance.doctorprofile.delete()
