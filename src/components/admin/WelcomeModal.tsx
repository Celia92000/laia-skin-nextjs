"use client"

import { useState, useEffect } from 'react'
import { X, Play, CheckCircle } from 'lucide-react'
import VideoPlayer from '../platform/VideoPlayer'

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')

  useEffect(() => {
    // Vérifier si c'est la première connexion
    const hasSeenWelcome = localStorage.getItem('laia-welcome-seen')

    if (!hasSeenWelcome) {
      setIsOpen(true)
    }

    // Charger l'URL de la vidéo tuto depuis l'API
    fetch('/api/platform/videos')
      .then(res => res.json())
      .then(data => setVideoUrl(data.welcomeTutorial))
      .catch(err => console.error('Erreur chargement vidéo:', err))
  }, [])

  const handleClose = () => {
    localStorage.setItem('laia-welcome-seen', 'true')
    setIsOpen(false)
  }

  const handleSkip = () => {
    localStorage.setItem('laia-welcome-seen', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl">
              👋
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">
                Bienvenue sur LAIA Connect !
              </h2>
              <p className="text-purple-100">
                Votre site est prêt, découvrez comment le personnaliser en 5 minutes
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {!showVideo ? (
            <div className="space-y-6">
              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Personnalisez votre design
                    </h3>
                    <p className="text-sm text-gray-600">
                      Couleurs, logo, photos - tout est modifiable en quelques clics
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💼</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Ajoutez vos prestations
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vos soins, tarifs et disponibilités en moins de 5 minutes
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Configurez votre agenda
                    </h3>
                    <p className="text-sm text-gray-600">
                      Horaires, créneaux, durées - tout est automatique ensuite
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Lancez votre site
                    </h3>
                    <p className="text-sm text-gray-600">
                      En ligne immédiatement, visible sur Google en 48h
                    </p>
                  </div>
                </div>
              </div>

              {/* Video CTA */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Tutoriel vidéo : Configurez votre site en 5 minutes
                    </h3>
                    <p className="text-gray-600">
                      Je vous montre étape par étape comment personnaliser votre site
                    </p>
                  </div>
                  <button
                    onClick={() => setShowVideo(true)}
                    className="flex-shrink-0 ml-4 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" fill="currentColor" />
                    Voir le tuto
                  </button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Par où commencer ?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="/admin/apparence"
                    onClick={handleClose}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group"
                  >
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="font-medium text-gray-900 group-hover:text-purple-600">
                      Personnaliser l'apparence
                    </div>
                  </a>

                  <a
                    href="/admin/prestations"
                    onClick={handleClose}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group"
                  >
                    <div className="text-2xl mb-2">💼</div>
                    <div className="font-medium text-gray-900 group-hover:text-purple-600">
                      Ajouter mes prestations
                    </div>
                  </a>

                  <a
                    href="/admin/parametres"
                    onClick={handleClose}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group"
                  >
                    <div className="text-2xl mb-2">⚙️</div>
                    <div className="font-medium text-gray-900 group-hover:text-purple-600">
                      Configurer mes horaires
                    </div>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            // Video view
            <div className="space-y-6">
              <button
                onClick={() => setShowVideo(false)}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                ← Retour
              </button>

              <VideoPlayer
                videoUrl={videoUrl}
                title="Comment configurer votre site LAIA Connect"
                description="Tutoriel complet de 5 minutes"
              />

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 mb-1">
                    Besoin d'aide personnalisée ?
                  </p>
                  <p className="text-sm text-green-700">
                    Notre équipe est là ! Accédez à l'aide depuis le menu en haut à droite.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-8 py-4 flex items-center justify-between border-t">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Passer l'introduction
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            C'est parti ! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}