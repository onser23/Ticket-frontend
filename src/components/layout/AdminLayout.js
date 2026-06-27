import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from '../admin/AdminSidebar';
import AdminTopBar from '../admin/AdminTopBar';
import MobileDrawer from '../common/MobileDrawer';

const AdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen">
        <AdminSidebar />
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
      </MobileDrawer>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
          <div className="flex items-center px-4 py-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Menyunu aç"
              className="lg:hidden p-2 text-slate-300 hover:bg-slate-700 rounded-lg mr-2"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1"><AdminTopBar /></div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
