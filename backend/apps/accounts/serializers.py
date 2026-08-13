from rest_framework import serializers
from .models import User, OTP


class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)

    def validate_phone(self, value):
        if not value.startswith('09') or len(value) != 11:
            raise serializers.ValidationError("شماره موبایل معتبر نیست")
        return value


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    code = serializers.CharField(max_length=5)
