from rest_framework import serializers
from .models import Category, Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt']


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'order', 'is_active', 'product_count', 'sub_items']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', default='', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'image',
            'category', 'category_name', 'is_featured', 'is_active',
            'price', 'is_purchasable',  # <--- اضافه شد
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    gallery = ProductImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'description',
            'image', 'features', 'gallery', 'category', 'is_featured',
            'price', 'is_purchasable',
        ]


class ProductAdminSerializer(serializers.ModelSerializer):
    """Admin: full read/write including image upload."""
    category_name = serializers.CharField(source='category.name', default='', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'description',
            'image', 'features', 'gallery',
            'category', 'category_name',
            'is_featured', 'is_active',
            'price', 'is_purchasable',
            'created_at',
        ]
        read_only_fields = ['created_at']
