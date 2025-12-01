from rest_framework import serializers
from .models import Page, Achievement, MediaGallery

class PageSerializer(serializers.ModelSerializer):
    """Serializer for Page model"""
    class Meta:
        model = Page
        fields = '__all__'
        read_only_fields = ['organization', 'slug', 'created_at', 'updated_at']


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for Achievement model"""
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ['organization']


class MediaGallerySerializer(serializers.ModelSerializer):
    """Serializer for MediaGallery model"""
    class Meta:
        model = MediaGallery
        fields = '__all__'
        read_only_fields = ['organization']
