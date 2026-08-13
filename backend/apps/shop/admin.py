from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Order, OrderItem, Cart, CartItem, Payment


class OrderItemInline(admin.TabularInline):
    """نمایش آیتم‌های سفارش در پنل ادمین"""
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'unit_price', 'subtotal']
    fields = ['product', 'quantity', 'unit_price', 'subtotal']
    can_delete = False

    def subtotal(self, obj):
        """محاسبه جمع کل آیتم"""
        return obj.quantity * obj.unit_price
    subtotal.short_description = 'جمع کل'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """مدیریت سفارشات در پنل ادمین"""
    list_display = [
        'id', 'full_name', 'phone', 'status_colored',
        'total', 'items_count', 'created_at'
    ]
    list_filter = ['status', 'created_at', 'customer']
    search_fields = ['full_name', 'phone', 'id', 'tracking_code', 'ref_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'total', 'ref_id']
    inlines = [OrderItemInline]
    ordering = ['-created_at']

    fieldsets = (
        ('اطلاعات مشتری', {
            'fields': ('customer', 'full_name', 'phone', 'address', 'postal_code')
        }),
        ('اطلاعات سفارش', {
            'fields': ('status', 'total', 'ref_id', 'tracking_code')
        }),
        ('تاریخچه', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def status_colored(self, obj):
        """نمایش وضعیت با رنگ مناسب"""
        colors = {
            'pending': 'orange',
            'paid': 'blue',
            'shipped': 'purple',
            'delivered': 'green',
            'cancelled': 'red',
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_colored.short_description = 'وضعیت'
    status_colored.admin_order_field = 'status'

    def items_count(self, obj):
        """تعداد آیتم‌های سفارش"""
        return obj.items.count()
    items_count.short_description = 'تعداد آیتم‌ها'

    def get_actions(self, request):
        """افزودن اکشن‌های سفارشی"""
        actions = super().get_actions(request)
        actions['mark_as_paid'] = ('mark_as_paid', 'علامت‌گذاری به عنوان پرداخت شده')
        actions['mark_as_shipped'] = ('mark_as_shipped', 'علامت‌گذاری به عنوان ارسال شده')
        return actions

    def mark_as_paid(self, request, queryset):
        """تغییر وضعیت به پرداخت شده"""
        updated = queryset.update(status=Order.Status.PAID)
        self.message_user(request, f'{updated} سفارش به وضعیت پرداخت شده تغییر یافت.')
    mark_as_paid.short_description = 'علامت‌گذاری به عنوان پرداخت شده'

    def mark_as_shipped(self, request, queryset):
        """تغییر وضعیت به ارسال شده"""
        updated = queryset.update(status=Order.Status.SHIPPED)
        self.message_user(request, f'{updated} سفارش به وضعیت ارسال شده تغییر یافت.')
    mark_as_shipped.short_description = 'علامت‌گذاری به عنوان ارسال شده'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """مدیریت آیتم‌های سفارش"""
    list_display = ['id', 'order', 'product', 'quantity', 'unit_price', 'subtotal']
    list_filter = ['order__status']
    search_fields = ['order__full_name', 'product__name']
    readonly_fields = ['subtotal']

    def subtotal(self, obj):
        """جمع کل آیتم"""
        return obj.quantity * obj.unit_price
    subtotal.short_description = 'جمع کل'


class CartItemInline(admin.TabularInline):
    """نمایش آیتم‌های سبد خرید در پنل ادمین"""
    model = CartItem
    extra = 0
    readonly_fields = ['product', 'quantity']
    can_delete = True


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """مدیریت سبدهای خرید"""
    list_display = ['id', 'user', 'items_count', 'total_price', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__phone', 'user__username']
    inlines = [CartItemInline]
    readonly_fields = ['created_at', 'updated_at']

    def items_count(self, obj):
        """تعداد آیتم‌های سبد"""
        return obj.items.count()
    items_count.short_description = 'تعداد آیتم‌ها'

    def total_price(self, obj):
        """مجموع قیمت سبد"""
        return obj.total
    total_price.short_description = 'مجموع قیمت'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """مدیریت آیتم‌های سبد خرید"""
    list_display = ['id', 'cart', 'product', 'quantity', 'subtotal']
    list_filter = ['cart__user']
    search_fields = ['product__name']
    readonly_fields = ['subtotal']

    def subtotal(self, obj):
        """جمع کل آیتم"""
        return obj.quantity * obj.product.price
    subtotal.short_description = 'جمع کل'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """مدیریت پرداخت‌ها"""
    list_display = [
        'id', 'order', 'amount', 'gateway', 'status_colored',
        'ref_id', 'created_at'
    ]
    list_filter = ['status', 'gateway', 'created_at']
    search_fields = ['order__full_name', 'ref_id', 'authority']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('اطلاعات پرداخت', {
            'fields': ('order', 'amount', 'gateway', 'status')
        }),
        ('اطلاعات درگاه', {
            'fields': ('ref_id', 'authority')
        }),
        ('تاریخچه', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def status_colored(self, obj):
        """نمایش وضعیت با رنگ مناسب"""
        colors = {
            'pending': 'orange',
            'success': 'green',
            'failed': 'red',
            'cancelled': 'gray',
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_colored.short_description = 'وضعیت'
    status_colored.admin_order_field = 'status'
