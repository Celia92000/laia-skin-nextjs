'use client'

import { Check } from 'lucide-react'

interface Step {
  id: string
  label: string
  completed: boolean
  current: boolean
}

interface OnboardingProgressProps {
  steps: Step[]
  currentStepIndex: number
  totalSteps: number
}

export default function OnboardingProgress({ steps, currentStepIndex, totalSteps }: OnboardingProgressProps) {
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Titre et pourcentage */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configuration de votre espace</h2>
            <p className="text-sm text-gray-600 mt-1">
              Étape {currentStepIndex + 1} sur {totalSteps}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: '#7c3aed' }}>
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-xs text-gray-500">Progression</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="relative">
          <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
            <div
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: '#7c3aed',
                transition: 'width 0.5s ease-in-out'
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
            />
          </div>
        </div>

        {/* Checklist des étapes */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`
                relative flex items-center gap-2 p-2 rounded-lg border transition-all
                ${step.completed
                  ? 'bg-green-50 border-green-200'
                  : step.current
                    ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-300'
                    : 'bg-gray-50 border-gray-200'
                }
              `}
            >
              {/* Icône */}
              <div
                className={`
                  flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                  ${step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }
                `}
              >
                {step.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p
                  className={`
                    text-xs font-medium truncate
                    ${step.completed
                      ? 'text-green-700'
                      : step.current
                        ? 'text-purple-700'
                        : 'text-gray-600'
                    }
                  `}
                >
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message d'encouragement */}
        {progressPercentage < 100 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {progressPercentage < 25 && "🚀 C'est parti ! Quelques informations pour commencer..."}
              {progressPercentage >= 25 && progressPercentage < 50 && "💪 Excellent ! Vous progressez bien !"}
              {progressPercentage >= 50 && progressPercentage < 75 && "🎉 Plus que quelques étapes !"}
              {progressPercentage >= 75 && "🏁 Vous y êtes presque !"}
            </p>
          </div>
        )}

        {progressPercentage === 100 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 text-center">
              ✅ Configuration terminée ! Votre espace est prêt.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
