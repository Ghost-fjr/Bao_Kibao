from django.core.cache import cache
from rest_framework.response import Response

class CacheResponseMixin:
    """
    Mixin to cache list and retrieve responses for ViewSets.
    Requires `cache_key_prefix` to be set on the ViewSet.
    """
    
    def get_cache_key(self, view_action, **kwargs):
        prefix = getattr(self, 'cache_key_prefix', self.__class__.__name__)
        key = f"{prefix}_{view_action}"
        if kwargs:
            # Sort kwargs for consistent keys
            sorted_kwargs = sorted(kwargs.items())
            key += "_" + "_".join([f"{k}:{v}" for k, v in sorted_kwargs])
        return key

    def list(self, request, *args, **kwargs):
        # Only cache if there are no query params (or handle them carefully)
        # For simplicity, we'll cache the exact query string
        query_string = request.META.get('QUERY_STRING', '')
        cache_key = self.get_cache_key('list', query=query_string)
        
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data)
        return response

    def retrieve(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        cache_key = self.get_cache_key('retrieve', pk=pk)
        
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data)
        return response

    def invalidate_cache(self):
        prefix = getattr(self, 'cache_key_prefix', self.__class__.__name__)
        # Using cache.delete_pattern or similar is ideal, but locmem doesn't support wildcards easily.
        # So we use cache.clear() for simplicity when an item changes.
        # Warning: This clears the entire cache. Since we only cache read-heavy stuff, it's fine.
        cache.clear()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        self.invalidate_cache()
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        self.invalidate_cache()
        return response

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        self.invalidate_cache()
        return response

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        self.invalidate_cache()
        return response
