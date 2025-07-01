from .models import Asset, Location, Customer, SalesOffer, FinancialRecord, MaintenanceRecord, Warehouse, Attachment
from rest_framework.views import APIView
from .serializers import AssetSerializer, LocationSerializer, AssetCreationSerializer, MaintenanceRecordSerializer, AssetAttachmentSerializer, CustomerSerializer, OfferSerializer, FinancialRecordSerializer, FinancialRecordCreationSerializer, ScheduleMaintenanceSerializer, MaintenanceRecordSerializer, WarehouseManagerAssetSerializer, WarehouseSerializer, AssetManagerDashboardSerailizer, AssetCustomerSerializer
from .permissions import IsAssetManagerOrAdmin, IsWarehouseManager
from django.db import transaction
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.db.models.functions import Coalesce
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.conf import settings
from rest_framework import status
from django.db.models import Q, F, Sum, Count, Avg, Value, DecimalField
from datetime import date
from django.core.mail import send_mail
from datetime import timedelta, timezone, datetime
import pytz
from .utils import translate_text
from django.db import IntegrityError
from django.contrib.auth import update_session_auth_hash


class Pagination(PageNumberPagination):
    page_size = 10 
    page_size_query_param = 'page_size'
    max_page_size = 100


class GetLocationsAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        language = request.GET.get('language', 'de')

        locations = Location.objects.all()

        # Translate 'reason' field for each location
        for location in locations:
            location.reason = translate_text(location.reason, language)

        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# class AssetCreateAPIView(APIView):
#     permission_classes = (IsAuthenticated, IsAssetManagerOrAdmin,)
#     parser_classes = (MultiPartParser, FormParser)

#     def post(self, request, *args, **kwargs):
#         data = request.data.copy()
#         attachments_data = []

#         # Handle file attachments
#         if request.FILES.getlist('attachments'):
#             for file in request.FILES.getlist('attachments'):
#                 if file.content_type.startswith('image/'):
#                     attachments_data.append({
#                         'image': file,
#                         'document': None
#                     })
#                 elif file.content_type in [
#                     'application/pdf',
#                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
#                     'application/msword',
#                     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
#                 ]:
#                     attachments_data.append({
#                         'image': None,
#                         'document': file
#                     })
#                 else:
#                     return Response(
#                         {'error': f'Unsupported file type: {file.content_type}'},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )

#         # Add attachments data to the request data
#         data['attachments'] = attachments_data

#         serializer = AssetCreationSerializer(data=data, context={'request': request})
#         if serializer.is_valid():
#             try:
#                 with transaction.atomic():
#                     asset = serializer.save()

#                     # Create attachments after asset is saved
#                     for attachment_data in attachments_data:
#                         Attachment.objects.create(asset=asset, **attachment_data)

#                     response_serializer = AssetCreationSerializer(asset, context={'request': request})
#                     return Response(response_serializer.data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AssetCreateAPIView(APIView):
    permission_classes = (IsAuthenticated, IsAssetManagerOrAdmin,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        data = request.data.copy()  # Copy request data
        attachments_data = []  # List to store attachments separately

        # Handle file attachments
        if request.FILES.getlist('attachments'):
            for file in request.FILES.getlist('attachments'):
                if file.content_type.startswith('image/'):
                    attachments_data.append({
                        'image': file,
                        'document': None
                    })
                elif file.content_type in [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ]:
                    attachments_data.append({
                        'image': None,
                        'document': file
                    })
                else:
                    return Response(
                        {'error': f'Unsupported file type: {file.content_type}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                data['attachments'] = attachments_data

        serializer = AssetCreationSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    asset = serializer.save()
                    
                    # Assign attachments to the created asset
                    for attachment_data in attachments_data:
                        Attachment.objects.create(asset=asset, **attachment_data)

                    response_serializer = AssetCreationSerializer(asset, context={'request': request})
                    return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AssetAttachmentsView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, assetid):
        try:
            asset_obj = Asset.objects.get(id=assetid)
        except Asset.DoesNotExist:
            return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)

        attachments = asset_obj.attachments.all()
        serializer = AssetAttachmentSerializer(attachments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MaintainanceRecordView(APIView):
    permission_classes = (IsAuthenticated, )
    pagination_class = Pagination

    def get(self, request, assetid):
        language = request.GET.get('language', 'de')  
        try:
            asset_obj = Asset.objects.get(id=assetid)
        except Asset.DoesNotExist:
            return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)

        maintenance_records = asset_obj.maintenance_records.all()
        
        paginator = self.pagination_class()
        paginated_records = paginator.paginate_queryset(maintenance_records, request)
        serializer = MaintenanceRecordSerializer(paginated_records, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def patch(self, request, assetid, recordid):
        try:
            asset_obj = Asset.objects.get(id=assetid)
        except Asset.DoesNotExist:
            return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            record = asset_obj.maintenance_records.get(id=recordid)
        except MaintenanceRecord.DoesNotExist:
            return Response({'error': 'Maintenance record not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MaintenanceRecordSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, assetid, recordid):
        try:
            asset_obj = Asset.objects.get(id=assetid)
        except Asset.DoesNotExist:
            return Response({'error': 'Asset not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            record = asset_obj.maintenance_records.get(id=recordid)
        except MaintenanceRecord.DoesNotExist:
            return Response({'error': 'Maintenance record not found'}, status=status.HTTP_404_NOT_FOUND)

        record.delete()
        return Response({'message': 'Maintenance record deleted successfully'}, status=status.HTTP_200_OK)


class ShowMaintenancesView(APIView):
    def get(self, request):
        assign_roles = self.get_assigned_roles(request.user)

        if not request.user.role in ('asset_manager', 'admin') or 'asset_manager' not in assign_roles or 'admin' not in assign_roles:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch maintenance records scheduled by the Asset Manager
        maintenance_records = MaintenanceRecord.objects.filter(scheduled_by=request.user)
        serializer = MaintenanceRecordSerializer(maintenance_records, many=True)
        return Response(serializer.data)
    
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


class ScheduleMaintenanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assetid):
        data = request.data
        data['asset'] = assetid
        serializer = ScheduleMaintenanceSerializer(data=data)
        assign_role = self.get_assigned_roles(request.user)
        if serializer.is_valid():
            if not request.user.role == 'asset_manager' or 'asset_manager' in assign_role:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

            asset = serializer.validated_data.get('asset')
            if not asset:
                return Response({'error': 'Invalid asset'}, status=status.HTTP_400_BAD_REQUEST)

            maintenance_record = serializer.save(scheduled_by=request.user)
            return Response(
                {
                    'message': 'Maintenance scheduled successfully',
                    'data': ScheduleMaintenanceSerializer(maintenance_record).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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



class AssetListAPIView(APIView):
    permission_classes = (IsAuthenticated, )
    pagination_class = Pagination

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

    def put(self, request, assetid):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role == 'asset_manager' or 'asset_manager' in assign_roles:
            asset_obj = Asset.objects.get(id=assetid)
            serializer = AssetCreationSerializer(asset_obj, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Asset updated successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, assetid):
        asset_obj = Asset.objects.get(id=assetid)
        serializer = AssetCreationSerializer(asset_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Asset updated successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, assetid):
        asset_obj = Asset.objects.get(id=assetid)
        
        if asset_obj:
            asset_obj.delete()
            return Response({"message": "Asset deleted Successfully"}, status=status.HTTP_200_OK)
        
        return Response({"error": "Asset not found"}, status=status.HTTP_204_NO_CONTENT)            

    def get(self, request, assetid=None):
        user = request.user
        assign_roles = self.get_assigned_roles(request.user)

        asset_id = request.GET.get('asset_id')
        language = request.GET.get('language', 'de')  

        if asset_id is not None and asset_id.isnumeric():
            asset_id = int(asset_id)
        else:
            asset_id = None

        filters = {
            'id': asset_id,
            'description': request.GET.get('description'),
            'status': request.GET.get('status'),
            # 'brand': request.GET.get('brand'),
            # 'model': request.GET.get('model'),
            # 'machine_category': request.GET.get('category'),
            # 'locations__warehouse__name': request.GET.get('location'),
            # 'operational_status': request.GET.get('operational_status'),
        }

        query = Q()
        for key, value in filters.items():
            if value:
                query &= Q(**{key: value})


        paginator = self.pagination_class()

        if assetid:
            asset = Asset.objects.get(id=assetid)
            # # Translate dynamic fields before serializing
            asset.description = translate_text(asset.description, language)
            asset.mast = translate_text(asset.mast_type, language)
            asset.battery_category = translate_text(asset.battery_category, language)
            # asset.warranty = translate_text(asset.warranty, language)
            # asset.operational_status = translate_text(asset.operational_status, language)
            # asset.notes = translate_text(asset.notes, language)
            asset.status = translate_text(asset.status,language)

            serializer = AssetSerializer(asset)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        
        elif user.is_superuser or user.role == 'asset_manager' or 'admin' in assign_roles or 'asset_manager' in assign_roles:            
            assets = Asset.objects.all().filter(query).order_by('-created_at')

        elif user.role == 'warehouse_manager' or 'warehouse_manager' in assign_roles:
            managed_warehouses = Warehouse.objects.filter(manager=request.user)
            
            assets = Asset.objects.filter(warehouse__in=managed_warehouses)
            
            paginated_assets = paginator.paginate_queryset(assets, request)
            serializer = WarehouseManagerAssetSerializer(paginated_assets, many=True)
            return paginator.get_paginated_response(serializer.data)
            

        elif user.role == 'finance_manager' or 'finance_manager' in assign_roles:
            asset_list = Asset.objects.filter().filter(query)
            assets = (
                asset_list
                .annotate(
                    total_depreciation=Coalesce(Sum('financial_records__depreciation'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))),
                    total_maintenance_costs=Coalesce(Sum('financial_records__maintenance_costs'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))),
                    total_operating_costs=Coalesce(Sum('financial_records__operating_costs'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))),
                    total_insurance_costs=Coalesce(Sum('financial_records__insurance_costs'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))),
                    book_value=F('purchase_price') - Coalesce(Sum('financial_records__depreciation'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2)))
                )
                .values(
                    'id', 'description', 'brand', 'model', 'purchase_price',
                    'total_depreciation', 'total_maintenance_costs', 'total_operating_costs',
                    'total_insurance_costs', 'book_value'
                )
            )

            assets = assets.order_by('-created_at')
            paginated_assets = paginator.paginate_queryset(assets, request)
            return paginator.get_paginated_response(paginated_assets)
            
        elif user.role == 'customer_manager' or 'customer_manager' in assign_roles:
            managed_customer_ids = Customer.objects.filter(customer_manager=user).values_list('id', flat=True)
            assets = Asset.objects.filter(customer_id__in=managed_customer_ids).filter(query)
        
        else:
            return Response({"detail": "You do not have permission to view this resource."}, status=status.HTTP_403_FORBIDDEN)

        # if not assets.exists():
        #     return Response({'error': 'No assets found'}, status=status.HTTP_404_NOT_FOUND)

        assets = assets.order_by('-created_at')
        paginated_assets = paginator.paginate_queryset(assets, request)

        # Translate dynamic fields for all assets
        translated_assets = []
        for asset in paginated_assets:
            asset.description = translate_text(asset.description, language)
            asset.condition = translate_text(asset.condition, language)
            asset.status = translate_text(asset.status,language)

            translated_assets.append(asset)

        serializer = AssetManagerDashboardSerailizer(paginated_assets, many=True)
        return paginator.get_paginated_response(serializer.data)


class CustomerListAPIView(APIView):
    permission_classes = (IsAuthenticated,)
    pagination_class = Pagination

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

    def get(self, request):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role == 'customer_manager' or 'customer_manager' in assign_roles:
            customers = Customer.objects.filter(customer_manager=request.user
                ).order_by('id')
            
            paginator = self.pagination_class()
            paginated_customers = paginator.paginate_queryset(customers, request)
            serializer = CustomerSerializer(paginated_customers, many=True)
            
            # return Response(serializer.data, status=status.HTTP_200_OK)
            return paginator.get_paginated_response(serializer.data)
        else:
            return Response({"error": "Not Authorized"}, status=status.HTTP_403_FORBIDDEN)

    def patch(self, request, customer_id):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role == 'customer_manager' or 'customer_manager' in assign_roles:
            customer_obj = Customer.objects.get(id=customer_id)
            serializer = CustomerSerializer(customer_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Customer details updated successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, customer_id):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role == 'customer_manager' or 'customer_manager' in assign_roles:
            # customer_obj = CustomerSerializer.objects.get(id=offerid)
            customer = Customer.objects.get(id=customer_id)
            customer.delete()
            return Response({'message': 'Customer details updated successfully'}, status=status.HTTP_200_OK)
        return Response({"error": "You do not have permission to perform this aciton"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role == 'customer_manager' or 'customer_manager' in assign_roles:
            data = request.data
            data['customer_manager'] = request.user.id
            serializer = CustomerSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Customer Added Successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class OffersView(APIView):
    permission_classes = (IsAuthenticated, )
    pagination_class = Pagination

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

    def get(self, request, offerid=None):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role == 'customer_manager' or 'customer_manager' in assign_roles:
            if not offerid:
                offers = SalesOffer.objects.all()
            else:
                offers = SalesOffer.objects.filter(id=offerid)
                serializer = OfferSerializer(offers)
                return Response(serializer.data, status=status.HTTP_200_OK)

            if not offers.exists():
                return Response({'error': 'No Offers found'}, status=status.HTTP_404_NOT_FOUND)

            paginator = self.pagination_class()
            paginated_offers = paginator.paginate_queryset(offers, request)
            serializer = OfferSerializer(paginated_offers, many=True)            
            return paginator.get_paginated_response(serializer.data)
        
        else:
            return Response({'error': 'Not Accessible'}, status=status.HTTP_403_FORBIDDEN)
        
    def post(self, request):
        assign_role = self.get_assigned_roles(request.user)
        if request.user.role == 'customer_manager' or 'customer_manager' in assign_role:
            data = request.data
            data['customer_manager'] = request.user.id
            serializer = OfferSerializer(data=data)

            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Offer Added Successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Not Accessible'}, status=status.HTTP_403_FORBIDDEN)
        
    def patch(self, request, offerid):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role == 'customer_manager' or 'customer_manager' in assign_roles:
            sales_obj = SalesOffer.objects.get(id=offerid)
            serializer = OfferSerializer(sales_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Offer updated successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, offerid):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role == 'customer_manager' or 'customer_manager' in assign_roles:
            
            if not offerid:
                return Response({'error': 'Offer ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                offer = SalesOffer.objects.get(id=offerid, customer_manager=request.user)
                offer.delete()
                return Response({'message': 'Offer deleted successfully'}, status=status.HTTP_200_OK)
            except SalesOffer.DoesNotExist:
                return Response({'error': 'Offer not found or not authorized to delete'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Not Accessible'}, status=status.HTTP_403_FORBIDDEN)
        
              
class WarehouseListView(APIView):
    permission_classes = [IsAuthenticated,]

    def get(self, request):
        warehouses = Warehouse.objects.all()
        serializer = WarehouseSerializer(warehouses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Ensure capacity is an integer
        try:
            if 'capacity' in request.data:
                request.data['capacity'] = int(request.data['capacity'])
        except (ValueError, TypeError):
            return Response(
                {'error': 'Capacity must be a valid integer'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = WarehouseSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(
                    {
                        'message': 'Warehouse created successfully', 
                        'data': serializer.data
                    }, 
                    status=status.HTTP_201_CREATED
                )
            except IntegrityError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk=None):
        # Delete a specific warehouse by ID
        try:
            warehouse = Warehouse.objects.get(pk=pk)
            warehouse.delete()
            return Response(
                {'message': 'Warehouse deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Warehouse.DoesNotExist:
            return Response(
                {'error': 'Warehouse not found'},
                status=status.HTTP_404_NOT_FOUND
            )
            
    def patch(self, request, pk=None):
        # Partially update an existing warehouse by ID
        try:
            warehouse = Warehouse.objects.get(pk=pk)
            # Ensure capacity is an integer if it's in the request
            if 'capacity' in request.data:
                try:
                    request.data['capacity'] = int(request.data['capacity'])
                except (ValueError, TypeError):
                    return Response(
                        {'error': 'Capacity must be a valid integer'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Partially update the warehouse with the new data
            serializer = WarehouseSerializer(warehouse, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {'message': 'Warehouse partially updated successfully', 'data': serializer.data},
                    status=status.HTTP_200_OK
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Warehouse.DoesNotExist:
            return Response(
                {'error': 'Warehouse not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
class SalesReportView(APIView):
    permission_classes = [IsAuthenticated,]

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

    def get(self, request):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role == "customer_manager" or 'customer_manager' in assign_roles:
            language = request.GET.get('language', 'de')  
            now = datetime.now()
            thirty_days_ago = now - timedelta(days=30)
            
            accepted_offers = SalesOffer.objects.filter(status='Accepted')
            total_sales = accepted_offers.aggregate(total=Sum('price'))['total'] or 0
            recent_sales = accepted_offers.filter(created_at__gte=thirty_days_ago).aggregate(
                total=Sum('price'))['total'] or 0
            
            offer_status_counts = SalesOffer.objects.values('status').annotate(
                count=Count('id')
            )
            
            top_customers = SalesOffer.objects.filter(
                status=translate_text('Accepted', language)
            ).values(
                'customer__name'
            ).annotate(
                total_spent=Sum('price'),
                deals_count=Count('id')
            ).order_by('-total_spent')[:5]
            
            asset_performance = SalesOffer.objects.filter(
                status='Accepted'
            ).values(
                'asset__machine_category'
            ).annotate(
                total_revenue=Sum('price'),
                units_sold=Count('id'),
                avg_price=Avg('price')
            )
            
            monthly_sales = accepted_offers.values(
                'created_at__year',
                'created_at__month'
            ).annotate(
                total=Sum('price'),
                count=Count('id')
            ).order_by('created_at__year', 'created_at__month')
            
            asset_costs = Asset.objects.filter(
                sales_offers__status='Accepted'
            ).aggregate(
                total_purchase_cost=Sum('purchase_price'),
                # total_maintenance_cost=Sum('maintenance_costs'),
                total_operating_cost=Coalesce(Sum('financial_records__operating_costs'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))),
            )
            
            total_costs = (asset_costs['total_purchase_cost'] or 0) + \
                         (asset_costs['total_operating_cost'] or 0)
            gross_profit = total_sales - total_costs
            
            asset_metrics = Asset.objects.filter(
                sales_offers__isnull=False
            ).aggregate(
                avg_operating_hours=Avg('operating_hours'),
                # total_depreciation=Sum('annual_depreciation_cost')
            )
            
            report_data = {
                'summary': {
                    'total_sales': total_sales,
                    'recent_sales': recent_sales,
                    'gross_profit': gross_profit,
                    'profit_margin': (gross_profit / total_sales * 100) if total_sales else 0,
                },
                'offer_metrics': {
                    'status_distribution': list(offer_status_counts),
                    'conversion_rate': (
                        accepted_offers.count() / SalesOffer.objects.count() * 100
                    ) if SalesOffer.objects.exists() else 0,
                },
                'customer_insights': {
                    'top_customers': list(top_customers),
                    'average_deal_size': total_sales / accepted_offers.count() if accepted_offers.exists() else 0,
                },
                'asset_metrics': {
                    'category_performance': list(asset_performance),
                    'avg_operating_hours': asset_metrics['avg_operating_hours'],
                    # 'total_depreciation': asset_metrics['total_depreciation'],
                },
                'financial_metrics': {
                    'total_costs': total_costs,
                    # 'maintenance_costs': asset_costs['total_maintenance_cost'],
                    'operating_costs': asset_costs['total_operating_cost'],
                },
                'sales_trends': list(monthly_sales),
            }
            
            return Response(report_data, status=status.HTTP_200_OK)
        
        else:
            return Response({'error': 'Not Accessible'}, status=status.HTTP_403_FORBIDDEN)


class DashboardView(APIView):
    permission_classes = (IsAuthenticated,)

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

    def get(self, request):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role in ['admin', 'asset_manager'] or 'admin' in assign_roles or 'asset_manager' in assign_roles:
            language = request.GET.get('language', 'de')  

            total_assets = Asset.objects.count()
            assets_by_status = Asset.objects.values('status').annotate(count=Count('status'))
            # Apply translate_text to each status value
            for asset in assets_by_status:
                asset['status'] = translate_text(asset['status'])
            assets_under_maintenance = MaintenanceRecord.objects.filter(
                status='Scheduled'
            ).values('asset').distinct().count()

            upcoming_maintenance = MaintenanceRecord.objects.filter(
                status='Pending', date__gte=date.today()
            ).order_by('date')[:5]
            overdue_maintenance = MaintenanceRecord.objects.filter(
                status='Pending', date__lt=date.today()
            )

            critical_notifications = [
                {
                    'asset': translate_text(record.asset.description, language),
                    'message': f"Maintenance overdue since {record.date}",
                }
                for record in overdue_maintenance
            ]

            data = {
                'total_assets': total_assets,
                'assets_by_status': list(assets_by_status),
                'assets_under_maintenance': assets_under_maintenance,
                'upcoming_maintenance': [
                    {
                        'id': maintenance.id,
                        'asset': translate_text(maintenance.asset.description, language),
                        'date': maintenance.date
                    } for maintenance in upcoming_maintenance
                ],
                'overdue_maintenance': [
                    {
                        'id': maintenance.id,
                        'asset': translate_text(maintenance.asset.description, language),
                        'date': maintenance.date
                    } for maintenance in overdue_maintenance
                ],
                'critical_notifications': critical_notifications,
            }

            return Response(data, status=status.HTTP_200_OK)

        elif request.user.role == 'finance_manager' or 'finance_manager' in assign_roles:
            financial_aggregates = FinancialRecord.objects.aggregate(
                total_depreciation=Coalesce(Sum('depreciation'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))),
                total_maintenance_costs=Coalesce(Sum('maintenance_costs'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))),
                total_operating_costs=Coalesce(Sum('operating_costs'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))),
                total_insurance_costs=Coalesce(Sum('insurance_costs'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2)))
            )

            asset_aggregates = Asset.objects.aggregate(
                total_purchase_price=Coalesce(Sum('purchase_price'), Value(0, output_field=DecimalField(max_digits=10, decimal_places=2)))
            )

            total_depreciation = financial_aggregates['total_depreciation']
            total_purchase_price = asset_aggregates['total_purchase_price']
            total_annotated_book_value = total_purchase_price - total_depreciation

            financial_overview = {
                'total_depreciation': total_depreciation,
                'total_maintenance_costs': financial_aggregates['total_maintenance_costs'],
                'total_operating_costs': financial_aggregates['total_operating_costs'],
                'total_insurance_costs': financial_aggregates['total_insurance_costs'],
                'total_purchase_price': total_purchase_price,
                'total_annotated_book_value': total_annotated_book_value
            }

            return Response({
                "financial_overview": financial_overview,
            }, status=status.HTTP_200_OK)

        elif request.user.role == 'warehouse_manager' or 'warehouse_manager' in assign_roles:
            warehouses = (
                Warehouse.objects
                .filter(manager=request.user)
                .annotate(
                    total_assets=Count('assets', distinct=True),
                    assets_under_maintenance=Count(
                        'assets__maintenance_records',
                        filter=Q(assets__maintenance_records__status='Scheduled'),
                        distinct=True
                    ),
                    total_depreciation=Coalesce(
                        Sum('assets__financial_records__depreciation'),
                        Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))
                    ),
                    total_maintenance_costs=Coalesce(
                        Sum('assets__financial_records__maintenance_costs'),
                        Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))
                    ),
                    total_purchase_price=Coalesce(
                        Sum('assets__purchase_price'),  
                        Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))
                    )
                )
                .annotate(
                    total_annotated_book_value=F('total_purchase_price') - F('total_depreciation')
                )
                .values(
                    'id', 'name', 'capacity', 'total_assets', 'assets_under_maintenance',
                    'total_depreciation', 'total_maintenance_costs', 'total_purchase_price', 'total_annotated_book_value'
                )
            )

            return Response({"warehouse_overview": list(warehouses)}, status=status.HTTP_200_OK)

        elif request.user.role == 'customer_manager' or 'customer_manager' in assign_roles:
            total_customers = Customer.objects.filter(customer_manager=request.user).count()
            
            offers_aggregate = SalesOffer.objects.filter(customer_manager=request.user).aggregate(
                total_offers=Count('id'),
                accepted_offers=Count('id', filter=Q(status='Accepted')),
                rejected_offers=Count('id', filter=Q(status='Rejected')),
                pending_offers=Count('id', filter=Q(status='Pending')),
                total_accepted_revenue=Coalesce(
                    Sum('price', filter=Q(status='Accepted')),
                    Value(0, output_field=DecimalField(max_digits=10, decimal_places=2))
                )
            )

            customer_overview = {
                'total_customers_managed': total_customers,
                'total_offers': offers_aggregate['total_offers'],
                'accepted_offers': offers_aggregate['accepted_offers'],
                'rejected_offers': offers_aggregate['rejected_offers'],
                'pending_offers': offers_aggregate['pending_offers'],
                'total_accepted_revenue': offers_aggregate['total_accepted_revenue']
            }

            return Response({"customer_overview": customer_overview}, status=status.HTTP_200_OK)

        else:
            return Response({"error": "Not Authorized"}, status=status.HTTP_403_FORBIDDEN)
        
class FinancialRecordListView(APIView):
    permission_classes = [IsAuthenticated]

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

    def get(self, request, assetid):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role != 'finance_manager' or 'finance_manager' in assign_roles:
            return Response({"error": "You do not have permission to perform this action"}, status=status.HTTP_403_FORBIDDEN)
        
        language = request.GET.get('language', 'de') 

        financial_records = FinancialRecord.objects.filter(asset_id=assetid)

        for record in financial_records:
            record.asset.description = translate_text(record.asset.description, language)
            record.notes = translate_text(record.notes, language)


        serializer = FinancialRecordSerializer(financial_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, assetid, recordid):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role != 'finance_manager' or 'finance_manager' in assign_roles:
            return Response({"error": "You do not have permission to perform this action"}, status=status.HTTP_403_FORBIDDEN)

        try:
            financial_record = FinancialRecord.objects.get(id=recordid, asset_id=assetid)
        except FinancialRecord.DoesNotExist:
            return Response({"error": "Financial record not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = FinancialRecordCreationSerializer(financial_record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Financial record updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, assetid):
        assign_roles = self.get_assigned_roles(request.user)
        print("request.user.role", request.user.role)
        if request.user.role != 'finance_manager' or 'finance_manager' not in assign_roles:
            return Response({"error": "You do not have permission to perform this action"}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        data['asset'] = assetid
        serializer = FinancialRecordCreationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Financial record added successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, assetid, recordid):
        assign_roles = self.get_assigned_roles(request.user)
        if request.user.role != 'finance_manager' or 'finance_manager' in assign_roles:
            return Response({"error": "You do not have permission to perform this action"}, status=status.HTTP_403_FORBIDDEN)

        try:
            financial_record = FinancialRecord.objects.get(id=recordid, asset_id=assetid)
            financial_record.delete()
            return Response({"message": "Financial record deleted successfully"}, status=status.HTTP_200_OK)
        except FinancialRecord.DoesNotExist:
            return Response({"error": "Financial record not found"}, status=status.HTTP_404_NOT_FOUND)
    

class AssetsSummaryView(APIView):
    def get(self, request):
        condition_counts = Asset.objects.values('condition').annotate(count=Count('condition'))
        condition_summary = {item['condition']: item['count'] for item in condition_counts}

        utilization_agg = Asset.objects.aggregate(
            total_hours=Sum('operating_hours'),
            average_hours=Avg('operating_hours')
        )
        total_hours = utilization_agg['total_hours'] or 0
        average_hours = utilization_agg['average_hours'] or 0

        data = {
            'condition_summary': condition_summary,
            'utilization': {
                'total_operating_hours': total_hours,
                'average_operating_hours_per_asset': float(average_hours)
            }
        }

        return Response(data, status=status.HTTP_200_OK)
    

class FinancialSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get total asset value and depreciation
        asset_values = Asset.objects.aggregate(
            total_purchase_value=Sum('purchase_price'),
            avg_purchase_value=Avg('purchase_price')
        )

        # Get financial records summary
        financial_summary = FinancialRecord.objects.aggregate(
            total_maintenance=Sum('maintenance_costs'),
            total_operating=Sum('operating_costs'),
            total_insurance=Sum('insurance_costs')
        )

        # Calculate totals (handle None values)
        total_maintenance = financial_summary['total_maintenance'] or 0
        total_operating = financial_summary['total_operating'] or 0
        total_insurance = financial_summary['total_insurance'] or 0
        total_expenses = total_maintenance + total_operating + total_insurance

        
        data = {
            'depreciation': {
                'total_asset_value': float(asset_values['total_purchase_value'] or 0),
                'average_asset_value': float(asset_values['avg_purchase_value'] or 0)
            },
            'expenses': {
                'maintenance_costs': float(total_maintenance),
                'operating_costs': float(total_operating),
                'insurance_costs': float(total_insurance),
                'total_annual_expenses': float(total_expenses)
            },
            'summary': {
                'total_assets': Asset.objects.count(),
                'total_expenses': float(total_expenses),
                'average_cost_per_asset': float(total_expenses / Asset.objects.count() if Asset.objects.count() > 0 else 0)
            }
        }

        return Response(data, status=status.HTTP_200_OK)

# def email_alerts():
#         today = datetime.now(pytz.utc).date()
#         upcoming_threshold = today + timedelta(days=7)

#         upcoming_assets = Asset.objects.filter(
#             next_maintenance__isnull=False,
#             next_maintenance__lte=upcoming_threshold,
#             next_maintenance__gte=today
#         )

#         sent_count = 0

#         for asset in upcoming_assets:
#             manager = getattr(asset, 'customer_manager', None)
#             if manager and manager.email:
#                 subject = f"Upcoming Maintenance Reminder for Asset {asset.asset_id}"
#                 message = (
#                     f"Hello {manager.name},\n\n"
#                     f"This is a reminder that the asset {asset.asset_id} ({asset.brand} {asset.model}) "
#                     f"has a scheduled maintenance due on {asset.next_maintenance}.\n\n"
#                     f"Please ensure that the maintenance is carried out by the due date.\n\n"
#                     f"Thank you."
#                 )
#                 from_email = settings.DEFAULT_FROM_EMAIL or 'no-reply@example.com'
#                 recipient_list = [manager.email]

#                 send_mail(subject, message, from_email, recipient_list)
#                 sent_count += 1

#         return Response(
#             {'message': f'Email alerts sent for {sent_count} assets due for maintenance.'},
#             status=status.HTTP_200_OK
#         )

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        # Check if the old password is correct
        if not user.check_password(old_password):
            return Response({'message': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        # Set the new password
        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)  # Keep the user logged in

        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)