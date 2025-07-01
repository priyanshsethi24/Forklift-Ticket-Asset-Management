from django.urls import path
from .views import *

urlpatterns = [
    path('assets/locations/', GetLocationsAPIView.as_view()),
    path('assets/create/', AssetCreateAPIView.as_view()),           # Done
    path('assets/', AssetListAPIView.as_view()),                    # Done
    path('assets/<int:assetid>/', AssetListAPIView.as_view()),      # Done
    path('assets/<int:assetid>/maintenance_records/', MaintainanceRecordView.as_view()), #get list
    path('assets/<int:assetid>/maintenance/<int:recordid>/', MaintainanceRecordView.as_view()), #get single record
    path('maintenance/schedule/<int:assetid>/', ScheduleMaintenanceAPIView.as_view()), # create

    path('warehouses/', WarehouseListView.as_view()),
    path('warehouses/<int:pk>/', WarehouseListView.as_view(), name='warehouse-delete'), 
    path('dashboard/', DashboardView.as_view()),

    path('assets/<int:assetid>/attachments/', AssetAttachmentsView.as_view()),
    path('assets/', AssetListAPIView.as_view()),

    # path('maintenance/', .as_view())

    path('customers/', CustomerListAPIView.as_view()),
    path('customers/<int:customer_id>/', CustomerListAPIView.as_view()),

    path('sales-report/', SalesReportView.as_view()),
    path('sales-offers/', OffersView.as_view()),
    path('sales-offers/<int:offerid>/', OffersView.as_view()),
    
    # path('finance/dashboard/', FinancialDashboardView.as_view(), name='finance_dashboard'),
    path('finance/records/', FinancialRecordListView.as_view(), name='financial_record_list'),
    path('finance/records/<int:assetid>/', FinancialRecordListView.as_view(), name='financial_record_list'),
    path('finance/records/<int:assetid>/<int:recordid>/', FinancialRecordListView.as_view(), name='financial_record_patch'),
    path('assets-summary/', AssetsSummaryView.as_view(), name='asset_summary'),
    path('financial-summary/', FinancialSummaryView.as_view(), name='financial-summary'),
    path('update-password/', ChangePasswordView.as_view(), name='change_password'),
]
