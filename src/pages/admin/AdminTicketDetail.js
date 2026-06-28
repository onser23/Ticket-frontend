import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Paperclip,
  Building2,
  User as UserIcon,
  Calendar,
  Trash2,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminTicketsAPI, adminCommentsAPI } from "../../utils/adminApi";
import ImageGallery from "../../components/tickets/ImageGallery";
import CommentThread from "../../components/tickets/CommentThread";

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Gözləyən",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "in_progress",
    label: "İcradadır",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "resolved",
    label: "Həll Edildi",
    color: "bg-green-100 text-green-700",
  },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Aşağı", color: "bg-slate-100 text-slate-600" },
  { value: "medium", label: "Orta", color: "bg-amber-100 text-amber-700" },
  { value: "high", label: "Yüksək", color: "bg-red-100 text-red-700" },
];

const AdminTicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await adminTicketsAPI.get(id);
      setTicket(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Müraciət yüklənmədi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ticket.status) return;
    setUpdatingStatus(true);
    try {
      await adminTicketsAPI.patchStatus(id, newStatus);
      toast.success(
        newStatus === "resolved"
          ? "Müraciət həll edildi — istifadəçiyə email göndərildi"
          : "Status yeniləndi",
      );
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status dəyişdirilmədi");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `${ticket.displayId} müraciətini deaktiv etmək istədiyinizə əminsiniz?`,
      )
    )
      return;
    try {
      await adminTicketsAPI.delete(id);
      toast.success("Müraciət deaktiv edildi");
      navigate("/admin/tickets");
    } catch (err) {
      toast.error("Deaktiv etmə uğursuz oldu");
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-red-600 mb-4">{error || "Müraciət tapılmadı"}</p>
        <Link
          to="/admin/tickets"
          className="text-amber-600 hover:text-amber-700 font-medium"
        >
          ← Müraciətlərə qayıt
        </Link>
      </div>
    );
  }

  const status = STATUS_OPTIONS.find((s) => s.value === ticket.status);
  const priority = PRIORITY_OPTIONS.find((p) => p.value === ticket.priority);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/tickets"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Müraciətlərə qayıt
        </Link>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg border border-red-200"
        >
          <Trash2 className="w-4 h-4" />
          Deaktiv et
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-mono text-slate-500 mb-1">
              {ticket.displayId}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {ticket.title}
            </h1>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${status?.color}`}
          >
            {status?.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-y border-slate-100">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Şirkət:</span>
            <span className="font-medium text-slate-900">
              {ticket.companyId?.displayName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Yaradan:</span>
            <span className="font-medium text-slate-900">
              {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">Tarix:</span>
            <span className="font-medium text-slate-900">
              {new Date(ticket.createdAt).toLocaleDateString("az-AZ")}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Açıqlama
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </p>
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Status dəyişdir
        </h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleStatusChange(opt.value)}
              disabled={updatingStatus || ticket.status === opt.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                ticket.status === opt.value
                  ? opt.color + " ring-2 ring-offset-2 ring-amber-500"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {ticket.status === opt.value && (
                <Check className="inline w-4 h-4 mr-1" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          <strong>Qeyd:</strong> "Həll Edildi" statusuna keçərkən istifadəçiyə
          avtomatik email göndərilir.
        </p>
        {ticket.resolvedAt && (
          <p className="text-xs text-green-600 mt-2">
            ✓ Həll edildi: {new Date(ticket.resolvedAt).toLocaleString("az-AZ")}
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        💬 Müraciət ilə bağlı müzakirələri aşağıda görə bilərsiniz.
      </div>

      <CommentThread
        ticketId={ticket._id}
        api={adminCommentsAPI}
        currentRole="admin"
      />
    </div>
  );
};

export default AdminTicketDetail;
