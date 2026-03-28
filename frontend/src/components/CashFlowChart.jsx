import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth } from 'date-fns';

const CashFlowChart = ({ invoices }) => {
  // Group invoices by month for the chart
  const processData = () => {
    const months = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = format(d, 'MMM yy');
      months[monthStr] = { name: monthStr, paid: 0, pending: 0, overdue: 0 };
    }

    invoices.forEach(inv => {
      const monthStr = format(parseISO(inv.issue_date), 'MMM yy');
      if (months[monthStr]) {
        const amt = parseFloat(inv.total);
        if (inv.status === 'paid') {
          months[monthStr].paid += amt;
        } else if (inv.status === 'overdue') {
          months[monthStr].overdue += amt;
        } else if (['sent', 'viewed', 'partially_paid'].includes(inv.status)) {
          months[monthStr].pending += amt;
        }
      }
    });

    return Object.values(months);
  };

  const data = processData();

  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="paid" name="Paid Income" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;
