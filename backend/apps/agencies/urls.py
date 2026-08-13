from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    AgencyViewSet,
    AgencySalesRequestCreateView, AgencyServiceRequestCreateView,
    AgencySalesRequestListView, AgencyServiceRequestListView,
    AgencySalesRequestMarkReadView, AgencyServiceRequestMarkReadView,
)

router = DefaultRouter()
router.register('agencies', AgencyViewSet, basename='agency')

urlpatterns = router.urls + [
    path('agency-requests/sales/', AgencySalesRequestCreateView.as_view(), name='agency-sales-request'),
    path('agency-requests/service/', AgencyServiceRequestCreateView.as_view(), name='agency-service-request'),
    path('agency-requests/sales/list/', AgencySalesRequestListView.as_view(), name='agency-sales-list'),
    path('agency-requests/service/list/', AgencyServiceRequestListView.as_view(), name='agency-service-list'),
    path('agency-requests/sales/<int:pk>/read/', AgencySalesRequestMarkReadView.as_view(), name='agency-sales-read'),
    path('agency-requests/service/<int:pk>/read/', AgencyServiceRequestMarkReadView.as_view(), name='agency-service-read'),
]
