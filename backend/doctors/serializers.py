from rest_framework import serializers

from .models import Availability, DoctorProfile, Specialty


class SpecialtySerializer(serializers.ModelSerializer):
    doctor_count = serializers.IntegerField(source="doctors.count", read_only=True)

    class Meta:
        model = Specialty
        fields = ["id", "name", "description", "slug", "doctor_count", "created_at"]
        read_only_fields = ["slug", "created_at"]


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ["id", "day_of_week", "start_time", "end_time", "is_active"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        start = attrs.get("start_time")
        end = attrs.get("end_time")
        if start is not None and end is not None and start >= end:
            raise serializers.ValidationError("end_time must be after start_time.")

        doctor = self.context.get("doctor")
        if doctor is None and self.instance:
            doctor = self.instance.doctor
        day_of_week = attrs.get("day_of_week", self.instance.day_of_week if self.instance else None)
        start_time = attrs.get("start_time", self.instance.start_time if self.instance else None)
        end_time = attrs.get("end_time", self.instance.end_time if self.instance else None)

        if doctor and day_of_week is not None and start_time and end_time:
            existing = Availability.objects.filter(
                doctor=doctor, day_of_week=day_of_week, is_active=True
            )
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            for slot in existing:
                if start_time < slot.end_time and end_time > slot.start_time:
                    raise serializers.ValidationError(
                        f"Overlaps with existing slot: {slot.start_time}-{slot.end_time}."
                    )
        return attrs


class DoctorProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    full_name = serializers.SerializerMethodField()
    specialty_detail = SpecialtySerializer(source="specialty", read_only=True)
    availability = AvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = DoctorProfile
        fields = [
            "id", "user_id", "username", "email", "first_name", "last_name",
            "full_name", "specialty", "specialty_detail", "bio", "phone",
            "consultation_fee", "online_consultation_fee", "rating",
            "years_of_experience", "is_approved", "availability", "created_at",
        ]
        read_only_fields = ["id", "user_id", "is_approved", "created_at"]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class DoctorListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    full_name = serializers.SerializerMethodField()
    specialty_name = serializers.CharField(source="specialty.name", read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = [
            "id", "username", "first_name", "last_name", "full_name",
            "specialty", "specialty_name", "consultation_fee",
            "online_consultation_fee", "bio", "rating",
            "years_of_experience", "image",
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_image(self, obj):
        return getattr(obj, "image", None) or None
