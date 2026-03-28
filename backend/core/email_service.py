from django.core.mail import EmailMessage
from django.conf import settings
from .models import BusinessProfile

def send_invoice_email(invoice, pdf_bytes):
    """
    Sends an invoice email to the client using standard Django SMTP (configured for Gmail).
    """
    profile = BusinessProfile.objects.filter(user=invoice.user).first()
    if not profile:
        raise Exception("Business Profile not found. Please complete your settings first.")
    
    if not pdf_bytes:
        raise Exception("Failed to generate PDF for the invoice.")
    
    subject = f"Invoice {invoice.invoice_number} from {profile.business_name}"
    
    # In standard SMTP, the 'from' email is usually fixed to the authenticated user (your Gmail)
    from_email = settings.EMAIL_HOST_USER
    
    # The reply-to can be the user's specific business email
    reply_email = profile.email or invoice.user.email
    
    html_content = f"""
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #000;">Hello {invoice.client.name},</h2>
        <p>You have received a new invoice from <strong>{profile.business_name}</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p><strong>Invoice Number:</strong> {invoice.invoice_number}</p>
        <p><strong>Amount Due:</strong> {invoice.currency} {invoice.total}</p>
        <p><strong>Due Date:</strong> {invoice.due_date}</p>
        
        <div style="margin: 30px 0; text-align: center;">
            <a href="{invoice.razorpay_payment_link_url or '#'}" 
               style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
               Pay Invoice Online
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">Please find the invoice PDF attached to this email for your records.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p>Best regards,<br><strong>{profile.business_name}</strong></p>
    </div>
    """

    email = EmailMessage(
        subject=subject,
        body=html_content,
        from_email=from_email,
        to=[invoice.client.email],
        reply_to=[reply_email],
    )
    email.content_subtype = "html"
    
    # Attach PDF
    email.attach(f"Invoice-{invoice.invoice_number}.pdf", pdf_bytes, 'application/pdf')

    try:
        email.send(fail_silently=False)
        return True
    except Exception as e:
        print(f"SMTP/GMAIL ERROR: {str(e)}")
        raise Exception(f"Email Sending Failed (Gmail SMTP): {str(e)}")
