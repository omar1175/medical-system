"""Seed the database with realistic medical appointment data.

Usage:
    python manage.py seed_data          # full seed
    python manage.py seed_data --flush   # wipe and re-seed
"""

import random
from datetime import date, datetime, time, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from appointments.models import Appointment
from core.choices import (
    APPOINTMENT_STATUS_CANCELLED,
    APPOINTMENT_STATUS_COMPLETED,
    APPOINTMENT_STATUS_CONFIRMED,
    APPOINTMENT_STATUS_PENDING,
    APPOINTMENT_TYPE_IN_PERSON,
    ADMIN,
    DOCTOR,
    PATIENT,
)
from doctors.models import Availability, DoctorProfile, Specialty
from payments.models import SubscriptionPlan
from users.models import CustomUser

# ── Realistic seed data ──────────────────────────────────────────────────────

SPECIALTIES = [
    ("Cardiology", "Diagnosis and treatment of heart and cardiovascular conditions."),
    ("Dermatology", "Treatment of skin, hair, and nail conditions."),
    ("General Practice", "Primary care for routine check-ups, illness, and preventive health."),
    ("Neurology", "Disorders of the nervous system including brain and spine."),
    ("Orthopedics", "Musculoskeletal system conditions — bones, joints, muscles."),
    ("Pediatrics", "Medical care for infants, children, and adolescents."),
    ("Psychiatry", "Mental health diagnosis and treatment."),
    ("Radiology", "Medical imaging interpretation and guided procedures."),
    ("General Surgery", "Surgical treatment of a wide range of conditions."),
    ("Urology", "Urinary tract and male reproductive system health."),
]

DOCTORS = [
    {
        "username": "dr_smith",
        "email": "dr.smith@medclinic.com",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "specialty": "Cardiology",
        "bio": "Board-certified cardiologist with 15 years of experience in interventional cardiology and heart failure management.",
        "phone": "+1-555-0101",
        "fee": 250.00,
        "online_fee": 80.00,
        "rating": 4.9,
        "years": 15,
    },
    {
        "username": "dr_johnson",
        "email": "dr.johnson@medclinic.com",
        "first_name": "Michael",
        "last_name": "Chen",
        "specialty": "General Practice",
        "bio": "Compassionate family physician dedicated to preventive care and building lasting patient relationships.",
        "phone": "+1-555-0102",
        "fee": 100.00,
        "online_fee": 35.00,
        "rating": 4.7,
        "years": 12,
    },
    {
        "username": "dr_patel",
        "email": "dr.patel@medclinic.com",
        "first_name": "Emily",
        "last_name": "Davis",
        "specialty": "Dermatology",
        "bio": "Fellowship-trained dermatologist specializing in cosmetic and medical dermatology, skin cancer screening.",
        "phone": "+1-555-0103",
        "fee": 200.00,
        "online_fee": 60.00,
        "rating": 4.8,
        "years": 8,
    },
    {
        "username": "dr_chen",
        "email": "dr.chen@medclinic.com",
        "first_name": "Robert",
        "last_name": "Smith",
        "specialty": "Neurology",
        "bio": "Neurologist with expertise in headache medicine, epilepsy, and neurodegenerative disorders.",
        "phone": "+1-555-0104",
        "fee": 275.00,
        "online_fee": 90.00,
        "rating": 4.6,
        "years": 20,
    },
    {
        "username": "dr_garcia",
        "email": "dr.garcia@medclinic.com",
        "first_name": "Lisa",
        "last_name": "Brown",
        "specialty": "Pediatrics",
        "bio": "Board-certified pediatrician passionate about child development, vaccinations, and adolescent medicine.",
        "phone": "+1-555-0105",
        "fee": 120.00,
        "online_fee": 40.00,
        "rating": 4.9,
        "years": 10,
    },
    {
        "username": "dr_williams",
        "email": "dr.williams@medclinic.com",
        "first_name": "David",
        "last_name": "Wilson",
        "specialty": "Orthopedics",
        "bio": "Orthopedic surgeon specializing in sports medicine, joint replacement, and minimally invasive procedures.",
        "phone": "+1-555-0106",
        "fee": 300.00,
        "online_fee": 100.00,
        "rating": 4.5,
        "years": 18,
    },
    {
        "username": "dr_kim",
        "email": "dr.kim@medclinic.com",
        "first_name": "Maria",
        "last_name": "Rodriguez",
        "specialty": "Psychiatry",
        "bio": "Psychiatrist focusing on mood disorders, anxiety, and evidence-based medication management.",
        "phone": "+1-555-0107",
        "fee": 220.00,
        "online_fee": 70.00,
        "rating": 4.8,
        "years": 14,
    },
    {
        "username": "dr_ahmed",
        "email": "dr.ahmed@medclinic.com",
        "first_name": "James",
        "last_name": "Thompson",
        "specialty": "General Surgery",
        "bio": "Experienced general surgeon with expertise in laparoscopic and bariatric surgery.",
        "phone": "+1-555-0108",
        "fee": 350.00,
        "online_fee": 120.00,
        "rating": 4.7,
        "years": 22,
    },
    {
        "username": "dr_lee",
        "email": "dr.lee@medclinic.com",
        "first_name": "Amanda",
        "last_name": "Foster",
        "specialty": "Radiology",
        "bio": "Diagnostic radiologist proficient in MRI, CT, and ultrasound interpretation with interventional experience.",
        "phone": "+1-555-0109",
        "fee": 180.00,
        "online_fee": 55.00,
        "rating": 4.4,
        "years": 9,
    },
    {
        "username": "dr_martinez",
        "email": "dr.martinez@medclinic.com",
        "first_name": "Victoria",
        "last_name": "Torres",
        "specialty": "Urology",
        "bio": "Urologist specializing in kidney stones, urinary infections, and minimally invasive urologic surgery.",
        "phone": "+1-555-0110",
        "fee": 230.00,
        "online_fee": 75.00,
        "rating": 4.6,
        "years": 11,
    },
]

PATIENTS = [
    {"username": "alice_w", "email": "alice.wilson@email.com", "first_name": "Alice", "last_name": "Wilson"},
    {"username": "bob_j", "email": "bob.jones@email.com", "first_name": "Bob", "last_name": "Jones"},
    {"username": "carlos_r", "email": "carlos.ramirez@email.com", "first_name": "Carlos", "last_name": "Ramirez"},
    {"username": "diana_l", "email": "diana.lee@email.com", "first_name": "Diana", "last_name": "Lee"},
    {"username": "emma_d", "email": "emma.davis@email.com", "first_name": "Emma", "last_name": "Davis"},
    {"username": "frank_m", "email": "frank.miller@email.com", "first_name": "Frank", "last_name": "Miller"},
    {"username": "grace_h", "email": "grace.hall@email.com", "first_name": "Grace", "last_name": "Hall"},
    {"username": "henry_t", "email": "henry.taylor@email.com", "first_name": "Henry", "last_name": "Taylor"},
    {"username": "ivy_c", "email": "ivy.clark@email.com", "first_name": "Ivy", "last_name": "Clark"},
    {"username": "jack_b", "email": "jack.brown@email.com", "first_name": "Jack", "last_name": "Brown"},
    {"username": "karen_s", "email": "karen.white@email.com", "first_name": "Karen", "last_name": "White"},
    {"username": "leo_g", "email": "leo.green@email.com", "first_name": "Leo", "last_name": "Green"},
]

APPOINTMENT_NOTES = [
    "Routine check-up",
    "Follow-up from last visit",
    "New patient consultation",
    "Annual physical exam",
    "Prescription refill request",
    "Chronic condition monitoring",
    "Pre-operative assessment",
    "Post-operative follow-up",
    "Urgent: sharp pain in lower back",
    "Lab results review",
    "Blood pressure check",
    "Vaccination appointment",
    "Skin rash evaluation",
    "Mental health check-in",
    "Joint pain assessment",
    "Headache specialist visit",
    "Post-surgery recovery check",
    "Routine bloodwork",
    "New symptoms discussion",
    "Therapy session",
]

TIME_SLOTS = [
    time(9, 0), time(9, 30), time(10, 0), time(10, 30),
    time(11, 0), time(11, 30),
    time(13, 0), time(13, 30), time(14, 0), time(14, 30),
    time(15, 0), time(15, 30), time(16, 0), time(16, 30),
]

# ── Command ──────────────────────────────────────────────────────────────────


class Command(BaseCommand):
    help = "Seed database with realistic medical appointment data"

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true", help="Wipe all data before seeding")

    def handle(self, *args, **options):
        if options["flush"]:
            self.stdout.write("Flushing existing data …")
            Appointment.objects.all().delete()
            Availability.objects.all().delete()
            DoctorProfile.objects.all().delete()
            Specialty.objects.all().delete()
            CustomUser.objects.filter(is_superuser=False).delete()

        self.stdout.write(self.style.WARNING("Seeding database …"))

        specialties = self._create_specialties()
        doctors = self._create_doctors(specialties)
        patients = self._create_patients()
        self._create_availability(doctors)
        self._create_appointments(doctors, patients)
        self._create_subscription_plans()

        self._print_summary()
        self.stdout.write(self.style.SUCCESS("Done!"))

    # ── helpers ───────────────────────────────────────────────────────────

    def _create_specialties(self):
        objs = {}
        for name, desc in SPECIALTIES:
            obj, created = Specialty.objects.get_or_create(
                name=name, defaults={"description": desc}
            )
            objs[name] = obj
            if created:
                self.stdout.write(f"  + Specialty: {name}")
        return objs

    def _create_doctors(self, specialties):
        objs = []
        for data in DOCTORS:
            user, created = CustomUser.objects.get_or_create(
                username=data["username"],
                defaults={
                    "email": data["email"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "role": DOCTOR,
                    "is_email_confirmed": True,
                },
            )
            if created:
                user.set_password("doctor123")
                user.save()
                self.stdout.write(f"  + Doctor user: {data['username']}")

            profile, p_created = DoctorProfile.objects.get_or_create(
                user=user,
                defaults={
                    "specialty": specialties[data["specialty"]],
                    "bio": data["bio"],
                    "phone": data["phone"],
                    "consultation_fee": data["fee"],
                    "online_consultation_fee": data.get("online_fee", 0),
                    "rating": data.get("rating", 0),
                    "years_of_experience": data.get("years", 0),
                    "is_approved": True,
                },
            )
            if not p_created:
                DoctorProfile.objects.filter(pk=profile.pk).update(is_approved=True)
            if p_created:
                self.stdout.write(f"  + Doctor profile: Dr. {data['last_name']}")
            objs.append(profile)
        return objs

    def _create_patients(self):
        objs = []
        for data in PATIENTS:
            user, created = CustomUser.objects.get_or_create(
                username=data["username"],
                defaults={
                    "email": data["email"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "role": PATIENT,
                    "is_email_confirmed": True,
                },
            )
            if created:
                user.set_password("patient123")
                user.save()
                self.stdout.write(f"  + Patient: {data['username']}")
            objs.append(user)
        return objs

    def _create_availability(self, doctors):
        count = 0
        for doc in doctors:
            # Each doctor works Mon-Fri, with a lunch break
            for day in range(5):  # 0=Mon .. 4=Fri
                defaults = {"is_active": True}
                Availability.objects.get_or_create(
                    doctor=doc, day_of_week=day,
                    start_time=time(9, 0), end_time=time(12, 0),
                    defaults=defaults,
                )
                Availability.objects.get_or_create(
                    doctor=doc, day_of_week=day,
                    start_time=time(13, 0), end_time=time(17, 0),
                    defaults=defaults,
                )
                count += 2
        self.stdout.write(f"  + Availability slots: {count}")

    def _create_appointments(self, doctors, patients):
        now = timezone.localtime(timezone.now())
        today = now.date()
        count = 0

        # ── Past completed appointments (last 4 weeks) ──
        for _ in range(25):
            doctor = random.choice(doctors)
            patient = random.choice(patients)
            days_ago = random.randint(1, 28)
            d = today - timedelta(days=days_ago)
            slot = random.choice(TIME_SLOTS)
            dt = timezone.make_aware(datetime.combine(d, slot))
            Appointment.objects.get_or_create(
                doctor=doctor,
                scheduled_at=dt,
                defaults={
                    "patient": patient,
                    "specialty": doctor.specialty,
                    "duration_minutes": 30,
                    "status": APPOINTMENT_STATUS_COMPLETED,
                    "notes": random.choice(APPOINTMENT_NOTES),
                },
            )
            count += 1

        # ── Past cancelled appointments ──
        for _ in range(8):
            doctor = random.choice(doctors)
            patient = random.choice(patients)
            days_ago = random.randint(1, 21)
            d = today - timedelta(days=days_ago)
            slot = random.choice(TIME_SLOTS)
            dt = timezone.make_aware(datetime.combine(d, slot))
            Appointment.objects.get_or_create(
                doctor=doctor,
                scheduled_at=dt,
                defaults={
                    "patient": patient,
                    "specialty": doctor.specialty,
                    "duration_minutes": 30,
                    "status": APPOINTMENT_STATUS_CANCELLED,
                    "notes": random.choice(APPOINTMENT_NOTES),
                },
            )
            count += 1

        # ── Today's appointments ──
        for doctor in doctors[:5]:
            patient = random.choice(patients)
            slot = random.choice(TIME_SLOTS[:6])
            dt = timezone.make_aware(datetime.combine(today, slot))
            Appointment.objects.get_or_create(
                doctor=doctor,
                scheduled_at=dt,
                defaults={
                    "patient": patient,
                    "specialty": doctor.specialty,
                    "duration_minutes": 30,
                    "status": APPOINTMENT_STATUS_CONFIRMED,
                    "notes": random.choice(APPOINTMENT_NOTES),
                },
            )
            count += 1

        # ── Upcoming confirmed appointments (next 2 weeks) ──
        for _ in range(20):
            doctor = random.choice(doctors)
            patient = random.choice(patients)
            days_ahead = random.randint(1, 14)
            d = today + timedelta(days=days_ahead)
            slot = random.choice(TIME_SLOTS)
            dt = timezone.make_aware(datetime.combine(d, slot))
            Appointment.objects.get_or_create(
                doctor=doctor,
                scheduled_at=dt,
                defaults={
                    "patient": patient,
                    "specialty": doctor.specialty,
                    "duration_minutes": 30,
                    "status": APPOINTMENT_STATUS_CONFIRMED,
                    "notes": random.choice(APPOINTMENT_NOTES),
                },
            )
            count += 1

        # ── Pending appointments (next 1-2 weeks) ──
        for _ in range(8):
            doctor = random.choice(doctors)
            patient = random.choice(patients)
            days_ahead = random.randint(1, 14)
            d = today + timedelta(days=days_ahead)
            slot = random.choice(TIME_SLOTS)
            dt = timezone.make_aware(datetime.combine(d, slot))
            Appointment.objects.get_or_create(
                doctor=doctor,
                scheduled_at=dt,
                defaults={
                    "patient": patient,
                    "specialty": doctor.specialty,
                    "duration_minutes": 30,
                    "status": APPOINTMENT_STATUS_PENDING,
                    "notes": random.choice(APPOINTMENT_NOTES),
                },
            )
            count += 1

        self.stdout.write(f"  + Appointments: {count}")

    def _print_summary(self):
        self.stdout.write("")
        self.stdout.write(self.style.HTTP_INFO("── Seed Summary ──"))
        self.stdout.write(f"  Users:      {CustomUser.objects.count()}")
        self.stdout.write(f"  Doctors:    {DoctorProfile.objects.count()}")
        self.stdout.write(f"  Patients:   {CustomUser.objects.filter(role=PATIENT).count()}")
        self.stdout.write(f"  Specialties:{Specialty.objects.count()}")
        self.stdout.write(f"  Availability:{Availability.objects.count()}")
        self.stdout.write(f"  Appointments:{Appointment.objects.count()}")
        self.stdout.write(f"  Plans:      {SubscriptionPlan.objects.count()}")

    def _create_subscription_plans(self):
        plan, created = SubscriptionPlan.objects.get_or_create(
            name="Monthly Plan",
            defaults={
                "description": "Full access to the platform for one month. Manage appointments, chat with patients, and more.",
                "price": 50.00,
                "duration_days": 30,
                "is_active": True,
            },
        )
        if created:
            self.stdout.write(f"  + Subscription plan: {plan.name} — ${plan.price}")
        self.stdout.write("")
        self.stdout.write(self.style.WARNING("Login credentials:"))
        self.stdout.write("  Admin:      admin / admin123")
        self.stdout.write("  Doctors:    dr_smith / doctor123  (and dr_johnson, dr_patel, …)")
        self.stdout.write("  Patients:   alice_w / patient123  (and bob_j, carlos_r, …)")
