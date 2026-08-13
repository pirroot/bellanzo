from django.urls import path
from .views import (
    send_otp, verify_otp, login_with_phone_or_username,
    update_profile, AdminUserListView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/otp/send/', send_otp, name='send_otp'),
    path('auth/otp/verify/', verify_otp, name='verify_otp'),
    path('auth/login/', login_with_phone_or_username, name='login'),
    path('auth/profile/', update_profile, name='update_profile'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),  # <--- اضافه شد
]
