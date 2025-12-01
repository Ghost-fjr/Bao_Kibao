from rest_framework import serializers
from .models import Organization, OrganizationMember
from apps.users.serializers import UserSerializer

class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for Organization model"""
    class Meta:
        model = Organization
        fields = '__all__'
        read_only_fields = ['slug', 'created_at', 'updated_at']


class OrganizationMemberSerializer(serializers.ModelSerializer):
    """Serializer for OrganizationMember model"""
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = OrganizationMember
        fields = ['id', 'organization', 'user', 'user_details', 'role', 'joined_at', 'is_active']
        read_only_fields = ['joined_at']
