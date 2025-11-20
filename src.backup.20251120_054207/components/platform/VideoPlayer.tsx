"use client"

import { useState } from 'react'
import { Play, X } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl?: string
  thumbnailUrl?: string
  title?: string
  description?: string
}

export default function VideoPlayer({
  videoUrl = '', // Vous mettrez l'URL de votre vidéo ici demain
  thumbnailUrl = '/images/video-thumbnail-placeholder.jpg',
  title = 'Créez votre site d\'institut en 15 minutes',
  description = 'Découvrez comment LAIA Connect transforme votre activité'
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Si pas de vidéo, afficher un placeholder
  const hasVideo = videoUrl && videoUrl.length > 0

  return (
    <div className="relative w-full">
      {!isPlaying ? (
        // Thumbnail avec bouton Play
        <div className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
          onClick={() => hasVideo && setIsPlaying(true)}
        >
          {/* Image de fond */}
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
                {!hasVideo && (
                  <p className="mt-4 text-sm text-purple-600 font-medium">
                    📹 Vidéo de démonstration à venir
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Overlay avec bouton Play */}
          {hasVideo && (
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                <Play className="w-10 h-10 text-purple-600 ml-1" fill="currentColor" />
              </div>
            </div>
          )}
        </div>
      ) : (
        // Lecteur vidéo
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          {/* Bouton fermer */}
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Vidéo */}
          <div className="aspect-video bg-black">
            {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
              // YouTube embed
              <iframe
                className="w-full h-full"
                src={videoUrl.replace('watch?v=', 'embed/') + '?autoplay=1'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoUrl.includes('vimeo.com') ? (
              // Vimeo embed
              <iframe
                className="w-full h-full"
                src={videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/') + '?autoplay=1'}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : videoUrl ? (
              // Vidéo HTML5 (MP4, WebM, etc.)
              <video
                className="w-full h-full"
                controls
                autoPlay
                src={videoUrl}
              >
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}