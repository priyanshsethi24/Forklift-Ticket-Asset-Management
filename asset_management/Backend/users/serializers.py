from rest_framework import serializers
from .models import User


# User Serializer
class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'role2', 'role3', 'role4', 'role5', 'first_name', 'last_name', 'organization_name']
        extra_kwargs = {
            'password': {'write_only': True},
            #'role': {'read_only': True}  # Role is set by admin; users cannot change it
        }

    def create(self, validated_data): 
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class UpdatePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("The new password must contain at least one digit.")
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError("The new password must contain at least one letter.")
        return value