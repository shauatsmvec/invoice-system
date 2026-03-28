from django.template.loader import render_to_string
from xhtml2pdf import pisa
from io import BytesIO
from .models import BusinessProfile

def generate_invoice_pdf(invoice):
    """
    Generates a PDF from an invoice instance using xhtml2pdf.
    """
    profile = BusinessProfile.objects.filter(user=invoice.user).first()
    
    html_string = render_to_string('invoices/invoice_pdf.html', {
        'invoice': invoice,
        'profile': profile
    })
    
    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html_string.encode("UTF-8")), result)
    
    if not pdf.err:
        return result.getvalue()
    return None
