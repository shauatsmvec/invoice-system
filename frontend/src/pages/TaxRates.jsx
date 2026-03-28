import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { Plus, Pencil, Trash2, X, Percent } from 'lucide-react';

const TaxRateForm = ({ taxRate, onClose, onSave }) => {
  const [formData, setFormData] = useState(taxRate || {
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">
            {taxRate ? 'Edit Tax Rate' : 'Add Tax Rate'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax Name *</label>
            <input 
              required
              placeholder="e.g. GST, VAT, Sales Tax"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rate (as decimal) *</label>
            <div className="relative">
              <input 
                type="number"
                step="0.0001"
                required
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none pr-12"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs">
                {(formData.rate * 100).toFixed(1)}%
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Example: 0.1 for 10%, 0.05 for 5%</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none bg-white"
            >
              <option value="gst">GST</option>
              <option value="vat">VAT</option>
              <option value="sales_tax">Sales Tax</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
              className="w-4 h-4 accent-slate-900"
            />
            <label htmlFor="is_default" className="text-sm text-slate-700">Set as default for new items</label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Rate'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tax Rates</h1>
          <p className="text-slate-500">Manage reusable tax settings for your invoices</p>
        </div>
        <button 
          onClick={() => { setEditingRate(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} />
          <span>Add Tax Rate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading rates...</div>
        ) : taxRates.map((rate) => (
          <div key={rate.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                  <Percent size={20} />
                </div>
                {rate.is_default && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                    Default
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{rate.name}</h3>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {(parseFloat(rate.rate) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{rate.type}</p>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-50">
              <button 
                onClick={() => { setEditingRate(rate); setIsFormOpen(true); }}
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => handleDelete(rate.id)}
                className="text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {!loading && taxRates.length === 0 && (
          <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-500">
            No tax rates configured yet.
          </div>
        )}
      </div>

      {isFormOpen && (
        <TaxRateForm 
          taxRate={editingRate} 
          onClose={() => setIsFormOpen(false)} 
          onSave={() => { setIsFormOpen(false); fetchRates(); }} 
        />
      )}
    </div>
  );
};

export default TaxRates;
