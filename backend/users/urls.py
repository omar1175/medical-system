from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("users/", views.UsersListView.as_view(), name="users_list"),
    path("users/<int:pk>/", views.UserDetailView.as_view(), name="user_detail"),
    path("users/<int:pk>/block/", views.BlockUserView.as_view(), name="block_user"),
    path("users/<int:pk>/unblock/", views.UnblockUserView.as_view(), name="unblock_user"),
    path("patients/search/", views.PatientSearchView.as_view(), name="patient_search"),
    path("patients/<int:pk>/", views.PatientDetailView.as_view(), name="patient_detail"),
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", views.MeView.as_view(), name="me"),
    path("auth/change-password/", views.ChangePasswordView.as_view(), name="change_password"),
    path("auth/confirm-email/", views.ConfirmEmailView.as_view(), name="confirm_email"),
    path("auth/resend-email/", views.ResendEmailView.as_view(), name="resend_email"),
    path("auth/password-reset/", views.PasswordResetRequestView.as_view(), name="password_reset"),
    path("auth/password-reset-confirm/", views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
]
