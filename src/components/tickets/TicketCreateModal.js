import React, { useState } from 'react';
import { X, Loader2, AlertCircle, FileText, AlignLeft, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { ticketsAPI } from '../../utils/userApi';
import FileUpload from './FileUpload';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Aşağı', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { value: 'medium', label: 'Orta', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  { value: 'high', label: 'Yüksək', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
];

const TicketCreateModal = ({ open, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      return setError('Başlıq minimum 3 simvol olmalıdır');
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      return setError('Açıqlama minimum 10 simvol olmalıdır');
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('description', formData.description.trim());
      fd.append('priority', formData.priority);
      files.forEach((file) => fd.append('attachments', file));

      const res = await ticketsAPI.create(fd);
      toast.success('Müraciət uğurla yaradıldı');
      onCreated?.(res.data.data);
      setFormData({ title: '', description: '', priority: 'medium' });
      setFiles([]);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Müraciət yaradılmadı');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setFormData({ title: '', description: '', priority: 'medium' });
    setFiles([]);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-slate-900">Yeni Müraciət</h2>
          <button onClick={handleClose} disabled={submitting} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 flex-1">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Başlıq * (3-150 simvol)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={submitting}
              maxLength={150}
              placeholder="Müraciətin başlığı..."
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-slate-400">{formData.title.length} / 150</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <AlignLeft className="inline w-4 h-4 mr-1" />
              Açıqlama * (10-2000 simvol)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={submitting}
              maxLength={2000}
              rows={5}
              placeholder="Problemi ətraflı təsvir edin..."
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 resize-none"
            />
            <p className="mt-1 text-xs text-slate-400">{formData.description.length} / 2000</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Flag className="inline w-4 h-4 mr-1" />
              Prioritet *
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: opt.value })}
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    formData.priority === opt.value
                      ? opt.color + ' ring-2 ring-offset-2 ring-primary-500'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Şəkillər (max 5)</label>
            <FileUpload files={files} onChange={setFiles} disabled={submitting} />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={handleClose} disabled={submitting} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg disabled:opacity-60">
              Ləğv et
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Göndərilir...</span></> : 'Göndər'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketCreateModal;
