from django.template.loader import render_to_string
from weasyprint import HTML
from .models import BusinessProfile

def generate_invoice_pdf(invoice):
    """
    Generates a PDF from an invoice instance using WeasyPrint.
    """
    profile = BusinessProfile.objects.filter(user=invoice.user).first()
    
    html_string = render_to_string('invoices/invoice_pdf.html', {
        'invoice': invoice,
        'profile': profile
    })
    
    # Generate PDF
    pdf_file = HTML(string=html_string).write_pdf()
    
    return pdf_file
