from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from .models import BusinessProfile, TaxRate, Client, Invoice, RecurringTemplate, CreditNote
from .serializers import (
    BusinessProfileSerializer, TaxRateSerializer, ClientSerializer, 
    InvoiceSerializer, RecurringTemplateSerializer, CreditNoteSerializer
)
from .utils import generate_invoice_pdf
from .email_service import send_invoice_email

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

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        try:
            pdf_bytes = generate_invoice_pdf(invoice)
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Invoice-{invoice.invoice_number}.pdf"'
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        invoice = self.get_object()
        try:
            pdf_bytes = generate_invoice_pdf(invoice)
            send_invoice_email(invoice, pdf_bytes)
            
            # Update status
            if invoice.status == 'draft':
                invoice.status = 'sent'
                invoice.save()
                
            return Response({"message": "Email sent successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def void(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status == 'voided':
            return Response({"error": "Invoice is already voided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create Credit Note
            CreditNote.objects.create(
                invoice=invoice,
                user=request.user,
                credit_note_number=f"CN-{invoice.invoice_number}",
                amount=invoice.total,
                reason=request.data.get('reason', 'Invoice voided by user')
            )
            
            # Update Invoice Status
            invoice.status = 'voided'
            invoice.save()
            
            return Response({"message": "Invoice voided and credit note created"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RecurringTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecurringTemplate.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
