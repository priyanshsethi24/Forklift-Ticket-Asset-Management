from rest_framework.permissions import BasePermission

class IsAssetManagerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'asset_manager' or request.user.role == 'admin'
    
class IsWarehouseManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'warehouse_manager'