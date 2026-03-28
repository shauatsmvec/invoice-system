import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import CashFlowChart from '../components/CashFlowChart';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Plus,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, color, icon: Icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-110 ${color.replace('text-', 'bg-')}`} />
    
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '50').replace('900', '100')}`}>
        <Icon size={24} className={color} />
      </div>
      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    
    <div className="flex items-baseline gap-2">
      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchInvoices();
  }, []);

  const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const totalPending = invoices.filter(inv => ['sent', 'viewed', 'partially_paid'].includes(inv.status)).reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + parseFloat(inv.total), 0);

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            Financial Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 font-medium"
          >
            Welcome back! Here's what's happening with your business today.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-3"
        >
          <button 
            onClick={() => navigate('/invoices/new')}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95"
          >
            <Plus size={20} />
            Create Invoice
          </button>
        </motion.div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          color="text-slate-900" 
          icon={TrendingUp}
          delay={0.1}
        />
        <StatCard 
          label="Paid Invoices" 
          value={`$${totalPaid.toLocaleString()}`} 
          color="text-emerald-600" 
          icon={CheckCircle2}
          delay={0.2}
        />
        <StatCard 
          label="Pending" 
          value={`$${totalPending.toLocaleString()}`} 
          color="text-amber-600" 
          icon={Clock}
          delay={0.3}
        />
        <StatCard 
          label="Overdue" 
          value={`$${totalOverdue.toLocaleString()}`} 
          color="text-rose-600" 
          icon={AlertCircle}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Cash Flow Trends</h2>
            <select className="bg-slate-50 border-none text-sm font-bold rounded-lg px-3 py-2 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <CashFlowChart invoices={invoices} />
        </motion.div>

        {/* Recent Invoices Sidebar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <button 
              onClick={() => navigate('/invoices')}
              className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors uppercase tracking-widest"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            {invoices.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                No activity yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {invoices.slice(0, 6).map((inv) => (
                  <div key={inv.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
                        inv.status === 'overdue' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        <ArrowUpRight size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{inv.client_name || 'Quick Invoice'}</p>
                        <p className="text-xs text-slate-400 font-medium">{inv.invoice_number} · {new Date(inv.issue_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">${parseFloat(inv.total).toLocaleString()}</p>
                      <p className={`text-[10px] font-black uppercase tracking-tighter ${
                        inv.status === 'paid' ? 'text-emerald-500' : 
                        inv.status === 'overdue' ? 'text-rose-500' : 'text-slate-400'
                      }`}>{inv.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
