'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, X } from 'lucide-react'

interface WelcomeSetupBannerProps {
  organizationId: string
  plan: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'
  firstName?: string
  completionPercentage?: number
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

export default function WelcomeSetupBanner({
  organizationId,
  plan,
  firstName,
  completionPercentage = 0,
  primaryColor = '#d4b5a0',
  secondaryColor = '#c9a084',
  accentColor = '#2c3e50'
}: WelcomeSetupBannerProps) {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Vérifier si la bannière a déjà été fermée
    const bannerDismissed = localStorage.getItem(`welcome_banner_dismissed_${organizationId}`)

    // ✨ NOUVEAU : Réafficher tant que les étapes importantes ne sont pas complètes (< 70%)
    if (completionPercentage < 70) {
      setShowBanner(true)
    } else if (!bannerDismissed) {
      setShowBanner(true)
    }
  }, [organizationId, completionPercentage])

  const remainingPercentage = 100 - completionPercentage

  const handleDismiss = () => {
    // ✨ NOUVEAU : Sauvegarder seulement si étapes importantes complètes (>= 70%)
    if (completionPercentage >= 70) {
      localStorage.setItem(`welcome_banner_dismissed_${organizationId}`, 'true')
    }
    setShowBanner(false)
  }

  const handleStartSetup = () => {
    console.log('🎯 Clic sur "Commencer maintenant" de la bannière')
    // Déclencher l'ouverture FORCÉE du wizard (pas toggle)
    const event = new CustomEvent('openConfigWizard', { detail: { forceOpen: true } })
    window.dispatchEvent(event)
    console.log('📤 Événement openConfigWizard dispatché avec forceOpen')
  }

  if (!showBanner) {
    return null
  }

  const planMessages = {
    SOLO: "Votre site professionnel va prendre vie en quelques minutes !",
    DUO: "Votre site avec CRM et emailing va prendre vie en quelques minutes !",
    TEAM: "Votre plateforme complète avec boutique va prendre vie en quelques minutes !",
    PREMIUM: "Votre plateforme ultra-complète va prendre vie en quelques minutes !"
  }

  return (
    <div
      className="rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden border-2"
      style={{
        background: `linear-gradient(to bottom right, ${primaryColor}, #f9f5f2, ${secondaryColor})`,
        borderColor: `${secondaryColor}50`
      }}
    >
      {/* Motif de fond */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/2"
          style={{ backgroundColor: accentColor }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full translate-y-1/2 -translate-x-1/2"
          style={{ backgroundColor: accentColor }}
        ></div>
      </div>

      {/* Bouton fermer */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 transition-colors p-2 rounded-lg hover:bg-white/20"
        style={{ color: `${accentColor}99` }}
        onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
        onMouseLeave={(e) => e.currentTarget.style.color = `${accentColor}99`}
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Contenu */}
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: accentColor }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2" style={{ color: accentColor }}>
              {firstName ? `Bienvenue ${firstName} !` : 'Bienvenue !'}
            </h2>
            <p className="text-lg font-medium" style={{ color: `${accentColor}cc` }}>
              {planMessages[plan]}
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold" style={{ color: accentColor }}>Configuration globale</span>
            <span className="font-bold text-lg" style={{ color: accentColor }}>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-white/80 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end px-2 shadow-sm"
              style={{
                width: `${completionPercentage}%`,
                background: `linear-gradient(to right, ${accentColor}, ${primaryColor}, ${accentColor})`
              }}
            >
              {completionPercentage > 10 && (
                <span className="text-xs font-bold text-white drop-shadow-lg">{completionPercentage}%</span>
              )}
            </div>
          </div>
          <p className="text-sm mt-2 font-medium" style={{ color: `${accentColor}cc` }}>
            {remainingPercentage > 0
              ? `Plus que ${remainingPercentage}% pour finaliser votre site !`
              : 'Félicitations ! Votre configuration est terminée 🎉'
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleStartSetup}
            className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            style={{ backgroundColor: accentColor }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {completionPercentage === 0 ? 'Commencer maintenant' : 'Continuer la configuration'}
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: accentColor }}>
            <span
              className="inline-block w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor }}
            ></span>
            <span>
              {completionPercentage === 0 && 'Démarrez en 15 minutes chrono'}
              {completionPercentage > 0 && completionPercentage < 50 && 'Bon début ! Continuez'}
              {completionPercentage >= 50 && completionPercentage < 70 && 'Vous êtes sur la bonne voie !'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
