from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.contrib.auth import authenticate
from .serializers import UserSerializers, UpdatePasswordSerializer
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .permissions import IsAdmin
from .models import User
import datetime
import re
from django.utils.crypto import get_random_string
from asset.utils import translate_text, translate_dict
from django.shortcuts import get_object_or_404


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

        subject = "Welcome to Asset Management!"
        message = f"""
        Hi {user.first_name} {user.last_name},

        Your account has been successfully created!:

        You can login via following link: 
        
        {frontend_base_url}

        
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



class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Extract email and password
        email = request.data.get('email', '').strip().lower()  # Convert to lowercase
        password = request.data.get('password')

        if not email or not password:
            error_message = "Please provide both email and password."
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=400)

        try:
            # Case-insensitive lookup
            user = User.objects.get(email__iexact=email)
            # Authenticate using the stored email
            authenticated_user = authenticate(username=user.email, password=password)
            
            if authenticated_user is not None:
                refresh = RefreshToken.for_user(authenticated_user)
                role = "admin" if authenticated_user.is_superuser else getattr(authenticated_user, 'role', 'user')

                roles = [
                user.role,
                user.role2,
                user.role3,
                user.role4,
                user.role5
                ]

                roles = [role for role in roles if role]

                success_message = {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "role": role,
                    "all_roles": roles,
                    "name": authenticated_user.first_name,
                    "organization_name": user.organization_name,
                }
                translated_response = translate_dict(
                    success_message,
                    source_language = request.query_params.get('source_language', 'en'),
                    target_language = request.query_params.get('target_language', 'en') 
                )
                return Response(translated_response, status=200)
            else:
                error_message = "Invalid email or password."
                translated_error = translate_dict(
                    {"error": error_message},
                    source_language = request.query_params.get('source_language', 'en'),
                    target_language = request.query_params.get('target_language', 'en') 
                )
                return Response({"error": translated_error["error"]}, status=400)

        except User.DoesNotExist:
            error_message = "Invalid email or password."
            translated_error = translate_dict(
                {"error": error_message},
                source_language = request.query_params.get('source_language', 'en'),
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response({"error": translated_error["error"]}, status=400)




class UserManagementView(APIView):
    """
    Admin-only view for creating and managing users.
    Superusers will have the admin role and permissions.
    Customer_Manager can create Customers (users with the role == 'user') and send email credentials.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Allows the admin (superuser) to create a new user (Customer_Manager, Ticket_Manager, Sales_Manager, User).
        Allows Customer_Manager to create Users only and send them an email with credentials.
        """
        assign_roles = self.get_assigned_roles(request.user)

        # Superuser Permissions
        if request.user.is_superuser or request.user.role == 'admin' or 'admin' in assign_roles:
            # Ensure the superuser is creating valid roles
            role = request.data.get('role', '')
            if role not in ['customer_manager', 'ticket_manager', 'sales_manager', 'user']:
                return Response({"error": "Invalid role. Only User, Customer_Manager, Sales_Manager, and Ticket_Manager roles are allowed."}, status=status.HTTP_400_BAD_REQUEST)

        # Customer Manager Permissions
        elif request.user.role == 'customer_manager' or 'customer_manager' in assign_roles:
            role = request.data.get('role', '')
            if role != 'user' or 'user' in assign_roles:
                return Response({"error": "Customer Manager can only create Customers."}, status=status.HTTP_403_FORBIDDEN)

        # If neither superuser nor customer manager
        else:
            return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
        
        dummy_password = get_random_string(8)

        # Validate and create user
        serializer = UserSerializers(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            user.set_password(dummy_password)

            user.save()

            # Send email with login credentials
            self.send_password_reset_email(user)
            success_message = "User created successfully! A password set link has been sent to the user."

            return Response({"message": success_message, "user": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

        Best Regards
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
        assign_roles = self.get_assigned_roles(request.user)
        if not request.user.is_superuser or request.user.role != 'admin' or 'admin' in assign_roles:
            return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

        # Exclude the admin user and fetch non-admin users
        users = User.objects.exclude(role='admin')  # Exclude admins from the list
        serializer = UserSerializers(users, many=True)
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


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

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

            return Response({"message": "Password reset link sent to your email."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'No user found with this email'}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            token_generator = PasswordResetTokenGenerator()
            if not token_generator.check_token(user, token):
                return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

            if not self.is_password_strong(password):
                return Response({'error': 'Password must be strong (include uppercase, lowercase, digits, and special characters).'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Set the new password
            user.set_password(password)
            user.save()
            return Response({"message": "Password reset successful!"}, status=status.HTTP_200_OK)

        except (User.DoesNotExist, ValueError, Exception):
            return Response({'error': 'Invalid token or user'}, status=status.HTTP_400_BAD_REQUEST)

    @staticmethod
    def is_password_strong(password):
        if (len(password) < 8 or not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password)
                or not re.search(r"\d", password) or not re.search(r"[@$!%*?&]", password)):
            return False
        return True


        
class UpdatePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UpdatePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']

            if not user.check_password(old_password):
                return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class AssignRolesView(APIView):
    permission_classes = [IsAuthenticated] 

    def patch(self, request, user_id):
        # Get the user object by user_id
        user = get_object_or_404(User, id=user_id)
        data = request.data
        errors = {}

        # Only the fields role2 to role5 are available for updating
        role_fields = ['role', 'role2', 'role3', 'role4', 'role5']

        current_roles = [
            user.role,
            user.role2,
            user.role3,
            user.role4,
            user.role5
        ]
        
        for role_field in role_fields:
            new_role = data.get(role_field)
            
            if new_role:
                # Check if the new role is valid
                if new_role not in dict(User.ROLE_CHOICES):
                    errors[role_field] = f"Invalid role: {new_role}"
                elif new_role in current_roles:
                    # If the role is already assigned, don't update it
                    errors[role_field] = f"Role '{new_role}' is already assigned to this user."
                else:
                    # Update the corresponding role field
                    setattr(user, role_field, new_role)
                    current_roles.append(new_role)  # Add the new role to the list of current roles
            elif new_role == '':
                # If an empty string is provided, unassign the role
                current_value = getattr(user, role_field)
                if current_value != '':
                    setattr(user, role_field, '')  # Unassign the role by setting it to an empty string
                    if current_value in current_roles:
                        current_roles.remove(current_value) 

        if errors:
            # Translate and return errors if any
            translated_errors = translate_dict(
                errors,
                source_language=request.query_params.get('source_language', 'en'),  # Default to English
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
                "role": user.role,
                "assigned_roles": self.get_assigned_roles(user)  # Include updated roles
            }
        }, status=status.HTTP_200_OK)

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