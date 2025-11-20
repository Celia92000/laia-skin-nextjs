"use client"

import { useState } from 'react'
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react'

interface MediaUploaderProps {
  label: string
  value?: string
  onChange: (url: string) => void
  accept?: 'image' | 'video' | 'both'
  description?: string
}

export default function MediaUploader({
  label,
  value,
  onChange,
  accept = 'both',
  description
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const acceptTypes = {
    image: 'image/*',
    video: 'video/*',
    both: 'image/*,video/*'
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier la taille (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 50MB)')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'laia-media') // À créer dans Cloudinary

      // Upload vers Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dukgbjrse'}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) throw new Error('Échec de l\'upload')

      const data = await response.json()
      onChange(data.secure_url)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleUrlChange = (url: string) => {
    // Support YouTube, Vimeo, URL directes
    onChange(url)
  }

  const isVideo = value && (
    value.includes('youtube.com') ||
    value.includes('youtu.be') ||
    value.includes('vimeo.com') ||
    value.includes('.mp4') ||
    value.includes('.webm')
  )

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {/* Aperçu */}
      {value && (
        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
          {isVideo ? (
            <div className="aspect-video bg-black flex items-center justify-center">
              <Video className="w-16 h-16 text-gray-400" />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Vidéo : {value.substring(0, 40)}...
              </div>
            </div>
          ) : (
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
          )}
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload ou saisie URL */}
      {!value && (
        <div className="space-y-3">
          {/* Upload fichier */}
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-purple-400 transition-colors">
              <div className="flex flex-col items-center text-center">
                {uploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-3" />
                    <p className="text-sm text-gray-600">Upload en cours...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Cliquez pour uploader
                    </p>
                    <p className="text-xs text-gray-500">
                      {accept === 'image' && 'Images uniquement (JPG, PNG, WebP)'}
                      {accept === 'video' && 'Vidéos uniquement (MP4, WebM)'}
                      {accept === 'both' && 'Images ou vidéos (max 50MB)'}
                    </p>
                  </>
                )}
              </div>
            </div>
            <input
              type="file"
              className="hidden"
              accept={acceptTypes[accept]}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          {/* Ou saisir une URL */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <input
            type="url"
            placeholder="Coller une URL (YouTube, Vimeo, image...)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onChange={(e) => handleUrlChange(e.target.value)}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}