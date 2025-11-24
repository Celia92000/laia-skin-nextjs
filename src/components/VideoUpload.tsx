'use client';

import { useState, useRef } from 'react';
import { Upload, X, Video as VideoIcon } from 'lucide-react';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
  preview?: boolean;
}

export default function VideoUpload({
  value = '',
  onChange,
  folder = 'general',
  label = 'Vidéo',
  placeholder = 'https://example.com/video.mp4',
  preview = true
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez MP4, WebM, OGG ou MOV.');
      return;
    }

    // Vérifier la taille (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Fichier trop volumineux. Taille maximale : 50MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/upload-video', {
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
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Zone d'upload */}
      <div className="flex gap-3 items-start">
        {/* Input URL manuel */}
        <div className="flex-1">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder={placeholder}
          />
        </div>

        {/* Bouton upload */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Upload...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload</span>
              </>
            )}
          </button>
        </div>

        {/* Bouton supprimer */}
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Supprimer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500">
        🎥 Cliquez sur "Upload" pour sélectionner une vidéo depuis votre ordinateur (max 50MB, MP4/WebM/MOV) ou collez une URL
      </p>

      {/* Aperçu */}
      {preview && value && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
          <video
            src={value}
            controls
            className="w-full max-h-64 rounded-lg"
            onError={() => setError('Impossible de charger la vidéo')}
          >
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
      )}
    </div>
  );
}
