from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    RequestPasswordResetView,
    ResetPasswordView,
    UserManagementView,
    UpdatePasswordAPIView,
    AssignRolesView
)

urlpatterns = [
    # Authentication and Password Reset
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('reset-password/', RequestPasswordResetView.as_view()),
    path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view()),
    # User Management
    path('user-management/', UserManagementView.as_view()),
    # Update Password
    path('update-password/', UpdatePasswordAPIView.as_view()),
    path('assign-roles/<int:user_id>/', AssignRolesView.as_view(), name='assign-roles'), 

]
