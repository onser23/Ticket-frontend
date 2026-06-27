import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Search, Filter, Loader2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi, { adminTicketsAPI } from '../../utils/adminApi';

const STATUS_OPTIONS = [
  { value: '', label: 'Bütün statuslar' },
  { value: 'pending', label: 'Gözləyən' },
  { value: 'in_progress', label: 'İcradadır' },
  { value: 'resolved', label: 'Həll Edildi' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'Bütün prioritetlər' },
  { value: 'low', label: 'Aşağı' },
  { value: 'medium', label: 'Orta' },
  { value: 'high', label: 'Yüksək' },
];

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

const PRIORITY_BADGE = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const AdminTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({
    search: '', status: '', priority: '', companyId: '', page: 1, limit: 20,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.list({ limit: 100 });
        setCompanies(res.data.data || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: filters.limit };
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.companyId) params.companyId = filters.companyId;

      const res = await adminTicketsAPI.list(params);
      setTickets(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      toast.error('Müraciətlər yüklənmədi');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleDelete = async (ticket) => {
    if (!window.confirm(`${ticket.displayId} müraciətini deaktiv etmək istədiyinizə əminsiniz?`)) return;
    try {
      await adminTicketsAPI.delete(ticket._id);
      toast.success('Müraciət deaktiv edildi');
      fetchTickets();
    } catch (e) {
      toast.error('Deaktiv etmə uğursuz oldu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
          <Inbox className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Müraciətlər</h1>
          <p className="text-sm text-slate-500">Cəmi: {total} müraciət (bütün şirkətlər)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Filterlər</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Axtar (başlıq, ID, açıqlama)..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.companyId}
            onChange={(e) => setFilters({ ...filters, companyId: e.target.value, page: 1 })}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Bütün şirkətlər</option>
            {companies.map((c) => <option key={c._id} value={c._id}>{c.displayName}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Heç bir müraciət tapılmadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Şirkət</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Başlıq</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Prioritet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Yaradan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{t.displayId}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{t.companyId?.displayName}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900 line-clamp-1">{t.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[t.status]}`}>
                        {STATUS_OPTIONS.find((o) => o.value === t.status)?.label || t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[t.priority]}`}>
                        {PRIORITY_OPTIONS.find((o) => o.value === t.priority)?.label || t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {t.createdBy?.firstName} {t.createdBy?.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/admin/tickets/${t._id}`)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Bax"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(t)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Deaktiv et"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
            <button onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })} disabled={filters.page === 1} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg">Əvvəlki</button>
            <span className="text-sm text-slate-600">Səhifə {filters.page} / {totalPages}</span>
            <button onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })} disabled={filters.page === totalPages} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg">Növbəti</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;
