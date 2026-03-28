from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BusinessProfileViewSet, TaxRateViewSet, ClientViewSet, InvoiceViewSet

router = DefaultRouter()
router.register(r'business-profile', BusinessProfileViewSet, basename='business-profile')
router.register(r'tax-rates', TaxRateViewSet, basename='tax-rates')
router.register(r'clients', ClientViewSet, basename='clients')
router.register(r'invoices', InvoiceViewSet, basename='invoices')

urlpatterns = [
    path('', include(router.urls)),
]