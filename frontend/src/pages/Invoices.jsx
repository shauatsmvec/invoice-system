import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  MoreVertical, 
  Download, 
  Send, 
  Ban,
  FileText,
  Filter,
  Calendar,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      const errorMsg = error.response?.data?.error || 'Failed to send email. Check your SMTP configuration.';
      alert(`Error: ${errorMsg}`);
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
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.client_name && inv.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'voided': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'draft': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-slate-500 font-medium mt-1">Generate and track your professional billing</p>
        </div>
        <button 
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95 shadow-md"
        >
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 px-4 focus-within:ring-2 focus-ring-slate-900 transition-all">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by invoice number or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-slate-700 font-medium py-2"
          />
        </div>
        <button className="bg-white px-5 py-2 rounded-2xl border border-slate-100 shadow-sm text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Document</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="px-8 py-20 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-slate-900 mx-auto rounded-full"></div></td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-medium italic">No invoices found. Let's create your first one.</td></tr>
              ) : filteredInvoices.map((inv, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={inv.id} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-sm">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{inv.invoice_number}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inv.currency}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-700">{inv.client_name || 'Individual'}</p>
                    <p className="text-xs text-slate-400 font-medium">#{inv.client.substring(0, 8)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900 tracking-tight">
                      ${parseFloat(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      <Calendar size={14} className="text-slate-300" />
                      <span>Due {new Date(inv.due_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {inv.status !== 'voided' && (
                        <>
                          <button 
                            onClick={() => handleSendEmail(inv)}
                            disabled={sendingEmail === inv.id}
                            className={`p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all ${sendingEmail === inv.id ? 'animate-pulse text-blue-400 bg-blue-50' : ''}`}
                            title="Send via Email"
                          >
                            <Send size={18} />
                          </button>
                          <button 
                            onClick={() => handleVoid(inv)}
                            className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                            title="Void Invoice"
                          >
                            <Ban size={18} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDownloadPDF(inv)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                      {inv.razorpay_payment_link_url && (
                        <a 
                          href={inv.razorpay_payment_link_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-all"
                          title="Razorpay Portal"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Invoices;
