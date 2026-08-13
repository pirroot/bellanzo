from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CartViewSet, OrderViewSet, PaymentViewSet,
    AdminOrderViewSet, OrderHistoryView
)

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'payments', PaymentViewSet, basename='payments')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-orders')

urlpatterns = [
    path('', include(router.urls)),
    path('orders/history/', OrderHistoryView.as_view(), name='order-history'),
]
