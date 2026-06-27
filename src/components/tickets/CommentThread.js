import React, { useState, useEffect, useCallback } from 'react';
import { Send, Loader2, MessageCircle, User as UserIcon, Shield, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CommentThread = ({ ticketId, api, currentRole }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list(ticketId);
      setComments(res.data.data || []);
    } catch (err) {
      console.error('Şərhlər yüklənmədi', err);
    } finally {
      setLoading(false);
    }
  }, [ticketId, api]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.create(ticketId, text.trim());
      setComments([...comments, res.data.data]);
      setText('');
      toast.success(currentRole === 'admin' ? 'Cavab göndərildi — istifadəçiyə email bildirildi' : 'Şərh əlavə edildi');
    } catch (err) {
      setError(err.response?.data?.message || 'Şərh göndərilmədi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('az-AZ', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const isAdmin = (c) => c.authorRole === 'admin';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-slate-400" />
        <h2 className="text-base font-semibold text-slate-900">Şərhlər ({comments.length})</h2>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">Hələ şərh yoxdur. İlk şərhi yazın!</p>
      ) : (
        <div className="space-y-3 mb-6">
          {comments.map((c) => (
            <div
              key={c._id}
              className={`rounded-xl p-4 ${
                isAdmin(c)
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
                  : 'bg-indigo-50 border border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isAdmin(c) ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                }`}>
                  {isAdmin(c) ? <Shield className="w-4 h-4 text-white" /> : <UserIcon className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {isAdmin(c) ? (c.authorId?.fullName || 'Admin') : `${c.authorId?.firstName} ${c.authorId?.lastName}`}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(c.createdAt)}</p>
                </div>
                {isAdmin(c) && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed pl-9">{c.text}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2 border-t border-slate-100 pt-4">
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-2 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitting}
          rows={3}
          maxLength={2000}
          placeholder={currentRole === 'admin' ? 'İstifadəçiyə cavab yazın...' : 'Şərh yazın...'}
          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm disabled:opacity-60"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{text.length} / 2000</span>
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Göndər
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentThread;
