import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Plus, Search, FileText, ExternalLink, MoreVertical, Download, Send, Ban } from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingEmail, setSendingEmail] = useState(null);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      const response = await apiClient.get('/invoices/');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSendEmail = async (inv) => {
    setSendingEmail(inv.id);
    try {
      await apiClient.post(`/invoices/${inv.id}/send_email/`);
      alert('Invoice email sent successfully!');
      fetchInvoices();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Check your Resend configuration.');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleDownloadPDF = async (inv) => {
    try {
      const response = await apiClient.get(`/invoices/${inv.id}/pdf/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${inv.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF.');
    }
  };

  const handleVoid = async (inv) => {
    if (!window.confirm('Voiding this invoice will create a Credit Note and cancel the total. Proceed?')) return;
    try {
      await apiClient.post(`/invoices/${inv.id}/void/`);
      alert('Invoice voided successfully.');
      fetchInvoices();
    } catch (error) {
      console.error('Error voiding invoice:', error);
      alert('Failed to void invoice.');
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500">Create, send, and track your billing documents</p>
        </div>
        <button 
          onClick={() => navigate('/invoices/new')}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} />
          <span>Create Invoice</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
        <Search size={20} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by invoice number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-slate-700"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Number</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Loading invoices...</td></tr>
            ) : filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{inv.invoice_number}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{inv.client_name || 'Loading...'}</td>
                <td className="px-6 py-4 text-slate-900 font-semibold">${parseFloat(inv.total).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    inv.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' :
                    inv.status === 'overdue' ? 'bg-red-100 text-red-700 border border-red-200' :
                    inv.status === 'voided' ? 'bg-slate-200 text-slate-500' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">{new Date(inv.due_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    {inv.status !== 'voided' && (
                      <>
                        <button 
                          onClick={() => handleSendEmail(inv)}
                          disabled={sendingEmail === inv.id}
                          className={`text-slate-400 hover:text-blue-600 transition-colors ${sendingEmail === inv.id ? 'animate-pulse text-blue-400' : ''}`}
                          title="Send Invoice Email"
                        >
                          <Send size={18} />
                        </button>
                        <button 
                          onClick={() => handleVoid(inv)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                          title="Void Invoice"
                        >
                          <Ban size={18} />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDownloadPDF(inv)}
                      className="text-slate-400 hover:text-slate-900 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={18} />
                    </button>
                    {inv.stripe_payment_link_url && (
                      <a 
                        href={inv.stripe_payment_link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-900 transition-colors"
                        title="View Stripe Link"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                  No invoices found. Let's create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
