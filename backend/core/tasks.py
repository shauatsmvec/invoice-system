from django.utils import timezone
from .models import Invoice, RecurringTemplate, Reminder
from .utils import generate_invoice_pdf
from .email_service import send_invoice_email
import uuid

def process_recurring_templates():
    """
    Checks for templates that need generating today and creates invoices.
    """
    today = timezone.now().date()
    templates = RecurringTemplate.objects.filter(is_active=True, next_generate_date__lte=today)
    
    for tpl in templates:
        # Create the invoice
        invoice = Invoice.objects.create(
            user=tpl.user,
            client=tpl.client,
            invoice_number=f"{tpl.name}-{uuid.uuid4().hex[:6]}",
            issue_date=today,
            due_date=today + timezone.timedelta(days=tpl.due_days),
            currency='USD', # Defaulting to USD, should use profile/client default
            status='draft',
            notes=tpl.notes,
            terms=tpl.terms
        )
        
        # In a real app, we would copy line items from tpl.items JSON to InvoiceItem model
        
        if tpl.auto_send:
            try:
                pdf_bytes = generate_invoice_pdf(invoice)
                send_invoice_email(invoice, pdf_bytes)
                invoice.status = 'sent'
                invoice.save()
            except Exception as e:
                print(f"Failed to auto-send recurring invoice: {e}")

        # Update next generate date based on frequency
        if tpl.frequency == 'weekly':
            tpl.next_generate_date += timezone.timedelta(weeks=1)
        elif tpl.frequency == 'fortnightly':
            tpl.next_generate_date += timezone.timedelta(weeks=2)
        elif tpl.frequency == 'monthly':
            # Simplified month increment
            tpl.next_generate_date += timezone.timedelta(days=30)
        # ... handle other frequencies ...
        
        tpl.save()

def send_overdue_reminders():
    """
    Finds overdue invoices and sends reminders if they haven't been sent too recently.
    """
    today = timezone.now().date()
    overdue_invoices = Invoice.objects.filter(
        status__in=['sent', 'viewed', 'partially_paid'],
        due_date__lt=today
    )
    
    for inv in overdue_invoices:
        # Update status to overdue if not already
        if inv.status != 'overdue':
            inv.status = 'overdue'
            inv.save()
            
        # Nudge logic: send if last reminder was > 7 days ago
        if not inv.last_reminder_sent_at or (timezone.now() - inv.last_reminder_sent_at).days >= 7:
            try:
                pdf_bytes = generate_invoice_pdf(inv)
                # In a real app, use a specific 'reminder' email template
                send_invoice_email(inv, pdf_bytes) 
                
                inv.reminder_count += 1
                inv.last_reminder_sent_at = timezone.now()
                inv.save()
                
                # Log the reminder
                Reminder.objects.create(
                    invoice=inv,
                    user=inv.user,
                    reminder_type='auto',
                    days_overdue=(today - inv.due_date).days,
                    email_sent_to=inv.client.email
                )
            except Exception as e:
                print(f"Failed to send reminder for {inv.invoice_number}: {e}")
