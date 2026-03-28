from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import BusinessProfile, TaxRate, Client, Invoice
from .serializers import BusinessProfileSerializer, TaxRateSerializer, ClientSerializer, InvoiceSerializer

class BusinessProfileViewSet(viewsets.ModelViewSet):
    serializer_class = BusinessProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BusinessProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaxRateViewSet(viewsets.ModelViewSet):
    serializer_class = TaxRateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TaxRate.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Client.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)