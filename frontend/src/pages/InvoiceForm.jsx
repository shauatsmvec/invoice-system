import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  
  const [invoice, setInvoice] = useState({
    client: '',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'USD',
    discount_type: 'percent',
    discount_value: 0,
    status: 'draft',
    notes: '',
    items: [{ description: '', quantity: 1, unit_price: 0, tax_rate: '' }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, taxRatesRes] = await Promise.all([
          apiClient.get('/clients/'),
          apiClient.get('/tax-rates/')
        ]);
        setClients(clientsRes.data);
        setTaxRates(taxRatesRes.data);
        
        if (id) {
          const invoiceRes = await apiClient.get(`/invoices/${id}/`);
          setInvoice(invoiceRes.data);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    fetchData();
  }, [id]);

  const handleAddItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 1, unit_price: 0, tax_rate: '' }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value;
    setInvoice({ ...invoice, items: newItems });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;

    invoice.items.forEach(item => {
      const lineSubtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
      subtotal += lineSubtotal;
      
      const taxRateObj = taxRates.find(r => r.id === item.tax_rate);
      if (taxRateObj) {
        totalTax += lineSubtotal * parseFloat(taxRateObj.rate);
      }
    });

    let discountAmount = 0;
    if (invoice.discount_type === 'fixed') {
      discountAmount = parseFloat(invoice.discount_value) || 0;
    } else {
      discountAmount = subtotal * ((parseFloat(invoice.discount_value) || 0) / 100);
    }

    const total = subtotal + totalTax - discountAmount;

    return { subtotal, totalTax, discountAmount, total };
  };

  const { subtotal, totalTax, discountAmount, total } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await apiClient.put(`/invoices/${id}/`, invoice);
      } else {
        await apiClient.post('/invoices/', invoice);
      }
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Ensure all required fields are filled.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button 
        onClick={() => navigate('/invoices')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back to Invoices</span>
      </button>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">
            {id ? `Edit Invoice ${invoice.invoice_number}` : 'New Invoice'}
          </h1>
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Client *</label>
                  <select 
                    required
                    value={invoice.client}
                    onChange={(e) => setInvoice({...invoice, client: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Choose a client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number *</label>
                  <input 
                    required
                    placeholder="e.g. INV-001"
                    value={invoice.invoice_number}
                    onChange={(e) => setInvoice({...invoice, invoice_number: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date *</label>
                  <input 
                    type="date"
                    required
                    value={invoice.issue_date}
                    onChange={(e) => setInvoice({...invoice, issue_date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
                  <input 
                    type="date"
                    required
                    value={invoice.due_date}
                    onChange={(e) => setInvoice({...invoice, due_date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Line Items</h3>
                <button 
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-bold text-slate-900 flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-start border-b border-slate-100 pb-4 last:border-0">
                    <div className="col-span-12 md:col-span-5">
                      <input 
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm"
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input 
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm"
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <input 
                        type="number"
                        placeholder="Price"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm"
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <select 
                        value={item.tax_rate || ''}
                        onChange={(e) => handleItemChange(index, 'tax_rate', e.target.value)}
                        className="w-full px-2 py-2 border border-slate-300 rounded-md outline-none text-xs"
                      >
                        <option value="">No Tax</option>
                        {taxRates.map(r => <option key={r.id} value={r.id}>{r.name} ({(parseFloat(r.rate)*100).toFixed(0)}%)</option>)}
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex justify-end">
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes / Payment Terms</label>
              <textarea 
                rows="4"
                value={invoice.notes}
                onChange={(e) => setInvoice({...invoice, notes: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none resize-none"
                placeholder="Include your bank details or thank you message..."
              ></textarea>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax</span>
                  <span>${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Discount</span>
                    <div className="flex gap-2">
                      <select 
                        value={invoice.discount_type}
                        onChange={(e) => setInvoice({...invoice, discount_type: e.target.value})}
                        className="bg-slate-800 border-none text-[10px] rounded px-1 outline-none"
                      >
                        <option value="percent">%</option>
                        <option value="fixed">$</option>
                      </select>
                      <input 
                        type="number"
                        value={invoice.discount_value}
                        onChange={(e) => setInvoice({...invoice, discount_value: e.target.value})}
                        className="bg-slate-800 w-16 text-right border-none text-sm rounded px-2 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 italic">
                    <span>Amount off</span>
                    <span>-${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-white">
                    ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Status</label>
              <select 
                value={invoice.status}
                onChange={(e) => setInvoice({...invoice, status: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none bg-slate-50"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="voided">Voided</option>
              </select>
              <p className="mt-3 text-[10px] text-slate-400 leading-relaxed">
                Tip: Status will automatically update to 'Paid' if a Stripe payment is detected.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
