from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import Faq
from .serializers import FaqSerializer

class FaqViewSet(viewsets.ModelViewSet):
    queryset = Faq.objects.all()
    serializer_class = FaqSerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Faq.objects.all()
        return Faq.objects.filter(is_active=True)
