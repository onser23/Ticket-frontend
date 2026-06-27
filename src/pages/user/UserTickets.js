import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { ticketsAPI } from '../../utils/userApi';
import TicketFilters from '../../components/tickets/TicketFilters';
import TicketCard from '../../components/tickets/TicketCard';
import TicketTable from '../../components/tickets/TicketTable';
import TicketCreateModal from '../../components/tickets/TicketCreateModal';

const UserTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', page: 1, limit: 20 });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: filters.limit };
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const res = await ticketsAPI.list(params);
      setTickets(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Müraciətlər yüklənmədi', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleCreated = () => {
    setFilters({ ...filters, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Müraciətlərim</h1>
            <p className="text-sm text-slate-500">Cəmi: {total} müraciət</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Müraciət</span>
        </button>
      </div>

      <TicketFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">Heç bir müraciət yoxdur</h3>
          <p className="text-sm text-slate-500 mb-4">İlk müraciətinizi yaradın</p>
          <button onClick={() => setCreateOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
            + Yeni Müraciət
          </button>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {tickets.map((t) => (
              <TicketCard key={t._id} ticket={t} onClick={(ticket) => navigate(`/tickets/${ticket._id}`)} />
            ))}
          </div>
          <div className="hidden md:block">
            <TicketTable tickets={tickets} onRowClick={(ticket) => navigate(`/tickets/${ticket._id}`)} />
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
            disabled={filters.page === 1}
            className="px-4 py-2 text-sm bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 rounded-lg"
          >
            Əvvəlki
          </button>
          <span className="text-sm text-slate-600">Səhifə {filters.page} / {totalPages}</span>
          <button
            onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
            disabled={filters.page === totalPages}
            className="px-4 py-2 text-sm bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 rounded-lg"
          >
            Növbəti
          </button>
        </div>
      )}

      <TicketCreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
    </div>
  );
};

export default UserTickets;
