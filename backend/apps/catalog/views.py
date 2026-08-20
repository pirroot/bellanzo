from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
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
        # 🔥 برای retrieve، همه محصولات فعال رو برگردان (حتی قطعات یدکی)
        if self.action == 'retrieve':
            return Product.objects.all().select_related('category', 'main_product')

        # دریافت پارامترها
        is_spare_part_param = self.request.query_params.get('is_spare_part')
        main_product_param = self.request.query_params.get('main_product')

        # شروع با queryset پایه
        queryset = Product.objects.all().select_related('category', 'main_product')

        # اگر کاربر ادمین است
        if self.request.user and self.request.user.is_staff:
            # ادمین: اگر پارامتر is_spare_part وجود داشت، بر اساس آن فیلتر کن
            if is_spare_part_param is not None:
                if is_spare_part_param.lower() == 'true':
                    queryset = queryset.filter(is_spare_part=True)
                else:
                    queryset = queryset.filter(is_spare_part=False)
            # اگر main_product مشخص شده بود، قطعات آن محصول را نشان بده
            elif main_product_param is not None:
                queryset = queryset.filter(main_product_id=main_product_param)
            # در غیر این صورت همه رو نشون بده

        else:
            # کاربر عادی
            # اگر main_product مشخص شده بود، قطعات فعال آن محصول را نشان بده
            if main_product_param is not None:
                queryset = queryset.filter(
                    main_product_id=main_product_param,
                    is_active=True,
                    is_spare_part=True
                )
            # اگر is_spare_part=true بود، قطعات فعال را نشان بده
            elif is_spare_part_param is not None and is_spare_part_param.lower() == 'true':
                queryset = queryset.filter(is_active=True, is_spare_part=True)
            # در غیر این صورت محصولات معمولی فعال را نشان بده
            else:
                queryset = queryset.filter(is_active=True, is_spare_part=False)

        # فیلتر بر اساس دسته‌بندی
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)

        # فیلتر بر اساس ویژه
        if self.request.query_params.get('featured') == 'true':
            queryset = queryset.filter(is_featured=True)

        # حذف محصول خاص (برای محصولات مشابه)
        exclude = self.request.query_params.get('exclude')
        if exclude:
            queryset = queryset.exclude(id=exclude)

        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductAdminSerializer

    @action(detail=True, methods=['get'], url_path='spare-parts')
    def get_spare_parts(self, request, slug=None):
        """دریافت قطعات یدکی یک محصول"""
        product = self.get_object()
        spare_parts = Product.objects.filter(
            main_product=product,
            is_active=True,
            is_spare_part=True
        ).select_related('category')

        serializer = ProductListSerializer(spare_parts, many=True)
        return Response(serializer.data)
