from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import SiteSetting, Page, HeroSlide
from .serializers import SiteSettingSerializer, PageSerializer, HeroSlideSerializer


class SiteSettingView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get(self, request):
        obj = SiteSetting.objects.first()
        if not obj:
            obj = SiteSetting.objects.create()
        return Response(SiteSettingSerializer(obj, context={'request': request}).data)

    def patch(self, request):
        obj = SiteSetting.objects.first()
        if not obj:
            obj = SiteSetting.objects.create()
        # Handle explicit image clearing
        if request.data.get('clear_logo') == 'true':
            obj.logo.delete(save=False)
            obj.logo = None
        if request.data.get('clear_hero_bg_image') == 'true':
            obj.hero_bg_image.delete(save=False)
            obj.hero_bg_image = None
        if request.data.get('clear_hero_product_image') == 'true':
            obj.hero_product_image.delete(save=False)
            obj.hero_product_image = None
        s = SiteSettingSerializer(obj, data=request.data, partial=True, context={'request': request})
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)


class PageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Page.objects.filter(is_published=True)
    serializer_class = PageSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class HeroSlideViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HeroSlide.objects.filter(is_active=True)
    serializer_class = HeroSlideSerializer
    permission_classes = [AllowAny]
    pagination_class = None


