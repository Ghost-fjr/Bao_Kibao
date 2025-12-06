from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'bio', 'is_verified', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'is_verified']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    organization_slug = serializers.CharField(required=False, write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'confirm_password', 'first_name', 'last_name', 'role', 'organization_slug']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        organization_slug = validated_data.pop('organization_slug', None)
        
        # Provide defaults for first_name and last_name if not provided
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            role=validated_data.get('role', 'donor')
        )
        
        # If organization slug provided, add user to organization
        if organization_slug:
            try:
                org = Organization.objects.get(slug=organization_slug)
                # Logic to add member would go here, e.g.:
                # OrganizationMember.objects.create(user=user, organization=org, role='member')
                pass
            except Organization.DoesNotExist:
                pass
                
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that accepts email instead of username"""
    username_field = 'email'
