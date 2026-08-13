from rest_framework import serializers
from .models import ServiceRequest, Survey, Feedback, ContactMessage


class ServiceRequestCreateSerializer(serializers.ModelSerializer):
    """Public: customers submit a request."""
    class Meta:
        model = ServiceRequest
        fields = [
            'full_name', 'phone', 'email', 'request_type',
            'product_name', 'serial_number', 'purchase_date',
            'description', 'attachment',
        ]


class ServiceRequestStatusSerializer(serializers.ModelSerializer):
    """Public: track a request by code (read-only, safe subset)."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'tracking_code', 'full_name', 'request_type_display',
            'product_name', 'status', 'status_display',
            'admin_note', 'created_at', 'updated_at',
        ]


class ServiceRequestAdminSerializer(serializers.ModelSerializer):
    """Admin panel: full record + status/note editing."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRequest
        fields = '__all__'
        read_only_fields = ['tracking_code', 'created_at', 'updated_at']

    def get_attachment_url(self, obj):
        if not obj.attachment:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.attachment.url)
        return obj.attachment.url


class SurveySerializer(serializers.ModelSerializer):
    survey_type_display = serializers.CharField(source='get_survey_type_display', read_only=True)

    class Meta:
        model = Survey
        fields = [
            'id', 'survey_type', 'survey_type_display',
            'full_name', 'phone', 'email', 'city',
            # service
            'agency_name', 'service_quality', 'staff_behavior',
            'service_duration', 'staff_knowledge', 'service_cost', 'info_method',
            # product — product info
            'product_model', 'purchase_date_survey', 'serial_number_survey', 'feedback_message',
            # product — survey
            'national_id', 'purchased_recently', 'selected_item',
            'future_purchase', 'current_product_usage', 'home_appliance_models',
            'top_brands', 'recommend', 'best_iranian_brand', 'product_suggestion',
            # common
            'comment', 'rating', 'related_request', 'created_at',
        ]
        read_only_fields = ['created_at']


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            'id', 'full_name', 'phone', 'product_model',
            'purchase_date', 'serial_number', 'email',
            'message', 'is_read', 'created_at',
        ]
        read_only_fields = ['is_read', 'created_at']


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'full_name', 'phone', 'email', 'subject', 'message', 'is_read', 'created_at']
        read_only_fields = ['is_read', 'created_at']
