from rest_framework import serializers

from core.choices import PATIENT

from .models import LabTest, MedicalHistory, Prescription


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = [
            "id", "medication_name", "dosage", "frequency",
            "duration", "notes", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = [
            "id", "test_name", "result", "normal_range",
            "test_date", "notes", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class MedicalHistorySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.get_full_name", read_only=True)
    doctor_name = serializers.SerializerMethodField()
    specialty_name = serializers.SerializerMethodField()
    appointment_date = serializers.DateTimeField(
        source="appointment.scheduled_at", read_only=True, default=None
    )
    prescriptions = PrescriptionSerializer(many=True, read_only=True)
    lab_tests = LabTestSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalHistory
        fields = [
            "id", "patient", "patient_name", "doctor", "doctor_name",
            "specialty_name", "appointment", "appointment_date",
            "diagnosis", "symptoms", "treatment_plan", "notes",
            "prescriptions", "lab_tests", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "patient", "doctor", "created_at", "updated_at",
        ]

    def get_doctor_name(self, obj):
        if obj.doctor:
            return obj.doctor.user.get_full_name() or obj.doctor.user.username
        return None

    def get_specialty_name(self, obj):
        if obj.doctor and obj.doctor.specialty:
            return obj.doctor.specialty.name
        return None


class PrescriptionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = [
            "medication_name", "dosage", "frequency", "duration", "notes",
        ]


class LabTestWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = [
            "test_name", "result", "normal_range", "test_date", "notes",
        ]


class MedicalHistoryCreateSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionWriteSerializer(many=True, required=False)
    lab_tests = LabTestWriteSerializer(many=True, required=False)

    class Meta:
        model = MedicalHistory
        fields = [
            "patient", "appointment", "diagnosis", "symptoms",
            "treatment_plan", "notes", "prescriptions", "lab_tests",
        ]

    def create(self, validated_data):
        prescriptions_data = validated_data.pop("prescriptions", [])
        lab_tests_data = validated_data.pop("lab_tests", [])
        validated_data["doctor"] = self.context["request"].user.doctorprofile
        record = MedicalHistory.objects.create(**validated_data)
        for p in prescriptions_data:
            record.prescriptions.create(**p)
        for lt in lab_tests_data:
            record.lab_tests.create(**lt)
        return record

    def validate_patient(self, value):
        if value.role != PATIENT:
            raise serializers.ValidationError("Selected user is not a patient.")
        return value


class MedicalHistoryUpdateSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionWriteSerializer(many=True, required=False)
    lab_tests = LabTestWriteSerializer(many=True, required=False)

    class Meta:
        model = MedicalHistory
        fields = [
            "diagnosis", "symptoms", "treatment_plan", "notes",
            "prescriptions", "lab_tests",
        ]

    def update(self, instance, validated_data):
        prescriptions_data = validated_data.pop("prescriptions", None)
        lab_tests_data = validated_data.pop("lab_tests", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if prescriptions_data is not None:
            instance.prescriptions.all().delete()
            for p in prescriptions_data:
                instance.prescriptions.create(**p)

        if lab_tests_data is not None:
            instance.lab_tests.all().delete()
            for lt in lab_tests_data:
                instance.lab_tests.create(**lt)

        return instance


class PatientSummarySerializer(serializers.Serializer):
    total_records = serializers.IntegerField()
    total_prescriptions = serializers.IntegerField()
    total_lab_tests = serializers.IntegerField()
    recent_diagnoses = serializers.ListField(child=serializers.CharField())
    recent_records = MedicalHistorySerializer(many=True)
