from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role.name == 'Admin'


class IsStaffUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role.name == 'Lễ tân'


class IsCustomerUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role.name == 'Khách hàng'
