import os
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.common.keep_awake import start_keep_awake

# Start the keep-awake thread for the 48-hour demo
# We check an environment variable so it doesn't run during simple management commands
if not os.environ.get('RUN_MAIN') == 'true' and not os.environ.get('DISABLE_KEEP_AWAKE'):
    # In production on Render (or if RUN_MAIN is not set in runserver), we start it.
    # To prevent multiple threads during development autoreload, we only start it once.
    start_keep_awake()

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
