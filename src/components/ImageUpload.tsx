'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
  preview?: boolean;
  maxSize?: number; // in MB
  className?: string;
}

export default function ImageUpload({
  value = '',
  onChange,
  folder = 'general',
  label = 'Image',
  placeholder = 'https://example.com/image.jpg',
  preview = true,
  maxSize = 10,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    // Vérifier le type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPG, PNG, GIF, WebP ou SVG.');
      return;
    }

    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Fichier trop volumineux. Taille maximale : ${maxSize}MB`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  }, [folder, maxSize, onChange]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleUpload(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, [handleUpload]);

  const handleRemove = () => {
    onChange('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Zone de drag-and-drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${dragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm text-gray-600">Upload en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-8 h-8 ${dragActive ? 'text-purple-500' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600">
              {dragActive ? 'Deposez l\'image ici' : 'Cliquez ou glissez une image'}
            </p>
            <p className="text-xs text-gray-400">
              JPEG, PNG, GIF, WebP, SVG (max {maxSize}MB)
            </p>
          </div>
        )}
      </div>

      {/* Input URL manuel */}
      <div className="flex gap-2 items-center">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
          placeholder={placeholder}
        />
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Supprimer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Apercu */}
      {preview && value && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Apercu :</p>
          <img
            src={value}
            alt="Apercu"
            className="max-h-48 object-contain rounded-lg"
            onError={() => setError('Impossible de charger l\'image')}
          />
        </div>
      )}
    </div>
  );
}
