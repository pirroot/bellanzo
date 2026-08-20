from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteSettingView, PageViewSet, HeroSlideViewSet, upload_page_header_image

router = DefaultRouter()
router.register(r'pages', PageViewSet, basename='pages')
router.register(r'hero-slides', HeroSlideViewSet, basename='hero-slides')

urlpatterns = [
    path('settings/', SiteSettingView.as_view(), name='site-settings'),
    path('', include(router.urls)),
    path('upload/page-header/', upload_page_header_image, name='upload-page-header'),
]
