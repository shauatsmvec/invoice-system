from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from .models import User, Client, Invoice, InvoiceItem, TaxRate
import uuid
import jwt
from django.conf import settings
from decimal import Decimal

class InvoiceTests(APITestCase):
    def setUp(self):
        settings.SUPABASE_JWT_SECRET = 'test_secret'
        settings.STRIPE_SECRET_KEY = 'sk_test_123' # Dummy key to prevent API calls
        
        # Create user
        self.user = User.objects.create(email='test@example.com', full_name='Test User')
        
        # Generate token matching the Supabase format
        payload = {
            'sub': str(self.user.id),
            'email': self.user.email,
            'aud': 'authenticated',
            'user_metadata': {'full_name': self.user.full_name}
        }
        self.token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm='HS256')
        
        self.client_auth = self.client
        self.client_auth.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        
        # Create client
        self.client_record = Client.objects.create(
            user=self.user,
            name='Test Client',
            email='client@example.com'
        )
        
        # Create tax rate
        self.tax_rate = TaxRate.objects.create(
            user=self.user,
            name='GST',
            rate=Decimal('0.1000'),
            type='gst'
        )

    def test_create_invoice_with_calculations(self):
        url = reverse('invoices-list')
        data = {
            'client': self.client_record.id,
            'invoice_number': 'INV-001',
            'issue_date': '2026-03-28',
            'due_date': '2026-04-28',
            'discount_type': 'percent',
            'discount_value': '10.00', # 10% discount on subtotal
            'items': [
                {
                    'description': 'Web Design',
                    'quantity': '10.000',
                    'unit_price': '100.00',
                    'tax_rate': self.tax_rate.id
                },
                {
                    'description': 'Hosting',
                    'quantity': '1.000',
                    'unit_price': '50.00'
                }
            ]
        }
        
        response = self.client_auth.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        
        invoice = Invoice.objects.get(id=response.data['id'])
        
        # Calculations:
        # Item 1: 10 * 100 = 1000. Tax = 100. Total = 1100.
        # Item 2: 1 * 50 = 50. Tax = 0. Total = 50.
        # Subtotal: 1050.
        # Total Tax: 100.
        # Discount (10% of subtotal): 105.
        # Total: 1050 + 100 - 105 = 1045.
        
        self.assertEqual(invoice.subtotal, Decimal('1050.00'))
        self.assertEqual(invoice.total_tax, Decimal('100.00'))
        self.assertEqual(invoice.discount_amount, Decimal('105.00'))
        self.assertEqual(invoice.total, Decimal('1045.00'))
        self.assertEqual(invoice.balance_due, Decimal('1045.00'))