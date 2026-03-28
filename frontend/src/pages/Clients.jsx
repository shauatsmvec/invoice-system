import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { Plus, Pencil, Trash2, Search, X, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientForm = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState(client || {
    name: '',
    email: '',
    phone: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (client?.id) {
        await apiClient.put(`/clients/${client.id}/`, formData);
      } else {
        await apiClient.post('/clients/', formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Please check your data.');
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-none mb-1">
              {client ? 'Update Client' : 'New Client'}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Business or Full Name *</label>
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Email Address *</label>
              <input 
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
                placeholder="billing@acme.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Phone Number</label>
              <input 
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">City</label>
              <input 
                value={formData.city || ''}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Country</label>
              <input 
                value={formData.country || ''}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium"
                placeholder="US"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Internal Notes</label>
            <textarea 
              rows="3"
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none resize-none transition-all font-medium"
              placeholder="Private details about this client..."
            ></textarea>
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
              {loading ? 'Processing...' : 'Save Client'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = async () => {
    try {
      const response = await apiClient.get('/clients/');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this client?')) return;
    try {
      await apiClient.delete(`/clients/${id}/`);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your customer database and relationships</p>
        </div>
        <button 
          onClick={() => { setEditingClient(null); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95 shadow-md"
        >
          <Plus size={20} />
          <span>Add Client</span>
        </button>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 px-4 focus-within:ring-2 focus-ring-slate-900 transition-all max-w-2xl">
        <Search size={20} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Find a client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-slate-700 font-medium py-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full py-20 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-slate-900 mx-auto rounded-full"></div></div>
          ) : filteredClients.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 font-medium italic bg-white rounded-3xl border border-dashed border-slate-200">No clients found matching your search.</div>
          ) : filteredClients.map((client, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              key={client.id} 
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-md hover:border-slate-200 transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(client)}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 truncate">{client.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 mt-1">
                    <Mail size={14} />
                    <span className="text-xs font-bold truncate">{client.email}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">{client.city || 'Remote'}</span>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Active
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <ClientForm 
            client={editingClient} 
            onClose={() => setIsFormOpen(false)} 
            onSave={() => { setIsFormOpen(false); fetchClients(); }} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Clients;
