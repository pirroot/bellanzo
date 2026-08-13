import random
from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q

from .models import OTP
from .serializers import SendOTPSerializer, VerifyOTPSerializer

User = get_user_model()


# ==================== Serializer ====================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone', 'username', 'full_name', 'email', 'is_staff', 'is_superuser', 'date_joined']


# ==================== OTP ====================
@api_view(['POST'])
def send_otp(request):
    serializer = SendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    phone = serializer.validated_data['phone']
    code = str(random.randint(10000, 99999))

    OTP.objects.filter(phone=phone).delete()
    OTP.objects.create(phone=phone, code=code)

    print(f"OTP for {phone}: {code}")

    return Response({'message': 'کد تایید ارسال شد'})


@api_view(['POST'])
def verify_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    phone = serializer.validated_data['phone']
    code = serializer.validated_data['code']

    try:
        otp = OTP.objects.filter(phone=phone, code=code, is_used=False).latest('created_at')
    except OTP.DoesNotExist:
        return Response({'detail': 'کد نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

    if otp.created_at < timezone.now() - timedelta(minutes=2):
        return Response({'detail': 'کد منقضی شده است'}, status=status.HTTP_400_BAD_REQUEST)

    otp.is_used = True
    otp.save()

    user, created = User.objects.get_or_create(
        phone=phone,
        defaults={'username': phone, 'full_name': ''}
    )

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'phone': user.phone,
            'full_name': user.full_name,
        }
    })


# ==================== Login ====================
@api_view(['POST'])
def login_with_phone_or_username(request):
    """Login with phone OR username"""
    phone = request.data.get('phone')
    username = request.data.get('username')
    password = request.data.get('password')

    if not password:
        return Response({'detail': 'رمز عبور الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    if phone:
        user = User.objects.filter(phone=phone).first()
    elif username:
        user = User.objects.filter(username=username).first()
    else:
        return Response({'detail': 'شماره موبایل یا نام کاربری الزامی است'}, status=status.HTTP_400_BAD_REQUEST)

    if not user:
        return Response({'detail': 'کاربری با این مشخصات یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

    if not user.check_password(password):
        return Response({'detail': 'رمز عبور اشتباه است'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'phone': user.phone,
            'username': user.username,
            'full_name': user.full_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }
    })


# ==================== Profile ====================
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile (full_name only)"""
    user = request.user
    full_name = request.data.get('full_name')

    if full_name:
        user.full_name = full_name
        user.save()

    return Response({
        'id': user.id,
        'phone': user.phone,
        'username': user.username,
        'full_name': user.full_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    })


# ==================== Admin Users ====================
class AdminUserListView(generics.ListAPIView):
    """Admin: list all users"""
    permission_classes = [IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
