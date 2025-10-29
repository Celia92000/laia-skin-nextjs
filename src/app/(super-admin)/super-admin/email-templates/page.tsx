"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface EmailTemplate {
  id: string
  key: string
  name: string
  subject: string
  htmlBody: string
  textBody: string | null
  variables: any
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function EmailTemplatesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const [editForm, setEditForm] = useState({
    name: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    active: true
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    setLoading(true)
    try {
      const response = await fetch('/api/super-admin/email-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(template: EmailTemplate) {
    setSelectedTemplate(template)
    setEditForm({
      name: template.name,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody || '',
      active: template.active
    })
    setShowEditModal(true)
  }

  async function saveTemplate() {
    if (!selectedTemplate) return

    try {
      const response = await fetch(`/api/super-admin/email-templates/${selectedTemplate.key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (response.ok) {
        setShowEditModal(false)
        fetchTemplates()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      alert('Erreur serveur')
    }
  }

  const templateDescriptions: { [key: string]: string } = {
    WELCOME: 'Email envoyé lors de la création d\'une nouvelle organisation',
    TRIAL_ENDING_7D: 'Rappel 7 jours avant la fin de l\'essai',
    TRIAL_ENDING_3D: 'Rappel 3 jours avant la fin de l\'essai',
    TRIAL_EXPIRED: 'Email envoyé quand l\'essai est expiré',
    PAYMENT_SUCCESS: 'Confirmation de paiement réussi',
    PAYMENT_FAILED: 'Notification de paiement échoué',
    LIMIT_REACHED: 'Alert e quand les limites sont atteintes',
    NEWSLETTER: 'Template pour les newsletters',
    PASSWORD_RESET: 'Email de réinitialisation de mot de passe'
  }

  const availableVariables: { [key: string]: string[] } = {
    WELCOME: ['{{org_name}}', '{{owner_name}}', '{{trial_end_date}}', '{{login_url}}'],
    TRIAL_ENDING_7D: ['{{org_name}}', '{{owner_name}}', '{{days_left}}', '{{trial_end_date}}', '{{upgrade_url}}'],
    TRIAL_ENDING_3D: ['{{org_name}}', '{{owner_name}}', '{{days_left}}', '{{trial_end_date}}', '{{upgrade_url}}'],
    TRIAL_EXPIRED: ['{{org_name}}', '{{owner_name}}', '{{expired_date}}', '{{reactivate_url}}'],
    PAYMENT_SUCCESS: ['{{org_name}}', '{{amount}}', '{{invoice_number}}', '{{next_billing_date}}'],
    PAYMENT_FAILED: ['{{org_name}}', '{{amount}}', '{{retry_date}}', '{{update_payment_url}}'],
    LIMIT_REACHED: ['{{org_name}}', '{{limit_type}}', '{{current_usage}}', '{{limit}}', '{{upgrade_url}}'],
    NEWSLETTER: ['{{org_name}}', '{{owner_name}}', '{{unsubscribe_url}}'],
    PASSWORD_RESET: ['{{org_name}}', '{{reset_url}}', '{{expires_in}}']
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#7c3aed" }}></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href="/super-admin" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              Templates d'Emails
            </h2>
            <p className="text-gray-700">Gestion des emails automatiques de la plateforme</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Templates List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{template.key}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    template.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {templateDescriptions[template.key] || 'Template d\'email personnalisé'}
                </p>

                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Sujet:</div>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {template.subject}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Variables disponibles:</div>
                  <div className="flex flex-wrap gap-1">
                    {(availableVariables[template.key] || []).map((variable, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded font-mono">
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Dernière modification: {new Date(template.updatedAt).toLocaleDateString('fr-FR')}
                </div>

                <button
                  onClick={() => handleEdit(template)}
                  className="w-full px-4 py-2 text-white rounded-lg hover:bg-purple-700"
                  style={{ backgroundColor: "#7c3aed" }}
                >
                  ✏️ Modifier
                </button>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📧</div>
            <p className="text-gray-600 mb-4">Aucun template trouvé</p>
            <p className="text-sm text-gray-500">
              Les templates seront créés automatiquement au premier usage
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Modifier le template: {selectedTemplate.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du template</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sujet de l'email</label>
                <input
                  type="text"
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Bienvenue sur {{org_name}} !"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Corps HTML
                  <span className="text-xs text-gray-500 ml-2">
                    Utilisez les variables: {(availableVariables[selectedTemplate.key] || []).join(', ')}
                  </span>
                </label>
                <textarea
                  value={editForm.htmlBody}
                  onChange={(e) => setEditForm({ ...editForm, htmlBody: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={15}
                  placeholder="<html><body>...</body></html>"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Corps texte (optionnel)
                </label>
                <textarea
                  value={editForm.textBody}
                  onChange={(e) => setEditForm({ ...editForm, textBody: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={8}
                  placeholder="Version texte de l'email..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  className="w-4 h-4 rounded"
                  style={{ color: "#7c3aed" }}
                />
                <label className="ml-2 text-sm text-gray-700">
                  Template actif
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveTemplate}
                className="flex-1 px-4 py-2 text-white rounded-lg hover:bg-purple-700"
                style={{ backgroundColor: "#7c3aed" }}
              >
                💾 Enregistrer
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
