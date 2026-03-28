import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 transition-colors"
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">FlowBill</h1>
        </div>
        
        <nav className="flex-1 pt-4">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/clients" icon={Users} label="Clients" />
          <SidebarItem to="/tax-rates" icon={Percent} label="Tax Rates" />
          <SidebarItem to="/invoices" icon={FileText} label="Invoices" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
