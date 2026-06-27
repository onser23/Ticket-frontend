import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const MobileDrawer = ({ open, onClose, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50 animate-fadeIn" onClick={onClose} aria-label="Bağla" />
      <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 text-white shadow-xl animate-fadeIn">
        <button
          type="button"
          onClick={onClose}
          aria-label="Menyunu bağla"
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default MobileDrawer;
