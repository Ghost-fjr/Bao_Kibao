from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import uuid

from .serializers import UserSerializer, RegisterSerializer, EmailTokenObtainPairSerializer, AdminUserSerializer
from apps.common.permissions import IsAdminUser

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """API view for user registration"""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        # Send email verification link
        verify_url = f"{settings.FRONTEND_URL}/verify-email/{user.email_verification_token}"
        send_mail(
            subject='Verify your Bao Kibao account',
            message=(
                f"Hi {user.first_name or user.username},\n\n"
                f"Thanks for registering! Click the link below to verify your email address:\n\n"
                f"{verify_url}\n\n"
                f"This link does not expire. If you did not register, please ignore this email.\n\n"
                f"The Bao Kibao Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,  # Don't block registration if email fails
        )


class VerifyEmailView(APIView):
    """Verify a user's email address via token link"""
    permission_classes = (permissions.AllowAny,)

    def get(self, request, token):
        try:
            user = User.objects.get(email_verification_token=token)
            if user.is_verified:
                return Response({'message': 'Email already verified.'})
            user.is_verified = True
            user.email_verified_at = timezone.now()
            user.save(update_fields=['is_verified', 'email_verified_at'])
            return Response({'message': 'Email verified successfully. You can now log in.'})
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid verification token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class PasswordResetRequestView(APIView):
    """Request a password reset email"""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            # Generate and save reset token
            token = uuid.uuid4()
            user.password_reset_token = token
            user.password_reset_token_expires = timezone.now() + timezone.timedelta(hours=24)
            user.save(update_fields=['password_reset_token', 'password_reset_token_expires'])

            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            send_mail(
                subject='Reset your Bao Kibao password',
                message=(
                    f"Hi {user.first_name or user.username},\n\n"
                    f"Click the link below to reset your password (valid for 24 hours):\n\n"
                    f"{reset_url}\n\n"
                    f"If you did not request a password reset, please ignore this email.\n\n"
                    f"The Bao Kibao Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass  # Don't reveal whether the email exists

        # Always return success to prevent email enumeration
        return Response({'message': 'If that email exists, a reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token and new password"""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not token or not new_password:
            return Response(
                {'error': 'token and new_password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(password_reset_token=token)
        except (User.DoesNotExist, Exception):
            return Response(
                {'error': 'Invalid or expired reset token.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if timezone.now() > user.password_reset_token_expires:
            return Response(
                {'error': 'Reset token has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.password_reset_token = None
        user.password_reset_token_expires = None
        user.save(update_fields=['password', 'password_reset_token', 'password_reset_token_expires'])

        return Response({'message': 'Password reset successfully. You can now log in.'})


class UserProfileView(generics.RetrieveUpdateAPIView):
    """API view for retrieving and updating user profile"""
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    """Blacklist the refresh token on logout so it cannot be reused"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'Logout failed.'}, status=status.HTTP_400_BAD_REQUEST)


class EmailTokenObtainPairView(TokenObtainPairView):
    """Custom JWT view that accepts email instead of username"""
    serializer_class = EmailTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin users to manage all users.
    Provides full CRUD: list, create, retrieve, update, delete
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')

        role = self.request.query_params.get('role', None)
        if role and role != 'all':
            queryset = queryset.filter(role=role)

        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        search = self.request.query_params.get('search', None)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        user = serializer.save()
        password = self.request.data.get('password')
        if password:
            user.set_password(password)
            user.save()

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Admin action to reset a user's password"""
        user = self.get_object()
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'error': 'new_password is required'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successfully'})

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({'is_active': user.is_active})
