from django.contrib import admin
from .models import Agency


@admin.register(Agency)
class AgencyAdmin(admin.ModelAdmin):
    list_display = ['name', 'province', 'city', 'phone', 'is_active']
    list_filter = ['province', 'is_active']
    search_fields = ['name', 'city', 'address']
