from rest_framework.routers import DefaultRouter
from .views import (
    ServiceRequestViewSet, SurveyViewSet,
    FeedbackViewSet, ContactMessageViewSet,
)

router = DefaultRouter()
router.register('service-requests', ServiceRequestViewSet, basename='service-request')
router.register('surveys', SurveyViewSet, basename='survey')
router.register('feedbacks', FeedbackViewSet, basename='feedback')
router.register('messages', ContactMessageViewSet, basename='contact-message')

urlpatterns = router.urls
