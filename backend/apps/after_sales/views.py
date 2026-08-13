from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import ServiceRequest, Survey, Feedback, ContactMessage
from .serializers import (
    ServiceRequestCreateSerializer, ServiceRequestStatusSerializer,
    ServiceRequestAdminSerializer, SurveySerializer,
    FeedbackSerializer, ContactMessageSerializer,
)


class ServiceRequestViewSet(viewsets.ModelViewSet):
    """
    Public: create (POST) + track by code (GET /track/?code=XXXX).
    Admin (authenticated staff): full list / update / delete.
    """
    queryset = ServiceRequest.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'track']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'create':
            return ServiceRequestCreateSerializer
        if self.action == 'track':
            return ServiceRequestStatusSerializer
        return ServiceRequestAdminSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(
            {'tracking_code': obj.tracking_code,
             'message': 'درخواست شما با موفقیت ثبت شد.'},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def track(self, request):
        code = request.query_params.get('code', '').strip().upper()
        obj = ServiceRequest.objects.filter(tracking_code=code).first()
        if not obj:
            return Response({'detail': 'کد پیگیری یافت نشد.'},
                            status=status.HTTP_404_NOT_FOUND)
        return Response(ServiceRequestStatusSerializer(obj).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def stats(self, request):
        qs = ServiceRequest.objects
        data = {
            'total': qs.count(),
            'new': qs.filter(status=ServiceRequest.Status.NEW).count(),
            'in_progress': qs.filter(status=ServiceRequest.Status.IN_PROGRESS).count(),
            'resolved': qs.filter(status=ServiceRequest.Status.RESOLVED).count(),
            'surveys': Survey.objects.count(),
            'feedbacks': Feedback.objects.filter(is_read=False).count(),
            'unread_messages': ContactMessage.objects.filter(is_read=False).count(),
        }
        return Response(data)


class SurveyViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,
                    viewsets.GenericViewSet):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]


class FeedbackViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,
                      mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]
