import resend
from django.conf import settings
from django.template.loader import render_to_string
import base64

resend.api_key = getattr(settings, 'RESEND_API_KEY', '')

def send_invoice_email(invoice, pdf_bytes):
    """
    Sends an invoice email to the client using Resend.
    """
    profile = invoice.user.business_profile
    
    # We use base64 encoding for the attachment as required by many SDKs/APIs
    # though Resend's python SDK handles bytes/files too.
    
    subject = f"Invoice {invoice.invoice_number} from {profile.business_name}"
    
    # Simple HTML body - in a real app, use a dedicated React Email or Jinja2 template
    html_content = f"""
    <div style="font-family: sans-serif; color: #333;">
        <h2>Hello {invoice.client.name},</h2>
        <p>You have received a new invoice from <strong>{profile.business_name}</strong>.</p>
        <p><strong>Invoice Number:</strong> {invoice.invoice_number}</p>
        <p><strong>Amount Due:</strong> {invoice.currency} {invoice.total}</p>
        <p><strong>Due Date:</strong> {invoice.due_date}</p>
        
        <div style="margin: 30px 0;">
            <a href="{invoice.stripe_payment_link_url}" 
               style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               Pay Invoice Now
            </a>
        </div>
        
        <p>Please find the invoice PDF attached to this email.</p>
        <p>Best regards,<br>{profile.business_name}</p>
    </div>
    """

    params = {
        "from": f"{profile.business_name} <onboarding@resend.dev>", # Default test domain
        "to": [invoice.client.email],
        "reply_to": profile.email,
        "subject": subject,
        "html": html_content,
        "attachments": [
            {
                "filename": f"Invoice-{invoice.invoice_number}.pdf",
                "content": list(pdf_bytes), # Resend expects a list of ints or bytes
            }
        ],
    }

    try:
        email = resend.Emails.send(params)
        return email
    except Exception as e:
        print(f"Error sending email: {e}")
        raise e
