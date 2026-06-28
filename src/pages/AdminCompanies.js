import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Search, Edit, Power, Loader2, AlertCircle, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../utils/adminApi';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingCompany, setEditingCompany] = useState(null);
  const [editData, setEditData] = useState({ displayName: '', contactEmail: '', contactPhone: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const limit = 20;
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      params.sortBy = sortBy;
      params.order = order;
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await adminApi.get('/companies', { params });
      setCompanies(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      toast.error('Şirkətlər yüklənmədi');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy, order]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleEdit = (company) => {
    setEditingCompany(company);
    setEditData({ displayName: company.displayName, contactEmail: company.contactEmail || '', contactPhone: company.contactPhone || '' });
    setEditError('');
  };

  const handleSave = async () => {
    if (!editData.displayName.trim() || editData.displayName.trim().length < 2) {
      setEditError('Şirkət adı minimum 2 simvol olmalıdır');
      return;
    }
    setSaving(true);
    setEditError('');
    try {
      await adminApi.put(`/companies/${editingCompany._id}`, editData);
      toast.success('Şirkət yeniləndi');
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      setEditError(error.response?.data?.message || 'Yenilənmə uğursuz oldu');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (company) => {
    if (!window.confirm(`${company.displayName} şirkətini deaktiv etmək istədiyinizə əminsiniz?`)) return;
    try {
      await adminApi.delete(`/companies/${company._id}`);
      toast.success('Şirkət deaktiv edildi');
      fetchCompanies();
    } catch (error) {
      toast.error('Deaktiv etmə uğursuz oldu');
    }
  };

  const handleReactivate = async (company) => {
    if (!window.confirm(`${company.displayName} şirkətini yenidən aktivləşdirmək istədiyinizə əminsiniz?`)) return;
    try {
      await adminApi.put(`/companies/${company._id}`, { isActive: true });
      toast.success('Şirkət və istifadəçi hesabı yenidən aktivləşdirildi');
      fetchCompanies();
    } catch (error) {
      toast.error('Aktivləşdirmə uğursuz oldu');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Şirkətlər</h1>
            <p className="text-sm text-slate-500">Cəmi: {total} şirkət</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Şirkət adına görə axtar..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="all">Hamısı</option>
            <option value="active">Aktiv</option>
            <option value="passive">Passiv</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Heç bir şirkət tapılmadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Şirkət adı</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th
                    onClick={() => handleSort('ticketCount')}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-1">
                      Müraciət sayı
                      {sortBy === 'ticketCount' && (order === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.displayName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.ownerUserId?.firstName} {c.ownerUserId?.lastName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.ownerUserId?.email || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[getStatusKey(c)].className}`}>
                        {STATUS_BADGES[getStatusKey(c)].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium">{c.ticketCount}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(c)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Redaktə et"><Edit className="w-4 h-4" /></button>
                        {c.isActive ? (
                          <button onClick={() => handleDeactivate(c)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Deaktiv et"><Power className="w-4 h-4" /></button>
                        ) : (
                          <button onClick={() => handleReactivate(c)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Aktivləşdir"><Power className="w-4 h-4" /></button>
                        )}
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
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg">Əvvəlki</button>
            <span className="text-sm text-slate-600">Səhifə {page} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg">Növbəti</button>
          </div>
        )}
      </div>

      {editingCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={() => setEditingCompany(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Şirkəti redaktə et</h2>
              <button onClick={() => setEditingCompany(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {editError && (
              <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 flex-1">{editError}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Şirkət adı *</label>
                <input type="text" value={editData.displayName} onChange={(e) => setEditData({...editData, displayName: e.target.value})} disabled={saving} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Əlaqə email</label>
                <input type="email" value={editData.contactEmail} onChange={(e) => setEditData({...editData, contactEmail: e.target.value})} disabled={saving} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Əlaqə telefon</label>
                <input type="text" value={editData.contactPhone} onChange={(e) => setEditData({...editData, contactPhone: e.target.value})} disabled={saving} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60" />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditingCompany(null)} disabled={saving} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg disabled:opacity-60">Ləğv et</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Saxla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const STATUS_BADGES = {
  active_verified: { label: 'Təsdiqlənmiş', className: 'bg-green-100 text-green-700' },
  active_unverified: { label: 'Doğrulanmamış', className: 'bg-yellow-100 text-yellow-700' },
  passive: { label: 'Passiv', className: 'bg-slate-100 text-slate-600' },
};

function getStatusKey(company) {
  if (!company.isActive) return 'passive';
  if (company.ownerUserId?.isVerified) return 'active_verified';
  return 'active_unverified';
}

export default AdminCompanies;
