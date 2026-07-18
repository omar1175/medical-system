"""Reusable DRF permission classes based on the user ``role``."""

from rest_framework import permissions

from core.choices import ADMIN, DOCTOR, PATIENT


class IsPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == PATIENT)


class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == DOCTOR)


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == ADMIN)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admins may write; everyone authenticated may read."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == ADMIN
