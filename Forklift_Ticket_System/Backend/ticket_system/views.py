from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.contrib.auth import authenticate
from .serializers import TicketSerializer, AttachmentSerializer
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.http import StreamingHttpResponse
from django.conf import settings
from .models import User, Ticket, Attachment, ThirdPartyRole
from .utils.translation import translate_dict, translate_text
import datetime
import json
from django.utils.dateparse import parse_datetime
from django.db.models import Q

# from rest_framework import viewsets, permissions
# from users.permissions import IsThirdPartyUser  # Import permission

# class TicketViewSet(viewsets.ModelViewSet):
#     queryset = Ticket.objects.all()
#     serializer_class = TicketSerializer

#     def get_permissions(self):
#         if self.action in ['list', 'create']:  # Allow 3rd-party users to view and create tickets
#             return [IsThirdPartyUser()]
#         return [permissions.IsAuthenticated()]

class ThirdPartyRoleTicketView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if not ThirdPartyRole.objects.filter(user=user).exists():
            return Response({"error": "Unauthorized third-party access."}, status=status.HTTP_403_FORBIDDEN)
        
        # Filter tickets where creator is the logged-in user
        tickets = Ticket.objects.filter(creator=user).order_by('-last_updated')
        # tickets = Ticket.objects.all().order_by('-last_updated')
        serializer = TicketSerializer(tickets, many=True)
        translated_data = translate_dict(
            serializer.data,
            source_language = request.query_params.get('source_language', 'en'),  # Default to English
            target_language = request.query_params.get('target_language', 'en') 
        )
        return Response(translated_data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        ThirdPartyRole.objects.get_or_create(user=user)
        if not ThirdPartyRole.objects.filter(user=user).exists():
            return Response({"error": "Unauthorized third-party access."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TicketSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            ticket = serializer.save(creator=user)
            ticket.add_activity_log(
                action="Ticket Created",
                changed_by=request.user,
                updated_value=f"Ticket ID {ticket.ticket_id} created with title '{ticket.title}'",
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        
        # Translate error messages
        translated_errors = translate_dict(
            serializer.errors,
            source_language = request.query_params.get('source_language', 'en'),  # Default to English
            target_language = request.query_params.get('target_language', 'en') 
        )
        return Response(translated_errors, status=status.HTTP_400_BAD_REQUEST)

class TranslateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        source_language = request.data.get("source_language", "en")  # Default to English
        target_language = request.data.get("target_language")        # Required

        if not target_language:
            return Response({"error": "Target language is required."}, status=400)
        
        print(f"translateview target_lang: {target_language}")
        # Store in session
        request.session['source_language'] = source_language
        request.session['target_language'] = target_language

        return Response(
            {"target_language": target_language},  # Only send target_language
            status=200
        )


# class TicketView(APIView):
    # permission_classes = [IsAuthenticated]

    # def get(self, request):
    #     user = request.user
    #     assign_role = self.get_assigned_roles(user)

    #     if user.is_superuser or user.role == 'admin' or 'admin' in assign_role:
    #         tickets = Ticket.objects.all().order_by('-last_updated')
    #     elif user.role in ['customer_manager', 'sales_manager'] or 'customer_manager' in assign_role or 'sales_manager' in assign_role:
    #         tickets = Ticket.objects.all().order_by('-last_updated')
    #     elif user.role == 'ticket_manager' or 'ticket_manager' in assign_role:
    #         tickets = Ticket.objects.filter(
    #             Q(assigned_to=user) | Q(creator=user)
    #         ).order_by('-last_updated')
    #     # elif (user.role == 'ticket_manager') or ('ticket_manager' in assign_role):
    #     #     tickets = Ticket.objects.filter(assigned_to=user).order_by('-last_updated')
    #     else:
    #         tickets = Ticket.objects.filter(creator=user).order_by('-last_updated')

    #     serializer = TicketSerializer(tickets, many=True)
        
    #     print(f"ticketview target_lang: {request.target_language}")
    #     # Translate the serialized data
    #     translated_data = translate_dict(
    #         serializer.data,
    #         source_language = request.query_params.get('source_language', 'en'),  # Default to English
    #         target_language = request.query_params.get('target_language', 'en') 
    #     )

    #     return Response(translated_data, status=status.HTTP_200_OK)

    # def post(self, request):
    #     serializer = TicketSerializer(data=request.data, context={'request': request})
    #     if serializer.is_valid():
    #         ticket = serializer.save(creator=request.user)
    #         ticket.add_activity_log(
    #             action="Ticket Created",
    #             changed_by=request.user,
    #             updated_value=f"Ticket ID {ticket.ticket_id} created with title '{ticket.title}'",
    #         )
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     # Translate error messages
    #     translated_errors = translate_dict(
    #         serializer.errors,
    #         source_language = request.query_params.get('source_language', 'en'),  # Default to English
    #         target_language = request.query_params.get('target_language', 'en') 
    #     )
    #     return Response(translated_errors, status=status.HTTP_400_BAD_REQUEST)
    
    # def get_assigned_roles(self, user):
    #     # Helper method to gather all assigned roles (role, role2, role3, etc.)
    #     roles = [
    #         user.role,
    #         user.role2,
    #         user.role3,
    #         user.role4,
    #         user.role5
    #     ]
    #     # Remove empty roles
    #     return [role for role in roles if role]



class TicketView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        user = request.user
        assign_role = self.get_assigned_roles(user)
 
        if user.is_superuser or user.role == 'admin' or 'admin' in assign_role:
            tickets = Ticket.objects.all().order_by('-last_updated')
        elif user.role in ['customer_manager', 'sales_manager'] or 'customer_manager' in assign_role or 'sales_manager' in assign_role:
            tickets = Ticket.objects.all().order_by('-last_updated')
        elif user.role == 'ticket_manager' or 'ticket_manager' in assign_role:
            tickets = Ticket.objects.filter(
                Q(assigned_to=user) | Q(creator=user)
            ).order_by('-last_updated')
        # elif (user.role == 'ticket_manager') or ('ticket_manager' in assign_role):
        #     tickets = Ticket.objects.filter(assigned_to=user).order_by('-last_updated')
        else:
            tickets = Ticket.objects.filter(creator=user).order_by('-last_updated')
        
 
        serializer = TicketSerializer(tickets, many=True)
        
        print(f"ticketview target_lang: {request.target_language}")
        # Translate the serialized data
        translated_data = translate_dict(
            serializer.data,
            source_language = request.query_params.get('source_language', 'en'),  # Default to English
            target_language = request.query_params.get('target_language', 'en')
        )
        # print(translated_data)
 
        for item in translated_data:
            item['last_updated'] = item['last_updated'].replace(" ","")
            item['creation_date'] = item['creation_date'].replace(" ","")
            for activity_log in item['activity_log']:
              activity_log['timestamp'] = activity_log['timestamp'].replace(" ","")
            for comments in item['comments']:
              comments['timestamp'] = comments['timestamp'].replace(" ","")
 
        return Response(translated_data, status=status.HTTP_200_OK)
 
    def post(self, request):
        serializer = TicketSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            ticket = serializer.save(creator=request.user)
            ticket.add_activity_log(
                action="Ticket Created",
                changed_by=request.user,
                updated_value=f"Ticket ID {ticket.ticket_id} created with title '{ticket.title}'",
            )
 
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        for item in serializer.data:
            item['last_updated'] = item['last_updated'].replace(" ","")
            item['creation_date'] = item['creation_date'].replace(" ","")
            for activity_log in item['activity_log']:
              activity_log['timestamp'] = activity_log['timestamp'].replace(" ","")
            for comments in item['comments']:
              comments['timestamp'] = comments['timestamp'].replace(" ","")
 
        # Translate error messages
        translated_errors = translate_dict(
            serializer.errors,
            source_language = request.query_params.get('source_language', 'en'),  # Default to English
            target_language = request.query_params.get('target_language', 'en')
        )
        
        return Response(translated_errors, status=status.HTTP_400_BAD_REQUEST)
    
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






class TicketDetailView(APIView):
    """
    Handles retrieving and updating individual tickets.
    - Admin (superuser) can view and update all tickets.
    - Customer_Manager, Sales_Manager can view all tickets and update the `status` and `assigned_to`.
    - Ticket_Manager can view tickets assigned to them and update only the `status`.
    - Customers can view only their own tickets and cannot update them.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return None

    def get(self, request, pk):
        ticket = self.get_object(pk)
        if not ticket:
            # Translate error message
            error_message = translate_dict(
                {"error": "Ticket not found."},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response(error_message, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        assign_role = self.get_assigned_roles(user)
        # Superuser (admin) can view all tickets
        if user.is_superuser or user.role == 'admin' or 'admin' in assign_role:
            pass
        # Admin, Customer_Manager and Sales_Manager can view all tickets
        elif user.role in ['admin', 'customer_manager', 'sales_manager'] or 'admin' in assign_role or 'customer_manager' in assign_role or 'sales_manager' in assign_role:
            pass
        # Ticket_Manager can view tickets assigned to them
        elif (user.role == 'ticket_manager' or 'ticket_manager' in assign_role) and ticket.assigned_to != user:
            error_message = translate_dict(
                {"error": "You do not have permission to view this ticket."},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response(error_message, status=status.HTTP_403_FORBIDDEN)
        # Customers can view only their own tickets
        elif (user.role == 'user' or 'user' in assign_role) and ticket.creator != user:
            error_message = translate_dict(
                {"error": "You do not have permission to view this ticket."},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response(error_message, status=status.HTTP_403_FORBIDDEN)

        serializer = TicketSerializer(ticket)

        # Translate the serialized data
        translated_data = translate_dict(
            serializer.data,
            source_language = request.query_params.get('source_language', 'en'),  # Default to English
            target_language = request.query_params.get('target_language', 'en') 
        )
        return Response(translated_data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        ticket = self.get_object(pk)
        if not ticket:
            error_message = translate_dict(
                {"error": "Ticket not found."},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response(error_message, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        assign_role = self.get_assigned_roles(user)
        previous_status = ticket.status
        previous_assigned_to = ticket.assigned_to

        # Superuser (admin) can update any ticket
        if user.is_superuser or user.role == 'admin' or 'admin' in assign_role:
            allowed_fields = ['customer_company','title',
            'customer_name',
            'customer_phone',
            'customer_email',
            'description',         'street',
            'zip_code',
            'city',
            'customer_number','category','department','priority','status', 'assigned_to', 'comments', 'attachments']  # Superuser can update these fields
        
        # Customers cannot update tickets
        elif user.role == 'user' or 'user' in assign_role:
            error_message = translate_dict(
                {"error": "You do not have permission to update this ticket."},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response(error_message, status=status.HTTP_403_FORBIDDEN)
        
        # Ticket_Manager can update only the `status`
        # Q(assigned_to=user) | Q(creator=user)
        elif (user.role == 'ticket_manager' or 'ticket_manager' in assign_role) and Q(ticket.assigned_to == user) | Q(creator =user):
        # elif (user.role == 'ticket_manager' or 'ticket_manager' in assign_role) and ticket.assigned_to == user:
            allowed_fields = ['status', 'comments', 'attachments']

        elif user.role == 'sales_manager' or 'sales_manager' in assign_role:
            allowed_fields = ['customer_company',
            'customer_name','title',
            'customer_phone',
            'customer_email',
            'description','category',         'street',
            'zip_code',
            'city',
            'customer_number','department','priority','status', 'assigned_to', 'comments', 'attachments']
        
        # Customer_Manager and Sales_Manager can update `status` and `assigned_to`
        elif user.role in ['customer_manager', 'sales_manager'] or 'customer_manager' in assign_role or 'sales_manager' in assign_role:
            allowed_fields = ['status', 'assigned_to', 'comments', 'attachments']
        
        else:
            error_message = translate_dict(
                {"error": "You do not have permission to update this ticket."},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response(error_message, status=status.HTTP_403_FORBIDDEN)

        # Only update the allowed fields
        data = {key: request.data[key] for key in allowed_fields if key in request.data}
        serializer = TicketSerializer(ticket, data=data, partial=True, context={'request': request})


        if 'attachments' in request.FILES:
            attachments = request.FILES.getlist('attachments')

            for attachment in attachments:
                if attachment.content_type.startswith('image/'):
                    # If the file is an image, save it to the image field
                    Attachment.objects.create(ticket=ticket, image=attachment)
                else:
                    # Otherwise, save it to the document field (e.g., PDF, Word, etc.)
                    Attachment.objects.create(ticket=ticket, document=attachment)

        if serializer.is_valid():
            serializer.save()

            # Log status changes
            # if 'status' in data and data['status'] != previous_status:
            #     ticket.add_activity_log(
            #         action="Status Updated",
            #         changed_by=user,  # Pass `user` explicitly
            #         previous_value=previous_status,
            #         updated_value=data['status'],
            #     )
                # ticket.activity_log.sort(key=lambda x: parse_datetime(x["timestamp"]), reverse=True)
            # logs_added = True

            # Log assignment changes
            if 'assigned_to' in data and data['assigned_to'] != (previous_assigned_to.id if previous_assigned_to else None):
                new_assignee = User.objects.get(id=data['assigned_to']) if 'assigned_to' in data else None
                ticket.add_activity_log(
                    action="Assigned to ticket manager",
                    changed_by=user,  # Pass `user` explicitly
                    previous_value=previous_assigned_to.email if previous_assigned_to else None,
                    updated_value=new_assignee.email if new_assignee else None,
                )

            return Response(serializer.data, status=status.HTTP_200_OK)

        # Translate the serializer error messages
        translated_errors = translate_dict(
            serializer.errors,
            source_language = request.query_params.get('source_language', 'en'),  # Default to English
            target_language = request.query_params.get('target_language', 'en') 
        )
        return Response(translated_errors, status=status.HTTP_400_BAD_REQUEST)
    

    def delete(self, request, pk):
            """
            Handles ticket deletion.
            Only superusers, admins, sales managers, or customer managers can delete a ticket.
            """
            ticket = self.get_object(pk)
            if not ticket:
                return Response(
                    {"error": translate_text("Ticket not found.", target_language=request.query_params.get('target_language', 'en'))},
                    status=status.HTTP_404_NOT_FOUND
                )

            user = request.user
            assign_role = self.get_assigned_roles(user)
            if user.is_superuser or user.role in ['admin', 'customer_manager', 'sales_manager', 'ticket_manager'] or any(role in assign_role for role in ['admin', 'customer_manager', 'sales_manager', 'ticket_manager']):
                ticket.delete()
                return Response(
                    {"message": translate_text(f"Ticket ID {pk} deleted successfully.", target_language=request.query_params.get('target_language', 'en'))},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": translate_text("You do not have permission to delete this ticket.", target_language=request.query_params.get('target_language', 'en'))},
                    status=status.HTTP_403_FORBIDDEN
                )
            
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

class RelatedTicketsView(APIView): 
    """
    View to show related tickets for a specific ticket.
    - Admin, Customer_Manager, Sales_Manager, and Ticket_Manager can view the related tickets.
    - Customers can view related tickets only for tickets they have created.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return None

    def get(self, request, pk):
        ticket = self.get_object(pk)
        if not ticket:
            # Translate error message
            error_message = translate_dict(
                {"error": "Ticket not found."},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response(error_message, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        assign_role = self.get_assigned_roles(user)
        # Admin, Customer_Manager, Sales_Manager, and Ticket_Manager can view related tickets
        if user.is_superuser or user.role in ['admin', 'customer_manager', 'sales_manager'] or any(role in assign_role for role in ['admin', 'customer_manager', 'sales_manager']):
            related_tickets = ticket.related_tickets.all()
        elif (user.role == 'user' or 'user' in assign_role) and ticket.creator == user:
            related_tickets = ticket.related_tickets.all()
        else:
            # Translate error message for permission denial
            error_message = translate_dict(
                {"error": "You do not have permission to view related tickets for this ticket."},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response(error_message, status=status.HTTP_403_FORBIDDEN)

        # Serialize the related tickets
        serializer = TicketSerializer(related_tickets, many=True)
        
        # Translate the serialized data
        translated_data = translate_dict(
            serializer.data,
            source_language = request.query_params.get('source_language', 'en'),  # Default to English
            target_language = request.query_params.get('target_language', 'en') 
        )
        return Response(translated_data, status=status.HTTP_200_OK)
    
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


class TicketsByDepartmentView(APIView):
    """
    API to filter tickets based on the department and user permissions.
    - Admin, Customer_Manager, and Sales_Manager can see all tickets.
    - Ticket_Manager can see tickets assigned to them.
    - Users can only see tickets they created.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        department = request.data.get('department', None)
        if not department:
            # Translate error message
            error_message = translate_dict(
                {"error": "Department field is required in the request body."},
                source_language = request.query_params.get('source_language', 'en'),  # Default to English
                target_language = request.query_params.get('target_language', 'en') 
            )
            return Response(error_message, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        assign_role = self.get_assigned_roles(user)
        tickets = Ticket.objects.none()  # Initialize empty queryset

        # Admin, Customer_Manager, and Sales_Manager can view all tickets
        if user.is_superuser or user.role in ['admin', 'customer_manager', 'sales_manager'] or any(role in assign_role for role in ['admin', 'customer_manager', 'sales_manager']):
            tickets = Ticket.objects.filter(department=department).order_by('-last_updated')

        # Ticket_Manager can view tickets assigned to them
        elif user.role == 'ticket_manager' or 'ticket_manager' in assign_role:
            tickets = Ticket.objects.filter(department=department, assigned_to=user).order_by('-last_updated')

        # Users can view tickets they created
        elif user.role == 'user' or 'user' in assign_role:
            tickets = Ticket.objects.filter(department=department, creator=user).order_by('-last_updated')

        # Serialize and return the filtered tickets
        serializer = TicketSerializer(tickets, many=True)

        # Translate the serialized data
        translated_data = translate_dict(
            serializer.data,
            source_language = request.query_params.get('source_language', 'en'),  # Default to English
            target_language = request.query_params.get('target_language', 'en') 
        )
        return Response(translated_data, status=status.HTTP_200_OK)
    
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


class TicketCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return None

    def post(self, request, pk):
        ticket = self.get_object(pk)
        if not ticket:
            error_message = translate_dict(
                {"error": "Ticket not found."},
                source_language=request.query_params.get('source_language', 'en'),
                target_language=request.query_params.get('target_language', 'en')
            )
            return Response(error_message, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        # ✅ Authorization Check: Only assigned users can comment
        if ticket.assigned_to != user:
            error_message = translate_dict(
                {"error": "You are not assigned to this ticket."},
                source_language=request.query_params.get('source_language', 'en'),
                target_language=request.query_params.get('target_language', 'en')
            )
            return Response(error_message, status=status.HTTP_403_FORBIDDEN)

        # Validate the input data for comment
        comment_data = request.data.get('comment')
        if not comment_data or 'name' not in comment_data or 'comment' not in comment_data:
            error_message = translate_dict(
                {"error": "Both 'name' and 'comment' fields are required."},
                source_language=request.query_params.get('source_language', 'en'),
                target_language=request.query_params.get('target_language', 'en')
            )
            return Response(error_message, status=status.HTTP_400_BAD_REQUEST)

        # Add the comment to the ticket
        ticket.add_comment(comment_data['name'], comment_data['comment'])  # Assuming add_comment method exists

        # Log the activity
        ticket.add_activity_log(
            action="Comment Added",
            changed_by=user,
            updated_value=f"Comment added by {comment_data['name']}: {comment_data['comment']}",
        )

        # Serialize and translate the updated ticket
        serializer = TicketSerializer(ticket)
        translated_data = translate_dict(
            serializer.data,
            source_language=request.query_params.get('source_language', 'en'),
            target_language=request.query_params.get('target_language', 'en')
        )
        return Response(translated_data, status=status.HTTP_201_CREATED)

    def get_assigned_roles(self, user):
        # (You may not need this method here anymore, unless you plan to extend permission logic)
        roles = [
            user.role,
            user.role2,
            user.role3,
            user.role4,
            user.role5
        ]
        return [role for role in roles if role]










