'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface SetupProgressBarProps {
  completionPercentage: number
  stats?: {
    hasTemplate?: boolean
    hasCustomColors?: boolean
    hasLogo?: boolean
    hasServices?: boolean
    hasBusinessHours?: boolean
  }
}

export default function SetupProgressBar({ completionPercentage, stats }: SetupProgressBarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Ne pas afficher si étapes importantes complètes (>= 70%)
  if (completionPercentage >= 70) {
    return null
  }

  const remainingPercentage = 100 - completionPercentage

  // Déterminer la première étape non complétée
  const getNextStep = () => {
    if (!stats) return '/admin?tab=config&section=template'

    if (!stats.hasTemplate) return '/admin?tab=config&section=template'
    if (!stats.hasCustomColors) return '/admin?tab=config&section=appearance'
    if (!stats.hasLogo) return '/admin?tab=config&section=general'
    if (!stats.hasServices) return '/admin?tab=services'
    if (!stats.hasBusinessHours) return '/admin?tab=config&section=hours'

    return '/admin?tab=config&section=template' // Fallback
  }

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-[#d4b5a0] via-[#c9a084] to-[#d4b5a0] shadow-xl border-b-2 border-[#c9a084]/30">
      <div className="max-w-7xl mx-auto">
        {/* Barre principale toujours visible */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Icône + Titre */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-1.5 bg-white/30 rounded-lg backdrop-blur-sm flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#2c3e50]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[#2c3e50] font-bold text-sm truncate">
                    Configuration du site
                  </span>
                  <span className="px-2 py-0.5 bg-[#2c3e50] text-white rounded-full text-xs font-bold shadow-sm">
                    {completionPercentage}%
                  </span>
                </div>
                {!isExpanded && (
                  <div className="w-full max-w-xs bg-white/40 rounded-full h-1.5 mt-1 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-[#2c3e50] to-[#3d5a80] h-1.5 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  window.location.href = getNextStep()
                }}
                className="px-4 py-1.5 bg-[#2c3e50] text-white rounded-lg font-semibold text-sm hover:bg-[#3d5a80] hover:shadow-lg hover:scale-105 transition-all"
              >
                Reprendre
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-[#2c3e50] hover:bg-white/30 rounded-lg transition-colors"
                aria-label={isExpanded ? 'Réduire' : 'Développer'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Détails expansibles */}
        {isExpanded && (
          <div className="px-4 pb-3 border-t border-[#2c3e50]/20">
            <div className="pt-3">
              {/* Barre de progression détaillée */}
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/60 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#2c3e50] text-xs font-semibold">Progression globale</span>
                  <span className="text-[#2c3e50] font-bold text-sm">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-[#2c3e50] via-[#3d5a80] to-[#2c3e50] h-3 rounded-full transition-all duration-500 ease-out flex items-center justify-end px-2 shadow-sm"
                    style={{ width: `${completionPercentage}%` }}
                  >
                    {completionPercentage > 15 && (
                      <span className="text-xs font-bold text-white drop-shadow-lg">{completionPercentage}%</span>
                    )}
                  </div>
                </div>
                <p className="text-[#2c3e50]/80 text-xs mt-2 font-medium">
                  {remainingPercentage > 0
                    ? `Plus que ${remainingPercentage}% pour finaliser votre site !`
                    : 'Configuration terminée 🎉'
                  }
                </p>
              </div>

              {/* Étapes à compléter */}
              <div className="grid grid-cols-5 gap-2 text-xs mb-3">
                {[
                  { emoji: '🎨', label: 'Template', time: '2min', link: '/admin?tab=config&section=template' },
                  { emoji: '🌈', label: 'Couleurs', time: '1min', link: '/admin?tab=config&section=appearance' },
                  { emoji: '🖼️', label: 'Logo', time: '1min', link: '/admin?tab=config&section=general' },
                  { emoji: '💆', label: 'Services', time: '2min', link: '/admin?tab=services' },
                  { emoji: '🕐', label: 'Horaires', time: '2min', link: '/admin?tab=config&section=hours' },
                ].map((step, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      window.location.href = step.link
                    }}
                    className="bg-white/50 backdrop-blur-sm rounded-lg p-2 text-center border border-white/80 shadow-sm hover:bg-white/70 hover:border-[#2c3e50]/30 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="text-base mb-0.5">{step.emoji}</div>
                    <div className="text-[#2c3e50] font-semibold text-xs mb-0.5">{step.label}</div>
                    <div className="text-[#2c3e50]/60 text-xs">{step.time}</div>
                  </button>
                ))}
              </div>

              {/* Message d'encouragement */}
              <div className="flex items-center gap-2 text-[#2c3e50] text-xs font-medium">
                <span className="inline-block w-2 h-2 bg-[#2c3e50] rounded-full animate-pulse"></span>
                <span>
                  {completionPercentage === 0 && '🚀 Démarrez en 15 minutes chrono !'}
                  {completionPercentage > 0 && completionPercentage < 40 && '💪 Bon début ! Continuez sur votre lancée'}
                  {completionPercentage >= 40 && completionPercentage < 70 && '⭐ Vous êtes sur la bonne voie !'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
