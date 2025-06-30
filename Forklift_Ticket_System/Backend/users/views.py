from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.contrib.auth import authenticate
from .serializers import UserSerializers, TicketSerializer
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password
from users.utils.translation import translate_dict, translate_text
from django.conf import settings
from .models import User, Ticket
import datetime
import re
from django.utils.crypto import get_random_string
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .permissions import IsThirdParty


class TicketListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = Ticket.objects.filter(user=request.user)
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk, user=request.user)
        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk, user=request.user)
        ticket.delete()
        return Response({"message": "Ticket deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

from rest_framework_simplejwt.tokens import RefreshToken

class ThirdPartyRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data.copy()
        errors = {}

        email = data.get('email', '').strip().lower()
        data['email'] = email

        # Check if email already exists
        if User.objects.filter(email__iexact=email).exists():
            errors['email'] = 'Email already exists.'

        # Validate email format
        try:
            validate_email(email)
        except ValidationError:
            errors['email'] = 'Invalid email format.'

        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializers(data=data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(data.get('password'))
            user.save()

            # Assign third-party role to user (modify based on your role management)
            user.role = 'third_party'
            user.save()

            # Generate authentication tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Third-party user registered successfully.",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user_info": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Create your views here.
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data.copy()  # Create a mutable copy of the data
        errors = {}

        # Convert email to lowercase before validation and storage
        email = data.get('email', '').strip().lower()
        data['email'] = email  # Update the data with lowercase email

        role = request.data.get('role', '')

        if role != 'user':
                error_message = "Only User Registration is allowed!"
                translated_error = translate_dict(
                    {"error": error_message},
                    source_language = request.query_params.get('source_language', 'en'),  # Default to English
                    target_language = request.query_params.get('target_language', 'en') 
                )
                return Response({"error": translated_error["error"]}, status=status.HTTP_403_FORBIDDEN)

        
        try:
            validate_email(email)
        except ValidationError:
            errors['email'] = 'Invalid email format.'

        # Check if email already exists (case-insensitive)
        if User.objects.filter(email__iexact=email).exists():
            errors['email'] = 'Email already exists.'

        # Validate password strength
        password = data.get('password')
        if not self.is_password_strong(password):
            errors['password'] = 'Password must be at least 8 characters long, and include a mix of uppercase, lowercase, digits, and special characters.'

        
        # Translate and return errors if any
        if errors:
            translated_errors = translate_dict(
                errors,
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"errors": translated_errors}, status=status.HTTP_400_BAD_REQUEST)

        # Save the user if data is valid
        serializer = UserSerializers(data=data)  # Use modified data with lowercase email
        if serializer.is_valid():
            user = serializer.save()

            user.set_password(password)

            user.save()
            refresh = RefreshToken.for_user(user)

            roles = [
                user.role,
                user.role2,
                user.role3,
                user.role4,
                user.role5
            ]

            roles = [role for role in roles if role]

            success_message = translate_text(
                "User registered successfully!",
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )

            self.send_password_reset_email(user)
            

            return Response({
                "message": success_message,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user_info": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "organization_name": user.organization_name,
                    "role": user.role,
                    "all_roles": roles,

                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def is_password_strong(password):
        if (len(password) < 8 or not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password)
                or not re.search(r"\d", password) or not re.search(r"[@$!%*?&]", password)):
            return False
        return True
    
    def send_password_reset_email(self, user):
        """
        Sends welcome email to the user.
        """

        frontend_base_url = settings.FRONTEND_URL

        subject = "Welcome to Ticket Management!"
        message = f"""
        Hi {user.first_name} {user.last_name},

        Your account has been successfully created!:

        You can login via following link: 
        
        {frontend_base_url}

        
        Best Regards,
        Your Company
        """
        # Email: {user.email}
        # Organization: {user.organization_name}
        # Role: {user.role}
        # Admin notification email
        subject_admin = "New User Registration Alert"
        message_admin = f"""
        A new user, {user.first_name} {user.last_name}, has registered on the ticket portal.Please approve or disable the account via the Django Admin Panel:
        {frontend_base_url}/admin/

        Regards,
        Ticket Management System
        """

        try:
            send_mail(
                subject, 
                message, 
                settings.EMAIL_HOST_USER, 
                [user.email], 
                fail_silently=False
            )

            send_mail(
                subject_admin,
                message_admin,
                settings.EMAIL_HOST_USER,
                [settings.ADMIN_EMAIL],  # Define ADMIN_EMAIL in your settings.py
                fail_silently=False
            )
        except Exception as e:
            print(f"Error sending email: {e}")



from rest_framework_simplejwt.tokens import RefreshToken, OutstandingToken, BlacklistedToken

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password')

        if not email or not password:
            translated_error = translate_dict(
                {"error": "Please provide both email and password."},
                source_language=request.query_params.get('source_language', 'en'),
                target_language=request.query_params.get('target_language', 'en')
            )
            return Response({"error": translated_error["error"]}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
            authenticated_user = authenticate(username=user.email, password=password)

            if authenticated_user is not None:
                # Blacklist all old tokens of this user
                try:
                    outstanding_tokens = OutstandingToken.objects.filter(user=authenticated_user)
                    for token in outstanding_tokens:
                        BlacklistedToken.objects.get_or_create(token=token)
                except Exception as e:
                    print(f"Error blacklisting tokens: {e}")

                refresh = RefreshToken.for_user(authenticated_user)
                role = "admin" if authenticated_user.is_superuser else getattr(authenticated_user, 'role', 'user')

                roles = [
                    user.role,
                    user.role2,
                    user.role3,
                    user.role4,
                    user.role5
                ]
                roles = [r for r in roles if r]

                success_message = {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "role": role,
                    "all_roles": roles,
                    "name": authenticated_user.first_name + " " + authenticated_user.last_name,
                    "organization_name": user.organization_name,
                }
                translated_response = translate_dict(
                    success_message,
                    source_language=request.query_params.get('source_language', 'en'),
                    target_language=request.query_params.get('target_language', 'en')
                )
                return Response(translated_response, status=200)

            else:
                translated_error = translate_dict(
                    {"error": "Invalid email or password."},
                    source_language=request.query_params.get('source_language', 'en'),
                    target_language=request.query_params.get('target_language', 'en')
                )
                return Response({"error": translated_error["error"]}, status=400)

        except User.DoesNotExist:
            translated_error = translate_dict(
                {"error": "Invalid email or password."},
                source_language=request.query_params.get('source_language', 'en'),
                target_language=request.query_params.get('target_language', 'en')
            )
            return Response({"error": translated_error["error"]}, status=400)



class UserManagementView(APIView):
    """
    Admin-only view for creating and managing users.
    Superusers will have the admin role and permissions.
    Customer_Manager can create Customers (users with the role == 'user') and send email credentials.
    """
    permission_classes = [IsAuthenticated]

    def get_assigned_roles(self, user):
        # Helper method to gather all assigned roles (role, role2, role3, etc.)
        roles = [
            user.role,
            user.role2,
            user.role3,
            user.role4,
            user.role5
        ]
        # Remove empty roles
        return [role for role in roles if role]

    def post(self, request):
        """
        Allows the admin (superuser) to create a new user (Customer_Manager, Ticket_Manager, Sales_Manager, User).
        Allows Customer_Manager to create Users only and send them an email with credentials.
        """
        # Superuser Permissions
        print("11")
        assign_roles = self.get_assigned_roles(request.user)
        if 'admin' in assign_roles or request.user.is_superuser or request.user.role == 'admin':
            role = request.data.get('role', '')
            if role not in ['customer_manager', 'ticket_manager', 'sales_manager', 'user']:
                error_message = "Invalid role. Only User, Customer_Manager, Sales_Manager, and Ticket_Manager roles are allowed."
                translated_error = translate_dict(
                    {"error": error_message},
                    source_language = request.query_params.get('source_language', 'en'),  # Default to English
                    target_language = request.query_params.get('target_language', 'en') 
                )
                return Response({"error": translated_error["error"]}, status=status.HTTP_400_BAD_REQUEST)

        # Customer Manager Permissions
        elif 'customer_manager' in assign_roles or request.user.role == 'customer_manager':
            role = request.data.get('role', '')
            if role != 'user':
                error_message = "Customer Manager can only create Customers."
                translated_error = translate_dict(
                    {"error": error_message},
                    source_language = request.query_params.get('source_language', 'en'),  # Default to English
                    target_language = request.query_params.get('target_language', 'en') 
                )
                return Response({"error": translated_error["error"]}, status=status.HTTP_403_FORBIDDEN)

        # If neither superuser nor customer manager
        else:
            print("22")
            error_message = "You do not have permission to perform this action."
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=status.HTTP_403_FORBIDDEN)
        
        dummy_password = get_random_string(8)


        # Validate and create user
        serializer = UserSerializers(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            user.set_password(dummy_password)

            user.save()

            self.send_password_reset_email(user)

            success_message = "User created successfully! A password reset link has been sent to the user."
            translated_message = translate_dict(
                {"message": success_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"message": translated_message["message"], "user": serializer.data}, status=status.HTTP_201_CREATED)

        # Translate serializer errors
        translated_errors = translate_dict(
            serializer.errors,
            source_language = request.query_params.get('source_language', 'en'),  # Default to English
            target_language = request.query_params.get('target_language', 'en') 
        )
        return Response({"errors": translated_errors}, status=status.HTTP_400_BAD_REQUEST)

    def send_password_reset_email(self, user):
        """
        Sends a password reset email to the user.
        """
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        frontend_base_url = settings.FRONTEND_URL  # Adjust URL as needed
        reset_url = f"{frontend_base_url}/reset-password/{uidb64}/{token}/"

        subject = "Set Your Password"
        message = f"""
        Hi {user.first_name} {user.last_name},

        Your account has been successfully created. Please click the link below to set your password:

        {reset_url}

        Best Regards,
        Your Company
        """
        try:
            send_mail(
                subject, 
                message, 
                settings.EMAIL_HOST_USER, 
                [user.email], 
                fail_silently=False
            )
        except Exception as e:
            print(f"Error sending email: {e}")

    def get(self, request):
        """
        Superuser can view a list of all users, excluding admins.
        """
        print(request.user.role)
        assign_roles = self.get_assigned_roles(request.user)
        print("assign_roles", assign_roles)
        if not request.user.is_superuser and ('admin' not in assign_roles or request.user.role != 'admin'):
            error_message = "You do not have permission to perform this action."
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )

            return Response({"error": translated_error["error"]}, status=status.HTTP_403_FORBIDDEN)

        # Exclude the admin user and fetch non-admin users
        users = User.objects.exclude(role='admin').order_by('id')  # Exclude admins from the list
        serializer = UserSerializers(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, pk=None):
        """
        Delete a user by ID (Only admin users can perform this).
        """
        assign_roles = self.get_assigned_roles(request.user)
        
        # Admin Permissions
        if 'admin' in assign_roles or request.user.is_superuser or request.user.role == 'admin':
            try:
                user_to_delete = User.objects.get(pk=pk)
            except User.DoesNotExist:
                error_message = "User not found."
                translated_error = translate_dict(
                    {"error": error_message},
                    source_language=request.query_params.get('source_language', 'en'),  # Default to English
                    target_language=request.query_params.get('target_language', 'en') 
                )
                return Response({"error": translated_error["error"]}, status=status.HTTP_404_NOT_FOUND)

            if user_to_delete == request.user:
                error_message = "You cannot delete your own account."
                translated_error = translate_dict(
                    {"error": error_message},
                    source_language=request.query_params.get('source_language', 'en'),  # Default to English
                    target_language=request.query_params.get('target_language', 'en') 
                )
                return Response({"error": translated_error["error"]}, status=status.HTTP_400_BAD_REQUEST)

            user_to_delete.delete()
            success_message = "User deleted successfully."
            translated_message = translate_dict(
                {"message": success_message},
                source_language=request.query_params.get('source_language', 'en'),  # Default to English
                target_language=request.query_params.get('target_language', 'en') 
            )
            return Response({"message": translated_message["message"]}, status=status.HTTP_204_NO_CONTENT)

        # If the user does not have permission
        error_message = "You do not have permission to perform this action."
        translated_error = translate_dict(
            {"error": error_message},
            source_language=request.query_params.get('source_language', 'en'),  # Default to English
            target_language=request.query_params.get('target_language', 'en') 
        )
        return Response({"error": translated_error["error"]}, status=status.HTTP_403_FORBIDDEN)

    
    def get_assigned_roles(self, user):
        # Helper method to gather all assigned roles (role, role2, role3, etc.)
        roles = [
            user.role,
            user.role2,
            user.role3,
            user.role4,
            user.role5
        ]
        # Remove empty roles
        return [role for role in roles if role]
    
    # def patch(self, request, pk=None):
    #     """
    #     Update a user's email or other fields (admin only).
    #     """
    #     assign_roles = self.get_assigned_roles(request.user)

    #     # Admin check
    #     if 'admin' in assign_roles or request.user.is_superuser or request.user.role == 'admin':
    #         try:
    #             user = User.objects.get(pk=pk)
    #         except User.DoesNotExist:
    #             return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    #         serializer = UserSerializers(user, data=request.data, partial=True)
    #         if serializer.is_valid():
    #             serializer.save()
    #             return Response({"message": "User updated successfully.", "user": serializer.data}, status=status.HTTP_200_OK)
    #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #     return Response({"error": "You do not have permission."}, status=status.HTTP_403_FORBIDDEN)

    # def patch(self, request, pk=None):
    #     """
    #     Admin can update user details like email, name, etc.
    #     """
    #     assign_roles = self.get_assigned_roles(request.user)
    #     if 'admin' not in assign_roles and not request.user.is_superuser and request.user.role != 'admin':
    #         error_message = "You do not have permission to perform this action."
    #         translated_error = translate_dict(
    #             {"error": error_message},
    #             source_language=request.query_params.get('source_language', 'en'),
    #             target_language=request.query_params.get('target_language', 'en')
    #         )
    #         return Response({"error": translated_error["error"]}, status=status.HTTP_403_FORBIDDEN)

    #     try:
    #         user_to_update = User.objects.get(pk=pk)
    #     except User.DoesNotExist:
    #         error_message = "User not found."
    #         translated_error = translate_dict(
    #             {"error": error_message},
    #             source_language=request.query_params.get('source_language', 'en'),
    #             target_language=request.query_params.get('target_language', 'en')
    #         )
    #         return Response({"error": translated_error["error"]}, status=status.HTTP_404_NOT_FOUND)

    #     serializer = UserSerializers(user_to_update, data=request.data, partial=True)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response({"message": "User updated successfully", "user": serializer.data}, status=status.HTTP_200_OK)

    #     translated_errors = translate_dict(
    #         serializer.errors,
    #         source_language=request.query_params.get('source_language', 'en'),
    #         target_language=request.query_params.get('target_language', 'en')
    #     )
    #     return Response({"errors": translated_errors}, status=status.HTTP_400_BAD_REQUEST)
   

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()

            success_message = "Successfully logged out"
            translated_message = translate_dict(
                {"message": success_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"message": translated_message["message"]}, status=200)
        except Exception as e:
            error_message = str(e)
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=400)


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            error_message = "Email is required"
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

            frontend_base_url = settings.FRONTEND_URL
            reset_url = f"{frontend_base_url}/reset-password/{uidb64}/{token}/"
            send_mail(
                subject="Reset Your Password",
                message=f"Click the link to reset your password: {reset_url}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )

            success_message = "Password reset link sent to your email."
            translated_message = translate_dict(
                {"message": success_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"message": translated_message["message"]}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            error_message = "No user found with this email"
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get('password')
        if not password:
            error_message = "Password is required"
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            token_generator = PasswordResetTokenGenerator()
            if not token_generator.check_token(user, token):
                error_message = "Invalid or expired token"
                translated_error = translate_dict(
                    {"error": error_message},
                    source_language = request.query_params.get('source_language', 'en'),  # Default to English
                    target_language = request.query_params.get('target_language', 'en') 
                )
                return Response({"error": translated_error["error"]}, status=status.HTTP_400_BAD_REQUEST)

            if not self.is_password_strong(password):
                error_message = "Password must be strong (include uppercase, lowercase, digits, and special characters)."
                translated_error = translate_dict(
                    {"error": error_message},
                    source_language = request.query_params.get('source_language', 'en'),  # Default to English
                    target_language = request.query_params.get('target_language', 'en') 
                )
                return Response({"error": translated_error["error"]}, status=status.HTTP_400_BAD_REQUEST)

            # Set the new password
            user.set_password(password)
            user.save()
            success_message = "Password reset successful!"
            translated_message = translate_dict(
                {"message": success_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"message": translated_message["message"]}, status=status.HTTP_200_OK)

        except (User.DoesNotExist, ValueError, Exception):
            error_message = "Invalid token or user"
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def is_password_strong(password):
        if (len(password) < 8 or not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password)
                or not re.search(r"\d", password) or not re.search(r"[@$!%*?&]", password)):
            return False
        return True



class UpdatePasswordView(APIView):
    """
    API to allow authenticated users to update their password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        # Extract current and new passwords from the request
        current_password = data.get('old_password')
        new_password = data.get('new_password')

        # Check if both fields are provided
        if not current_password or not new_password:
            error_message = "Both current and new passwords are required."
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=status.HTTP_400_BAD_REQUEST)

        # Verify the current password
        if not check_password(current_password, user.password):
            error_message = "Current password is incorrect."
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=status.HTTP_400_BAD_REQUEST)

        # Validate the new password strength
        if not self.is_password_strong(new_password):
            error_message = "New password must be at least 8 characters long, include uppercase, lowercase, digits, and special characters."
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=status.HTTP_400_BAD_REQUEST)

        # Update the password
        user.set_password(new_password)
        user.save()

        success_message = "Password updated successfully."
        translated_message = translate_dict(
            {"message": success_message},
            source_language = request.query_params.get('source_language', 'en'),  # Default to English
            target_language = request.query_params.get('target_language', 'en') 
        )

        return Response({"message": translated_message["message"]}, status=status.HTTP_200_OK)

    @staticmethod
    def is_password_strong(password):
        """
        Validates password strength.
        - At least 8 characters
        - Contains uppercase, lowercase, digit, and special character
        """
        if (len(password) < 8 or not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password)
                or not re.search(r"\d", password) or not re.search(r"[@$!%*?&]", password)):
            return False
        return True

    

class TicketManagersView(APIView):
    """
    View to fetch all Ticket Managers.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):

        assign_roles = self.get_assigned_roles(request.user)
        # Check if user has permission
        if not request.user.is_superuser and not any(role in ['admin', 'customer_manager', 'sales_manager'] for role in assign_roles) and request.user.role not in ['admin', 'customer_manager', 'sales_manager']:
            error_message = "You do not have permission to access this resource."
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=status.HTTP_403_FORBIDDEN)

        # Fetch users with the 'ticket_manager' role
        ticket_managers = User.objects.filter(
            Q(role='ticket_manager') | 
            Q(role2='ticket_manager') | 
            Q(role3='ticket_manager') | 
            Q(role4='ticket_manager') | 
            Q(role5='ticket_manager')
        )

        serializer = UserSerializers(ticket_managers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def get_assigned_roles(self, user):
        # Helper method to gather all assigned roles (role, role2, role3, etc.)
        roles = [
            user.role,
            user.role2,
            user.role3,
            user.role4,
            user.role5
        ]
        # Remove empty roles
        return [role for role in roles if role]


class AssignRolesView(APIView):
    permission_classes = [IsAuthenticated] 

    def patch(self, request, user_id):
        # Get the user object by user_id
        user = get_object_or_404(User, id=user_id)
        data = request.data
        errors = {}

        # Get the list of roles provided in the payload
        first_name = data.get('first_name', None)
        last_name = data.get('last_name', None)
        assigned_roles = data.get('assigned_roles', [])

        # List of valid roles
        valid_roles = [role[0] for role in User.ROLE_CHOICES]

        # The current assigned roles (including role1 to role5)
        current_roles = self.get_assigned_roles(user)

        # Loop through the roles to check and assign/remove as necessary
        for role in assigned_roles:
            if role not in valid_roles:
                # If the role is not valid, return an error
                errors['assigned_roles'] = f"Invalid role: {role}"
            elif role in current_roles:
                # If the role is already assigned, skip adding it
                continue
            else:
                # If the role is not assigned, assign it to the user
                self.assign_role(user, role)

        # Now check if there are any roles that are no longer in the assigned list
        for role in current_roles:
            if role not in assigned_roles and role != '':
                # If the role is not in the assigned_roles list, unassign it
                self.unassign_role(user, role)

        # Update first_name and last_name if provided
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name

        assign_roles = self.get_assigned_roles(request.user)
        is_admin = 'admin' in assign_roles or request.user.is_superuser or request.user.role == 'admin'
        email = data.get('email', None)  # Email update request
        # Only allow email updates if user is admin
        if email:
            if is_admin:
                user.email = email
            else:
                errors['email'] = "You do not have permission to update the email."

        if errors:
            # Translate and return errors if any
            translated_errors = translate_dict(
                errors,
                source_language=request.query_params.get('source_language', 'en'),
                target_language=request.query_params.get('target_language', 'en')
            )
            return Response({"errors": translated_errors}, status=status.HTTP_400_BAD_REQUEST)

        # Save the updated user object
        user.save()

        # Translate success message
        success_message = translate_text(
            "User roles and details updated successfully!",
            source_language=request.query_params.get('source_language', 'en'),
            target_language=request.query_params.get('target_language', 'en')
        )


        if errors:
            # Translate and return errors if any
            translated_errors = translate_dict(
                errors,
                source_language=request.query_params.get('source_language', 'en'),
                target_language=request.query_params.get('target_language', 'en')
            )
            return Response({"errors": translated_errors}, status=status.HTTP_400_BAD_REQUEST)

        # Save the updated user object
        user.save()

        # Translate success message
        success_message = translate_text(
            "User roles updated successfully!",
            source_language=request.query_params.get('source_language', 'en'),
            target_language=request.query_params.get('target_language', 'en')
        )

        # Return updated user info in the response
        return Response({
            "message": success_message,
            "user_info": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "organization_name": user.organization_name,
                "role": self.get_assigned_roles(user)[0] if self.get_assigned_roles(user) else "",
                "assigned_roles": self.get_assigned_roles(user)  # Include updated roles
            }
        }, status=status.HTTP_200_OK)

    def assign_role(self, user, role):
        # Find an empty role field and assign the new role to it
        for i in range(1, 6):  # role1 to role5
            role_field = f'role{i}' if i > 1 else 'role'
            if getattr(user, role_field) == '':
                setattr(user, role_field, role)
                break

    def unassign_role(self, user, role):
        # Find and unassign the role if it exists in any of the role fields
        for i in range(1, 6):  # role1 to role5
            role_field = f'role{i}' if i > 1 else 'role'
            if getattr(user, role_field) == role:
                setattr(user, role_field, '')
                break

    def get_assigned_roles(self, user):
        # Helper method to gather all assigned roles (role, role2, role3, etc.)
        roles = [
            user.role,
            user.role2,
            user.role3,
            user.role4,
            user.role5
        ]
        # Remove empty roles
        return [role for role in roles if role]