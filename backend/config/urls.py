from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth endpoints (login, register, logout, verify, password-reset)
    path('api/auth/', include('apps.users.auth_urls')),

    # Admin-only user management CRUD
    path('api/users/', include('apps.users.admin_urls')),

    # Core API
    path('api/tournaments/', include('apps.tournaments.urls')),
    path('api/store/', include('apps.store.urls')),
    path('api/cms/', include('apps.cms.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# OpenAPI / Swagger docs (available in DEBUG mode only)
if settings.DEBUG:
    from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ]
