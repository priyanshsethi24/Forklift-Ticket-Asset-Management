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


# Custom User Model with Role Field
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('customer_manager', 'Customer Manager'),
        ('ticket_manager', 'Ticket Manager'),
        ('sales_manager', 'Sales Manager'),
        ('asset_manager', 'Asset Manager'),
        ('warehouse_manager', 'Warehouse Manager'),
        ('finance_manager', 'Finance Manager'),
        ('user', 'User'),
    ]

    email = models.EmailField(unique=True)
    # password = models.CharField(max_length=225)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    role2 = models.CharField(max_length=20, choices=ROLE_CHOICES, default='')
    role3 = models.CharField(max_length=20, choices=ROLE_CHOICES, default='')
    role4 = models.CharField(max_length=20, choices=ROLE_CHOICES, default='')
    role5 = models.CharField(max_length=20, choices=ROLE_CHOICES, default='')
    

    username = None  
    first_name = models.CharField(max_length=100, blank=True)  
    last_name = models.CharField(max_length=100, blank=True) 
    organization_name = models.CharField(max_length=225, blank=True) 



    USERNAME_FIELD = 'email'
    NAME_FIELD = 'name'
    REQUIRED_FIELDS = ['first_name', 'last_name']  

    objects = UserManager() 

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"