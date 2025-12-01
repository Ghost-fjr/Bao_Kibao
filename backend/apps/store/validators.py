from django.core.exceptions import ValidationError
from django.conf import settings


def validate_image_file(file):
    """Validate uploaded image files"""
    # Check file size
    if file.size > settings.FILE_UPLOAD_MAX_MEMORY_SIZE:
        raise ValidationError(f'Image file too large. Maximum size is {settings.FILE_UPLOAD_MAX_MEMORY_SIZE / (1024 * 1024)}MB')
    
    # Check file type
    if hasattr(file, 'content_type'):
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise ValidationError(f'Invalid image type. Allowed types: {", ".join(settings.ALLOWED_IMAGE_TYPES)}')
    
    return file


def validate_file_extension(file, allowed_extensions):
    """Validate file extension"""
    import os
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in allowed_extensions:
        raise ValidationError(f'Invalid file extension. Allowed: {", ".join(allowed_extensions)}')
    return file
