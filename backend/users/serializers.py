from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from core.choices import PATIENT, DOCTOR, ADMIN, ROLE_CHOICES

User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "is_email_confirmed"]
        read_only_fields = ["id", "is_email_confirmed"]


class AdminUserSerializer(serializers.ModelSerializer):
    doctor_is_approved = serializers.SerializerMethodField()
    doctor_profile_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role",
                  "is_active", "is_email_confirmed", "doctor_is_approved", "doctor_profile_id"]
        read_only_fields = ["id", "username", "email", "role", "is_email_confirmed"]

    def get_doctor_is_approved(self, obj):
        if hasattr(obj, "doctorprofile"):
            return obj.doctorprofile.is_approved
        return None

    def get_doctor_profile_id(self, obj):
        if hasattr(obj, "doctorprofile"):
            return obj.doctorprofile.id
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(
        choices=[(PATIENT, "Patient"), (DOCTOR, "Doctor"), (ADMIN, "Admin")], default=PATIENT
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "password", "password2"]
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
