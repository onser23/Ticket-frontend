import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Inbox, FileText, Loader2, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import { statsAPI } from '../utils/userApi';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';

const UserDashboard = () => {
  const { user } = useUserAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await statsAPI.user();
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
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ana Səhifə</h1>
            <p className="text-sm text-slate-500">Xoş gəldiniz, {user?.firstName} {user?.lastName}!</p>
          </div>
        </div>
        <Link
          to="/tickets"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni Müraciət
        </Link>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Toplam müraciət" value={stats.total} color="indigo" icon={Inbox} />
            <StatCard label="Gözləyən" value={stats.pending} color="yellow" icon={Clock} />
            <StatCard label="İcradadır" value={stats.in_progress} color="blue" icon={AlertCircle} />
            <StatCard label="Həll Edildi" value={stats.resolved} color="green" icon={CheckCircle2} />
          </div>

          {stats.total === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <EmptyState
                icon={Inbox}
                title="Hələ müraciətiniz yoxdur"
                description="İlk müraciətinizi yaradın və statusu izləyin"
                action={
                  <Link to="/tickets" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
                    <Plus className="w-4 h-4" />
                    Yeni Müraciət
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/tickets" className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <Inbox className="w-8 h-8 text-indigo-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-900 mb-1">Müraciətlərim</h3>
                <p className="text-sm text-slate-500">Bütün müraciətlərinizə baxın və status izləyin</p>
              </Link>
              <Link to="/profile" className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <FileText className="w-8 h-8 text-indigo-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-900 mb-1">Profil</h3>
                <p className="text-sm text-slate-500">{user?.companyName}</p>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserDashboard;
