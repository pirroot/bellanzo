from django.db import models


class Category(models.Model):
    name = models.CharField('نام دسته', max_length=120)
    slug = models.SlugField('اسلاگ', unique=True, allow_unicode=True)
    description = models.TextField('توضیحات', blank=True)
    image = models.ImageField('تصویر', upload_to='categories/', blank=True, null=True)
    order = models.PositiveIntegerField('ترتیب', default=0)
    is_active = models.BooleanField('فعال', default=True)
    sub_items = models.JSONField('زیرمنوها', default=list, blank=True,
                                 help_text='آرایه‌ای از {name, link} برای منوی hover')

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'دسته‌بندی'
        verbose_name_plural = 'دسته‌بندی‌ها'

    def __str__(self):
        return self.name


class Product(models.Model):
    """Showcase product (phase 1). Pricing/stock fields ready for shop phase."""
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='products', verbose_name='دسته‌بندی',
    )
    name = models.CharField('نام محصول', max_length=200)
    slug = models.SlugField('اسلاگ', unique=True, allow_unicode=True)
    short_description = models.CharField('توضیح کوتاه', max_length=300, blank=True)
    description = models.TextField('توضیحات کامل', blank=True)
    discount_price = models.PositiveIntegerField('قیمت تخفیف‌خورده (ریال)', default=0)
    image = models.ImageField('تصویر اصلی', upload_to='products/', blank=True, null=True)
    features = models.JSONField('ویژگی‌ها', default=list, blank=True)
    stock = models.PositiveIntegerField('موجودی', default=0)
    is_spare_part = models.BooleanField('قطعه یدکی', default=False)
    show_in_products = models.BooleanField('نمایش در محصولات', default=True)
    # Reserved for phase 2 (shop). Unused in showcase mode.
    price = models.DecimalField('قیمت', max_digits=12, decimal_places=0, default=0)
    is_purchasable = models.BooleanField('قابل خرید', default=False)

    is_featured = models.BooleanField('ویژه', default=False)
    is_active = models.BooleanField('فعال', default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    main_product = models.ForeignKey(
            'self',
            on_delete=models.SET_NULL,
            null=True,
            blank=True,
            related_name='spare_parts',
            verbose_name='محصول اصلی'
        )
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'محصول'
        verbose_name_plural = 'محصولات'

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='gallery',
        verbose_name='محصول',
    )
    image = models.ImageField('تصویر', upload_to='products/gallery/')
    alt = models.CharField('متن جایگزین', max_length=150, blank=True)

    class Meta:
        verbose_name = 'تصویر گالری'
        verbose_name_plural = 'تصاویر گالری'

    def __str__(self):
        return f'{self.product.name} - {self.pk}'
