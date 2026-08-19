from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny, IsAdminUser
from django.db.models import Q

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
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'short_description', 'description']
    ordering_fields = ['created_at', 'name', 'price']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        # Admin sees all products
        if self.request.user and self.request.user.is_staff:
            qs = Product.objects.all().select_related('category')
        else:
            # Check if we're filtering for spare parts page
            is_spare_part_filter = self.request.query_params.get('is_spare_part')

            if is_spare_part_filter is not None and is_spare_part_filter.lower() == 'true':
                # Spare parts page: show ALL spare parts
                qs = Product.objects.filter(
                    is_active=True,
                    is_spare_part=True
                ).select_related('category')
            else:
                # Products page: regular products + spare parts with show_in_products=True
                qs = Product.objects.filter(
                    is_active=True
                ).filter(
                    Q(is_spare_part=False) | Q(is_spare_part=True, show_in_products=True)
                ).select_related('category')

        # Filter by category slug
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)

        # Filter by featured
        if self.request.query_params.get('featured') == 'true':
            qs = qs.filter(is_featured=True)

        # Exclude specific product (for similar products)
        exclude = self.request.query_params.get('exclude')
        if exclude:
            qs = qs.exclude(id=exclude)

        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductAdminSerializer
