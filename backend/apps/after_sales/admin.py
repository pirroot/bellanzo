from django.contrib import admin
from django.utils.html import format_html
from .models import ServiceRequest, Survey, Feedback, ContactMessage


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ['tracking_code', 'full_name', 'phone', 'request_type',
                    'product_name', 'status', 'has_attachment', 'created_at']
    list_filter = ['status', 'request_type', 'created_at']
    search_fields = ['tracking_code', 'full_name', 'phone', 'product_name', 'serial_number']
    list_editable = ['status']
    readonly_fields = ['tracking_code', 'created_at', 'updated_at', 'attachment_preview']
    date_hierarchy = 'created_at'

    @admin.display(description='پیوست', boolean=True)
    def has_attachment(self, obj):
        return bool(obj.attachment)

    @admin.display(description='پیوست')
    def attachment_preview(self, obj):
        if obj.attachment:
            return format_html(
                '<a href="{}" target="_blank">دانلود / مشاهده فایل پیوست</a>',
                obj.attachment.url,
            )
        return '—'


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'survey_type', 'phone', 'city', 'created_at']
    list_filter = ['survey_type', 'created_at', 'service_quality']
    search_fields = ['full_name', 'phone', 'agency_name']

    fieldsets = (
        ('اطلاعات کلی', {
            'fields': ('survey_type', 'full_name', 'phone', 'email', 'city'),
        }),
        ('نظرسنجی خدمات', {
            'fields': (
                'agency_name', 'service_quality', 'staff_behavior',
                'service_duration', 'staff_knowledge', 'service_cost', 'info_method',
            ),
            'classes': ('collapse',),
        }),
        ('نظرسنجی محصول', {
            'fields': (
                'national_id', 'purchased_recently', 'selected_item',
                'future_purchase', 'current_product_usage', 'home_appliance_models',
                'top_brands', 'recommend', 'best_iranian_brand', 'product_suggestion',
            ),
            'classes': ('collapse',),
        }),
        ('پیشنهادات و امتیاز', {
            'fields': ('comment', 'rating', 'related_request'),
        }),
    )


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone', 'product_model', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    list_editable = ['is_read']
    search_fields = ['full_name', 'phone', 'email', 'product_model', 'message']
    readonly_fields = ['created_at']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'subject', 'phone', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['full_name', 'phone', 'email', 'subject', 'message']
    list_editable = ['is_read']
