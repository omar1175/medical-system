from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class AuthFlowTests(APITestCase):
    def _register(self, **overrides):
        payload = {
            "username": "bob",
            "email": "bob@example.com",
            "password": "Str0ngPass!23",
            "password2": "Str0ngPass!23",
            "role": "PATIENT",
        }
        payload.update(overrides)
        return self.client.post("/api/v1/auth/register/", payload, format="json")

    def test_register_creates_unconfirmed_user(self):
        res = self._register()
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="bob")
        self.assertFalse(user.is_email_confirmed)

    def test_register_password_mismatch(self):
        res = self._register(password2="different123!")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_blocked_until_confirmed(self):
        self._register()
        res = self.client.post(
            "/api/v1/auth/login/",
            {"username": "bob", "password": "Str0ngPass!23"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirm_email_then_login(self):
        self._register()
        user = User.objects.get(username="bob")
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        res = self.client.get(f"/api/v1/auth/confirm-email/?uid={uid}&token={token}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.get(pk=user.pk).is_email_confirmed)

        res = self.client.post(
            "/api/v1/auth/login/",
            {"username": "bob", "password": "Str0ngPass!23"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    def test_confirm_email_invalid_token(self):
        self._register()
        res = self.client.get("/api/v1/auth/confirm-email/?uid=MQ&token=badtoken")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_authenticated_me(self):
        self._register()
        user = User.objects.get(username="bob")
        user.is_email_confirmed = True
        user.save()
        self.client.force_authenticate(user=user)
        res = self.client.get("/api/v1/auth/me/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["username"], "bob")

    def test_refresh_issues_new_access(self):
        self._register()
        user = User.objects.get(username="bob")
        user.is_email_confirmed = True
        user.save()
        login = self.client.post(
            "/api/v1/auth/login/",
            {"username": "bob", "password": "Str0ngPass!23"},
            format="json",
        )
        refresh = login.data["refresh"]
        res = self.client.post("/api/v1/auth/refresh/", {"refresh": refresh}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)

    def test_resend_email_does_not_reveal_user(self):
        res = self.client.post(
            "/api/v1/auth/resend-email/",
            {"email": "nobody@example.com"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
