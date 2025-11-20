'use client'

import { ReactNode } from 'react'

interface OnboardingStepWrapperProps {
  title: string
  description: string
  icon: string
  children: ReactNode
}

export default function OnboardingStepWrapper({
  title,
  description,
  icon,
  children
}: OnboardingStepWrapperProps) {
  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
          <span className="text-4xl">{icon}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600">
          {description}
        </p>
      </div>

      {/* Form content */}
      <div className="space-y-5">
        {children}
      </div>
    </div>
  )
}
