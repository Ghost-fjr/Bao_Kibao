from django.contrib import admin
from .models import Page, Achievement, GalleryCollection, MediaGallery


class MediaGalleryInline(admin.TabularInline):
    """Inline admin for adding multiple media items to a collection"""
    model = MediaGallery
    extra = 3
    fields = ('title', 'media_type', 'image', 'video_url', 'caption', 'order', 'is_featured')
    readonly_fields = ('uploaded_at',)


@admin.register(GalleryCollection)
class GalleryCollectionAdmin(admin.ModelAdmin):
    """Admin interface for Gallery Collections"""
    list_display = ('title', 'event_date', 'media_count', 'is_published', 'order', 'created_at')
    list_filter = ('is_published', 'event_date', 'organization')
    search_fields = ('title', 'description')
    list_editable = ('order', 'is_published')
    readonly_fields = ('created_at', 'updated_at', 'media_count')
    inlines = [MediaGalleryInline]
    
    fieldsets = (
        ('Collection Information', {
            'fields': ('organization', 'title', 'description', 'event_date')
        }),
        ('Display Settings', {
            'fields': ('cover_image', 'order', 'is_published')
        }),
        ('Metadata', {
            'fields': ('media_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Filter by user's organization if not superuser
        if hasattr(request.user, 'organization'):
            return qs.filter(organization=request.user.organization)
        return qs.none()


@admin.register(MediaGallery)
class MediaGalleryAdmin(admin.ModelAdmin):
    """Admin interface for Media Gallery"""
    list_display = ('title', 'collection', 'media_type', 'is_featured', 'uploaded_at')
    list_filter = ('media_type', 'is_featured', 'collection', 'organization')
    search_fields = ('title', 'caption', 'collection__title')
    list_editable = ('is_featured',)
    readonly_fields = ('uploaded_at',)
    
    fieldsets = (
        ('Media Information', {
            'fields': ('organization', 'collection', 'title', 'caption')
        }),
        ('Media Content', {
            'fields': ('media_type', 'image', 'video_url')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_featured', 'uploaded_at')
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Filter by user's organization if not superuser
        if hasattr(request.user, 'organization'):
            return qs.filter(organization=request.user.organization)
        return qs.none()


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    """Admin interface for CMS Pages"""
    list_display = ('title', 'is_published', 'created_at', 'updated_at')  # Removed slug
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'content')
    # prepopulated_fields removed - slug field no longer exists
    list_editable = ('is_published',)


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    """Admin interface for Achievements"""
    list_display = ('title', 'date', 'is_featured', 'order', 'created_at')
    list_filter = ('is_featured', 'date')
    search_fields = ('title', 'description')
    list_editable = ('is_featured', 'order')
    date_hierarchy = 'date'
