import logging

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.db import models
from django.utils.http import urlsafe_base64_decode
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status, generics, permissions, throttling, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from core import emails
from users.permissions import IsAdminRole

logger = logging.getLogger(__name__)
from .serializers import (
    AdminUserSerializer,
    CustomUserSerializer,
    RegisterSerializer,
    EmailSerializer,
)

User = get_user_model()


class UsersListView(generics.ListAPIView):
    """List all users. Admin only."""

    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        qs = User.objects.all().order_by("-date_joined")
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                models.Q(username__icontains=search)
                | models.Q(email__icontains=search)
                | models.Q(first_name__icontains=search)
                | models.Q(last_name__icontains=search)
            )
        return qs


class PatientSearchView(generics.ListAPIView):
    """Search patients. Accessible by doctors and admins."""

    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role not in ("DOCTOR", "ADMIN"):
            return User.objects.none()

        qs = User.objects.filter(role="PATIENT").order_by("first_name", "last_name")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                models.Q(username__icontains=search)
                | models.Q(email__icontains=search)
                | models.Q(first_name__icontains=search)
                | models.Q(last_name__icontains=search)
            )
        return qs


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a user. Admin only."""

    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    queryset = User.objects.all()


class PatientDetailView(generics.RetrieveAPIView):
    """Retrieve a patient's basic info. Accessible by doctors and admins."""

    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role not in ("DOCTOR", "ADMIN"):
            return User.objects.none()
        return User.objects.filter(role="PATIENT")


class RegisterView(generics.CreateAPIView):
    """Public registration. Sends a confirmation email on success."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        try:
            emails.send_confirmation_email(user)
        except Exception:
            pass
        return Response(
            CustomUserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveUpdateAPIView):
    """Return or update the currently authenticated user."""

    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change password for the authenticated user."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        if not old_password or not new_password:
            return Response(
                {"detail": "old_password and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = request.user
        if not user.check_password(old_password):
            return Response(
                {"detail": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from django.contrib.auth.password_validation import validate_password
        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response(
                {"new_password": list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password changed successfully."})


class ConfirmEmailView(APIView):
    """Activate an account from the link sent by email."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]

    def _confirm(self, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return None
        if default_token_generator.check_token(user, token):
            user.is_email_confirmed = True
            user.save(update_fields=["is_email_confirmed"])
            return user
        return False

    def get(self, request):
        uidb64 = request.query_params.get("uid")
        token = request.query_params.get("token")
        result = self._confirm(uidb64, token)
        if result is None:
            return Response({"detail": "Invalid confirmation link."}, status=status.HTTP_400_BAD_REQUEST)
        if result is False:
            return Response({"detail": "This link is no longer valid."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Email confirmed successfully."}, status=status.HTTP_200_OK)

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        result = self._confirm(uidb64, token)
        if result is None or result is False:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Email confirmed successfully."}, status=status.HTTP_200_OK)


class ResendEmailView(APIView):
    """Re-send the confirmation email for an unconfirmed account."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email__iexact=email)
        except ObjectDoesNotExist:
            return Response({"detail": "If the account exists, a confirmation email was sent."})
        if not user.is_email_confirmed:
            try:
                emails.send_confirmation_email(user)
            except Exception:
                logger.exception("Failed to resend confirmation email to %s", email)
        return Response({"detail": "If the account exists, a confirmation email was sent."})


class LoginSerializer(TokenObtainPairSerializer):
    """Validate credentials and ensure the email is confirmed."""

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if not user.is_email_confirmed:
            raise serializers.ValidationError(
                "Please confirm your email address before logging in."
            )
        data["user"] = CustomUserSerializer(user).data
        return data


class LoginView(TokenObtainPairView):
    """Issue a JWT pair after checking email confirmation."""

    serializer_class = LoginSerializer


class PasswordResetRequestView(APIView):
    """Send a password-reset email to the given address."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email__iexact=email)
        except ObjectDoesNotExist:
            # Always return the same message to avoid leaking account existence.
            return Response({"detail": "If the account exists, a password reset email was sent."})
        try:
            emails.send_password_reset_email(user)
        except Exception:
            logger.exception("Failed to send password reset email to %s", email)
        return Response({"detail": "If the account exists, a password reset email was sent."})


class BlockUserView(APIView):
    """Admin-only endpoint to block (deactivate) a user account."""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response({"detail": f"User {user.username} has been blocked."})


class UnblockUserView(APIView):
    """Admin-only endpoint to unblock (reactivate) a user account."""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response({"detail": f"User {user.username} has been unblocked."})


class PasswordResetConfirmView(APIView):
    """Set a new password using the uid + token from the email link."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not uidb64 or not token or not new_password:
            return Response(
                {"detail": "uid, token, and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response({"new_password": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password reset successfully."})
