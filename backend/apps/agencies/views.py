from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import Agency, AgencySalesRequest, AgencyServiceRequest
from .serializers import AgencySerializer, AgencySalesRequestSerializer, AgencyServiceRequestSerializer


class AgencyViewSet(viewsets.ModelViewSet):
    serializer_class = AgencySerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Agency.objects.all() if (self.request.user and self.request.user.is_staff) else Agency.objects.filter(is_active=True)
        province = self.request.query_params.get('province')
        if province:
            qs = qs.filter(province=province)
        return qs


class AgencySalesRequestCreateView(generics.CreateAPIView):
    serializer_class = AgencySalesRequestSerializer
    permission_classes = [AllowAny]


class AgencyServiceRequestCreateView(generics.CreateAPIView):
    serializer_class = AgencyServiceRequestSerializer
    permission_classes = [AllowAny]


class AgencySalesRequestListView(generics.ListAPIView):
    serializer_class = AgencySalesRequestSerializer
    permission_classes = [IsAdminUser]
    queryset = AgencySalesRequest.objects.all()
    pagination_class = None


class AgencyServiceRequestListView(generics.ListAPIView):
    serializer_class = AgencyServiceRequestSerializer
    permission_classes = [IsAdminUser]
    queryset = AgencyServiceRequest.objects.all()
    pagination_class = None


class AgencySalesRequestMarkReadView(generics.UpdateAPIView):
    serializer_class = AgencySalesRequestSerializer
    permission_classes = [IsAdminUser]
    queryset = AgencySalesRequest.objects.all()

    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.is_read = True
        obj.save(update_fields=['is_read'])
        return Response(self.get_serializer(obj).data)


class AgencyServiceRequestMarkReadView(generics.UpdateAPIView):
    serializer_class = AgencyServiceRequestSerializer
    permission_classes = [IsAdminUser]
    queryset = AgencyServiceRequest.objects.all()

    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.is_read = True
        obj.save(update_fields=['is_read'])
        return Response(self.get_serializer(obj).data)
