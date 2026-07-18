from django.db.models.signals import post_save
from django.dispatch import receiver

from core.choices import PATIENT
from users.models import CustomUser, PatientProfile


@receiver(post_save, sender=CustomUser)
def create_patient_profile(sender, instance, created, **kwargs):
    """Automatically create a PatientProfile when a PATIENT account is created
    or the user's role changes to PATIENT."""
    if instance.role == PATIENT:
        PatientProfile.objects.get_or_create(user=instance)
    elif hasattr(instance, "patientprofile"):
        instance.patientprofile.delete()
