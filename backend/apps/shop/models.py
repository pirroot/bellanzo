"""
Phase 2 storefront models — Full e-commerce implementation
"""
from django.db import models
from django.conf import settings
from decimal import Decimal

from apps.catalog.models import Product


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'در انتظار پرداخت'
        PAID = 'paid', 'پرداخت شده'
        SHIPPED = 'shipped', 'ارسال شده'
        DELIVERED = 'delivered', 'تحویل شده'
        CANCELLED = 'cancelled', 'لغو شده'

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
    )
    full_name = models.CharField(max_length=120, verbose_name='نام کامل')
    phone = models.CharField(max_length=20, verbose_name='شماره موبایل')
    address = models.TextField(blank=True, verbose_name='آدرس')
    postal_code = models.CharField(max_length=20, blank=True, verbose_name='کد پستی')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='وضعیت'
    )
    total = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        default=0,
        verbose_name='مبلغ کل'
    )
    ref_id = models.CharField(
        max_length=64,
        blank=True,
        verbose_name='کد مرجع درگاه'
    )
    tracking_code = models.CharField(
        max_length=64,
        blank=True,
        verbose_name='کد رهگیری'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'سفارش'
        verbose_name_plural = 'سفارش‌ها'

    def __str__(self):
        return f'Order #{self.pk} - {self.full_name}'

    def get_total_items(self):
        return self.items.count()

    def get_total_quantity(self):
        return sum(item.quantity for item in self.items.all())


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='سفارش'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        verbose_name='محصول'
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name='تعداد'
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        default=0,
        verbose_name='قیمت واحد'
    )

    class Meta:
        verbose_name = 'آیتم سفارش'
        verbose_name_plural = 'آیتم‌های سفارش'

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'

    @property
    def subtotal(self):
        return self.quantity * self.unit_price


class Cart(models.Model):
    """سبد خرید کاربر"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart',
        verbose_name='کاربر'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')

    class Meta:
        verbose_name = 'سبد خرید'
        verbose_name_plural = 'سبدهای خرید'

    def __str__(self):
        return f'Cart - {self.user.phone}'

    @property
    def total(self):
        """مجموع قیمت سبد خرید با احتساب تخفیف"""
        total = 0
        for item in self.items.all():
            # قیمت نهایی: اگر تخفیف داره از discount_price استفاده کن
            price = item.product.discount_price if item.product.discount_price > 0 else item.product.price
            total += item.quantity * price
        return total

    @property
    def items_count(self):
        return self.items.count()

    def clear(self):
        self.items.all().delete()


class CartItem(models.Model):
    """آیتم‌های سبد خرید"""
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='سبد خرید'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        verbose_name='محصول'
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name='تعداد'
    )

    class Meta:
        verbose_name = 'آیتم سبد خرید'
        verbose_name_plural = 'آیتم‌های سبد خرید'
        unique_together = ['cart', 'product']

    def __str__(self):
        return f'{self.product.name} x{self.quantity}'

    @property
    def subtotal(self):
        """قیمت نهایی با تخفیف"""
        price = self.product.discount_price if self.product.discount_price > 0 else self.product.price
        return self.quantity * price

    def increase(self, quantity=1):
        self.quantity += quantity
        self.save()

    def decrease(self, quantity=1):
        if self.quantity > quantity:
            self.quantity -= quantity
            self.save()
        else:
            self.delete()


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'در انتظار'
        SUCCESS = 'success', 'موفق'
        FAILED = 'failed', 'ناموفق'
        CANCELLED = 'cancelled', 'لغو شده'

    class Gateway(models.TextChoices):
        ZARINPAL = 'zarinpal', 'زرین‌پال'
        PAYPAL = 'paypal', 'پی‌پال'

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='payment',
        verbose_name='سفارش'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        verbose_name='مبلغ'
    )
    gateway = models.CharField(
        max_length=20,
        choices=Gateway.choices,
        default=Gateway.ZARINPAL,
        verbose_name='درگاه پرداخت'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='وضعیت'
    )
    ref_id = models.CharField(
        max_length=64,
        blank=True,
        verbose_name='کد مرجع'
    )
    authority = models.CharField(
        max_length=64,
        blank=True,
        verbose_name='کد مجوز'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')

    class Meta:
        verbose_name = 'پرداخت'
        verbose_name_plural = 'پرداخت‌ها'
        ordering = ['-created_at']

    def __str__(self):
        return f'Payment #{self.pk} - {self.status}'
