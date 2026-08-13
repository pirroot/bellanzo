from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    phone = models.CharField(max_length=11, unique=True, verbose_name='شماره موبایل')
    full_name = models.CharField(max_length=120, blank=True, verbose_name='نام کامل')

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربران'

    def __str__(self):
        return self.phone


class OTP(models.Model):
    phone = models.CharField(max_length=11)
    code = models.CharField(max_length=5)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.phone} - {self.code}'
