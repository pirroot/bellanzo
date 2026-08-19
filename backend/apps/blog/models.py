from django.db import models
from django.utils.text import slugify

class Post(models.Model):
    title = models.CharField('عنوان', max_length=200)
    slug = models.SlugField('اسلاگ', unique=True, allow_unicode=True)
    excerpt = models.CharField('خلاصه', max_length=300, blank=True)
    content = models.TextField('محتوا')
    image = models.ImageField('تصویر شاخص', upload_to='blog/', blank=True, null=True)
    video_url = models.URLField('لینک ویدیو', blank=True)
    author = models.CharField('نویسنده', max_length=100, default='بلانزو')
    is_published = models.BooleanField('منتشر شده', default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'پست'
        verbose_name_plural = 'پست‌ها'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)
