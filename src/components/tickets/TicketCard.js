import React from 'react';
import { Paperclip } from 'lucide-react';

const STATUS_LABEL = {
  pending: { label: 'Gözləyən', color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'İcradadır', color: 'bg-blue-100 text-blue-700' },
  resolved: { label: 'Həll Edildi', color: 'bg-green-100 text-green-700' },
};

const PRIORITY_LABEL = {
  low: { label: 'Aşağı', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Orta', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Yüksək', color: 'bg-red-100 text-red-700' },
};

const TicketCard = ({ ticket, onClick }) => {
  const status = STATUS_LABEL[ticket.status] || STATUS_LABEL.pending;
  const priority = PRIORITY_LABEL[ticket.priority] || PRIORITY_LABEL.medium;

  return (
    <button
      type="button"
      onClick={() => onClick?.(ticket)}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-primary-300 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-mono text-slate-500">{ticket.displayId}</span>
        <div className="flex items-center gap-1">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>{priority.label}</span>
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-1">{ticket.title}</h3>
      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{ticket.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{new Date(ticket.createdAt).toLocaleDateString('az-AZ')}</span>
        {ticket.attachments?.length > 0 && (
          <span className="flex items-center gap-1">
            <Paperclip className="w-3 h-3" />
            {ticket.attachments.length} şəkil
          </span>
        )}
      </div>
    </button>
  );
};

export default TicketCard;
