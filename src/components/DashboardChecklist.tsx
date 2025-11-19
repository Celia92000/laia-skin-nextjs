'use client'

import { useState, useEffect } from 'react'
import { Check, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  link?: string
  linkText?: string
}

interface DashboardChecklistProps {
  userId: string
}

export default function DashboardChecklist({ userId }: DashboardChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [userId])

  async function fetchProgress() {
    try {
      const response = await fetch('/api/admin/onboarding/progress')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
      }
    } catch (error) {
      console.error('Erreur chargement progression:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsCompleted(itemId: string) {
    try {
      await fetch('/api/admin/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, completed: true })
      })
      setItems(items.map(item =>
        item.id === itemId ? { ...item, completed: true } : item
      ))
    } catch (error) {
      console.error('Erreur maj progression:', error)
    }
  }

  const completedCount = items.filter(i => i.completed).length
  const totalCount = items.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const isComplete = completedCount === totalCount

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-1">
              🎉 Configuration terminée !
            </h3>
            <p className="text-sm text-green-700">
              Votre espace est entièrement configuré. Vous pouvez maintenant profiter de toutes les fonctionnalités.
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-green-600 hover:text-green-700 p-1"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="grid grid-cols-2 gap-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Configuration de votre espace
            </h3>
            <p className="text-sm text-gray-600">
              {completedCount} sur {totalCount} tâches complétées
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Progression</span>
          <span className="font-bold text-purple-600">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden border border-purple-200">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Liste des tâches */}
      {isExpanded && (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`
                p-4 rounded-lg border transition-all
                ${item.completed
                  ? 'bg-white border-green-200'
                  : 'bg-white border-gray-200 hover:border-purple-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => !item.completed && markAsCompleted(item.id)}
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                    ${item.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-purple-500 cursor-pointer'
                    }
                  `}
                  disabled={item.completed}
                >
                  {item.completed && <Check className="w-4 h-4 text-white" />}
                </button>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Lien d'action */}
                  {!item.completed && item.link && (
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      {item.linkText || 'Configurer'} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message d'encouragement */}
      {!isComplete && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
          <p className="text-sm text-gray-700 text-center">
            {progressPercentage < 25 && "🚀 Bienvenue ! Commencez par configurer les bases."}
            {progressPercentage >= 25 && progressPercentage < 50 && "💪 Excellent début ! Continuez comme ça."}
            {progressPercentage >= 50 && progressPercentage < 75 && "🎉 Vous avancez bien ! Plus que quelques étapes."}
            {progressPercentage >= 75 && "🏁 Presque terminé ! Dernière ligne droite."}
          </p>
        </div>
      )}
    </div>
  )
}
