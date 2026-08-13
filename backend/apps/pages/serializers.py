from rest_framework import serializers
from .models import SiteSetting, Page, HeroSlide


class SiteSettingSerializer(serializers.ModelSerializer):
    hero_bg_image = serializers.ImageField(required=False, allow_null=True, use_url=True)
    hero_product_image = serializers.ImageField(required=False, allow_null=True, use_url=True)

    class Meta:
        model = SiteSetting
        fields = '__all__'


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ['id', 'title', 'slug', 'body', 'is_published', 'updated_at']


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = ['id', 'title', 'subtitle', 'image', 'cta_label', 'cta_link', 'order']
