import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, Ticket } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext';

const UserSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { user, logout } = useUserAuth();

  const menu = [
    { path: '/', label: 'Ana Səhifə', icon: LayoutDashboard, end: true },
    { path: '/tickets', label: 'Müraciətlərim', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className="flex flex-col w-64 bg-slate-800 text-white h-full">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">Ticket Sistemi</div>
            <div className="text-xs text-slate-400">İstifadəçi</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Əsas naviqasiya">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end || false}
            onClick={handleClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="px-4 py-2 mb-2 text-xs text-slate-400 truncate">
          {user?.firstName} {user?.lastName}
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

export default UserSidebar;
