import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Paperclip, Building2, User as UserIcon, Calendar } from 'lucide-react';
import { ticketsAPI } from '../../utils/userApi';
import { commentsAPI } from '../../utils/userApi';
import ImageGallery from '../../components/tickets/ImageGallery';
import CommentThread from '../../components/tickets/CommentThread';

const STATUS_INFO = {
  pending: { label: 'Gözləyən', color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'İcradadır', color: 'bg-blue-100 text-blue-700' },
  resolved: { label: 'Həll Edildi', color: 'bg-green-100 text-green-700' },
};

const PRIORITY_INFO = {
  low: { label: 'Aşağı', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Orta', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Yüksək', color: 'bg-red-100 text-red-700' },
};

const UserTicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await ticketsAPI.get(id);
        setTicket(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Müraciət yüklənmədi');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  if (error || !ticket) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-red-600 mb-4">{error || 'Müraciət tapılmadı'}</p>
        <Link to="/tickets" className="text-indigo-600 hover:text-indigo-700 font-medium">
          ← Müraciətlərə qayıt
        </Link>
      </div>
    );
  }

  const status = STATUS_INFO[ticket.status] || STATUS_INFO.pending;
  const priority = PRIORITY_INFO[ticket.priority] || PRIORITY_INFO.medium;

  return (
    <div className="space-y-6">
      <Link to="/tickets" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" />
        Müraciətlərə qayıt
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-mono text-slate-500 mb-1">{ticket.displayId}</p>
            <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priority.color}`}>{priority.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-y border-slate-100">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Şirkət:</span>
            <span className="font-medium text-slate-900">{ticket.companyId?.displayName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Tarix:</span>
            <span className="font-medium text-slate-900">{new Date(ticket.createdAt).toLocaleDateString('az-AZ')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Yaradan:</span>
            <span className="font-medium text-slate-900">{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</span>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Açıqlama</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
        </div>

        {ticket.attachments?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Şəkillər ({ticket.attachments.length})
            </h2>
            <ImageGallery attachments={ticket.attachments} />
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        💬 Admin cavabları və status dəyişiklikləri SP5/SP6-da əlavə olunacaq.
      </div>

      <CommentThread ticketId={ticket._id} api={commentsAPI} currentRole="user" />
    </div>
  );
};

export default UserTicketDetail;
