import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { Plus, Pencil, Trash2, Calendar, RefreshCw, X, Play } from 'lucide-react';

const TemplateForm = ({ template, onClose, onSave, clients }) => {
  const [formData, setFormData] = useState(template || {
    name: '',
    client: '',
    frequency: 'monthly',
    next_generate_date: new Date().toISOString().split('T')[0],
    auto_send: false,
    is_active: true,
    items: [],
    notes: '',
    terms: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (template?.id) {
        await apiClient.put(`/recurring-templates/${template.id}/`, formData);
      } else {
        await apiClient.post('/recurring-templates/', formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">
            {template ? 'Edit Recurring Template' : 'New Recurring Template'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Template Name *</label>
              <input 
                required
                placeholder="e.g. Monthly Retainer"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Client *</label>
              <select 
                required
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
              >
                <option value="">Choose a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
              <select 
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Next Generation Date *</label>
              <input 
                type="date"
                required
                value={formData.next_generate_date}
                onChange={(e) => setFormData({...formData, next_generate_date: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input 
                type="checkbox"
                id="auto_send"
                checked={formData.auto_send}
                onChange={(e) => setFormData({...formData, auto_send: e.target.checked})}
                className="w-4 h-4 accent-slate-900"
              />
              <label htmlFor="auto_send" className="text-sm text-slate-700 font-medium">Auto-send to client</label>
            </div>
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
              {loading ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RecurringTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const fetchData = async () => {
    try {
      const [tplRes, clientsRes] = await Promise.all([
        apiClient.get('/recurring-templates/'),
        apiClient.get('/clients/')
      ]);
      setTemplates(tplRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring template?')) return;
    try {
      await apiClient.delete(`/recurring-templates/${id}/`);
      fetchData();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recurring Invoices</h1>
          <p className="text-slate-500">Automate your regular billing with templates</p>
        </div>
        <button 
          onClick={() => { setEditingTemplate(null); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading templates...</div>
        ) : templates.map((tpl) => (
          <div key={tpl.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <RefreshCw size={20} />
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                tpl.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {tpl.is_active ? 'Active' : 'Paused'}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{tpl.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{tpl.client_name}</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar size={14} />
                <span>Next run: {new Date(tpl.next_generate_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Play size={14} />
                <span className="capitalize">{tpl.frequency}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <button 
                onClick={() => { setEditingTemplate(tpl); setIsFormOpen(true); }}
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => handleDelete(tpl.id)}
                className="text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {!loading && templates.length === 0 && (
          <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-500">
            No recurring templates created yet.
          </div>
        )}
      </div>

      {isFormOpen && (
        <TemplateForm 
          template={editingTemplate} 
          clients={clients}
          onClose={() => setIsFormOpen(false)} 
          onSave={() => { setIsFormOpen(false); fetchData(); }} 
        />
      )}
    </div>
  );
};

export default RecurringTemplates;
