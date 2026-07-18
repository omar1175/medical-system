from django.conf import settings
from django.db import models
from django.utils.text import slugify

from core.choices import DOCTOR


class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "doctors_specialty"
        ordering = ["name"]
        verbose_name_plural = "specialties"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class DoctorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="doctorprofile"
    )
    specialty = models.ForeignKey(
        Specialty, on_delete=models.SET_NULL, null=True, related_name="doctors"
    )
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    online_consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    years_of_experience = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "doctors_profile"

    def __str__(self):
        name = self.user.get_full_name() or self.user.username
        return f"Dr. {name}"


class Availability(models.Model):
    DAYS = [
        (0, "Monday"), (1, "Tuesday"), (2, "Wednesday"),
        (3, "Thursday"), (4, "Friday"), (5, "Saturday"), (6, "Sunday"),
    ]

    doctor = models.ForeignKey(
        DoctorProfile, on_delete=models.CASCADE, related_name="availability"
    )
    day_of_week = models.PositiveSmallIntegerField(choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "doctors_availability"
        ordering = ["day_of_week", "start_time"]
        unique_together = [("doctor", "day_of_week", "start_time", "end_time")]

    def __str__(self):
        return f"{self.doctor} - day {self.day_of_week} {self.start_time}-{self.end_time}"
