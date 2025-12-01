from rest_framework import viewsets, permissions, filters
from .models import Organization, OrganizationMember
from .serializers import OrganizationSerializer, OrganizationMemberSerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    """ViewSet for Organization CRUD"""
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'mission']
    lookup_field = 'slug'


class OrganizationMemberViewSet(viewsets.ModelViewSet):
    """ViewSet for OrganizationMember CRUD"""
    queryset = OrganizationMember.objects.all()
    serializer_class = OrganizationMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__email', 'user__username']

    def get_queryset(self):
        # Filter members by organization if provided in query params
        queryset = super().get_queryset()
        org_slug = self.request.query_params.get('org', None)
        if org_slug:
            queryset = queryset.filter(organization__slug=org_slug)
        return queryset
