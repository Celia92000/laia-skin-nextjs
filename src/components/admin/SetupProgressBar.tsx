'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import WelcomeSetupBanner from './WelcomeSetupBanner'
import CompleteOnboardingWizard from '../CompleteOnboardingWizard'

interface SetupProgressBarProps {
  completionPercentage: number
  stats?: {
    hasTemplate?: boolean
    hasCustomColors?: boolean
    hasLogo?: boolean
    hasServices?: boolean
    hasBusinessHours?: boolean
  }
  organizationId?: string
  plan?: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'
  firstName?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

export default function SetupProgressBar({
  completionPercentage,
  stats,
  organizationId,
  plan,
  firstName,
  primaryColor = '#d4b5a0',
  secondaryColor = '#c9a084',
  accentColor = '#2c3e50'
}: SetupProgressBarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showWizard, setShowWizard] = useState(false)

  // Écouter l'événement pour ouvrir/fermer le wizard
  useEffect(() => {
    console.log('🔧 SetupProgressBar: useEffect monté, écouteur installé')

    const handleOpenWizard = (e: any) => {
      console.log('🎬 SetupProgressBar: Événement openConfigWizard reçu', e.detail)

      if (e.detail?.forceOpen) {
        console.log('✅ Ouverture FORCÉE du wizard depuis modal "C\'est parti"')
        setShowWizard(true)

        // Scroller vers le wizard après un délai suffisant pour le rendu
        setTimeout(() => {
          console.log('🔍 Scroll vers #config-wizard...')
          const wizardElement = document.getElementById('config-wizard')
          if (wizardElement) {
            console.log('📍 Element trouvé, scrolling...')
            wizardElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } else {
            console.warn('⚠️ Element #config-wizard non trouvé')
          }
        }, 500)
      } else {
        console.log('🔄 Toggle du wizard')
        setShowWizard(prev => !prev)
      }
    }

    window.addEventListener('openConfigWizard', handleOpenWizard)
    console.log('✅ Écouteur openConfigWizard installé')

    return () => {
      window.removeEventListener('openConfigWizard', handleOpenWizard)
      console.log('🧹 Écouteur openConfigWizard retiré')
    }
  }, [])

  // Ne pas afficher si étapes importantes complètes (>= 70%) OU si pas d'organizationId/plan
  if (completionPercentage >= 70 || !organizationId || !plan) {
    return null
  }

  const remainingPercentage = 100 - completionPercentage

  return (
    <>
      {/* Barre compacte sticky en haut */}
      <div
        className="sticky top-0 z-40 shadow-xl border-b-2"
        style={{
          background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
          borderColor: `${secondaryColor}50`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: accentColor }}>
                    Configuration du site
                  </span>
                  <span
                    className="px-2 py-0.5 text-white rounded-full text-xs font-bold"
                    style={{ backgroundColor: accentColor }}
                  >
                    {completionPercentage}%
                  </span>
                </div>
                {!showWizard && (
                  <div className="w-full max-w-md bg-white/40 rounded-full h-2 mt-1">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${completionPercentage}%`,
                        background: `linear-gradient(to right, ${accentColor}, ${primaryColor})`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                console.log('🎯 Clic sur bouton Configurer/Réduire')
                setShowWizard(!showWizard)

                // Scroller vers le wizard après ouverture
                if (!showWizard) {
                  setTimeout(() => {
                    const wizardElement = document.getElementById('config-wizard')
                    if (wizardElement) {
                      wizardElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }, 100)
                }
              }}
              className="px-6 py-2 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
              style={{ backgroundColor: accentColor }}
            >
              {showWizard ? 'Réduire' : 'Configurer'}
            </button>
          </div>
        </div>
      </div>

      {/* Wizard complet qui s'étend - NON STICKY, scrollable */}
      {showWizard && (
        <div className="bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div
              id="config-wizard"
              className="bg-white rounded-lg shadow-xl border-2 border-gray-200 p-6"
            >
              <CompleteOnboardingWizard
                onComplete={() => {
                  setShowWizard(false)
                  window.location.reload()
                }}
                inModal={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
