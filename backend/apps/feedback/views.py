from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import Feedback
from .serializers import FeedbackSerializer

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Feedback.objects.all()
        return Feedback.objects.filter(is_approved=True)  # اگر تایید میخوای

    def perform_create(self, serializer):
        serializer.save()
