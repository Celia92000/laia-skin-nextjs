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
    <div className="bg-gradient-to-br from-[#d4b5a0] via-[#f9f5f2] to-[#c9a084] rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden border-2 border-[#c9a084]/30">
      {/* Motif de fond */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2c3e50] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2c3e50] rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Bouton fermer */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-[#2c3e50]/60 hover:text-[#2c3e50] transition-colors p-2 rounded-lg hover:bg-white/20"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Contenu */}
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-[#2c3e50] rounded-xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-[#2c3e50] mb-2">
              {firstName ? `Bienvenue ${firstName} !` : 'Bienvenue !'}
            </h2>
            <p className="text-[#2c3e50]/80 text-lg font-medium">
              {planMessages[plan]}
            </p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/80 shadow-sm">
          <h3 className="text-[#2c3e50] font-bold mb-3 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Votre mission : 5 étapes en 15 minutes
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-[#2c3e50] text-sm bg-white/50 rounded-lg p-3 shadow-sm">
              <div className="font-bold mb-1">1. 🎨 Template</div>
              <div className="text-xs text-[#2c3e50]/70">2 min</div>
            </div>
            <div className="text-[#2c3e50] text-sm bg-white/50 rounded-lg p-3 shadow-sm">
              <div className="font-bold mb-1">2. 🌈 Couleurs</div>
              <div className="text-xs text-[#2c3e50]/70">1 min</div>
            </div>
            <div className="text-[#2c3e50] text-sm bg-white/50 rounded-lg p-3 shadow-sm">
              <div className="font-bold mb-1">3. 🖼️ Logo</div>
              <div className="text-xs text-[#2c3e50]/70">1 min</div>
            </div>
            <div className="text-[#2c3e50] text-sm bg-white/50 rounded-lg p-3 shadow-sm">
              <div className="font-bold mb-1">4. 💆 Service</div>
              <div className="text-xs text-[#2c3e50]/70">2 min</div>
            </div>
            <div className="text-[#2c3e50] text-sm bg-white/50 rounded-lg p-3 shadow-sm">
              <div className="font-bold mb-1">5. 🕐 Horaires</div>
              <div className="text-xs text-[#2c3e50]/70">2 min</div>
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#2c3e50] font-bold">Configuration globale</span>
            <span className="text-[#2c3e50] font-bold text-lg">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-white/80 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-[#2c3e50] via-[#3d5a80] to-[#2c3e50] h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end px-2 shadow-sm"
              style={{ width: `${completionPercentage}%` }}
            >
              {completionPercentage > 10 && (
                <span className="text-xs font-bold text-white drop-shadow-lg">{completionPercentage}%</span>
              )}
            </div>
          </div>
          <p className="text-[#2c3e50]/80 text-sm mt-2 font-medium">
            {remainingPercentage > 0
              ? `Plus que ${remainingPercentage}% pour finaliser votre site !`
              : 'Félicitations ! Votre configuration est terminée 🎉'
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleStartSetup}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#2c3e50] text-white rounded-xl font-bold text-lg hover:bg-[#3d5a80] hover:shadow-2xl hover:scale-105 transition-all"
          >
            {completionPercentage === 0 ? 'Commencer maintenant' : 'Continuer la configuration'}
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#2c3e50] text-sm font-medium">
            <span className="inline-block w-2 h-2 bg-[#2c3e50] rounded-full animate-pulse"></span>
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
