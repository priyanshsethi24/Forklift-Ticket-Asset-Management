from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault('role', 'user')  # Default role
        user = self.model(email=email, first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')  # Assign 'admin' role

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, first_name, last_name, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('customer_manager', 'Customer Manager'),
        ('ticket_manager', 'Ticket Manager'),
        ('sales_manager', 'Sales Manager'),
        ('user', 'User'),
        ('third_party', 'Third Party'),
        ('anonymous', 'Anonymous'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    username = None  
    first_name = models.CharField(max_length=100, blank=True)  
    last_name = models.CharField(max_length=100, blank=True) 
    organization_name = models.CharField(max_length=225, blank=True) 

    # 🔴 Add back missing role fields if required:
    role2 = models.CharField(max_length=20, choices=ROLE_CHOICES, default='')
    role3 = models.CharField(max_length=20, choices=ROLE_CHOICES, default='')
    role4 = models.CharField(max_length=20, choices=ROLE_CHOICES, default='')
    role5 = models.CharField(max_length=20, choices=ROLE_CHOICES, default='')

    # role2 = models.CharField(max_length=50, blank=True, null=True)
    # role3 = models.CharField(max_length=50, blank=True, null=True)
    # role4 = models.CharField(max_length=50, blank=True, null=True)
    # role5 = models.CharField(max_length=50, blank=True, null=True)
    # Add third_party_role field
    
    # third_party_role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='third_party')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"

# ✅ Add Ticket Model
class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('closed', 'Closed'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tickets')
    created_at = models.DateTimeField(auto_now_add=True)

    # Fix related_tickets to be non-symmetrical (This eliminates the warning)
    related_tickets = models.ManyToManyField("self", blank=True, symmetrical=False)

    def __str__(self):
        return f"{self.title} - {self.status}"
