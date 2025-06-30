from rest_framework import serializers
from .models import User, Ticket, Attachment
from django.conf import settings
# updated serializer 
class AttachmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Attachment model to handle images and documents.
    """
    image = serializers.SerializerMethodField()
    document = serializers.SerializerMethodField()
    
    class Meta:
        model = Attachment
        fields = ['id', 'image', 'document', 'uploaded_at']

    def get_image(self, obj):
        if obj.image:
            return f"{settings.BASE_URL}{obj.image.url}"
        return None

    def get_document(self, obj):
        if obj.document:
            return f"{settings.BASE_URL}{obj.document.url}"
        return None

# class AttachmentSerializer(serializers.ModelSerializer):
#     """
#     Serializer for Attachment model to handle images and documents using BASE_URL or request.
#     """
#     image = serializers.SerializerMethodField()
#     document = serializers.SerializerMethodField()

#     class Meta:
#         model = Attachment
#         fields = ['id', 'image', 'document', 'uploaded_at']

#     def get_image(self, obj):
#         request = self.context.get('request')
#         base_url = getattr(settings, 'BASE_URL', None)

#         if obj.image:
#             if base_url:
#                 return f"{base_url.rstrip('/')}{obj.image.url}"
#             elif request:
#                 return request.build_absolute_uri(obj.image.url)
#         return None

#     def get_document(self, obj):
#         request = self.context.get('request')
#         base_url = getattr(settings, 'BASE_URL', None)

#         if obj.document:
#             if base_url:
#                 return f"{base_url.rstrip('/')}{obj.document.url}"
#             elif request:
#                 return request.build_absolute_uri(obj.document.url)
#         return None

class TicketSerializer(serializers.ModelSerializer):
    """
    Serializer for Ticket model with support for related tickets and attachments.
    """
    creator = serializers.StringRelatedField(read_only=True)  # Display creator's name
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='ticket_manager'), required=False, allow_null=True)
    related_tickets = serializers.PrimaryKeyRelatedField(many=True, queryset=Ticket.objects.all(), required=False)
    attachments = AttachmentSerializer(many=True, read_only=True)  # Read-only field for existing attachments
    new_attachments = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )  # Field for adding new attachments

    comments = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField(max_length=255)),
        required=False,
        write_only=False  
    )

    status_display = serializers.SerializerMethodField()
    department_display = serializers.SerializerMethodField()
    last_updated_by = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'ticket_id',
            'title',
            'customer_company',
            'customer_name',
            'customer_phone',
            'customer_email',
            'description',
            'status',
            'status_display',
            'priority',
            'category',
            'creation_date',
            'creator',
            'assigned_to',
            'last_updated',
            'last_updated_by',
            'deadline',
            'internal_notes',
            'activity_log',
            'related_tickets',
            'solution',
            'feedback',
            'department',
            'department_display',
            'attachments',
            'new_attachments',
            'comments',
            'street',
            'zip_code',
            'city',
            'customer_number'
        ]



        read_only_fields = [
            'ticket_id',
            'creation_date',
            'last_updated',
            'creator',
            'activity_log',
            'comments'
        ]
    def get_last_updated_by(self, obj):
        if obj.last_updated_by:
            return f"{obj.last_updated_by.first_name} {obj.last_updated_by.last_name} ({obj.last_updated_by.role})"
        return None
    
    def get_status_display(self, obj):
        return dict(Ticket.STATUS_CHOICES).get(obj.status, obj.status)

    def get_department_display(self, obj):
        return dict(Ticket.DEPARTMENT_CHOICES).get(obj.department, obj.department)

    def validate(self, attrs):
        """
        Ensure that only users with appropriate roles can perform specific actions.
        """
        request = self.context.get('request')
        user = request.user
        assign_role = self.get_assigned_roles(user)
        if request and (request.user.role == 'user' or 'user' in assign_role) and 'assigned_to' in attrs:
            raise serializers.ValidationError("Customers cannot assign tickets.")
        
        return attrs

    def create(self, validated_data):
        """
        Add logic to link related tickets during the creation of a ticket.
        """
        related_tickets_data = validated_data.pop('related_tickets', [])
        new_attachments = validated_data.pop('new_attachments', [])
        comments_data = validated_data.pop('comments', [])

        # Ensure related_tickets_data contains integers
        related_ticket_ids = [
            ticket.ticket_id if isinstance(ticket, Ticket) else int(ticket)

            for ticket in related_tickets_data
        ]

        # Create the main ticket
        ticket = super().create(validated_data)

        # Link the related tickets
        for ticket_id in related_ticket_ids:
            try:
                related_ticket = Ticket.objects.get(ticket_id=ticket_id)
                ticket.related_tickets.add(related_ticket)
            except Ticket.DoesNotExist:
                raise serializers.ValidationError({
                    "related_tickets": f"Ticket with ID {ticket_id} not found."
                })

        # Handle attachments
        for attachment in new_attachments:
            Attachment.objects.create(ticket=ticket, document=attachment)

        if comments_data:
            for comment in comments_data:
                comment_attachments = comment.get("comment_attachments", [])
                ticket.add_comment(comment['name'], comment['comment'], comment_attachments)

        return ticket
    

    def get_last_updated_by(self, obj):
        if obj.last_updated_by:
            return f"{obj.last_updated_by.first_name} {obj.last_updated_by.last_name} ({obj.last_updated_by.role})"
        return None

    def update(self, instance, validated_data):
        """
        Handle updates to tickets, including adding new attachments.
        """
        request = self.context.get('request')
        if request:
            user = request.user
            user_role = user.role
            allowed_fields = []
            assign_role = self.get_assigned_roles(user)

            # Role-based field access
            if user.is_superuser or user.role == 'admin' or 'admin' in assign_role:
                allowed_fields = validated_data.keys()
            elif user_role in ['admin', 'customer_manager', 'sales_manager'] or any(role in assign_role for role in ['admin', 'customer_manager', 'sales_manager']):
                allowed_fields = ['customer_company','title',
            'customer_name',
            'customer_phone',
            'customer_email',
            'description',         'street',
            'zip_code',
            'city',
            'customer_number','category','department','priority','assigned_to', 'status', 'comments']
            elif user_role == 'ticket_manager' or 'ticket_manager' in assign_role:
                allowed_fields = ['status', 'comments']
            elif user_role == 'user' or 'user' in assign_role:
                raise serializers.ValidationError("You are not allowed to update this ticket.")

            validated_data = {key: validated_data[key] for key in allowed_fields if key in validated_data}

            # Handle new attachments
            new_attachments = validated_data.pop('new_attachments', [])
            for attachment in new_attachments:
                Attachment.objects.create(ticket=instance, document=attachment)

            comments_data = validated_data.pop('comments', [])
            if comments_data:
                for comment in comments_data:
                    comment_attachments = comment.get("comment_attachments", [])
                    instance.add_comment(comment['name'],assign_role, comment['comment'], comment_attachments)
            # Sort comments after adding all
                if hasattr(instance, 'comments') and isinstance(instance.comments, list):
                    instance.comments = sorted(instance.comments, key=lambda x: x.get("timestamp", ""), reverse=True)
                    instance.save()

            # Log activity
            for field, value in validated_data.items():
                previous_value = getattr(instance, field, None)
                if previous_value != value:
                    instance.add_activity_log(
                        action=f"{field.capitalize()} Updated",
                        changed_by=user,
                        previous_value=previous_value,
                        updated_value=value,
                    )
                    # ticket.activity_log.sort(key=lambda x: parse_datetime(x["timestamp"]), reverse=True)
                if hasattr(instance, 'activity_log') and isinstance(instance.activity_log, list):
                    from django.utils.dateparse import parse_datetime
                    instance.activity_log = sorted(instance.activity_log, key=lambda x: parse_datetime(x.get("timestamp", "")), reverse=True)
                    instance.save()

                for attr, value in validated_data.items():
                        setattr(instance, attr, value)

                        # Set the user who updated the ticket
                        request = self.context.get('request')
                        if request and request.user.is_authenticated:
                            instance.last_updated_by = request.user

        return super().update(instance, validated_data)
    
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