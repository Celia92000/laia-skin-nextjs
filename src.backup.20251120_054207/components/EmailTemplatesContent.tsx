'use client'

import { useState, useEffect } from 'react'
import { Mail, Eye, Edit, Send, Check, Plus, Copy, Trash2, Power, PowerOff } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  description: string
  templateKey: string
  subject: string
  content: string
  isActive: boolean
  usage: string | null
  createdAt: string
  updatedAt: string
}

export default function EmailTemplatesContent() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null)

  // Données de test pour prévisualisation
  const previewData = {
    organizationName: 'Beauté Zen Paris',
    ownerFirstName: 'Sophie',
    ownerLastName: 'Martin',
    ownerEmail: 'sophie@beautezen.fr',
    tempPassword: 'Test123Pass!@#',
    plan: 'TEAM',
    subdomain: 'beaute-zen-paris',
    adminUrl: 'https://beaute-zen-paris.laia-connect.fr/admin',
    monthlyAmount: 149,
    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
    sepaMandateRef: 'LAIA-BEAUTE-ZEN-PARIS-1234567890'
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      setLoading(true)
      const res = await fetch('/api/super-admin/onboarding-email-templates')
      const data = await res.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveTemplate() {
    if (!editingTemplate) return

    try {
      const res = await fetch('/api/super-admin/onboarding-email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate)
      })

      const data = await res.json()
      if (data.success) {
        alert('Template enregistré avec succès !')
        setShowEditor(false)
        setEditingTemplate(null)
        fetchTemplates()
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur sauvegarde template:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  async function handleToggleActive(template: EmailTemplate) {
    try {
      const res = await fetch('/api/super-admin/onboarding-email-templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: template.id,
          isActive: !template.isActive
        })
      })

      const data = await res.json()
      if (data.success) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Erreur changement statut:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce template ?')) return

    try {
      const res = await fetch(`/api/super-admin/onboarding-email-templates?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      if (data.success) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Erreur suppression template:', error)
    }
  }

  function handleDuplicate(template: EmailTemplate) {
    setEditingTemplate({
      name: `${template.name} (copie)`,
      description: template.description,
      templateKey: template.templateKey,
      subject: template.subject,
      content: template.content,
      isActive: false,
      usage: template.usage
    })
    setShowEditor(true)
  }

  function previewTemplate(template: EmailTemplate) {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  function renderPreviewContent(content: string) {
    let preview = content
    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{${key}}`, 'g'), String(value))
    })
    return preview
  }

  const activeTemplate = templates.find(t => t.isActive)
  const templatesByKey = templates.reduce((acc, t) => {
    if (!acc[t.templateKey]) acc[t.templateKey] = []
    acc[t.templateKey].push(t)
    return acc
  }, {} as Record<string, EmailTemplate[]>)

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-3">
              <Mail className="w-7 h-7 text-purple-600" />
              Templates d'Emails d'Onboarding
            </h2>
            <p className="text-gray-600">
              Gérez les emails envoyés aux nouveaux clients
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTemplate({
                name: '',
                description: '',
                templateKey: 'welcome',
                subject: '',
                content: '',
                isActive: false,
                usage: ''
              })
              setShowEditor(true)
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau template
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Templates disponibles</p>
              <p className="text-3xl font-bold text-gray-900">{templates.length}</p>
            </div>
            <Mail className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Template actif</p>
              <p className="text-xl font-bold text-gray-900 truncate">
                {activeTemplate ? activeTemplate.name : 'Aucun'}
              </p>
            </div>
            <Check className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Types de templates</p>
              <p className="text-3xl font-bold text-gray-900">{Object.keys(templatesByKey).length}</p>
            </div>
            <Send className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-2 ${
              template.isActive
                ? 'border-green-500 ring-2 ring-green-200'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            {/* Header */}
            <div className={`p-6 ${
              template.isActive
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-purple-500 to-pink-600'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <Mail className="w-8 h-8 text-white" />
                {template.isActive && (
                  <span className="bg-white text-green-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Power className="w-3 h-3" />
                    ACTIF
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {template.name}
              </h3>
              <p className="text-white/90 text-sm">
                {template.description}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Type :</strong>
                </p>
                <p className="text-sm bg-gray-50 p-2 rounded border border-gray-200">
                  {template.templateKey}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Objet :</strong>
                </p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {template.subject}
                </p>
              </div>

              {template.usage && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Usage :</strong>
                  </p>
                  <p className="text-sm text-gray-700">
                    {template.usage}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => previewTemplate(template)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Voir
                </button>
                <button
                  onClick={() => {
                    setEditingTemplate(template)
                    setShowEditor(true)
                  }}
                  className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleDuplicate(template)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Dupliquer
                </button>
                <button
                  onClick={() => handleToggleActive(template)}
                  className={`flex-1 px-3 py-2 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2 ${
                    template.isActive
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {template.isActive ? (
                    <>
                      <PowerOff className="w-4 h-4" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4" />
                      Activer
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-300">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun template créé
            </h3>
            <p className="text-gray-600 mb-4">
              Créez votre premier template d'onboarding
            </p>
            <button
              onClick={() => {
                setEditingTemplate({
                  name: '',
                  description: '',
                  templateKey: 'welcome',
                  subject: '',
                  content: '',
                  isActive: false,
                  usage: ''
                })
                setShowEditor(true)
              }}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer un template
            </button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">
              ℹ️ Fonctionnement
            </h3>
            <p className="text-blue-800 text-sm mb-2">
              Seul <strong>un template actif par type</strong> peut exister. Lorsque vous activez un template, les autres du même type sont automatiquement désactivés.
            </p>
            <p className="text-blue-800 text-sm">
              Les templates utilisent des variables comme <code className="bg-blue-100 px-2 py-1 rounded">{'{organizationName}'}</code>, <code className="bg-blue-100 px-2 py-1 rounded">{'{ownerFirstName}'}</code>, etc.
            </p>
          </div>
        </div>
      </div>

      {/* Éditeur Modal */}
      {showEditor && editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingTemplate.id ? 'Modifier le template' : 'Nouveau template'}
              </h3>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Colonne gauche */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du template *
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Email de bienvenue complet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={editingTemplate.description || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Description du template"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de template *
                  </label>
                  <select
                    value={editingTemplate.templateKey || 'welcome'}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, templateKey: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    disabled={!!editingTemplate.id}
                  >
                    <option value="welcome">Bienvenue (welcome)</option>
                    <option value="pending">En attente activation (pending)</option>
                    <option value="activation">Activation compte (activation)</option>
                  </select>
                  {editingTemplate.id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Le type ne peut pas être modifié après création
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet de l'email *
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.subject || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Bienvenue sur LAIA Connect - {organizationName}"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage (optionnel)
                  </label>
                  <textarea
                    value={editingTemplate.usage || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, usage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Quand ce template est-il utilisé ?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variables disponibles
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1 max-h-40 overflow-y-auto">
                    <p><code>{'{organizationName}'}</code> - Nom de l'organisation</p>
                    <p><code>{'{ownerFirstName}'}</code> - Prénom du propriétaire</p>
                    <p><code>{'{ownerLastName}'}</code> - Nom du propriétaire</p>
                    <p><code>{'{ownerEmail}'}</code> - Email du propriétaire</p>
                    <p><code>{'{tempPassword}'}</code> - Mot de passe temporaire</p>
                    <p><code>{'{plan}'}</code> - Formule d'abonnement</p>
                    <p><code>{'{subdomain}'}</code> - Sous-domaine</p>
                    <p><code>{'{adminUrl}'}</code> - URL espace admin</p>
                    <p><code>{'{monthlyAmount}'}</code> - Montant mensuel</p>
                    <p><code>{'{sepaMandateRef}'}</code> - Référence mandat SEPA</p>
                  </div>
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu HTML *
                  </label>
                  <textarea
                    value={editingTemplate.content || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                    rows={25}
                    placeholder="<div>Contenu HTML de l'email...</div>"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between gap-3">
              <button
                onClick={() => {
                  setShowEditor(false)
                  setEditingTemplate(null)
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-white/90 text-sm">
                    Prévisualisation du template
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Objet de l'email :</p>
                <p className="font-semibold text-gray-900">
                  {selectedTemplate.subject.replace('{organizationName}', previewData.organizationName)}
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div dangerouslySetInnerHTML={{ __html: renderPreviewContent(selectedTemplate.content) }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
