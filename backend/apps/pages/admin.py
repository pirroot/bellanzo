from django.contrib import admin
from .models import SiteSetting, Page, HeroSlide


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ['brand_name', 'phone', 'email']

    def has_add_permission(self, request):
        # singleton
        return not SiteSetting.objects.exists()


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'is_published', 'updated_at']
    list_editable = ['is_published']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active']
    list_editable = ['order', 'is_active']
