from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
from .models import SiteSetting, Page, HeroSlide
from .serializers import SiteSettingSerializer, PageSerializer, HeroSlideSerializer


class SiteSettingView(APIView):
    """Singleton settings - GET and PATCH only"""

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_object(self):
        obj, created = SiteSetting.objects.get_or_create(id=1)
        return obj

    def get(self, request):
        instance = self.get_object()
        serializer = SiteSettingSerializer(instance)
        return Response(serializer.data)

    def patch(self, request):
        instance = self.get_object()
        serializer = SiteSettingSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


class HeroSlideViewSet(viewsets.ModelViewSet):
    queryset = HeroSlide.objects.filter(is_active=True)
    serializer_class = HeroSlideSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_page_header_image(request):
    file = request.FILES.get('image')
    if not file:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    ext = os.path.splitext(file.name)[1]
    filename = f'page-headers/{uuid.uuid4().hex}{ext}'
    path = default_storage.save(filename, ContentFile(file.read()))
    url = f'/media/{path}'

    return Response({'url': url}, status=status.HTTP_200_OK)
