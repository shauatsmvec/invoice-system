import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { Save, Building2, Globe, Mail, Phone, MapPin, CreditCard, Receipt } from 'lucide-react';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    business_name: '',
    tagline: '',
    email: '',
    phone: '',
    website: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    default_currency: 'USD',
    invoice_prefix: 'INV-',
    invoice_counter: 1,
    default_payment_terms: 30,
    default_notes: '',
    default_terms: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/business-profile/');
        if (response.data.length > 0) {
          setProfile(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile.id) {
        await apiClient.put(`/business-profile/${profile.id}/`, profile);
      } else {
        const response = await apiClient.post('/business-profile/', profile);
        setProfile(response.data);
      }
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Business Settings</h1>
          <p className="text-slate-500">Configure your business identity and default invoice preferences</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        {/* Basic Info */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
            <Building2 size={18} className="text-slate-400" />
            <h2 className="font-bold text-slate-900">General Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Legal Name *</label>
              <input 
                required
                value={profile.business_name}
                onChange={(e) => setProfile({...profile, business_name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g. Acme Studio LLC"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Tagline / Slogan</label>
              <input 
                value={profile.tagline || ''}
                onChange={(e) => setProfile({...profile, tagline: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g. Premium Design & Development"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Email</label>
              <input 
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input 
                type="url"
                value={profile.website || ''}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
                placeholder="https://acme.com"
              />
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
            <MapPin size={18} className="text-slate-400" />
            <h2 className="font-bold text-slate-900">Business Address</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label>
              <input 
                value={profile.address_line1 || ''}
                onChange={(e) => setProfile({...profile, address_line1: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input 
                value={profile.city || ''}
                onChange={(e) => setProfile({...profile, city: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State / Province</label>
              <input 
                value={profile.state || ''}
                onChange={(e) => setProfile({...profile, state: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
              <input 
                value={profile.postal_code || ''}
                onChange={(e) => setProfile({...profile, postal_code: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country (ISO 2-letter)</label>
              <input 
                value={profile.country || ''}
                maxLength="2"
                onChange={(e) => setProfile({...profile, country: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
                placeholder="US, GB, AU..."
              />
            </div>
          </div>
        </section>

        {/* Invoice Defaults */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
            <Receipt size={18} className="text-slate-400" />
            <h2 className="font-bold text-slate-900">Invoice Preferences</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Prefix</label>
              <input 
                value={profile.invoice_prefix}
                onChange={(e) => setProfile({...profile, invoice_prefix: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Next Number</label>
              <input 
                type="number"
                value={profile.invoice_counter}
                onChange={(e) => setProfile({...profile, invoice_counter: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Terms (Days)</label>
              <select 
                value={profile.default_payment_terms}
                onChange={(e) => setProfile({...profile, default_payment_terms: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none bg-white"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Payment Instructions</label>
              <textarea 
                rows="3"
                value={profile.default_terms || ''}
                onChange={(e) => setProfile({...profile, default_terms: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none resize-none"
                placeholder="e.g. Please pay via bank transfer to Acc: 12345678, SWIFT: ABCDEF"
              ></textarea>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default Settings;
