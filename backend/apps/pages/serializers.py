from rest_framework import serializers
from .models import SiteSetting, Page, HeroSlide


class SiteSettingSerializer(serializers.ModelSerializer):
    hero_bg_image = serializers.ImageField(required=False, allow_null=True, use_url=True)
    hero_product_image = serializers.ImageField(required=False, allow_null=True, use_url=True)

    class Meta:
        model = SiteSetting
        fields = [
            'brand_name', 'slogan', 'logo', 'about',
            'phone', 'email', 'address',
            'instagram', 'telegram', 'whatsapp', 'linkedin',
            'hero_badge', 'hero_title_line1', 'hero_title_line2',
            'hero_subtitle', 'hero_bg_image', 'hero_product_image',
            'hero_cta_label', 'hero_cta_link',
            'shipping_cost', 'free_shipping_threshold',
            'maintenance_mode',
            'page_headers',
        ]


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ['id', 'title', 'slug', 'body', 'is_published', 'updated_at']


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = ['id', 'title', 'subtitle', 'image', 'cta_label', 'cta_link', 'order', 'is_active']
