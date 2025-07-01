from rest_framework import serializers
from .models import (
    Asset, Warehouse, Customer, MaintenanceRecord, Attachment, Location, FinancialRecord, SalesOffer
)
from users.models import User
import base64
from django.core.files.base import ContentFile
import os

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'capacity', 'manager']

# class DealerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Dealer
#         fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    dealer_name = serializers.CharField(source='dealer.name', read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'

class AssetSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)

    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class MaintenanceRecordSerializer(serializers.ModelSerializer):
    asset_description = serializers.CharField(source='asset.description', read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = ['id', 'asset_description', 'date', 'details', 'status', 'cost']

class LocationSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.username', read_only=True)

    class Meta:
        model = Location
        fields = '__all__'

class FinancialRecordSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.description', read_only=True)

    class Meta:
        model = FinancialRecord
        fields = '__all__'

class SalesOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesOffer
        fields = '__all__'
        read_only_fields = ['created_at']

class AssetAttachmentSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()
    document_base64 = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ['id', 'image', 'document', 'uploaded_at', 'asset', 'image_base64', 'document_base64']
        read_only_fields = ['id', 'uploaded_at']

    def get_image_base64(self, obj):
        if obj.image:
            with obj.image.open('rb') as img_file:
                return base64.b64encode(img_file.read()).decode('utf-8')
        return None

    def get_document_base64(self, obj):
        if obj.document:
            with obj.document.open('rb') as doc_file:
                return base64.b64encode(doc_file.read()).decode('utf-8')
        return None

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'image', 'document', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def validate(self, data):
        image = data.get('image')
        document = data.get('document')

        if image and document:
            raise serializers.ValidationError("An attachment can have either an image or a document, not both.")

        if not image and not document:
            raise serializers.ValidationError("An attachment must have either an image or a document.")

        return data

    def validate_image(self, value):
        if value:
            valid_image_mime_types = ['image/jpeg', 'image/png', 'image/gif']
            if value.content_type not in valid_image_mime_types:
                raise serializers.ValidationError("Unsupported image type. Allowed types are JPEG, PNG, and GIF.")
            
            max_image_size = 5 * 1024 * 1024  # 5 MB
            if value.size > max_image_size:
                raise serializers.ValidationError("Image size should not exceed 5 MB.")
        return value

    def validate_document(self, value):
        if value:
            allowed_extensions = ['.pdf', '.doc', '.docx', '.xlsx']
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in allowed_extensions:
                raise serializers.ValidationError("Unsupported document type. Allowed types are PDF, DOC, DOCX, and XLSX.")
            
            max_document_size = 10 * 1024 * 1024  # 10 MB
            if value.size > max_document_size:
                raise serializers.ValidationError("Document size should not exceed 10 MB.")
        return value

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'image', 'document', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def validate(self, data):
        image = data.get('image')
        document = data.get('document')

        if image and document:
            raise serializers.ValidationError("An attachment can have either an image or a document, not both.")

        if not image and not document:
            raise serializers.ValidationError("An attachment must have either an image or a document.")

        return data

    def validate_image(self, value):
        if value:
            valid_image_mime_types = ['image/jpeg', 'image/png', 'image/gif']
            if value.content_type not in valid_image_mime_types:
                raise serializers.ValidationError("Unsupported image type. Allowed types are JPEG, PNG, and GIF.")
            
            max_image_size = 5 * 1024 * 1024  # 5 MB
            if value.size > max_image_size:
                raise serializers.ValidationError("Image size should not exceed 5 MB.")
        return value

    def validate_document(self, value):
        if value:
            allowed_extensions = ['.pdf', '.doc', '.docx', '.xlsx']
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in allowed_extensions:
                raise serializers.ValidationError("Unsupported document type. Allowed types are PDF, DOC, DOCX, and XLSX.")
            
            max_document_size = 10 * 1024 * 1024  # 10 MB
            if value.size > max_document_size:
                raise serializers.ValidationError("Document size should not exceed 10 MB.")
        return value



class AssetCreationSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, required=False)

    class Meta:
        model = Asset
        fields = "__all__"
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        attachments_data = validated_data.pop('attachments', [])
        asset = Asset.objects.create(**validated_data)

        # Save attachments if provided
        attachments = [
            Attachment(asset=asset, **attachment_data)
            for attachment_data in attachments_data if attachment_data
        ]
        if attachments:
            Attachment.objects.bulk_create(attachments)

        return asset
    

class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesOffer
        fields = "__all__"
        read_only_fields = ['created_at', '']


class FinancialRecordCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialRecord
        fields = "__all__"


class ScheduleMaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRecord
        fields = ['asset', 'date', 'details', 'cost']
        extra_kwargs = {
            'date': {'required': True},
            'details': {'required': True},
            'cost': {'required': True},
        }



class WarehouseManagerDashboardSerializer(serializers.ModelSerializer):
    total_assets = serializers.SerializerMethodField()
    available_space = serializers.SerializerMethodField()

    class Meta:
        model = Warehouse
        fields = [
            'id',
            'name',
            'total_assets',
            'available_space',
        ]

    def get_total_assets(self, obj):
        return obj.locations.count()

    def get_available_space(self, obj):
        return obj.capacity - obj.locations.count()


class WarehouseManagerAssetSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    warehouse_capacity = serializers.IntegerField(source='warehouse.capacity', read_only=True)

    class Meta:
        model = Asset
        fields = [
            'id',
            'description',
            'brand',
            'model',
            'status',
            'warehouse_name',
            'warehouse_capacity',
        ]




class AssetManagerDashboardSerailizer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
        'id',
        'asset_id',            
        'description',         
        'condition',          
        'manufacturer',        
        'type',                
        'insert_date',         
        'location',           
        'operating_hours',     
        'status',  
        'year_of_manufacture',
        'serial_no',
        'lift_height',
        'price',
        'price_netto',
        'dealer_price',
        'dealer_price_netto',
        'rental_price_per_day',
        'rental_price_per_week',
        'rental_price_per_month',
        'machine_width',
        'machine_height',
        'basket_load',
        'reach_horizontal',
        'machine_weight',
        'closed_height',
        'free_height',
        'fork_length',
        'forks',
        'load_centre',            
    ]

class AssetCustomerSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Asset
        fields = [
            'id',
            'description',
            'brand',
            'status',
            'customer_name',
        ]

