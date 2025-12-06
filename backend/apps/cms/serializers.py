from rest_framework import serializers
from .models import Page, Achievement, MediaGallery, GalleryCollection


class PageSerializer(serializers.ModelSerializer):
    """Serializer for CMS Pages"""
    class Meta:
        model = Page
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for Achievements"""
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ['created_at']


class MediaGallerySerializer(serializers.ModelSerializer):
    """Serializer for Media Gallery items"""
    collection_title = serializers.CharField(source='collection.title', read_only=True)
    
    class Meta:
        model = MediaGallery
        fields = '__all__'
        read_only_fields = ['uploaded_at']


class GalleryCollectionSerializer(serializers.ModelSerializer):
    """Serializer for Gallery Collections with nested media items"""
    media_items = MediaGallerySerializer(many=True, read_only=True)
    media_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = GalleryCollection
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'media_count']
