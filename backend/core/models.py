import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, id=None, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, id=id or uuid.uuid4(), **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password=password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    onboarding_complete = models.BooleanField(default=False)
    razorpay_customer_id = models.CharField(max_length=255, null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'

class BusinessProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='business_profile', db_index=True)
    business_name = models.CharField(max_length=255)
    tagline = models.CharField(max_length=255, null=True, blank=True)
    address_line1 = models.CharField(max_length=255, null=True, blank=True)
    address_line2 = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    postal_code = models.CharField(max_length=50, null=True, blank=True)
    country = models.CharField(max_length=2, null=True, blank=True) # ISO 3166-1 alpha-2
    phone = models.CharField(max_length=50, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    logo_url = models.URLField(null=True, blank=True)
    default_currency = models.CharField(max_length=3, default='USD')
    invoice_prefix = models.CharField(max_length=50, default='INV-')
    invoice_counter = models.IntegerField(default=1)
    default_payment_terms = models.IntegerField(default=30)
    default_notes = models.TextField(null=True, blank=True)
    default_terms = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'business_profiles'

class TaxRate(models.Model):
    TYPE_CHOICES = [
        ('gst', 'GST'),
        ('vat', 'VAT'),
        ('sales_tax', 'Sales Tax'),
        ('custom', 'Custom'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tax_rates', db_index=True)
    name = models.CharField(max_length=255)
    rate = models.DecimalField(max_digits=5, decimal_places=4)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tax_rates'

class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients', db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    address_line1 = models.CharField(max_length=255, null=True, blank=True)
    address_line2 = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    postal_code = models.CharField(max_length=50, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    currency = models.CharField(max_length=3, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    late_payment_count = models.IntegerField(default=0)
    avg_days_to_pay = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_archived = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients'

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('viewed', 'Viewed'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('disputed', 'Disputed'),
        ('cancelled', 'Cancelled'),
        ('voided', 'Voided'),
    ]
    DISCOUNT_CHOICES = [
        ('percent', 'Percent'),
        ('fixed', 'Fixed'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices', db_index=True)
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='invoices', db_index=True)
    invoice_number = models.CharField(max_length=100, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, null=True, blank=True, db_index=True)
    currency = models.CharField(max_length=3, default='USD')
    issue_date = models.DateField(db_index=True)
    due_date = models.DateField(db_index=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_CHOICES, null=True, blank=True)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(null=True, blank=True)
    terms = models.TextField(null=True, blank=True)
    pdf_url = models.URLField(null=True, blank=True)
    portal_token = models.CharField(max_length=255, unique=True, null=True, blank=True)
    portal_token_expires_at = models.DateTimeField(null=True, blank=True)
    razorpay_payment_link_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_payment_link_url = models.URLField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    voided_at = models.DateTimeField(null=True, blank=True)
    reminder_count = models.IntegerField(default=0)
    last_reminder_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoices'
        unique_together = ('user', 'invoice_number')

class InvoiceItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items', db_index=True)
    description = models.TextField()
    quantity = models.DecimalField(max_digits=10, decimal_places=3, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.ForeignKey(TaxRate, on_delete=models.SET_NULL, null=True, blank=True)
    tax_rate_snapshot = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    tax_rate_name_snapshot = models.CharField(max_length=255, null=True, blank=True)
    line_subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    line_tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoice_items'

class Payment(models.Model):
    METHOD_CHOICES = [
        ('razorpay', 'Razorpay'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('other', 'Other'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments', db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3)
    payment_date = models.DateField(db_index=True)
    method = models.CharField(max_length=50, choices=METHOD_CHOICES, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=255, null=True, blank=True)
    reference = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'

class CreditNote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.OneToOneField(Invoice, on_delete=models.CASCADE, related_name='credit_note', db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    credit_note_number = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField(null=True, blank=True)
    pdf_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'credit_notes'

class Reminder(models.Model):
    TYPE_CHOICES = [('auto', 'Auto'), ('manual', 'Manual')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='reminders', db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    reminder_type = models.CharField(max_length=20, choices=TYPE_CHOICES, null=True, blank=True)
    days_overdue = models.IntegerField()
    email_sent_to = models.EmailField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reminders'

class InvoiceActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='activities', db_index=True)
    event_type = models.CharField(max_length=100)
    description = models.TextField()
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoice_activity'

class RecurringTemplate(models.Model):
    FREQ_CHOICES = [
        ('weekly', 'Weekly'),
        ('fortnightly', 'Fortnightly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annually', 'Annually'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255)
    frequency = models.CharField(max_length=50, choices=FREQ_CHOICES, null=True, blank=True)
    next_generate_date = models.DateField(db_index=True)
    auto_send = models.BooleanField(default=False)
    due_days = models.IntegerField(default=30)
    is_active = models.BooleanField(default=True, db_index=True)
    items = models.JSONField()
    notes = models.TextField(null=True, blank=True)
    terms = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recurring_templates'
