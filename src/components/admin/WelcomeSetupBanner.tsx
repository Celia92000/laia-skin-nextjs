'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, X } from 'lucide-react'

interface WelcomeSetupBannerProps {
  organizationId: string
  plan: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'
  firstName?: string
  completionPercentage?: number
}

export default function WelcomeSetupBanner({ organizationId, plan, firstName, completionPercentage = 0 }: WelcomeSetupBannerProps) {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Vérifier si la bannière a déjà été fermée
    const bannerDismissed = localStorage.getItem(`welcome_banner_dismissed_${organizationId}`)
    if (!bannerDismissed) {
      setShowBanner(true)
    }
  }, [organizationId])

  const remainingPercentage = 100 - completionPercentage

  const handleDismiss = () => {
    localStorage.setItem(`welcome_banner_dismissed_${organizationId}`, 'true')
    setShowBanner(false)
  }

  const handleStartSetup = () => {
    // Scroller vers la checklist
    const checklist = document.querySelector('[data-setup-checklist]')
    if (checklist) {
      checklist.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    handleDismiss()
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
    <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
      {/* Motif de fond */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Bouton fermer */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Contenu */}
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">
              {firstName ? `Bienvenue ${firstName} !` : 'Bienvenue !'}
            </h2>
            <p className="text-white/90 text-lg">
              {planMessages[plan]}
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Votre mission : 5 étapes en 15 minutes
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-white/90 text-sm">
              <div className="font-medium mb-1">1. 🎨 Template</div>
              <div className="text-xs text-white/70">2 min</div>
            </div>
            <div className="text-white/90 text-sm">
              <div className="font-medium mb-1">2. 🌈 Couleurs</div>
              <div className="text-xs text-white/70">1 min</div>
            </div>
            <div className="text-white/90 text-sm">
              <div className="font-medium mb-1">3. 🖼️ Logo</div>
              <div className="text-xs text-white/70">1 min</div>
            </div>
            <div className="text-white/90 text-sm">
              <div className="font-medium mb-1">4. 💆 Service</div>
              <div className="text-xs text-white/70">2 min</div>
            </div>
            <div className="text-white/90 text-sm">
              <div className="font-medium mb-1">5. 🕐 Horaires</div>
              <div className="text-xs text-white/70">2 min</div>
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Configuration globale</span>
            <span className="text-white font-bold text-lg">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end px-2"
              style={{ width: `${completionPercentage}%` }}
            >
              {completionPercentage > 10 && (
                <span className="text-xs font-bold text-white drop-shadow-lg">{completionPercentage}%</span>
              )}
            </div>
          </div>
          <p className="text-white/80 text-sm mt-2">
            {remainingPercentage > 0
              ? `Plus que ${remainingPercentage}% pour finaliser votre site !`
              : 'Félicitations ! Votre configuration est terminée 🎉'
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleStartSetup}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            {completionPercentage === 0 ? 'Commencer maintenant' : 'Continuer la configuration'}
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-white/90 text-sm">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>
              {completionPercentage === 0 && 'Démarrez en 15 minutes chrono'}
              {completionPercentage > 0 && completionPercentage < 50 && 'Bon début ! Continuez'}
              {completionPercentage >= 50 && completionPercentage < 100 && 'Vous êtes sur la bonne voie !'}
              {completionPercentage === 100 && 'Configuration terminée ✓'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
