'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Circle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

interface ChecklistItem {
  id: string
  label: string
  description: string
  tabId: string
  isCompleted: boolean
  percentage: number
  completed: number
  total: number
}

interface ConfigurationChecklistProps {
  currentTabId: string
  onTabChange: (tabId: string) => void
}

export default function ConfigurationChecklist({ currentTabId, onTabChange }: ConfigurationChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [loading, setLoading] = useState(true)
  const [globalPercentage, setGlobalPercentage] = useState(0)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])

  useEffect(() => {
    fetchCompletionData()
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchCompletionData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCompletionData = async () => {
    try {
      const response = await fetch('/api/admin/config-completion')
      if (response.ok) {
        const data = await response.json()

        setGlobalPercentage(data.globalPercentage)

        // Mapper les données de l'API vers le format de la checklist
        const items: ChecklistItem[] = []

        // Seulement ajouter les sections qui existent dans la réponse de l'API
        if (data.sections.services) {
          items.push({
            id: 'services',
            label: data.sections.services.label,
            description: `${data.sections.services.completed}/${data.sections.services.total} services créés`,
            tabId: 'services',
            isCompleted: data.sections.services.isCompleted,
            percentage: data.sections.services.percentage,
            completed: data.sections.services.completed,
            total: data.sections.services.total
          })
        }

        if (data.sections.appearance) {
          items.push({
            id: 'appearance',
            label: data.sections.appearance.label,
            description: `${data.sections.appearance.completed}/${data.sections.appearance.total} champs remplis`,
            tabId: 'appearance',
            isCompleted: data.sections.appearance.isCompleted,
            percentage: data.sections.appearance.percentage,
            completed: data.sections.appearance.completed,
            total: data.sections.appearance.total
          })
        }

        if (data.sections.seo) {
          items.push({
            id: 'seo',
            label: data.sections.seo.label,
            description: `${data.sections.seo.completed}/${data.sections.seo.total} champs remplis`,
            tabId: 'seo',
            isCompleted: data.sections.seo.isCompleted,
            percentage: data.sections.seo.percentage,
            completed: data.sections.seo.completed,
            total: data.sections.seo.total
          })
        }

        setChecklist(items)
      }
    } catch (error) {
      console.error('Erreur chargement complétion config:', error)
    } finally {
      setLoading(false)
    }
  }

  const completedCount = checklist.filter(item => item.isCompleted).length
  const totalCount = checklist.length
  const progressPercentage = globalPercentage

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden mb-6">
      {/* En-tête */}
      <div
        className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-white">Configuration du site</h3>
              <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-semibold">
                {completedCount}/{totalCount}
              </span>
            </div>
            <p className="text-white/90 text-sm mb-3">
              Complétez ces étapes pour personnaliser votre site au maximum
            </p>

            {/* Barre de progression */}
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 20 && (
                  <span className="text-xs font-bold text-purple-600">{Math.round(progressPercentage)}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Bouton expand/collapse */}
          <button className="ml-4 p-2 rounded-lg hover:bg-white/10 transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-white" />
            ) : (
              <ChevronDown className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Liste des items */}
      {isExpanded && (
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-600 mt-2 text-sm">Chargement...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    item.isCompleted
                      ? 'bg-green-50 border-green-200 hover:border-green-300'
                      : currentTabId === item.tabId
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onTabChange(item.tabId)}
                >
                  {/* Icône de statut (non cliquable) */}
                  <div className="flex-shrink-0 mt-0.5">
                    {item.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : item.percentage > 0 ? (
                      <AlertCircle className="w-6 h-6 text-orange-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${item.isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                        {item.label}
                      </h4>
                      {item.percentage > 0 && !item.isCompleted && (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                          {item.percentage}%
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${item.isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Badge current tab */}
                  {currentTabId === item.tabId && !item.isCompleted && (
                    <span className="flex-shrink-0 px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                      En cours
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message de félicitations si tout est complété */}
          {!loading && completedCount === totalCount && totalCount > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-900 text-lg">Félicitations !</h4>
                  <p className="text-green-700 text-sm">
                    Votre site est entièrement configuré et prêt à accueillir vos clients !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info automatique */}
          {!loading && (
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                ℹ️ <strong>Détection automatique</strong> : La complétion se met à jour automatiquement en fonction des champs remplis dans votre configuration.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
