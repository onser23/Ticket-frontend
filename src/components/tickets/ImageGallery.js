import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace(/\/api$/, '');

const ImageGallery = ({ attachments = [] }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!attachments.length) return null;

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i > 0 ? i - 1 : attachments.length - 1));
  const next = () => setLightboxIndex((i) => (i < attachments.length - 1 ? i + 1 : 0));

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {attachments.map((att, index) => (
          <button
            key={index}
            type="button"
            onClick={() => openLightbox(index)}
            className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 hover:border-primary-400 transition-colors"
          >
            <img
              src={`${BASE_URL}/uploads/${att.path}`}
              alt={att.originalName}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fadeIn" onClick={closeLightbox}>
          <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }} className="absolute top-4 right-4 text-white hover:text-slate-300">
            <X className="w-8 h-8" />
          </button>
          {attachments.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white hover:text-slate-300">
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-white hover:text-slate-300">
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}
          <img
            src={`${BASE_URL}/uploads/${attachments[lightboxIndex].path}`}
            alt={attachments[lightboxIndex].originalName}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </>
  );
};

export default ImageGallery;
