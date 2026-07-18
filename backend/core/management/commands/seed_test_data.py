"""
Management command to seed test data for independent feature testing.

Usage:
    python manage.py seed_test_data          # seed data
    python manage.py seed_test_data --flush   # remove all test data

After seeding, test each feature independently:

    Video Call:
        1. Login as test_patient / testpass123
        2. Go to Appointments -> Join Call
        3. Open another tab -> Login as test_doctor / doctor123
        4. Go to Appointments -> Join Call
        5. Both tabs connected via WebRTC

    Chat:
        1. Login as test_patient / testpass123
        2. Go to Messages -> select conversation with doctor
        3. Open another tab -> Login as test_doctor / doctor123
        4. Go to Messages -> select conversation with patient
        5. Send messages in real-time
"""

import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from core.choices import (
    PATIENT, DOCTOR,
    APPOINTMENT_STATUS_CONFIRMED,
    APPOINTMENT_TYPE_ONLINE_VIDEO,
)
from doctors.models import Specialty, DoctorProfile
from appointments.models import Appointment
from chats.models import Conversation

User = get_user_model()

TEST_PATIENT = {
    "username": "test_patient",
    "email": "test_patient@test.com",
    "first_name": "Ahmed",
    "last_name": "Patient",
    "password": "testpass123",
}

TEST_DOCTOR = {
    "username": "test_doctor",
    "email": "test_doctor@test.com",
    "first_name": "Sarah",
    "last_name": "Doctor",
    "password": "doctor123",
}


class Command(BaseCommand):
    help = "Seed test data for independent feature testing (video call, chat, appointments)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush", action="store_true", help="Remove all test data"
        )

    def handle(self, *args, **options):
        if options["flush"]:
            self.flush()
            return

        self.stdout.write(self.style.NOTICE("Seeding test data...\n"))

        # 1. Specialty
        specialty, _ = Specialty.objects.get_or_create(
            name="General Medicine",
            defaults={"description": "General medical consultation"},
        )
        self.stdout.write(f"  Specialty: {specialty.name}")

        # 2. Patient
        patient, created = User.objects.get_or_create(
            username=TEST_PATIENT["username"],
            defaults={
                "email": TEST_PATIENT["email"],
                "first_name": TEST_PATIENT["first_name"],
                "last_name": TEST_PATIENT["last_name"],
                "role": PATIENT,
                "is_email_confirmed": True,
            },
        )
        if created:
            patient.set_password(TEST_PATIENT["password"])
            patient.save()
        self.stdout.write(f"  Patient: {patient.username} (id={patient.id})")

        # 3. Doctor (signal auto-creates DoctorProfile)
        doctor_user, created = User.objects.get_or_create(
            username=TEST_DOCTOR["username"],
            defaults={
                "email": TEST_DOCTOR["email"],
                "first_name": TEST_DOCTOR["first_name"],
                "last_name": TEST_DOCTOR["last_name"],
                "role": DOCTOR,
                "is_email_confirmed": True,
            },
        )
        if created:
            doctor_user.set_password(TEST_DOCTOR["password"])
            doctor_user.save()
        self.stdout.write(f"  Doctor user: {doctor_user.username} (id={doctor_user.id})")

        # 4. DoctorProfile (created by signal, update it)
        profile, _ = DoctorProfile.objects.get_or_create(user=doctor_user)
        profile.specialty = specialty
        profile.is_approved = True
        profile.bio = "Test doctor for video call and chat testing"
        profile.consultation_fee = 100.00
        profile.online_consultation_fee = 80.00
        profile.save()
        self.stdout.write(f"  DoctorProfile: id={profile.id}, approved={profile.is_approved}")

        # 5. CONFIRMED ONLINE_VIDEO Appointment
        now = timezone.now()
        appointment_time = now + datetime.timedelta(hours=1)
        appointment, created = Appointment.objects.get_or_create(
            doctor=profile,
            scheduled_at=appointment_time,
            defaults={
                "patient": patient,
                "specialty": specialty,
                "duration_minutes": 30,
                "status": APPOINTMENT_STATUS_CONFIRMED,
                "appointment_type": APPOINTMENT_TYPE_ONLINE_VIDEO,
                "notes": "Test appointment for video call testing",
            },
        )
        self.stdout.write(f"  Appointment: id={appointment.id}, status={appointment.status}, type={appointment.appointment_type}")

        # 6. Conversation for chat
        conversation, created = Conversation.objects.get_or_create(
            patient=patient,
            doctor=profile,
        )
        self.stdout.write(f"  Conversation: id={conversation.id}")

        self.stdout.write(self.style.SUCCESS(f"""
============================================
  TEST DATA SEEDED SUCCESSFULLY
============================================

  Login Credentials:
  ------------------
  Patient:  {TEST_PATIENT['username']} / {TEST_PATIENT['password']}
  Doctor:   {TEST_DOCTOR['username']} / {TEST_DOCTOR['password']}

  Test Links:
  -----------
  Test Dashboard:  http://localhost:5173/test
  Appointments:    /patient/appointments  or  /doctor/appointments
  Chat:            /patient/chat           or  /doctor/chat
  Video Call:      /patient/appointments/{appointment.id}/call
                   /doctor/appointments/{appointment.id}/call

  How to Test:
  ------------
  1. Video Call:
     - Open /patient/appointments as patient -> click "Join Call"
     - Open /doctor/appointments as doctor -> click "Join Call"
     - Both tabs connected via WebRTC

  2. Chat:
     - Login as patient -> go to Messages
     - Login as doctor -> go to Messages
     - Send messages in real-time

  3. Appointments:
     - See the seeded CONFIRMED ONLINE_VIDEO appointment
     - Verify "Join Call" button appears

============================================
"""))

    def flush(self):
        self.stdout.write(self.style.WARNING("Flushing test data...\n"))

        # Delete in reverse dependency order
        Appointment.objects.filter(
            patient__username=TEST_PATIENT["username"],
            doctor__user__username=TEST_DOCTOR["username"],
        ).delete()

        Conversation.objects.filter(
            patient__username=TEST_PATIENT["username"],
            doctor__user__username=TEST_DOCTOR["username"],
        ).delete()

        # Delete users (cascade deletes DoctorProfile)
        User.objects.filter(username=TEST_PATIENT["username"]).delete()
        User.objects.filter(username=TEST_DOCTOR["username"]).delete()

        self.stdout.write(self.style.SUCCESS("Test data flushed."))
