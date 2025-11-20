'use client'

import { useState, useEffect } from 'react'
import { X, Settings, ChevronRight } from 'lucide-react'

export default function SetupReminderBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const wizardCompleted = localStorage.getItem('laia-quick-setup-completed')
    const bannerDismissed = localStorage.getItem('laia-setup-reminder-dismissed')
    const savedData = localStorage.getItem('laia-quick-setup-data')

    // Afficher si le wizard n'est pas complété et que la bannière n'a pas été fermée
    if (!wizardCompleted && !bannerDismissed) {
      setIsVisible(true)

      // Calculer la progression si des données ont été sauvegardées
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          let completedSteps = 0
          const totalSteps = 6

          if (data.institutName && data.siret) completedSteps++
          if (data.openingHours) completedSteps++
          if (data.serviceName) completedSteps++
          if (data.primaryColor) completedSteps++
          if (data.phone) completedSteps++

          setProgress((completedSteps / totalSteps) * 100)
        } catch (e) {
          console.error('Error parsing saved data:', e)
        }
      }
    }
  }, [])

  const handleResumeSetup = () => {
    // Réouvrir le wizard en supprimant le flag de complétion
    localStorage.removeItem('laia-quick-setup-completed')
    window.location.reload()
  }

  const handleDismiss = () => {
    if (confirm('Vous pourrez toujours reprendre la configuration plus tard depuis l\'onglet Paramètres → Configuration du site.\n\nVoulez-vous vraiment masquer ce rappel ?')) {
      localStorage.setItem('laia-setup-reminder-dismissed', 'true')
      setIsVisible(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-4 mb-6 shadow-md">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 hover:bg-white/50 rounded-lg transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4 text-orange-700" />
      </button>

      <div className="flex items-start gap-4 pr-8">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
            <Settings className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-orange-900 mb-1 flex items-center gap-2">
            ⚙️ Configuration incomplète
          </h3>
          <p className="text-sm text-orange-800 mb-3">
            Terminez la configuration de votre site pour accéder à toutes les fonctionnalités
          </p>

          {/* Progress bar */}
          {progress > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-orange-700 mb-1">
                <span className="font-medium">Progression</span>
                <span className="font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-orange-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResumeSetup}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <Settings className="w-4 h-4" />
              Reprendre la configuration
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-orange-700 hover:text-orange-900 font-medium text-sm transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
