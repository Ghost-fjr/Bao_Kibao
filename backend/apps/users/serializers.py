from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'bio', 'is_verified', 'is_staff', 'is_superuser', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'is_verified', 'is_staff', 'is_superuser']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        # 'role' intentionally excluded — users cannot self-assign admin/captain roles.
        # Role is always set server-side to 'donor' during create().
        fields = ['email', 'username', 'password', 'confirm_password', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        # Provide defaults for first_name and last_name if not provided
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            role='donor'  # Hardcoded — users cannot self-assign roles
        )
                
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that accepts email instead of username"""
    username_field = 'email'


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management with full CRUD"""
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'role', 'phone', 'avatar', 'bio', 'is_verified', 
            'is_active', 'is_staff', 'date_joined', 'last_login', 'password'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
