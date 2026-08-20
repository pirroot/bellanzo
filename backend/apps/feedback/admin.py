from django.contrib import admin
from .models import Feedback

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['full_name', 'phone', 'message']
