from django.db import models
from users.models import User
import datetime
from django.utils import timezone
import pytz
from django.conf import settings

# Attachment Model
class Attachment(models.Model):
    ticket = models.ForeignKey('Ticket', on_delete=models.CASCADE, related_name='attachments')
    image = models.ImageField(upload_to='ticket_images/', null=True, blank=True)
    document = models.FileField(upload_to='ticket_documents/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.image:
            return f"Image for Ticket {self.ticket.ticket_id}"
        elif self.document:
            return f"Document for Ticket {self.ticket.ticket_id}"
        return f"Attachment for Ticket {self.ticket.ticket_id}"

# Ticket Model
class Ticket(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('waiting_customer', 'Waiting for Customer'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
        ('rejected', 'Rejected'),
        ('reopened', 'Reopened'),
        ('escalated', 'Escalated'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('middle', 'Middle'),
        ('high', 'High'),
    ]

    DEPARTMENT_CHOICES = [
        ('sales', 'Sales'),
        ('sales_ue', 'Sales UE'),
        ('sales_sth', 'Sales STH'),
        ('service', 'Service'),
    ]

    ticket_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    customer_company = models.CharField(max_length=255)
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=20)
    customer_email = models.EmailField(max_length=255 , null=True, blank=True)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
    category = models.CharField(max_length=100, null=True, blank=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ticket_system_created_tickets")
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, related_name='assigned_tickets', null=True, blank=True,
        limit_choices_to={'role': ['ticket_manager']}
    )
    last_updated = models.DateTimeField(auto_now=True)
    last_updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_tickets'
    )
    deadline = models.DateField(null=True, blank=True)
    internal_notes = models.TextField(null=True, blank=True)
    activity_log = models.JSONField(default=list, blank=True)
    related_tickets = models.ManyToManyField('self', blank=True, related_name='related_tickets')
    solution = models.TextField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, default='service')
    comments = models.JSONField(default=list, blank=True)

    street = models.CharField(max_length=255, null=True, blank=True)
    zip_code = models.CharField(max_length=20, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    customer_number = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"Ticket {self.ticket_id}: {self.title} (Status: {self.status})"

    def add_activity_log(self, action, changed_by, previous_value=None, updated_value=None):
        self.activity_log.append({
            "action": action,
            "timestamp": timezone.now().astimezone(pytz.timezone('Europe/Berlin')).isoformat(),
            "changed_by": f"{changed_by.first_name} {changed_by.last_name}",
            "previous_value": str(previous_value) if previous_value else None,
            "updated_value": str(updated_value) if updated_value else None, 
        })
        self.save()

    def can_be_viewed_by(self, user):
        if user.is_superuser:
            return True
        if user.role in ['admin', 'customer_manager', 'sales_manager']:
            return True
        if user.role == 'ticket_manager' and self.assigned_to == user:
            return True
        if self.creator == user:
            return True
        return False

    def can_be_updated_by(self, user):
        if user.is_superuser:
            return True
        if user.role in ['admin', 'customer_manager', 'sales_manager']:
            return True
        if user.role == 'ticket_manager' and self.assigned_to == user:
            return True
        return False

    def add_comment(self, username, user_role, comment_text, comment_attachments=None):
        """
        Add a new comment to the ticket with the user's name and the comment text.
        """
        if comment_attachments is None:
            comment_attachments = []

        new_comment = {
            "name": username,
            "user_role": user_role or [],
            "comment": comment_text,
            "comment_attachments": comment_attachments or [],
            "timestamp": timezone.now().astimezone(pytz.timezone('Europe/Berlin')).isoformat(),  # Convert to Berlin Time
        }
        self.comments.append(new_comment)
        self.save()


# ThirdPartyRole Model (remains unchanged)
class ThirdPartyRole(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role_name = models.CharField(max_length=255, default="Third Party")

    def __str__(self):
        return f"{self.user.email} - {self.role_name}"

# from django.db import models
# from users.models import User
# from django.utils import timezone
# import pytz

# # Timezone and date format
# BERLIN_TZ = pytz.timezone('Europe/Berlin')
# DATE_FORMAT = "%d-%m-%Y %H:%M:%S"

# # Attachment Model
# class Attachment(models.Model):
#     ticket = models.ForeignKey('Ticket', on_delete=models.CASCADE, related_name='attachments')
#     image = models.ImageField(upload_to='ticket_images/', null=True, blank=True)
#     document = models.FileField(upload_to='ticket_documents/', null=True, blank=True)
#     uploaded_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         if self.image:
#             return f"Image for Ticket {self.ticket.ticket_id}"
#         elif self.document:
#             return f"Document for Ticket {self.ticket.ticket_id}"
#         return f"Attachment for Ticket {self.ticket.ticket_id}"

#     def uploaded_at_berlin(self):
#         return self.uploaded_at.astimezone(BERLIN_TZ).strftime(DATE_FORMAT)

# # Ticket Model
# class Ticket(models.Model):
#     STATUS_CHOICES = [
#         ('new', 'New'),
#         ('in_progress', 'In Progress'),
#         ('waiting_customer', 'Waiting for Customer'),
#         ('resolved', 'Resolved'),
#         ('closed', 'Closed'),
#         ('rejected', 'Rejected'),
#         ('reopened', 'Reopened'),
#         ('escalated', 'Escalated'),
#     ]

#     PRIORITY_CHOICES = [
#         ('low', 'Low'),
#         ('middle', 'Middle'),
#         ('high', 'High'),
#     ]

#     DEPARTMENT_CHOICES = [
#         ('sales', 'Sales'),
#         ('sales_ue', 'Sales UE'),
#         ('sales_sth', 'Sales STH'),
#         ('service', 'Service'),
#     ]

#     ticket_id = models.AutoField(primary_key=True)
#     title = models.CharField(max_length=255)
#     customer_company = models.CharField(max_length=255)
#     customer_name = models.CharField(max_length=255)
#     customer_phone = models.CharField(max_length=20)
#     customer_email = models.EmailField()
#     description = models.TextField()
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
#     priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
#     category = models.CharField(max_length=100, null=True, blank=True)
#     creation_date = models.DateTimeField(auto_now_add=True)
#     creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ticket_system_created_tickets")
#     assigned_to = models.ForeignKey(
#         User, on_delete=models.SET_NULL, related_name='assigned_tickets', null=True, blank=True,
#         limit_choices_to={'role': ['ticket_manager']}
#     )
#     last_updated = models.DateTimeField(auto_now=True)
#     deadline = models.DateField(null=True, blank=True)
#     internal_notes = models.TextField(null=True, blank=True)
#     activity_log = models.JSONField(default=list, blank=True)
#     related_tickets = models.ManyToManyField('self', blank=True, related_name='related_tickets')
#     solution = models.TextField(null=True, blank=True)
#     feedback = models.TextField(null=True, blank=True)
#     department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, default='service')
#     comments = models.JSONField(default=list, blank=True)

#     def __str__(self):
#         return f"Ticket {self.ticket_id}: {self.title} (Status: {self.status})"

#     def creation_date_berlin(self):
#         return self.creation_date.astimezone(BERLIN_TZ).strftime(DATE_FORMAT)

#     def last_updated_berlin(self):
#         return self.last_updated.astimezone(BERLIN_TZ).strftime(DATE_FORMAT)

#     def add_activity_log(self, action, changed_by, previous_value=None, updated_value=None):
#         self.activity_log.append({
#             "action": action,
#             "timestamp": timezone.now().astimezone(BERLIN_TZ).strftime(DATE_FORMAT),
#             "changed_by": changed_by.email if changed_by else "System",
#             "previous_value": str(previous_value) if previous_value else None,
#             "updated_value": str(updated_value) if updated_value else None,
#         })
#         self.save()

#     def can_be_viewed_by(self, user):
#         if user.is_superuser:
#             return True
#         if user.role in ['admin', 'customer_manager', 'sales_manager']:
#             return True
#         if user.role == 'ticket_manager' and self.assigned_to == user:
#             return True
#         if self.creator == user:
#             return True
#         return False

#     def can_be_updated_by(self, user):
#         if user.is_superuser:
#             return True
#         if user.role in ['admin', 'customer_manager', 'sales_manager']:
#             return True
#         if user.role == 'ticket_manager' and self.assigned_to == user:
#             return True
#         return False

#     def add_comment(self, username, user_role, comment_text, comment_attachments=None):
#         if comment_attachments is None:
#             comment_attachments = []

#         new_comment = {
#             "name": username,
#             "user_role": user_role or [],
#             "comment": comment_text,
#             "comment_attachments": comment_attachments,
#             "timestamp": timezone.now().astimezone(BERLIN_TZ).strftime(DATE_FORMAT),
#         }
#         self.comments.append(new_comment)
#         self.save()

# # ThirdPartyRole Model
# class ThirdPartyRole(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     role_name = models.CharField(max_length=255, default="Third Party")

#     def __str__(self):
#         return f"{self.user.email} - {self.role_name}"

