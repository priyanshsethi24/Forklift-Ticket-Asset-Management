from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    RequestPasswordResetView,
    ResetPasswordView,
    UserManagementView,
    TicketManagersView,
    UpdatePasswordView,
    AssignRolesView,
    TicketListCreateView,  # New view for handling tickets
    TicketDetailView,  # View for getting a single ticket
    ThirdPartyRegisterView  # View for third-party user registration
)

urlpatterns = [
    # Authentication and Password Reset
    path('register/', RegisterView.as_view()),
    path('third-party/register/', ThirdPartyRegisterView.as_view()),  # Third-party user registration
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('reset-password/', RequestPasswordResetView.as_view()),
    path('update-password/', UpdatePasswordView.as_view()),
    path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view()),

    # User Management
    path('ticket-managers/', TicketManagersView.as_view()),
    path('user-management/', UserManagementView.as_view()),
    path('assign-roles/<int:user_id>/', AssignRolesView.as_view(), name='assign-roles'),
    path('users/<int:pk>/', UserManagementView.as_view(), name='user-delete'),

    # Ticket Management
    # path('tickets/', TicketListCreateView.as_view(), name='ticket-list-create'),  # Get/Create Tickets
    # path('tickets/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),  # Get Single Ticket
]
