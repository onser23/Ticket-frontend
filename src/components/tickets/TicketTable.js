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

const TicketTable = ({ tickets, onRowClick }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Başlıq</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Prioritet</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Şəkillər</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tarix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((t) => {
              const status = STATUS_LABEL[t.status] || STATUS_LABEL.pending;
              const priority = PRIORITY_LABEL[t.priority] || PRIORITY_LABEL.medium;
              return (
                <tr key={t._id} onClick={() => onRowClick?.(t)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 text-sm font-mono text-slate-500">{t.displayId}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900 line-clamp-1">{t.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{t.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>{priority.label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {t.attachments?.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        {t.attachments.length}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(t.createdAt).toLocaleDateString('az-AZ')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTable;
