from django.db import models


class ServiceRequest(models.Model):
    """After-sales service request submitted from the site — the priority feature."""

    class Status(models.TextChoices):
        NEW = 'new', 'جدید'
        IN_PROGRESS = 'in_progress', 'در حال بررسی'
        WAITING = 'waiting', 'در انتظار مشتری'
        RESOLVED = 'resolved', 'حل شده'
        CLOSED = 'closed', 'بسته شده'

    class RequestType(models.TextChoices):
        REPAIR = 'repair', 'تعمیر'
        WARRANTY = 'warranty', 'گارانتی'
        INSTALL = 'install', 'نصب و راه‌اندازی'
        QUESTION = 'question', 'سوال / راهنمایی'
        OTHER = 'other', 'سایر'

    full_name = models.CharField('نام و نام خانوادگی', max_length=120)
    phone = models.CharField('شماره تماس', max_length=20)
    email = models.EmailField('ایمیل', blank=True)

    request_type = models.CharField(
        'نوع درخواست', max_length=20,
        choices=RequestType.choices, default=RequestType.REPAIR,
    )
    product_name = models.CharField('نام محصول', max_length=200, blank=True)
    serial_number = models.CharField('شماره سریال', max_length=120, blank=True)
    purchase_date = models.DateField('تاریخ خرید', null=True, blank=True)
    description = models.TextField('شرح مشکل / درخواست')
    attachment = models.FileField('پیوست', upload_to='after_sales/', blank=True, null=True)

    status = models.CharField(
        'وضعیت', max_length=20, choices=Status.choices, default=Status.NEW,
    )
    admin_note = models.TextField('یادداشت ادمین', blank=True)
    tracking_code = models.CharField('کد پیگیری', max_length=12, unique=True, editable=False)

    created_at = models.DateTimeField('تاریخ ثبت', auto_now_add=True)
    updated_at = models.DateTimeField('آخرین بروزرسانی', auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'درخواست خدمات پس از فروش'
        verbose_name_plural = 'درخواست‌های خدمات پس از فروش'

    def save(self, *args, **kwargs):
        if not self.tracking_code:
            import secrets
            self.tracking_code = secrets.token_hex(4).upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.full_name} - {self.tracking_code}'


RATING_CHOICES = [
    ('excellent', 'عالی'),
    ('good', 'خوب'),
    ('average', 'متوسط'),
    ('poor', 'ضعیف'),
]


class Survey(models.Model):
    """Customer satisfaction survey — service or product type."""

    class SurveyType(models.TextChoices):
        SERVICE = 'service', 'نظرسنجی خدمات'
        PRODUCT = 'product', 'نظرسنجی محصول'

    survey_type = models.CharField(
        'نوع نظرسنجی', max_length=10,
        choices=SurveyType.choices, default=SurveyType.SERVICE,
    )

    # Common fields
    full_name = models.CharField('نام و نام خانوادگی', max_length=120, blank=True)
    phone = models.CharField('شماره تماس', max_length=20, blank=True)
    email = models.EmailField('آدرس ایمیل', blank=True)
    city = models.CharField('شهر', max_length=100, blank=True)

    # ── Service survey fields ──────────────────────────────────────────────
    agency_name = models.CharField('نام نمایندگی مورد نظر', max_length=200, blank=True)
    service_quality = models.CharField(
        'کیفیت خدمات ارائه شده', max_length=20, choices=RATING_CHOICES, blank=True)
    staff_behavior = models.CharField(
        'نحوه برخورد پرسنل', max_length=20, choices=RATING_CHOICES, blank=True)
    service_duration = models.CharField(
        'مدت زمان ارائه خدمات', max_length=20, choices=RATING_CHOICES, blank=True)
    staff_knowledge = models.CharField(
        'ارزیابی دانش فنی پرسنل', max_length=20, choices=RATING_CHOICES, blank=True)
    service_cost = models.CharField(
        'ارزیابی هزینه ارائه خدمات', max_length=20, choices=RATING_CHOICES, blank=True)
    info_method = models.CharField(
        'نحوه اطلاع‌رسانی', max_length=20, choices=RATING_CHOICES, blank=True)

    # ── Product survey — product info (feedback) ──────────────────────────
    product_model = models.CharField('مدل کالا', max_length=200, blank=True)
    purchase_date_survey = models.DateField('تاریخ خرید', null=True, blank=True)
    serial_number_survey = models.CharField('شماره سریال', max_length=120, blank=True)
    feedback_message = models.TextField('متن انتقاد و پیشنهادات', blank=True)

    # ── Product survey fields ──────────────────────────────────────────────
    national_id = models.CharField('کدملی', max_length=20, blank=True)
    purchased_recently = models.CharField(
        'خرید در ۶ ماه اخیر',
        max_length=5,
        choices=[('yes', 'بله'), ('no', 'خیر')],
        blank=True,
    )
    selected_item = models.CharField('آیتم انتخابی', max_length=200, blank=True)
    future_purchase = models.CharField('قصد خرید در آینده', max_length=200, blank=True)
    current_product_usage = models.CharField(
        'محصول فعلی در منزل', max_length=200, blank=True)
    home_appliance_models = models.CharField(
        'مدل لوازم خانگی در منزل', max_length=300, blank=True)
    top_brands = models.CharField(
        'سه برند محبوب', max_length=300, blank=True)
    recommend = models.CharField(
        'توصیه به دیگران',
        max_length=5,
        choices=[('yes', 'بله'), ('no', 'خیر')],
        blank=True,
    )
    best_iranian_brand = models.CharField(
        'موفق‌ترین برند ایرانی', max_length=200, blank=True)
    product_suggestion = models.CharField(
        'پیشنهاد محصول برای تکمیل سبد', max_length=300, blank=True)

    # Common feedback
    comment = models.TextField('پیشنهادات / نظر', blank=True)

    # Legacy — kept for old records
    rating = models.PositiveSmallIntegerField('امتیاز کلی (۱ تا ۵)', null=True, blank=True)
    related_request = models.ForeignKey(
        ServiceRequest, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='surveys', verbose_name='درخواست مرتبط',
    )

    created_at = models.DateTimeField('تاریخ', auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'نظرسنجی'
        verbose_name_plural = 'نظرسنجی‌ها'

    def __str__(self):
        return f'{self.get_survey_type_display()} — {self.full_name or "ناشناس"}'


class Feedback(models.Model):
    """انتقادات و پیشنهادات"""
    full_name = models.CharField('نام و نام خانوادگی', max_length=120)
    phone = models.CharField('شماره تماس', max_length=20)
    product_model = models.CharField('مدل کالا', max_length=200, blank=True)
    purchase_date = models.DateField('تاریخ خرید', null=True, blank=True)
    serial_number = models.CharField('شماره سریال', max_length=120, blank=True)
    email = models.EmailField('آدرس ایمیل', blank=True)
    message = models.TextField('متن انتقاد و پیشنهادات')
    is_read = models.BooleanField('خوانده شده', default=False)
    created_at = models.DateTimeField('تاریخ', auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'انتقاد / پیشنهاد'
        verbose_name_plural = 'انتقادات و پیشنهادات'

    def __str__(self):
        return f'{self.full_name} - {self.product_model or "بدون مدل"}'


class ContactMessage(models.Model):
    """Generic contact-us message."""
    full_name = models.CharField('نام', max_length=120)
    phone = models.CharField('شماره تماس', max_length=20, blank=True)
    email = models.EmailField('ایمیل', blank=True)
    subject = models.CharField('موضوع', max_length=200, blank=True)
    message = models.TextField('پیام')
    is_read = models.BooleanField('خوانده شده', default=False)
    created_at = models.DateTimeField('تاریخ', auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'پیام تماس'
        verbose_name_plural = 'پیام‌های تماس'

    def __str__(self):
        return f'{self.full_name} - {self.subject or "بدون موضوع"}'
