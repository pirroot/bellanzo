from rest_framework import serializers
from .models import Category, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'order', 'is_active', 'product_count', 'sub_items']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', default='', read_only=True)
    main_product_name = serializers.CharField(source='main_product.name', default='', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'image',
            'category', 'category_name', 'is_featured', 'is_active',
            'price', 'discount_price', 'stock', 'is_purchasable',
            'is_spare_part', 'show_in_products','main_product', 'main_product_name',
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    gallery = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'description',
            'image', 'features', 'gallery',
            'category', 'is_featured',
            'price', 'discount_price', 'stock', 'is_purchasable',
            'is_spare_part', 'show_in_products',
        ]


class ProductAdminSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', default='', read_only=True)
    gallery = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
