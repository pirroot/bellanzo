from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import SiteSettingView, PageViewSet, HeroSlideViewSet

router = DefaultRouter()
router.register('pages', PageViewSet, basename='page')
router.register('hero-slides', HeroSlideViewSet, basename='hero-slide')

urlpatterns = [
    path('settings/', SiteSettingView.as_view(), name='site-settings'),

] + router.urls
