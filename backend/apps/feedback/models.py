from django.db import models

class Feedback(models.Model):
    full_name = models.CharField('نام و نام خانوادگی', max_length=120)
    phone = models.CharField('شماره تماس', max_length=20)
    email = models.EmailField('ایمیل', blank=True)
    product_model = models.CharField('مدل کالا', max_length=200, blank=True)

    RATING_CHOICES = [(i, f'{i} ستاره') for i in range(1, 6)]
    rating = models.PositiveSmallIntegerField('امتیاز', choices=RATING_CHOICES, default=5)

    message = models.TextField('متن نظر')
    created_at = models.DateTimeField('تاریخ', auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'نظر'
        verbose_name_plural = 'نظرات'

    def __str__(self):
        return f'{self.full_name} - {self.rating}⭐'
