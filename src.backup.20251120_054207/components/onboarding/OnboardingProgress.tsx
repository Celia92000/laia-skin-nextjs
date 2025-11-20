'use client'

interface Step {
  id: string
  title: string
  description: string
  icon: string
}

interface OnboardingProgressProps {
  steps: Step[]
  currentStepId: string
}

export default function OnboardingProgress({ steps, currentStepId }: OnboardingProgressProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStepId)
  const progress = ((currentIndex + 1) / steps.length) * 100

  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId
          const isCompleted = index < currentIndex

          return (
            <div
              key={step.id}
              className={`
                relative flex flex-col items-center text-center p-3 rounded-lg transition-all
                ${isActive ? 'bg-purple-50 border-2 border-purple-300' : ''}
                ${isCompleted ? 'opacity-60' : ''}
              `}
            >
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2
                  ${isActive ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg scale-110' : ''}
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  transition-all duration-300
                `}
              >
                {isCompleted ? '✓' : step.icon}
              </div>
              <div className="text-xs font-medium text-gray-900 mb-1">
                {step.title}
              </div>
              <div className="text-xs text-gray-500 hidden md:block">
                {step.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
