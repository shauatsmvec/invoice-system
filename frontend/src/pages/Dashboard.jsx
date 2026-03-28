import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import CashFlowChart from '../components/CashFlowChart';

const StatCard = ({ label, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const totalPending = invoices.filter(inv => ['sent', 'viewed'].includes(inv.status)).reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + parseFloat(inv.total), 0);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} color="text-slate-900" />
        <StatCard label="Paid Invoices" value={`$${totalPaid.toLocaleString()}`} color="text-green-600" />
        <StatCard label="Pending Payment" value={`$${totalPending.toLocaleString()}`} color="text-amber-600" />
        <StatCard label="Overdue" value={`$${totalOverdue.toLocaleString()}`} color="text-red-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Recent Invoices</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Number</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoices.slice(0, 5).map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{invoice.invoice_number}</td>
                <td className="px-6 py-4 text-slate-600 text-sm">{invoice.client_name || 'Loading...'}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">${parseFloat(invoice.total).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">{new Date(invoice.due_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  No invoices found. Create your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
Create your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
