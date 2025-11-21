'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function WelcomeBanner() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Vérifier si la bannière a déjà été fermée
    const bannerDismissed = localStorage.getItem('welcome-banner-dismissed')
    const isFirstLogin = localStorage.getItem('is-first-login')

    // Afficher si c'est la première connexion ET que la bannière n'a pas été fermée
    if (isFirstLogin === 'true' && !bannerDismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('welcome-banner-dismissed', 'true')
    setIsVisible(false)
  }

  const handleConfigureClick = () => {
    localStorage.setItem('welcome-banner-dismissed', 'true')
    setIsVisible(false)
    router.push('/admin/settings?tab=site')
  }

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6 mb-6 shadow-lg overflow-hidden">
      {/* Effets de fond animés */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Contenu */}
      <div className="relative flex items-start gap-4">
        {/* Icône */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        {/* Texte */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            Bienvenue sur LAIA Connect ! 🎉
          </h3>
          <p className="text-gray-700 mb-4 text-lg">
            Configurez votre site en quelques minutes pour commencer à recevoir des réservations en ligne.
          </p>

          {/* Checklist rapide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Compte créé</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Personnaliser le site</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Ajouter vos soins</span>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleConfigureClick}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Configurer mon site →
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-white/50 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
