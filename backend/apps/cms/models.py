from django.db import models
from django.utils.text import slugify
from apps.organizations.models import Organization


class Page(models.Model):
    """CMS Page model for dynamic content"""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='pages')
    slug = models.SlugField(max_length=200, unique=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    meta_description = models.CharField(max_length=300, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class Achievement(models.Model):
    """Achievement/Milestone model"""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    image = models.ImageField(upload_to='achievements/', null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', 'order']

    def __str__(self):
        return f"{self.title} - {self.date}"


class MediaGallery(models.Model):
    """Media gallery model for photos and videos"""
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='media_gallery')
    title = models.CharField(max_length=200)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='image')
    image = models.ImageField(upload_to='gallery/images/', null=True, blank=True)
    video_url = models.URLField(blank=True)
    caption = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name_plural = 'Media Gallery'

    def __str__(self):
        return self.title
