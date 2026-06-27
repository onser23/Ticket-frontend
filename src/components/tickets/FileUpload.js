import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

const MAX_FILES = 5;
const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function FileUpload({ files = [], onChange, disabled = false, maxFiles = MAX_FILES, maxSize = MAX_SIZE }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTS.includes(ext)) {
      return 'Yalnız şəkil faylları (jpg, jpeg, png, webp, gif) qəbul olunur';
    }
    if (file.size > maxSize) {
      return `Fayl 2MB-dan böyükdür (${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }
    return null;
  };

  const addFiles = (newFiles) => {
    setError('');
    const valid = [];
    for (const file of newFiles) {
      if (files.length + valid.length >= maxFiles) {
        setError(`Maksimum ${maxFiles} şəkil yükləyə bilərsiniz`);
        break;
      }
      const err = validateFile(file);
      if (err) {
        setError(err);
        continue;
      }
      valid.push(file);
    }
    if (valid.length > 0) {
      onChange([...files, ...valid]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleSelect = (e) => {
    if (disabled) return;
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
    setError('');
  };

  return (
    <div>
      {files.length < maxFiles && (
        <div
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-primary-400 bg-slate-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-700 font-medium">Şəkil yükləmək üçün klikləyin və ya sürükləyin</p>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP, GIF • Maks. {maxFiles} şəkil • Hər biri max 2MB</p>
          <input ref={inputRef} type="file" multiple accept={ALLOWED_EXTS.join(',')} onChange={handleSelect} disabled={disabled} className="hidden" />
        </div>
      )}

      {error && (
        <div role="alert" className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="mt-1 text-xs text-slate-500 truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">{files.length} / {maxFiles} şəkil seçildi</p>
      )}
    </div>
  );
}

export default FileUpload;
