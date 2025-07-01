from django.db import models
from users.models import User
from django.db.models import Sum
from datetime import timedelta
from django.utils import timezone
import random
import string
import uuid

class Warehouse(models.Model):
    name = models.CharField(max_length=100, unique=True)
    capacity = models.IntegerField()
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_warehouses'
    )

    def __str__(self):
        return self.name


class Customer(models.Model):
    name = models.CharField(max_length=100)
    contact_information = models.TextField()
    transaction_history = models.TextField(null=True, blank=True)
    customer_manager = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='managed_customers'
    )

    def __str__(self):
        return self.name

    
def generate_unique_machine_id():
    """Generate a random 7-digit alphanumeric ID."""
    return ''.join(random.choices(string.digits, k=7))

class Asset(models.Model):
    # Basic Information
    asset_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    platform = models.TextField(null=True, blank=True)
    visible = models.CharField(
        max_length=50,
        choices=[
        ("dealer_search", "Dealer Search"),
        ("customer_search", "Customer Search"),
        ("rental_device", "Rental Device"),
        ("homepage", "Homepage"),
        ("manufacturer_page", "Manufacturer Page"),
    ],
        null=True, blank=True
    )
    insert_date = models.DateField(auto_now_add=True, null=True, blank=True)
    manufacturer = models.CharField(max_length=100, null=True, blank=True)
    type = models.CharField(max_length=100, null=True, blank=True)
    year_of_manufacture = models.CharField(max_length=7, null=True, blank=True)
    operating_hours = models.IntegerField(null=True, blank=True)
    serial_no = models.CharField(max_length=50, null=True, blank=True)
    capacity = models.IntegerField(null=True, blank=True)

    mast_type = models.CharField(
        max_length=50,
        choices=[
            ("None", "None"), ("Standard", "Standard"), ("Duplex", "Duplex"),
            ("Triplex", "Triplex"), ("Quattro", "Quattro"), ("Telescopic", "Telescopic")
        ],
        null=True, blank=True
    )
    
    lift_height = models.IntegerField(null=True, blank=True)
    
    status = models.CharField(
        max_length=50,
        choices=[("Demo", "Demo"), ("Rental", "Rental"), ("New", "New"), ("Used", "Used")],
        null=True, blank=True
    )
    
    classification = models.CharField(
        max_length=50,
        choices=[
        ("trailer", "Trailer"),
        ("tractor", "Tractor"),
        ("manual_pallet_truck", "Manual Pallet Truck"),
        ("high_lift_truck", "High Lift Truck"),
        ("gasoline_forklift", "Gasoline Forklift"),
        ("diesel_forklift", "Diesel Forklift"),
        ("electric_3_wheel", "Electric 3-Wheel Forklift"),
        ("electric_4_wheel", "Electric 4-Wheel Forklift"),
        ("natural_gas_forklift", "Natural Gas Forklift"),
        ("reach_stacker", "Reach Stacker"),
        ("side_loader", "Side Loader"),
        ("other", "Other"),
        ("compact_forklift", "Compact Forklift"),
        ("low_lift_truck", "Low Lift Truck"),
        ("off_road_forklift", "Off-Road Forklift"),
        ("truck_mounted_forklift", "Truck-Mounted Forklift"),
        ("scissor_lift", "Scissor Lift"),
        ("telescopic_forklift", "Telescopic Forklift"),
        ("terminal_tractor", "Terminal Tractor"),
        ("lpg_forklift", "LPG Forklift"),
        ("container_handler", "Container Handler"),
        ("reach_truck", "Reach Truck"),
        ("narrow_aisle_truck", "Narrow Aisle Truck"),
        ("standup_forklift", "Stand-Up Forklift"),
        ("pallet_truck_with_scale", "Pallet Truck with Scale"),
        ("route_train_trailer", "Route Train Trailer"),
        ("four_way_side_loader", "Four-Way Side Loader"),
        ("electric_platform_cart", "Electric Platform Cart"),
        ("vertical_order_picker", "Vertical Order Picker"),
        ("four_way_reach_truck", "Four-Way Reach Truck"),
        ("horizontal_order_picker", "Horizontal Order Picker"),
        ("battery", "Battery"),
    ],
        null=True,
        blank=True
    )

    fem_class = models.IntegerField(null=True, blank=True)

    engine_type = models.CharField(
        max_length=50,
        choices=[
            ("Diesel", "Diesel"), ("Electric", "Electric"), ("LPG", "LPG"),
            ("Hand", "Hand"), ("Gasoline-Gas", "Gasoline-Gas"), ("Natural Gas", "Natural Gas")
        ],
        null=True, blank=True
    )

    condition = models.CharField(
        max_length=50,
        choices=[
            ("New", "New"), ("Like New", "Like New"), ("Very Good", "Very Good"),
            ("Good", "Good"), ("Normal", "Normal"), ("Poor", "Poor"), ("Very Poor", "Very Poor")
        ],
        null=True, blank=True
    )

    title = models.CharField(max_length=50, null=True, blank=True)
    description = models.CharField(max_length=250, null=True, blank=True)
    description_temp = models.TextField(null=True, blank=True)
    available = models.BooleanField(default=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    salesmen = models.CharField(max_length=100, null=True, blank=True)


    # Pricing
    currency = models.CharField(
    max_length=3, choices=[
        ("EUR", "Euro (€)"),
        ("USD", "US Dollar ($)"),
        ("GBP", "British Pound (£)"),
    ], null=True, blank=True
    )
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_netto = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    dealer_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    dealer_price_netto = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_description = models.CharField(max_length=100, null=True, blank=True)
    rental_price_per_day = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    rental_price_per_week = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    rental_price_per_month = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    rental_price_description = models.CharField(max_length=100, null=True, blank=True)

    # Technical Details
    technical_condition = models.CharField(
        max_length=20,
        choices=[
        ("new", "New"),
        ("like_new", "Like New"),
        ("very_good", "Very Good"),
        ("good", "Good"),
        ("normal", "Normal"),
        ("poor", "Poor"),
        ("very_poor", "Very Poor"),
    ],
        null=True,
        blank=True
    )
    optical_condition = models.CharField(max_length=50, null=True, blank=True)
    reconditioning_date = models.DateField(null=True, blank=True)
    offer_no_dealer = models.CharField(max_length=50, null=True, blank=True)
    offer_no_platform = models.CharField(max_length=50, null=True, blank=True)
    machine_length = models.IntegerField(null=True, blank=True)
    machine_width = models.IntegerField(null=True, blank=True)
    machine_height = models.IntegerField(null=True, blank=True)
    basket_load = models.IntegerField(null=True, blank=True)
    reach_horizontal = models.IntegerField(null=True, blank=True)
    machine_weight = models.IntegerField(null=True, blank=True)
    closed_height = models.IntegerField(null=True, blank=True)
    free_height = models.IntegerField(null=True, blank=True)
    fork_carriage = models.CharField(max_length=50, null=True, blank=True)
    fork_length = models.IntegerField(null=True, blank=True)
    forks = models.IntegerField(null=True, blank=True)
    load_centre = models.IntegerField(null=True, blank=True)

    # Tires
    tires_front = models.CharField(
        max_length=50,
        choices = [
            ("bandages", "Bandages"),
            ("pneumatic", "Pneumatic"),
            ("polyurethane", "Polyurethane"),
            ("solid_rubber", "Solid Rubber"),
            ("super_elastic", "Super Elastic"),
        ],
        null=True,
        blank=True
    )
    tires_front_size = models.CharField(max_length=50, null=True, blank=True)
    tires_rear = models.CharField(
        max_length=50,
        choices = [
            ("bandages", "Bandages"),
            ("pneumatic", "Pneumatic"),
            ("polyurethane", "Polyurethane"),
            ("solid_rubber", "Solid Rubber"),
            ("super_elastic", "Super Elastic"),
        ],
        null=True,
        blank=True
    )
    tires_rear_size = models.CharField(max_length=50, null=True, blank=True)
    battery = models.BooleanField(default=False)

    # Attachments & Additional Equipment
    additional_equipment = models.CharField(
        max_length=50,
        choices = [
        ("third_valve", "3rd Valve"),
        ("fourth_valve", "4th Valve"),
        ("worklight_rear", "Work Light Rear"),
        ("worklight_front", "Work Light Front"),
        ("roof_cover", "Roof Cover"),
        ("front_window", "Front Window"),
        ("half_cabin", "Half Cabin"),
        ("heating", "Heating"),
        ("load_guard", "Load Guard"),
        ("magnet_valve", "Magnet Valve"),
        ("oil_separator", "Oil Separator"),
        ("soot_filter", "Soot Filter"),
        ("stvzo_compliant", "STVZO Compliant"),
        ("full_cabin", "Full Cabin"),
        ("explosion_proof", "Explosion-Proof"),
        ("impulse_control", "Impulse Control"),
        ("initial_lift", "Initial Lift"),
        ("air_conditioning", "Air Conditioning"),
        ("full_free_lift", "Full Free Lift"),
        ("ce_certificate", "CE Certificate"),
    ],
        null=True, blank=True
    )

    working_height = models.IntegerField(null=True, blank=True)

    # Battery Details
    battery = models.BooleanField(default=False)

    battery_category = models.CharField(
        max_length=50,
        choices=[
            ("PzS", "PzS"), ("Gel", "Gel"), ("Lithium-Ion", "Lithium-Ion"),
            ("Starter", "Starter"), ("Waterless", "Waterless"), ("Lead Acid", "Lead Acid")
        ],
        null=True, blank=True
    )

    battery_voltage = models.IntegerField(null=True, blank=True)
    battery_capacity = models.IntegerField(null=True, blank=True)
    battery_case = models.CharField(max_length=50, null=True, blank=True)
    battery_charger = models.BooleanField(default=False)

    battery_charger_type = models.CharField(
        max_length=50,
        choices=[
            ("Single-phase", "Single-phase"), ("Three-phase", "Three-phase"),
            ("HF", "HF"), ("Integrated", "Integrated")
        ],
        null=True, blank=True
    )

    battery_additional_equipment = models.TextField(null=True, blank=True)

    financial_partner = models.CharField(max_length=150, null=True, blank=True)
    financial_contract_classification = models.CharField(max_length=100, null=True, blank=True)
    financial_contract = models.CharField(max_length=100, null=True, blank=True)
    financial_contract_no = models.CharField(max_length=100, null=True, blank=True)
    upload_financial_contract = models.FileField(upload_to='financial_documents/', null=True, blank=True)
    financial_contract_start = models.DateField(null=True, blank=True)
    financial_contract_end = models.DateField(null=True, blank=True)
    duration_in_months = models.IntegerField(null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    acquisition_date = models.DateField(null=True, blank=True)
    residual_value_end_of_contract = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    book_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    depreciation_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    acquisition_costs = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    depreciation_method = models.CharField(max_length=100, null=True, blank=True)
    next_depreciation = models.DateField(null=True, blank=True)
    cost_refurbishing = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    transportation_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Customer Information
    customer_name = models.CharField(max_length=150, null=True, blank=True)
    customer_no = models.CharField(max_length=50, null=True, blank=True)
    customer_contract = models.CharField(max_length=100, null=True, blank=True)
    upload_customer_contract = models.FileField(upload_to='contracts/', null=True, blank=True)
    end_of_contract = models.DateField(null=True, blank=True)
    contract_completed = models.BooleanField(default=False)

    dealer_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    dealer_name = models.CharField(max_length=150, null=True, blank=True)
    dealer_contact_information = models.TextField(null=True, blank=True)
    dealer_location = models.CharField(max_length=255, null=True, blank=True)
    dealer_status = models.CharField(max_length=100, null=True, blank=True)
    dealer_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dealer_price_netto = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    dealer_country = models.CharField(max_length=100, null=True, blank=True)
    dealer_city = models.CharField(max_length=100, null=True, blank=True)
    dealer_zip = models.CharField(max_length=20, null=True, blank=True)
    finance_partner = models.CharField(max_length=150, blank=True, null=True)
    dealer_contact_person = models.CharField(max_length=150, blank=True, null=True)
    dealer_address = models.TextField(blank=True, null=True)
    dealer_phone = models.CharField(max_length=20, blank=True, null=True)
    dealer_email = models.EmailField(blank=True, null=True)
    dealer_website = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.manufacturer} {self.type} ({self.year_of_manufacture})"  

class MaintenanceRecord(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
    ]

    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='maintenance_records')
    date = models.DateField()
    details = models.TextField()
    documents = models.FileField(upload_to='maintenance_documents/', null=True, blank=True)
    scheduled_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scheduled_maintenance')
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class FinancialRecord(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='financial_records')

    # Financing details
    financial_partner = models.CharField(max_length=150, null=True, blank=True)  
    financial_contract_classification = models.CharField(max_length=150, null=True, blank=True) 
    financial_contract = models.CharField(max_length=150, null=True, blank=True)  
    financial_contract_no = models.CharField(max_length=150, null=True, blank=True)  
    upload_financial_contract = models.FileField(upload_to='financial_documents/', null=True, blank=True)  
    financial_contract_start = models.DateField(null=True, blank=True)  
    financial_contract_end = models.DateField(null=True, blank=True)  
    duration_in_months = models.IntegerField(null=True, blank=True)  

    # Pricing details
    purchase_price = models.IntegerField(null=True, blank=True)   
    acquisition_date = models.DateField(null=True, blank=True)  
    residual_value_end_of_contract = models.IntegerField(null=True, blank=True)  

    # Book value calculations
    book_value = models.IntegerField(null=True, blank=True)  
    depreciation_value = models.IntegerField(null=True, blank=True)  
    acquisition_costs = models.IntegerField(null=True, blank=True)   

    # Depreciation method
    DEPRECIATION_METHODS = [
        ("linear_96_months", "Linear 96 months"),
        ("monthly_0_3_percent", "0.3% every 12 months"),
    ]
    depreciation_method = models.CharField(
        max_length=50, choices=DEPRECIATION_METHODS, null=True, blank=True
    ) 
    next_depreciation = models.DateField(null=True, blank=True)  

    # Additional costs
    cost_refurbishing = models.IntegerField(null=True, blank=True)  
    transportation_cost = models.IntegerField(null=True, blank=True)  

    # Customer details
    customer_name = models.CharField(max_length=150, null=True, blank=True) 
    customer_no = models.CharField(max_length=150, null=True, blank=True)   
    customer_contract = models.CharField(max_length=150, null=True, blank=True)   

    # Contract details
    upload_customer_contract = models.FileField(upload_to='contracts/', null=True, blank=True)   
    end_of_contract = models.DateField(null=True, blank=True)

    # Signed documents checklist
    contract_completed = models.BooleanField(default=False)   
    passport_provided = models.BooleanField(default=False)   
    sepa_mandate_signed = models.BooleanField(default=False)  
    service_contract_signed = models.BooleanField(default=False)  
    economic_beneficiary_confirmed = models.BooleanField(default=False)  
    usage_analysis_completed = models.BooleanField(default=False)  

    def __str__(self):
        return f"Financial Record for {self.asset} - {self.financial_partner}"
    

class SalesOffer(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='sales_offers')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    customer_manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_offers')
    offer_details = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    terms = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('Pending', 'Pending'),
            ('Accepted', 'Accepted'),
            ('Rejected', 'Rejected')
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Offer for {self.asset} to {self.customer.name}"


class Location(models.Model):
    REASON_CHOICES = [
        ('Maintenance', 'Maintenance'),
        ('Reassignment', 'Reassignment'),
    ]

    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='locations')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='locations')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_locations')
    assigned_on = models.DateField()
    moved_on = models.DateField(null=True, blank=True)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)

    def __str__(self):
        return f"{self.asset} at {self.warehouse}"


class Attachment(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='attachments')
    image = models.ImageField(upload_to='asset_images/', null=True, blank=True)
    document = models.FileField(upload_to='asset_documents/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for {self.asset}"
    

