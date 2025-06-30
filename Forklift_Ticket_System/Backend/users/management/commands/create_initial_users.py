from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Create initial users with specified credentials'

    def handle(self, *args, **options):
        User = get_user_model()

        # Initial user credentials
        credentials = [
        {'first_name': 'Admin', 'last_name': '', 'email': 'admin@oodles.io', 'password': 'Admin@123', 'role': 'admin'},
        {'first_name': 'Customer', 'last_name': 'Manager', 'email': 'customer.manager@oodles.io', 'password': 'Admin@123', 'role': 'customer_manager'},
        {'first_name': 'Sales', 'last_name': 'Manager', 'email': 'sales.manager@oodles.io', 'password': 'Admin@123', 'role': 'sales_manager'},
        {'first_name': 'Martin', 'last_name': '', 'email': 'mk@smartxelements.de', 'password': 'Admin@123', 'role': 'ticket_manager'},
        {'first_name': 'Ticket', 'last_name': 'Manager', 'email': 'ticket.manager@oodles.io', 'password': 'Admin@123', 'role': 'ticket_manager'},
        {'first_name': 'User', 'last_name': '', 'email': 'user@oodles.io', 'password': 'Admin@123', 'role': 'user'},
    ]


        for credential in credentials:
            # Check if user with the given email already exists
            if not User.objects.filter(email=credential['email']).exists():
                # Create the user with first name, last name, and other provided fields
                user = User.objects.create_user(
                    email=credential['email'],
                    first_name=credential['first_name'],
                    last_name=credential['last_name'],
                    password=credential['password'],
                    role=credential['role']
                )
                print(f"User created: {user.email}")