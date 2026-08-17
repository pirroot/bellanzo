from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Order, OrderItem, Cart, CartItem, Payment
from .serializers import (
    OrderSerializer, OrderListSerializer, CreateOrderSerializer,
    CartSerializer, CartItemSerializer, AddToCartSerializer,
    PaymentSerializer, PaymentVerifySerializer, OrderStatusUpdateSerializer
)
from apps.catalog.models import Product

User = get_user_model()


class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_cart(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        return cart

    def list(self, request):
        cart = self.get_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']

        product = get_object_or_404(Product, id=product_id)
        cart = self.get_cart(request)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response({
            'message': 'محصول با موفقیت به سبد خرید اضافه شد',
            'product': product.name,
            'quantity': cart_item.quantity
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def remove(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_cart(request)
        cart_item = CartItem.objects.filter(cart=cart, product_id=product_id).first()

        if not cart_item:
            return Response(
                {'error': 'محصول در سبد خرید یافت نشد'},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_item.delete()
        return Response({'message': 'محصول از سبد خرید حذف شد'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')

        if not product_id or not quantity:
            return Response(
                {'error': 'product_id و quantity الزامی هستند'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
            if quantity < 0:
                return Response(
                    {'error': 'تعداد باید بزرگتر از 0 باشد'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {'error': 'quantity باید عدد باشد'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_cart(request)
        cart_item = CartItem.objects.filter(cart=cart, product_id=product_id).first()

        if not cart_item:
            return Response(
                {'error': 'محصول در سبد خرید یافت نشد'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check stock
        if quantity > cart_item.product.stock:
            return Response(
                {'error': f'فقط {cart_item.product.stock} عدد موجود است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity == 0:
            cart_item.delete()
            return Response({'message': 'محصول از سبد خرید حذف شد'}, status=status.HTTP_200_OK)

        cart_item.quantity = quantity
        cart_item.save()

        return Response({
            'message': 'تعداد با موفقیت بروزرسانی شد',
            'product': cart_item.product.name,
            'quantity': cart_item.quantity
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart = self.get_cart(request)
        cart.clear()
        return Response({'message': 'سبد خرید خالی شد'}, status=status.HTTP_200_OK)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Order.objects.all()
        return Order.objects.filter(customer=user)

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        return OrderSerializer

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        cart = getattr(user, 'cart', None)

        if not cart or cart.items.count() == 0:
            return Response(
                {'error': 'سبد خرید خالی است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            order = Order.objects.create(
                customer=user,
                full_name=serializer.validated_data['full_name'],
                phone=serializer.validated_data['phone'],
                address=serializer.validated_data['address'],
                postal_code=serializer.validated_data.get('postal_code', ''),
                total=cart.total
            )

            # ایجاد آیتم‌های سفارش با قیمت تخفیف‌خورده
            for cart_item in cart.items.all():
                # قیمت نهایی: اگر تخفیف داره از discount_price استفاده کن
                unit_price = cart_item.product.discount_price if cart_item.product.discount_price > 0 else cart_item.product.price
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    unit_price=unit_price
                )

            cart.clear()

        order_serializer = OrderSerializer(order, context={'request': request})
        return Response(order_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()

        if order.status != Order.Status.PENDING:
            return Response(
                {'error': 'فقط سفارشات در انتظار پرداخت قابل لغو هستند'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = Order.Status.CANCELLED
        order.save()

        return Response({
            'message': 'سفارش با موفقیت لغو شد',
            'status': order.get_status_display()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def payment(self, request, pk=None):
        order = self.get_object()
        payment = Payment.objects.filter(order=order).first()
        if payment:
            serializer = PaymentSerializer(payment)
            return Response(serializer.data)
        return Response({'error': 'پرداختی برای این سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class OrderHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderListSerializer

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)


class PaymentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def initiate(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response(
                {'error': 'order_id الزامی است'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order = get_object_or_404(Order, id=order_id, customer=request.user)

        if order.status != Order.Status.PENDING:
            return Response(
                {'error': 'فقط سفارشات در انتظار پرداخت قابل پرداخت هستند'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'message': 'درگاه پرداخت آماده است',
            'order_id': order.id,
            'amount': order.total,
            'gateway_url': 'https://sandbox.zarinpal.com/pg/StartPay/123456789'
        })

    @action(detail=False, methods=['post'])
    def verify(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data['order_id']
        authority = serializer.validated_data['authority']
        status_param = serializer.validated_data['status']

        order = get_object_or_404(Order, id=order_id, customer=request.user)

        if status_param != 'OK':
            return Response({
                'error': 'پرداخت ناموفق بود',
                'status': status_param
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order.status = Order.Status.PAID
            order.save()

            payment = Payment.objects.create(
                order=order,
                amount=order.total,
                status=Payment.Status.SUCCESS,
                ref_id=authority,
                authority=authority
            )

        return Response({
            'message': 'پرداخت با موفقیت انجام شد',
            'order_id': order.id,
            'ref_id': authority
        }, status=status.HTTP_200_OK)


class AdminOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_permissions(self):
        if not self.request.user.is_superuser:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        status_value = serializer.validated_data['status']
        tracking_code = serializer.validated_data.get('tracking_code', '')

        order.status = status_value
        if tracking_code:
            order.tracking_code = tracking_code
        order.save()

        order_serializer = OrderSerializer(order, context={'request': request})
        return Response(order_serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        return self.update(request, pk=pk)
