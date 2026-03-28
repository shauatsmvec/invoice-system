import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Percent, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ to, icon: Icon, label, active }) => (
  <Link to={to} className="relative group">
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-slate-900 text-white shadow-md' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      <span className={`font-bold text-sm ${active ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="active-pill"
          className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
        />
      )}
    </div>
  </Link>
);

const Layout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/clients", icon: Users, label: "Clients" },
    { to: "/tax-rates", icon: Percent, label: "Tax Rates" },
    { to: "/invoices", icon: FileText, label: "Invoices" },
    { to: "/recurring", icon: RefreshCw, label: "Recurring" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-slate-900 p-2 rounded-xl text-white shadow-inner">
            <Zap size={24} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">FlowBill</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Main Menu</p>
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to}
              {...item} 
              active={location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))}
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Active User</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Pro Plan</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 font-bold text-sm group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white to-transparent pointer-events-none z-0 opacity-50" />
        <div className="p-10 relative z-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
