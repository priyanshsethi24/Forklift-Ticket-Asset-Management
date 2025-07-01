from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Create initial users with specified credentials'

    def handle(self, *args, **options):
        User = get_user_model()

        credentials = [
            {'email': 'mk@smartxelements.de', 'first_name': 'Martin', 'last_name': '', 'password': 'Admin@123', 'role': 'asset_manager'},
            {'email': 'asset.manager@oodles.io', 'first_name': 'Asset', 'last_name': 'Manager', 'password': 'Admin@123', 'role': 'asset_manager'},
            {'email': 'customer.manager@oodles.io', 'first_name': 'Customer', 'last_name': 'Manager', 'password': 'Admin@123', 'role': 'customer_manager'},
            {'email': 'finance.manager@oodles.io', 'first_name': 'Finance', 'last_name': 'Manager', 'password': 'Admin@123', 'role': 'finance_manager'},
            {'email': 'warehouse.manager@oodles.io', 'first_name': 'Warehouse', 'last_name': 'Manager', 'password': 'Admin@123', 'role': 'warehouse_manager'},
        ]


        for credential in credentials:
            if not User.objects.filter(email=credential['email']).exists():
                user = User.objects.create_user(
                    email=credential['email'],
                    password=credential['password'],
                    role=credential['role'],
                    first_name=credential['first_name'],  
                    last_name=credential['last_name'],    
                )
                print(f"User created: {user.email}")