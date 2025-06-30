from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsThirdParty(BasePermission):
    """Allows access only to Third-Party users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'third_party'

class IsTicketManager(BasePermission):
    """Allows access only to Ticket Managers."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ticket_manager'

class IsCustomerManager(BasePermission):
    """Allows access only to Customer Managers."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'customer_manager'
