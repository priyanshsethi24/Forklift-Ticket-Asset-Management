from rest_framework import serializers
from .models import User, Ticket

# User Serializer
class UserSerializers(serializers.ModelSerializer):
    assigned_roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'role', 'role2', 'role3', 'role4', 'role5',
            'first_name', 'last_name', 'organization_name', 'assigned_roles'
        ]
        extra_kwargs = {
            'role': {'required': True},
            'password': {'write_only': True}  # Ensure password is not exposed in responses
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = self.Meta.model(**validated_data)
        
        # Set password securely if provided
        if password:
            user.set_password(password)
            
        user.save()
        return user

    def get_assigned_roles(self, obj):
        """Returns a list of assigned roles (excluding empty roles)."""
        roles = [obj.role, obj.role2, obj.role3, obj.role4, obj.role5]
        return [role for role in roles if role]  # Exclude empty roles
# Ticket Serializer
class TicketSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'status', 'created_at', 'updated_at', 'user_email']

    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("User must be authenticated to create a ticket.")
        validated_data['user'] = request.user
        return super().create(validated_data)
