from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Order, OrderItem, Cart, CartItem, Payment
from apps.catalog.models import Product

User = get_user_model()


class OrderItemSerializer(serializers.ModelSerializer):
    """سریالایزر آیتم‌های سفارش"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_image',
            'quantity', 'unit_price', 'subtotal'
        ]
        read_only_fields = ['unit_price']

    def get_product_image(self, obj):
        """دریافت تصویر محصول"""
        if obj.product.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product.image.url)
            return obj.product.image.url
        return None

    def get_subtotal(self, obj):
        """محاسبه جمع کل آیتم"""
        return obj.quantity * obj.unit_price


class OrderSerializer(serializers.ModelSerializer):
    """سریالایزر اصلی سفارش"""
    items = OrderItemSerializer(many=True, read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'customer_phone',
            'full_name', 'phone', 'address', 'postal_code',
            'status', 'status_display', 'total', 'ref_id', 'tracking_code',
            'items', 'total_items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'customer', 'ref_id', 'tracking_code', 'created_at', 'updated_at', 'total']

    def get_total_items(self, obj):
        """تعداد کل آیتم‌های سفارش"""
        return obj.items.count()

    def create(self, validated_data):
        """ایجاد سفارش جدید"""
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        # اگر کاربر لاگین است، اطلاعاتش رو بگیر
        if user:
            validated_data['customer'] = user
            if not validated_data.get('full_name'):
                validated_data['full_name'] = user.get_full_name() or user.phone
            if not validated_data.get('phone'):
                validated_data['phone'] = user.phone

        # محاسبه مبلغ کل از سبد خرید
        cart = request.user.cart if user and hasattr(user, 'cart') else None
        if cart:
            total = cart.total
            validated_data['total'] = total

        return super().create(validated_data)


class CreateOrderSerializer(serializers.Serializer):
    """سریالایزر برای ایجاد سفارش جدید از سبد خرید"""
    full_name = serializers.CharField(max_length=120, required=True)
    phone = serializers.CharField(max_length=20, required=True)
    address = serializers.CharField(required=True, style={'base_template': 'textarea.html'})
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_phone(self, value):
        """اعتبارسنجی شماره موبایل"""
        if not value.startswith('09') or len(value) != 11:
            raise serializers.ValidationError("شماره موبایل باید با 09 شروع و 11 رقم باشد")
        return value


class CartItemSerializer(serializers.ModelSerializer):
    """سریالایزر آیتم‌های سبد خرید"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.IntegerField(source='product.price', read_only=True)
    product_image = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_name', 'product_price',
            'product_image', 'quantity', 'subtotal'
        ]
        read_only_fields = ['subtotal']

    def get_product_image(self, obj):
        """دریافت تصویر محصول"""
        if obj.product.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product.image.url)
            return obj.product.image.url
        return None

    def get_subtotal(self, obj):
        """محاسبه جمع کل آیتم"""
        return obj.quantity * obj.product.price


class CartSerializer(serializers.ModelSerializer):
    """سریالایزر سبد خرید"""
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'items_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total(self, obj):
        """مجموع قیمت سبد خرید"""
        return obj.total

    def get_items_count(self, obj):
        """تعداد آیتم‌های سبد خرید"""
        return obj.items_count


class AddToCartSerializer(serializers.Serializer):
    """سریالایزر برای اضافه کردن به سبد خرید"""
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=False, min_value=1, default=1)


    def validate_product_id(self, value):
        """اعتبارسنجی محصول"""
        try:
            Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError("محصول مورد نظر یافت نشد")
        return value

    def validate_quantity(self, value):
        """اعتبارسنجی تعداد"""
        if value < 1:
            raise serializers.ValidationError("تعداد باید حداقل 1 باشد")
        return value


class PaymentSerializer(serializers.ModelSerializer):
    """سریالایزر پرداخت"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    gateway_display = serializers.CharField(source='get_gateway_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'amount', 'gateway', 'gateway_display',
            'status', 'status_display', 'ref_id', 'authority',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ref_id', 'authority', 'created_at', 'updated_at']


class PaymentVerifySerializer(serializers.Serializer):
    """سریالایزر برای تایید پرداخت"""
    order_id = serializers.IntegerField(required=True)
    authority = serializers.CharField(max_length=64, required=True)
    status = serializers.CharField(max_length=20, required=True)


class OrderStatusUpdateSerializer(serializers.Serializer):
    """سریالایزر برای تغییر وضعیت سفارش (ادمین)"""
    status = serializers.ChoiceField(choices=Order.Status.choices, required=True)
    tracking_code = serializers.CharField(max_length=64, required=False, allow_blank=True)

    def validate_status(self, value):
        """اعتبارسنجی وضعیت"""
        valid_statuses = [choice[0] for choice in Order.Status.choices]
        if value not in valid_statuses:
            raise serializers.ValidationError("وضعیت نامعتبر است")
        return value


class OrderListSerializer(serializers.ModelSerializer):
    """سریالایزر برای لیست سفارشات (خلاصه)"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'full_name', 'phone', 'status', 'status_display',
            'total', 'items_count', 'created_at'
        ]

    def get_items_count(self, obj):
        """تعداد آیتم‌های سفارش"""
        return obj.items.count()
