from django.contrib import admin
from .models import Faq

@admin.register(Faq)
class FaqAdmin(admin.ModelAdmin):
    list_display = ['question', 'order', 'is_active', 'created_at']
    list_editable = ['order', 'is_active']
    search_fields = ['question', 'answer']
