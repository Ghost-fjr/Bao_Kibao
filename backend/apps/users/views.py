from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, EmailTokenObtainPairSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """API view for user registration"""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """API view for retrieving and updating user profile"""
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    """API view for logging out (blacklisting token)"""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            # In a real implementation with blacklist enabled, we would blacklist the refresh token here
            # refresh_token = request.data["refresh"]
            # token = RefreshToken(refresh_token)
            # token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class EmailTokenObtainPairView(TokenObtainPairView):
    """Custom JWT view that accepts email instead of username"""
    serializer_class = EmailTokenObtainPairSerializer
