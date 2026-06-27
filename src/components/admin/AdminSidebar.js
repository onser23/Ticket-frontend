import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Inbox, Building2, LogOut, Shield } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const menu = [
    { path: '/admin', label: 'Ana Səhifə', icon: LayoutDashboard, end: true },
    { path: '/admin/tickets', label: 'Müraciətlər', icon: Inbox },
    { path: '/admin/companies', label: 'Şirkətlər', icon: Building2 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className="flex flex-col w-64 bg-slate-900 text-white h-full">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">Ticket Sistemi</div>
            <div className="text-xs text-slate-400">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Admin naviqasiya">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end || false}
            onClick={handleClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="px-4 py-2 mb-2 text-xs text-slate-400 truncate">
          {admin?.fullName || admin?.username}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Çıxış"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">Çıxış</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
