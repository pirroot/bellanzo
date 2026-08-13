from django.db import models


class SiteSetting(models.Model):
    """Singleton-ish global brand & contact settings, editable from the panel."""
    brand_name = models.CharField('نام برند', max_length=120, default='برند ما')
    slogan = models.CharField('شعار', max_length=200, blank=True)
    logo = models.ImageField('لوگو', upload_to='brand/', blank=True, null=True)
    about = models.TextField('درباره ما', blank=True)

    phone = models.CharField('تلفن', max_length=40, blank=True)
    email = models.EmailField('ایمیل', blank=True)
    address = models.CharField('آدرس', max_length=255, blank=True)

    instagram = models.URLField('اینستاگرام', blank=True)
    telegram = models.URLField('تلگرام', blank=True)
    whatsapp = models.CharField('واتساپ', max_length=40, blank=True)
    linkedin = models.URLField('لینکدین', blank=True)

    # Hero section
    hero_badge = models.CharField('متن بج هیرو', max_length=100, blank=True, default='برند مورد اعتماد شما')
    hero_title_line1 = models.CharField('عنوان هیرو - خط اول', max_length=150, blank=True, default='تجربه‌ای نو از')
    hero_title_line2 = models.CharField('عنوان هیرو - خط دوم (رنگی)', max_length=150, blank=True, default='کیفیت و خدمات')
    hero_subtitle = models.TextField('متن توضیح هیرو', blank=True, default='محصولاتی که می‌توانید به آن‌ها اعتماد کنید، در کنار خدمات پس از فروشی که خیال شما را راحت می‌کند.')
    hero_bg_image = models.ImageField('عکس بک‌گراند هیرو', upload_to='hero/', blank=True, null=True)
    hero_product_image = models.ImageField('عکس محصول هیرو', upload_to='hero/', blank=True, null=True)

    maintenance_mode = models.BooleanField('حالت تعمیر (فقط خدمات)', default=False)

    class Meta:
        verbose_name = 'تنظیمات سایت'
        verbose_name_plural = 'تنظیمات سایت'

    def __str__(self):
        return self.brand_name


class Page(models.Model):
    """Generic content page (about, agencies/نمایندگی‌ها, etc.) — fill over time."""
    title = models.CharField('عنوان', max_length=150)
    slug = models.SlugField('اسلاگ', unique=True, allow_unicode=True)
    body = models.TextField('محتوا', blank=True)
    is_published = models.BooleanField('منتشر شده', default=False)
    updated_at = models.DateTimeField(auto_now=True)

    maintenance_mode = models.BooleanField('حالت تعمیر (فقط خدمات)', default=False)

    class Meta:
        verbose_name = 'صفحه'
        verbose_name_plural = 'صفحات'

    def __str__(self):
        return self.title


class HeroSlide(models.Model):
    """Homepage hero slides / banners."""
    title = models.CharField('عنوان', max_length=150)
    subtitle = models.CharField('زیرعنوان', max_length=250, blank=True)
    image = models.ImageField('تصویر', upload_to='hero/', blank=True, null=True)
    cta_label = models.CharField('متن دکمه', max_length=60, blank=True)
    cta_link = models.CharField('لینک دکمه', max_length=200, blank=True)
    order = models.PositiveIntegerField('ترتیب', default=0)
    is_active = models.BooleanField('فعال', default=True)

    maintenance_mode = models.BooleanField('حالت تعمیر (فقط خدمات)', default=False)

    class Meta:
        ordering = ['order']
        verbose_name = 'اسلاید هیرو'
        verbose_name_plural = 'اسلایدهای هیرو'

    def __str__(self):
        return self.title
