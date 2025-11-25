'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Save, X, Copy, Trash2, ToggleLeft, ToggleRight, FileText, Sparkles } from 'lucide-react'

interface SMSTemplate {
  id: string
  name: string
  type: string
  message: string
  active: boolean
}

interface SMSTemplatesTabProps {
  organizationId: string
}

const DEFAULT_TEMPLATES: Omit<SMSTemplate, 'id'>[] = [
  {
    name: "Rappel RDV",
    type: "APPOINTMENT",
    message: "Bonjour {{prenom}}, rappel de votre RDV demain à {{heureRDV}} chez {{institut}}. À très vite ! 💆",
    active: true
  },
  {
    name: "Confirmation RDV",
    type: "CONFIRMATION",
    message: "Bonjour {{prenom}}, votre RDV du {{dateRDV}} à {{heureRDV}} est confirmé chez {{institut}}. À bientôt ! ✨",
    active: true
  },
  {
    name: "Anniversaire",
    type: "BIRTHDAY",
    message: "Joyeux anniversaire {{prenom}} ! 🎉 Profitez de -20% sur votre prochain soin chez {{institut}}. Code: ANNIV20",
    active: true
  },
  {
    name: "Promotion Flash",
    type: "PROMOTION",
    message: "🎁 FLASH ! -30% sur tous nos soins ce week-end chez {{institut}}. Réservez vite !",
    active: true
  },
  {
    name: "Suivi après soin",
    type: "FOLLOW_UP",
    message: "Bonjour {{prenom}}, comment s'est passé votre soin {{service}} ? Votre avis compte pour nous ! 💕 {{institut}}",
    active: true
  },
  {
    name: "Points fidélité",
    type: "LOYALTY",
    message: "Félicitations {{prenom}} ! 🌟 Vous avez {{points}} points fidélité. 1 soin gratuit à partir de 100 points ! {{institut}}",
    active: true
  }
]

const TEMPLATE_TYPES = [
  { value: 'APPOINTMENT', label: 'Rendez-vous' },
  { value: 'CONFIRMATION', label: 'Confirmation' },
  { value: 'BIRTHDAY', label: 'Anniversaire' },
  { value: 'PROMOTION', label: 'Promotion' },
  { value: 'FOLLOW_UP', label: 'Suivi client' },
  { value: 'LOYALTY', label: 'Fidélité' },
  { value: 'CUSTOM', label: 'Personnalisé' }
]

export default function SMSTemplatesTab({ organizationId }: SMSTemplatesTabProps) {
  const [templates, setTemplates] = useState<SMSTemplate[]>([])
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null)
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/admin/sms/templates?organizationId=${organizationId}`)

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.length > 0 ? data : DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: `template-${i}` })))
      } else {
        setTemplates(DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: `template-${i}` })))
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error)
      setTemplates(DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: `template-${i}` })))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async (template: SMSTemplate) => {
    try {
      const method = template.id.startsWith('new-') ? 'POST' : 'PUT'
      const url = template.id.startsWith('new-')
        ? '/api/admin/sms/templates'
        : `/api/admin/sms/templates/${template.id}`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...template,
          organizationId
        })
      })

      if (response.ok) {
        await fetchTemplates()
        setEditingTemplate(null)
        setShowNewTemplateForm(false)
      }
    } catch (error) {
      console.error('Erreur sauvegarde template:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return

    try {
      const response = await fetch(`/api/admin/sms/templates/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error('Erreur suppression template:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleToggleActive = async (template: SMSTemplate) => {
    try {
      const response = await fetch(`/api/admin/sms/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !template.active })
      })

      if (response.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error('Erreur toggle template:', error)
    }
  }

  const handleCopyMessage = (message: string, templateId: string) => {
    navigator.clipboard.writeText(message)
    setCopiedId(templateId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const calculateSMSCount = (message: string) => {
    if (!message) return 0
    const length = message.length
    if (length <= 160) return 1
    return Math.ceil(length / 153)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Templates SMS</h3>
          <p className="text-sm text-gray-600 mt-1">
            Créez et gérez vos modèles de messages réutilisables
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTemplate({
              id: `new-${Date.now()}`,
              name: '',
              type: 'CUSTOM',
              message: '',
              active: true
            })
            setShowNewTemplateForm(true)
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau template
        </button>
      </div>

      {/* Variables disponibles */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">Variables disponibles</h4>
            <div className="flex flex-wrap gap-2">
              {['prenom', 'nom', 'dateRDV', 'heureRDV', 'service', 'institut', 'points'].map((variable, i) => (
                <code key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-mono">
                  {`{{ ${variable} }}`}
                </code>
              ))}
            </div>
            <p className="text-xs text-purple-700 mt-2">
              Ces variables seront automatiquement remplacées par les vraies données lors de l'envoi
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire nouveau template */}
      {showNewTemplateForm && editingTemplate && (
        <div className="bg-white border-2 border-blue-300 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              {editingTemplate.id.startsWith('new-') ? 'Nouveau template' : 'Modifier le template'}
            </h4>
            <button
              onClick={() => {
                setShowNewTemplateForm(false)
                setEditingTemplate(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du template
              </label>
              <input
                type="text"
                value={editingTemplate.name}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Rappel RDV"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de template
              </label>
              <select
                value={editingTemplate.type}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TEMPLATE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={editingTemplate.message}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre message avec des variables comme {{prenom}}"
              />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {editingTemplate.message.length} caractères
                </span>
                <span className="text-gray-600">
                  {calculateSMSCount(editingTemplate.message)} SMS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="template-active"
                checked={editingTemplate.active}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="template-active" className="text-sm font-medium text-gray-700">
                Template actif
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handleSaveTemplate(editingTemplate)}
                disabled={!editingTemplate.name || !editingTemplate.message}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Enregistrer
              </button>

              <button
                onClick={() => {
                  setShowNewTemplateForm(false)
                  setEditingTemplate(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`border-2 rounded-lg p-4 transition ${
              template.active
                ? 'border-gray-200 bg-white hover:border-blue-300'
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
                <span className="text-xs text-gray-500 uppercase">
                  {TEMPLATE_TYPES.find(t => t.value === template.type)?.label || template.type}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(template)}
                  className={`p-1 rounded ${
                    template.active
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={template.active ? 'Désactiver' : 'Activer'}
                >
                  {template.active ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => handleCopyMessage(template.message, template.id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Copier le message"
                >
                  {copiedId === template.id ? (
                    <span className="text-xs text-green-600">✓</span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setEditingTemplate(template)
                    setShowNewTemplateForm(true)
                  }}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-3 rounded border border-gray-200">
              {template.message}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{template.message.length} caractères</span>
              <span>{calculateSMSCount(template.message)} SMS</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {templates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Aucun template SMS pour le moment</p>
          <button
            onClick={() => {
              setEditingTemplate({
                id: `new-${Date.now()}`,
                name: '',
                type: 'CUSTOM',
                message: '',
                active: true
              })
              setShowNewTemplateForm(true)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Créer votre premier template
          </button>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Conseils pour vos templates</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Utilisez les variables pour personnaliser automatiquement vos messages</li>
          <li>• Un SMS = 160 caractères max. Au-delà, plusieurs SMS seront utilisés</li>
          <li>• Les templates inactifs ne sont pas affichés lors de la création de campagnes</li>
          <li>• Ajoutez des emojis pour rendre vos messages plus engageants 💆✨🎉</li>
        </ul>
      </div>
    </div>
  )
}
