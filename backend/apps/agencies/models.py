from django.db import models

PROVINCES = [
    ('tehran', 'تهران'),
    ('alborz', 'البرز'),
    ('isfahan', 'اصفهان'),
    ('fars', 'فارس'),
    ('khorasan-razavi', 'خراسان رضوی'),
    ('azerbaijan-east', 'آذربایجان شرقی'),
    ('azerbaijan-west', 'آذربایجان غربی'),
    ('khuzestan', 'خوزستان'),
    ('mazandaran', 'مازندران'),
    ('gilan', 'گیلان'),
    ('kermanshah', 'کرمانشاه'),
    ('golestan', 'گلستان'),
    ('semnan', 'سمنان'),
    ('yazd', 'یزد'),
    ('zanjan', 'زنجان'),
    ('qazvin', 'قزوین'),
    ('qom', 'قم'),
    ('markazi', 'مرکزی'),
    ('hamadan', 'همدان'),
    ('kurdistan', 'کردستان'),
    ('lorestan', 'لرستان'),
    ('ilam', 'ایلام'),
    ('chahar-mahaal-bakhtiari', 'چهارمحال بختیاری'),
    ('kohgiluyeh-boyer-ahmad', 'کهگیلویه و بویراحمد'),
    ('bushehr', 'بوشهر'),
    ('hormozgan', 'هرمزگان'),
    ('sistan-baluchestan', 'سیستان و بلوچستان'),
    ('ardabil', 'اردبیل'),
    ('khorasan-north', 'خراسان شمالی'),
    ('khorasan-south', 'خراسان جنوبی'),
    ('kerman', 'کرمان'),
]


AGENCY_TYPES = [
    ('sales', 'نمایندگی فروش'),
    ('service', 'نمایندگی خدمات'),
]


class Agency(models.Model):
    province = models.CharField('استان', max_length=60, choices=PROVINCES)
    city = models.CharField('شهر', max_length=100)
    name = models.CharField('نام نمایندگی', max_length=200)
    address = models.TextField('آدرس')
    phone = models.CharField('تلفن', max_length=60)
    code = models.CharField('کد نمایندگی', max_length=30, blank=True)
    agency_type = models.CharField('نوع نمایندگی', max_length=10, choices=AGENCY_TYPES, default='sales')
    is_active = models.BooleanField('فعال', default=True)

    class Meta:
        ordering = ['province', 'city']
        verbose_name = 'نمایندگی'
        verbose_name_plural = 'نمایندگی‌ها'

    def __str__(self):
        return f'{self.name} — {self.city}'


class AgencySalesRequest(models.Model):
    full_name = models.CharField('نام و نام خانوادگی', max_length=150)
    store_name = models.CharField('نام فروشگاه / گالری', max_length=200)
    province = models.CharField('استان', max_length=100)
    city = models.CharField('شهر', max_length=100)
    phone_landline = models.CharField('تلفن ثابت', max_length=20, blank=True)
    phone_mobile = models.CharField('تلفن همراه', max_length=20)
    ownership = models.CharField('وضعیت مالکیت', max_length=20,
                                  choices=[('owner', 'مالک'), ('tenant', 'مستأجر')])
    experience_years = models.PositiveSmallIntegerField('سابقه فعالیت (سال)', default=0)
    store_address = models.TextField('آدرس دقیق فروشگاه')
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField('خوانده شده', default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'درخواست نمایندگی فروش'
        verbose_name_plural = 'درخواست‌های نمایندگی فروش'

    def __str__(self):
        return f'{self.full_name} — {self.city}'


class AgencyServiceRequest(models.Model):
    full_name = models.CharField('نام و نام خانوادگی', max_length=150)
    workshop_name = models.CharField('نام تعمیرگاه / واحد خدماتی', max_length=200)
    province = models.CharField('استان', max_length=100)
    city = models.CharField('شهر', max_length=100)
    education = models.CharField('مدرک تحصیلی یا فنی‌وحرفه‌ای', max_length=200, blank=True)
    technician_count = models.PositiveSmallIntegerField('تعداد تکنسین‌های فعال', default=1)
    previous_brands = models.TextField('سابقه همکاری با برندهای دیگر', blank=True)
    facilities = models.TextField('امکانات موجود', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField('خوانده شده', default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'درخواست نمایندگی خدمات'
        verbose_name_plural = 'درخواست‌های نمایندگی خدمات'

    def __str__(self):
        return f'{self.full_name} — {self.city}'
