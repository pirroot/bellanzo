from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Category, Product
from .serializers import (
    CategorySerializer, ProductListSerializer,
    ProductDetailSerializer, ProductAdminSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    pagination_class = None
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Category.objects.all()
        return Category.objects.filter(is_active=True)


class ProductViewSet(viewsets.ModelViewSet):
    lookup_field = 'pk'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'short_description', 'description']
    ordering_fields = ['created_at', 'name']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        # Admin sees all products; public sees only active ones
        if self.request.user and self.request.user.is_staff:
            qs = Product.objects.all().select_related('category')
        else:
            qs = Product.objects.filter(is_active=True).select_related('category')

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)
        if self.request.query_params.get('featured') == 'true':
            qs = qs.filter(is_featured=True)
        return qs

    def get_serializer_class(self):
        if self.request.user and self.request.user.is_staff:
            return ProductAdminSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
