import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User as UserIcon, LogOut, Calendar } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { formatAzDate } from '../../utils/dateUtils';

const AdminTopBar = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const initials = admin ? ((admin.fullName?.[0] || admin.username?.[0] || 'A').toUpperCase()) : 'A';

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">{formatAzDate()}</span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <span className="hidden md:inline text-sm font-medium text-white">
              {admin?.fullName || admin?.username}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">{admin?.fullName || admin?.username}</p>
                <p className="text-xs text-slate-500 truncate">{admin?.email}</p>
              </div>
              <Link
                to="/admin/profile"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                Profilim
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Çıxış
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
