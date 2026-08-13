from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.contrib.auth import get_user_model

from apps.pages.models import SiteSetting, HeroSlide, Page
from apps.catalog.models import Category, Product

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed initial brand data: settings, categories, 10 sample products, slides, admin user.'

    def handle(self, *args, **options):
        # --- Admin user ---
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin12345')
            self.stdout.write(self.style.SUCCESS('Superuser created: admin / admin12345'))

        # --- Site settings ---
        if not SiteSetting.objects.exists():
            SiteSetting.objects.create(
                brand_name='برند ما',
                slogan='کیفیت، اعتماد، خدمات پس از فروش',
                about='ما با تمرکز بر کیفیت و رضایت مشتری، تجربه‌ای متفاوت از خرید و خدمات پس از فروش ارائه می‌دهیم.',
                phone='۰۲۱-۱۲۳۴۵۶۷۸',
                email='info@brand.ir',
                address='تهران، خیابان نمونه، پلاک ۱۰',
                instagram='https://instagram.com',
                telegram='https://telegram.org',
            )
            self.stdout.write(self.style.SUCCESS('Site settings created.'))

        # --- Categories ---
        cat_names = ['لوازم خانگی', 'الکترونیک', 'صوتی و تصویری', 'لوازم جانبی']
        cats = []
        for i, name in enumerate(cat_names):
            cat, _ = Category.objects.get_or_create(
                slug=slugify(name, allow_unicode=True),
                defaults={'name': name, 'order': i},
            )
            cats.append(cat)

        # --- Hero slides ---
        if not HeroSlide.objects.exists():
            HeroSlide.objects.create(
                title='تجربه‌ای نو از کیفیت',
                subtitle='محصولاتی که می‌توانید به آن‌ها اعتماد کنید',
                cta_label='مشاهده محصولات', cta_link='/products', order=0,
            )
            HeroSlide.objects.create(
                title='خدمات پس از فروش حرفه‌ای',
                subtitle='پشتیبانی سریع و مطمئن در کنار شما',
                cta_label='ثبت درخواست', cta_link='/services', order=1,
            )

        # --- 10 sample products ---
        if Product.objects.count() < 10:
            samples = [
                ('جاروبرقی هوشمند مدل X', 'لوازم خانگی', 'مکش قدرتمند و کم‌صدا'),
                ('یخچال ساید بای ساید', 'لوازم خانگی', 'فناوری نوفراست و کم‌مصرف'),
                ('تلویزیون ۵۵ اینچ ۴K', 'صوتی و تصویری', 'کیفیت تصویر فوق‌العاده'),
                ('هدفون بی‌سیم پرو', 'صوتی و تصویری', 'حذف نویز فعال'),
                ('لپ‌تاپ اولترابوک', 'الکترونیک', 'سبک، سریع و قدرتمند'),
                ('گوشی هوشمند نسل جدید', 'الکترونیک', 'دوربین حرفه‌ای و باتری قوی'),
                ('ماشین لباسشویی ۸ کیلو', 'لوازم خانگی', 'برنامه‌های شست‌وشوی متنوع'),
                ('اسپیکر بلوتوثی', 'لوازم جانبی', 'صدای فراگیر و ضدآب'),
                ('ساعت هوشمند', 'لوازم جانبی', 'پایش سلامت و ورزش'),
                ('مایکروویو دیجیتال', 'لوازم خانگی', 'پخت سریع و یکنواخت'),
            ]
            cat_map = {c.name: c for c in cats}
            for i, (name, cat_name, short) in enumerate(samples):
                Product.objects.get_or_create(
                    slug=slugify(name, allow_unicode=True),
                    defaults={
                        'name': name,
                        'category': cat_map.get(cat_name),
                        'short_description': short,
                        'description': f'{name} با بهترین کیفیت و گارانتی معتبر. {short}.',
                        'features': ['گارانتی ۱۸ ماهه', 'خدمات پس از فروش سراسری', 'کیفیت تضمینی'],
                        'is_featured': i < 4,
                    },
                )
            self.stdout.write(self.style.SUCCESS('10 sample products created.'))

        # --- Placeholder pages ---
        for title, slug in [('نمایندگی‌ها', 'agencies'), ('درباره ما', 'about')]:
            Page.objects.get_or_create(
                slug=slug,
                defaults={'title': title, 'body': 'این بخش به‌زودی تکمیل می‌شود.', 'is_published': True},
            )

        self.stdout.write(self.style.SUCCESS('Seed completed.'))
