'use client'

import Link from 'next/link'

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  time: string
  link: string
  priority: 1 | 2 | 3 // 1 = essentiel, 2 = recommandé, 3 = optionnel
  video?: string
  category?: 'setup' | 'content' | 'team' | 'advanced'
  phase?: 1 | 2 | 3 // Phase de la tâche
  requiredPlan?: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM' // Plan minimum requis
  requiredFeature?: string // Feature requise (featureCRM, featureShop, etc.)
}

interface SetupTaskProps {
  task: Task
}

export default function SetupTask({ task }: SetupTaskProps) {
  if (task.completed) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 transition-all">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 line-through">{task.title}</p>
        </div>
        <span className="text-xs text-green-600 font-medium whitespace-nowrap">✓ Terminé</span>
      </div>
    )
  }

  // Priority badge color
  const priorityConfig = {
    1: { bg: 'bg-red-100', text: 'text-red-600', label: 'Essentiel' },
    2: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Recommandé' },
    3: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Optionnel' }
  }
  const priority = priorityConfig[task.priority]

  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group">
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-full group-hover:border-purple-500 transition-colors" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Title + Time + Priority */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900">{task.title}</h3>

          {/* Time estimate */}
          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200 whitespace-nowrap">
            ⏱️ {task.time}
          </span>

          {/* Priority badge (only for priority 1) */}
          {task.priority === 1 && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priority.bg} ${priority.text} whitespace-nowrap`}>
              {priority.label}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-2">{task.description}</p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={task.link}
            className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            Commencer
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {task.video && (
            <a
              href={task.video}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              🎬 Voir la vidéo
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
