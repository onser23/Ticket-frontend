import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Inbox, Building2, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminStatsAPI } from '../utils/adminApi';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

const AdminDashboard = () => {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState({
    total: 0, pending: 0, in_progress: 0, resolved: 0, byCompany: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminStatsAPI.admin();
      setStats(res.data.data);
    } catch (err) {
      console.error('Statistika yüklənmədi', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-sm text-slate-500">Xoş gəldiniz, {admin?.fullName || admin?.username}!</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Toplam müraciət" value={stats.total} color="amber" icon={Inbox} />
            <StatCard label="Gözləyən" value={stats.pending} color="yellow" icon={Clock} />
            <StatCard label="İcradadır" value={stats.in_progress} color="blue" icon={AlertCircle} />
            <StatCard label="Həll Edildi" value={stats.resolved} color="green" icon={CheckCircle2} />
          </div>

          {stats.byCompany.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-400" />
                  Şirkət üzrə ({stats.byCompany.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Şirkət</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Toplam</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Gözləyən</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">İcradadır</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Həll Edildi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.byCompany.map((c) => (
                      <tr key={c.companyId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.displayName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{c.total}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE.pending}`}>{c.pending}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE.in_progress}`}>{c.in_progress}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE.resolved}`}>{c.resolved}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {stats.total === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <EmptyState icon={Inbox} title="Heç bir müraciət yoxdur" description="İstifadəçilər müraciət yaratdıqda burada görsənəcək" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/admin/tickets" className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <Inbox className="w-8 h-8 text-amber-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-900 mb-1">Müraciətlər</h3>
                <p className="text-sm text-slate-500">Bütün şirkətlərin müraciətlərini idarə edin</p>
              </Link>
              <Link to="/admin/companies" className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <Building2 className="w-8 h-8 text-amber-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-900 mb-1">Şirkətlər</h3>
                <p className="text-sm text-slate-500">Şirkətləri idarə edin</p>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
