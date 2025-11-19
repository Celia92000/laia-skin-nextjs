'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  target: string // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: string // Optional CTA text
}

const tourSteps: TourStep[] = [
  {
    id: 'dashboard',
    title: '📊 Tableau de bord',
    description: 'Suivez vos statistiques en temps réel : réservations, chiffre d\'affaires, clients.',
    target: '[data-tour="dashboard"]',
    position: 'right'
  },
  {
    id: 'planning',
    title: '📅 Planning',
    description: 'Gérez vos rendez-vous, visualisez votre semaine et ajoutez des réservations manuellement.',
    target: '[data-tour="planning"]',
    position: 'right'
  },
  {
    id: 'clients',
    title: '👥 Clients',
    description: 'Consultez vos fiches clients, leur historique de réservations et ajoutez des notes.',
    target: '[data-tour="clients"]',
    position: 'right'
  },
  {
    id: 'services',
    title: '💼 Services',
    description: 'Ajoutez et modifiez vos prestations : tarifs, durées, descriptions et photos.',
    target: '[data-tour="services"]',
    position: 'right',
    action: 'Ajouter mes prestations'
  },
  {
    id: 'communications',
    title: '📧 Communications',
    description: 'Envoyez des emails et SMS à vos clients, créez des campagnes marketing automatisées.',
    target: '[data-tour="communications"]',
    position: 'right'
  },
  {
    id: 'settings',
    title: '⚙️ Paramètres',
    description: 'Configurez vos horaires d\'ouverture, durée des créneaux et informations de contact.',
    target: '[data-tour="settings"]',
    position: 'right',
    action: 'Configurer mes horaires'
  }
]

export default function GuidedTour() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    // Vérifier si le tour a déjà été complété
    const tourCompleted = localStorage.getItem('laia-guided-tour-completed')
    const welcomeSeen = localStorage.getItem('laia-welcome-seen')

    // Lancer le tour uniquement si la welcome modal a été vue ET que le tour n'a pas été complété
    if (welcomeSeen === 'true' && !tourCompleted) {
      // Petit délai pour laisser la page charger
      const timer = setTimeout(() => {
        setIsActive(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!isActive) return

    const updateTargetPosition = () => {
      const step = tourSteps[currentStep]
      const element = document.querySelector(step.target)

      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)

        // Scroll vers l'élément si nécessaire
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    updateTargetPosition()
    window.addEventListener('resize', updateTargetPosition)
    window.addEventListener('scroll', updateTargetPosition)

    return () => {
      window.removeEventListener('resize', updateTargetPosition)
      window.removeEventListener('scroll', updateTargetPosition)
    }
  }, [isActive, currentStep])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTour()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('laia-guided-tour-completed', 'true')
    setIsActive(false)
  }

  const completeTour = () => {
    localStorage.setItem('laia-guided-tour-completed', 'true')
    setIsActive(false)
  }

  if (!isActive || !targetRect) return null

  const step = tourSteps[currentStep]
  const progress = ((currentStep + 1) / tourSteps.length) * 100

  // Calculer la position du tooltip
  const getTooltipPosition = () => {
    const tooltipWidth = 400
    const tooltipHeight = 200
    const offset = 20

    switch (step.position) {
      case 'bottom':
        return {
          top: targetRect.bottom + offset,
          left: targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)
        }
      case 'top':
        return {
          top: targetRect.top - tooltipHeight - offset,
          left: targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)
        }
      case 'right':
        return {
          top: targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2),
          left: targetRect.right + offset
        }
      case 'left':
        return {
          top: targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2),
          left: targetRect.left - tooltipWidth - offset
        }
    }
  }

  const tooltipPosition = getTooltipPosition()

  return (
    <>
      {/* Overlay avec spotlight sur l'élément ciblé */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Dark overlay with cutout */}
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Highlighted border around target */}
        <div
          className="absolute border-4 border-purple-500 rounded-xl shadow-2xl animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 4px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.6)'
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[9999] pointer-events-auto bg-white rounded-2xl shadow-2xl border-2 border-purple-200 w-[400px]"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-t-2xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-purple-600">
                  Étape {currentStep + 1}/{tourSteps.length}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {step.title}
              </h3>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fermer le tour"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">
            {step.description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Passer le tour
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Terminer
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional action link */}
          {step.action && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  completeTour()
                  // Trigger click on the menu item to open the tab
                  const element = document.querySelector(step.target) as HTMLButtonElement
                  if (element) {
                    element.click()
                  }
                }}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1 transition-colors"
              >
                {step.action} →
              </button>
            </div>
          )}
        </div>

        {/* Step indicators */}
        <div className="px-6 pb-6 flex items-center gap-2">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-purple-600'
                  : index < currentStep
                  ? 'bg-purple-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
