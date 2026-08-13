from rest_framework import serializers
from .models import Agency, AgencySalesRequest, AgencyServiceRequest


class AgencySerializer(serializers.ModelSerializer):
    province_display = serializers.CharField(source='get_province_display', read_only=True)
    agency_type_display = serializers.CharField(source='get_agency_type_display', read_only=True)

    class Meta:
        model = Agency
        fields = ['id', 'province', 'province_display', 'city', 'name', 'address', 'phone', 'code', 'agency_type', 'agency_type_display', 'is_active']


class AgencySalesRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgencySalesRequest
        fields = ['id', 'full_name', 'store_name', 'province', 'city', 'phone_landline', 'phone_mobile', 'ownership', 'experience_years', 'store_address', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at', 'is_read']


class AgencyServiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgencyServiceRequest
        fields = ['id', 'full_name', 'workshop_name', 'province', 'city', 'education', 'technician_count', 'previous_brands', 'facilities', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at', 'is_read']
