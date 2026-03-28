from rest_framework import serializers
from .models import User, BusinessProfile, TaxRate, Client, Invoice, InvoiceItem, Payment, RecurringTemplate
from decimal import Decimal
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'onboarding_complete', 'stripe_customer_id', 'created_at']
        read_only_fields = ['id', 'created_at']

class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfile
        fields = '__all__'
        read_only_fields = ['id', 'user', 'updated_at']

class TaxRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRate
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'late_payment_count', 'avg_days_to_pay']

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'tax_rate', 'tax_rate_snapshot', 'tax_rate_name_snapshot', 'line_subtotal', 'line_tax_amount', 'line_total', 'sort_order']
        read_only_fields = ['id', 'tax_rate_snapshot', 'tax_rate_name_snapshot', 'line_subtotal', 'line_tax_amount', 'line_total']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['id', 'user', 'subtotal', 'total_tax', 'discount_amount', 'total', 'amount_paid', 'balance_due', 'portal_token', 'portal_token_expires_at', 'stripe_payment_intent_id', 'stripe_payment_link_url', 'sent_at', 'viewed_at', 'paid_at', 'voided_at', 'reminder_count', 'last_reminder_sent_at', 'created_at', 'updated_at']

    def _create_items(self, invoice, items_data):
        subtotal = Decimal('0.00')
        total_tax = Decimal('0.00')
        
        for item_data in items_data:
            quantity = Decimal(str(item_data.get('quantity', 1)))
            unit_price = Decimal(str(item_data.get('unit_price')))
            tax_rate_obj = item_data.get('tax_rate')

            line_subtotal = quantity * unit_price
            line_tax = Decimal('0.00')
            
            tax_rate_snapshot = None
            tax_rate_name_snapshot = None
            if tax_rate_obj:
                tax_rate_snapshot = tax_rate_obj.rate
                tax_rate_name_snapshot = tax_rate_obj.name
                line_tax = line_subtotal * tax_rate_obj.rate
            
            line_total = line_subtotal + line_tax

            InvoiceItem.objects.create(
                invoice=invoice,
                description=item_data.get('description'),
                quantity=quantity,
                unit_price=unit_price,
                tax_rate=tax_rate_obj,
                tax_rate_snapshot=tax_rate_snapshot,
                tax_rate_name_snapshot=tax_rate_name_snapshot,
                line_subtotal=line_subtotal,
                line_tax_amount=line_tax,
                line_total=line_total,
                sort_order=item_data.get('sort_order', 0)
            )

            subtotal += line_subtotal
            total_tax += line_tax
            
        return subtotal, total_tax

    def _calculate_totals(self, invoice, subtotal, total_tax):
        invoice.subtotal = subtotal
        invoice.total_tax = total_tax
        
        discount_amt = Decimal('0.00')
        if invoice.discount_type == 'fixed':
            discount_amt = Decimal(str(invoice.discount_value))
        elif invoice.discount_type == 'percent':
            discount_amt = subtotal * (Decimal(str(invoice.discount_value)) / Decimal('100.00'))
        
        invoice.discount_amount = discount_amt
        invoice.total = subtotal + total_tax - discount_amt
        invoice.balance_due = invoice.total - invoice.amount_paid
        invoice.save()

    def _generate_stripe_payment_link(self, invoice):
        if invoice.total <= 0 or not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY.startswith('sk_test_...'):
            return

        try:
            product = stripe.Product.create(name=f"Invoice {invoice.invoice_number}")
            price = stripe.Price.create(
                product=product.id,
                unit_amount=int(invoice.total * 100),
                currency=invoice.currency.lower(),
            )
            payment_link = stripe.PaymentLink.create(
                line_items=[{"price": price.id, "quantity": 1}],
            )
            invoice.stripe_payment_link_url = payment_link.url
            invoice.save()
        except Exception as e:
            # Real-world apps should log this exception
            pass

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        
        subtotal, total_tax = self._create_items(invoice, items_data)
        self._calculate_totals(invoice, subtotal, total_tax)
        self._generate_stripe_payment_link(invoice)
        
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            subtotal, total_tax = self._create_items(instance, items_data)
            self._calculate_totals(instance, subtotal, total_tax)
            self._generate_stripe_payment_link(instance)
        
        return instance

class RecurringTemplateSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = RecurringTemplate
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']

class CreditNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditNote
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']
