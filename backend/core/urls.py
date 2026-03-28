from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BusinessProfileViewSet, TaxRateViewSet, ClientViewSet, InvoiceViewSet, RecurringTemplateViewSet

router = DefaultRouter()
router.register(r'business-profile', BusinessProfileViewSet, basename='business-profile')
router.register(r'tax-rates', TaxRateViewSet, basename='tax-rates')
router.register(r'clients', ClientViewSet, basename='clients')
router.register(r'invoices', InvoiceViewSet, basename='invoices')
router.register(r'recurring-templates', RecurringTemplateViewSet, basename='recurring-templates')

urlpatterns = [
    path('', include(router.urls)),
]