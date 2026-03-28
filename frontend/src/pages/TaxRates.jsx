import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { Plus, Pencil, Trash2, X, Percent, Zap, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TaxRateForm = ({ taxRate, onClose, onSave }) => {
  const [formData, setFormData] = useState(taxRate || {
    id: null,
    name: '',
    rate: 0.1,
    type: 'gst',
    is_default: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, rate: parseFloat(formData.rate) };
      if (taxRate?.id) {
        await apiClient.put(`/tax-rates/${taxRate.id}/`, payload);
      } else {
        await apiClient.post('/tax-rates/', payload);
      }
      onSave();
    } catch (error) {
      console.error('Error saving tax rate:', error);
      alert('Failed to save tax rate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-none mb-1">
              {taxRate ? 'Update Tax' : 'New Tax Rate'}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Configuration</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tax Identifier *</label>
            <input 
              required
              placeholder="e.g. GST, VAT"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Percentage Rate (Decimal) *</label>
            <div className="relative">
              <input 
                type="number"
                step="0.0001"
                required
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold pr-16"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-slate-900 font-black text-sm">
                  {(formData.rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Category</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-bold"
            >
              <option value="gst">GST</option>
              <option value="vat">VAT</option>
              <option value="sales_tax">Sales Tax</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer" onClick={() => setFormData({...formData, is_default: !formData.is_default})}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${formData.is_default ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200'}`}>
              {formData.is_default && <Check size={14} strokeWidth={4} />}
            </div>
            <span className="text-sm font-bold text-slate-700">Set as default for new invoices</span>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Save Rate'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const TaxRates = () => {
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);

  const fetchRates = async () => {
    try {
      const response = await apiClient.get('/tax-rates/');
      setTaxRates(response.data);
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tax rate?')) return;
    try {
      await apiClient.delete(`/tax-rates/${id}/`);
      fetchRates();
    } catch (error) {
      console.error('Error deleting rate:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tax Configuration</h1>
          <p className="text-slate-500 font-medium mt-1">Global tax rates for your regional compliance</p>
        </div>
        <button 
          onClick={() => { setEditingRate(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95 shadow-md"
        >
          <Plus size={20} />
          <span>Add Tax Rate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full py-20 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-slate-900 mx-auto rounded-full"></div></div>
          ) : taxRates.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 font-medium italic bg-white rounded-3xl border border-dashed border-slate-200">No tax rates configured yet.</div>
          ) : taxRates.map((rate, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              key={rate.id} 
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-md hover:border-slate-200 transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                  <Percent size={24} />
                </div>
                {rate.is_default && (
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border border-emerald-100 shadow-sm">
                    Default
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{rate.name}</h3>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {(parseFloat(rate.rate) * 100).toFixed(1)}%
                    </span>
                    <div className="bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                      {rate.type}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-end gap-2">
                  <button 
                    onClick={() => { setEditingRate(rate); setIsFormOpen(true); }}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(rate.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <TaxRateForm 
            taxRate={editingRate} 
            onClose={() => setIsFormOpen(false)} 
            onSave={() => { setIsFormOpen(false); fetchRates(); }} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaxRates;
