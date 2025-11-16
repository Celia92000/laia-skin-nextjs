'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface EmailAutomation {
  id: string
  name: string
  description: string
  trigger: string
  enabled: boolean
  emailSubject: string
  emailTemplate: string
  delayMinutes?: number
  conditions?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

interface Stats {
  total: number
  enabled: number
  disabled: number
}

interface OnboardingTemplate {
  id: string
  slug: string
  name: string
  description: string | null
  subject: string
  content: string
  textContent: string | null
  availableVariables: any
  category: string | null
  isActive: boolean
  isSystem: boolean
  fromName: string | null
  fromEmail: string | null
  language: string
  createdAt: Date
  updatedAt: Date
  currentlyUsed?: boolean
  usage?: string
}

export default function EmailAutomationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [automations, setAutomations] = useState<EmailAutomation[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedAutomation, setSelectedAutomation] = useState<EmailAutomation | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<EmailAutomation | null>(null)
  const [saving, setSaving] = useState(false)

  // Onboarding templates
  const [onboardingTemplates, setOnboardingTemplates] = useState<OnboardingTemplate[]>([])
  const [loadingOnboarding, setLoadingOnboarding] = useState(true)
  const [selectedOnboardingTemplate, setSelectedOnboardingTemplate] = useState<OnboardingTemplate | null>(null)
  const [showOnboardingPreview, setShowOnboardingPreview] = useState(false)
  const [showOnboardingEditModal, setShowOnboardingEditModal] = useState(false)
  const [editingOnboardingTemplate, setEditingOnboardingTemplate] = useState<OnboardingTemplate | null>(null)
  const [activeTab, setActiveTab] = useState<'crm' | 'onboarding'>('onboarding')

  useEffect(() => {
    fetchAutomations()
    fetchOnboardingTemplates()
  }, [])

  async function fetchAutomations() {
    try {
      setLoading(true)
      const response = await fetch('/api/super-admin/crm/automations')

      if (response.ok) {
        const data = await response.json()
        setAutomations(data.automations)
        setStats(data.stats)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/email-automations')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching automations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOnboardingTemplates() {
    try {
      setLoadingOnboarding(true)
      const response = await fetch('/api/super-admin/onboarding-templates')

      if (response.ok) {
        const data = await response.json()
        setOnboardingTemplates(data)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/email-automations')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching onboarding templates:', error)
    } finally {
      setLoadingOnboarding(false)
    }
  }

  async function toggleAutomation(id: string, currentState: boolean) {
    try {
      const response = await fetch(`/api/super-admin/crm/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentState })
      })

      if (response.ok) {
        setAutomations(prev =>
          prev.map(a => a.id === id ? { ...a, enabled: !currentState } : a)
        )
        setStats(prev => prev ? {
          ...prev,
          enabled: prev.enabled + (currentState ? -1 : 1),
          disabled: prev.disabled + (currentState ? 1 : -1)
        } : null)
      }
    } catch (error) {
      console.error('Error toggling automation:', error)
    }
  }

  function openEditModal(automation: EmailAutomation) {
    setEditingAutomation({ ...automation })
    setShowEditModal(true)
  }

  async function saveAutomation() {
    if (!editingAutomation) return

    try {
      setSaving(true)
      const response = await fetch(`/api/super-admin/crm/automations/${editingAutomation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingAutomation.name,
          description: editingAutomation.description,
          emailSubject: editingAutomation.emailSubject,
          emailTemplate: editingAutomation.emailTemplate,
          delayMinutes: editingAutomation.delayMinutes,
          conditions: editingAutomation.conditions
        })
      })

      if (response.ok) {
        // Mettre à jour la liste des automatisations
        setAutomations(prev =>
          prev.map(a => a.id === editingAutomation.id ? editingAutomation : a)
        )
        setShowEditModal(false)
        setEditingAutomation(null)
        alert('✅ Template mis à jour avec succès !')
      } else {
        alert('❌ Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving automation:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      'ORGANIZATION_CREATED': '🆕 Nouvelle organisation',
      'TRIAL_STARTED': '🎁 Essai démarré',
      'TRIAL_ENDING_SOON': '⏰ Fin d\'essai proche',
      'TRIAL_EXPIRED': '❌ Essai expiré',
      'SUBSCRIPTION_UPGRADED': '⬆️ Upgrade abonnement',
      'SUBSCRIPTION_DOWNGRADED': '⬇️ Downgrade abonnement',
      'SUBSCRIPTION_CANCELLED': '🚫 Abonnement annulé',
      'NO_ACTIVITY_7_DAYS': '😴 Inactivité 7 jours',
      'NO_ACTIVITY_30_DAYS': '💤 Inactivité 30 jours',
      'NO_ACTIVITY_90_DAYS': '😴 Inactivité 90 jours',
      'FIRST_RESERVATION': '🎉 Première réservation',
      'PAYMENT_FAILED': '💳 Paiement échoué',
      'HIGH_CHURN_RISK': '⚠️ Risque churn élevé',
      'LOW_RFM_SCORE': '📉 Score RFM faible',
      'BECAME_CHAMPION': '🏆 Devient Champion'
    }
    return labels[trigger] || trigger
  }

  const getTriggerColor = (trigger: string) => {
    if (trigger.includes('TRIAL')) return 'bg-blue-100 text-blue-800'
    if (trigger.includes('ACTIVITY')) return 'bg-yellow-100 text-yellow-800'
    if (trigger.includes('CHURN') || trigger.includes('LOW_RFM')) return 'bg-red-100 text-red-800'
    if (trigger.includes('CHAMPION') || trigger.includes('UPGRADED')) return 'bg-green-100 text-green-800'
    if (trigger.includes('FAILED') || trigger.includes('CANCELLED')) return 'bg-red-100 text-red-800'
    return 'bg-purple-100 text-purple-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7c3aed' }}></div>
          <p className="text-gray-600">Chargement des automatisations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <Link href="/super-admin" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              📧 Automatisations & Templates Email
            </h2>
            <p className="text-gray-700">Gérez les emails automatiques et templates d'onboarding</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 bg-white rounded-xl shadow-md p-2 inline-flex gap-2">
        <button
          onClick={() => setActiveTab('onboarding')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'onboarding'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🎉 Templates d'Onboarding
        </button>
        <button
          onClick={() => setActiveTab('crm')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'crm'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ⚡ Automatisations CRM
        </button>
      </div>

      {/* Onboarding Templates Tab */}
      {activeTab === 'onboarding' && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="text-sm text-gray-600 mb-1">Templates disponibles</div>
              <div className="text-4xl font-bold text-purple-600">{onboardingTemplates.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">Template actif</div>
              <div className="text-2xl font-bold text-green-600">Welcome Email</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <div className="text-2xl font-bold text-blue-600">ACTIVE</div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {onboardingTemplates.map((template) => (
              <div
                key={template.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border-2 ${
                  template.currentlyUsed
                    ? 'border-green-500 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className={`p-6 ${
                  template.currentlyUsed
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">📧</span>
                    {template.currentlyUsed && (
                      <span className="bg-white text-green-600 text-xs font-bold px-3 py-1 rounded-full">
                        EN COURS
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

                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Objet :</strong>
                    </p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {template.subject}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Usage :</strong>
                    </p>
                    <p className="text-sm text-gray-700">
                      {template.usage}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      Contenu inclus :
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      {template.id === 'welcome' && (
                        <>
                          <li>✅ Email et mot de passe</li>
                          <li>✅ Lien admin</li>
                          <li>✅ Détails formule</li>
                          <li>✅ Guide complet</li>
                          <li>✅ Facture PDF</li>
                        </>
                      )}
                      {template.id === 'pending' && (
                        <>
                          <li>⏳ Confirmation paiement</li>
                          <li>⏳ Délai d'activation (24h)</li>
                          <li>❌ Pas d'identifiants</li>
                        </>
                      )}
                      {template.id === 'activation' && (
                        <>
                          <li>✅ Email et mot de passe</li>
                          <li>✅ Lien admin</li>
                          <li>✅ Instructions</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOnboardingTemplate(template)
                        setShowOnboardingPreview(true)
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      👁️ Prévisualiser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">📧</span>
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">
                  Configuration actuelle
                </h3>
                <p className="text-blue-800 text-sm mb-2">
                  L'email <strong>"Bienvenue Complet"</strong> est actuellement utilisé lors de l'onboarding.
                  Le compte client est activé immédiatement avec le statut <code className="bg-blue-100 px-2 py-1 rounded">ACTIVE</code>.
                </p>
                <p className="text-blue-800 text-sm mb-3">
                  📄 Fichier : <code className="bg-blue-100 px-2 py-1 rounded">/src/lib/onboarding-emails.ts</code>
                </p>
                <p className="text-blue-700 text-sm font-semibold">
                  💡 Pour modifier un template, ouvrez le fichier source et modifiez le code HTML directement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRM Automations Tab */}
      {activeTab === 'crm' && (
        <div>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-600 mb-1">Total automatisations</div>
                <div className="text-4xl font-bold text-purple-600">{stats.total}</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-600 mb-1">Actives</div>
                <div className="text-4xl font-bold text-green-600">{stats.enabled}</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-sm text-gray-600 mb-1">Désactivées</div>
                <div className="text-4xl font-bold text-gray-600">{stats.disabled}</div>
              </div>
            </div>
          )}

      {/* Liste des automatisations */}
      <div className="space-y-4">
        {automations.map((automation) => (
          <div
            key={automation.id}
            className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition ${
              !automation.enabled ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{automation.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTriggerColor(automation.trigger)}`}>
                    {getTriggerLabel(automation.trigger)}
                  </span>
                  {automation.enabled ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      ✓ Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      ⏸ Désactivée
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{automation.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-gray-500">
                    <strong>Sujet :</strong> {automation.emailSubject}
                  </div>
                  {automation.delayMinutes && (
                    <div className="text-gray-500">
                      <strong>Délai :</strong> {automation.delayMinutes} minutes
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openEditModal(automation)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => {
                    setSelectedAutomation(automation)
                    setShowPreview(true)
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  👁️ Prévisualiser
                </button>
                <button
                  onClick={() => toggleAutomation(automation.id, automation.enabled)}
                  className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                    automation.enabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {automation.enabled ? '⏸ Désactiver' : '▶ Activer'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Informations */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">ℹ️ Comment fonctionnent les automatisations ?</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>1. Déclencheurs (Triggers)</strong> : Chaque automatisation est déclenchée par un événement spécifique
                (nouvelle inscription, inactivité, changement d'abonnement, etc.)
              </p>
              <p>
                <strong>2. Délais optionnels</strong> : Certaines automatisations peuvent avoir un délai avant envoi
                (ex: "3 jours avant la fin de l'essai")
              </p>
              <p>
                <strong>3. Variables dynamiques</strong> : Les emails utilisent des variables comme {`{{organizationName}}`},
                {`{{contactName}}`} qui sont remplacées automatiquement
              </p>
              <p>
                <strong>4. Conditions</strong> : Certaines automatisations ont des conditions supplémentaires
                (score RFM, nombre de jours d'inactivité, etc.)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {showPreview && selectedAutomation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  📧 Prévisualisation : {selectedAutomation.name}
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Déclencheur</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTriggerColor(selectedAutomation.trigger)}`}>
                    {getTriggerLabel(selectedAutomation.trigger)}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Sujet de l'email</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedAutomation.emailSubject}
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-6">
                <div className="text-sm text-gray-500 mb-4">Contenu de l'email (HTML)</div>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedAutomation.emailTemplate }}
                />
              </div>

              <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-800">
                  <strong>Note :</strong> Les variables entre accolades (ex: {`{{organizationName}}`})
                  seront remplacées par les vraies valeurs lors de l'envoi.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && editingAutomation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => !saving && setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  ✏️ Modifier le template : {editingAutomation.name}
                </h3>
                <button
                  onClick={() => !saving && setShowEditModal(false)}
                  disabled={saving}
                  className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'automatisation
                  </label>
                  <input
                    type="text"
                    value={editingAutomation.name}
                    onChange={(e) => setEditingAutomation({ ...editingAutomation, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingAutomation.description}
                    onChange={(e) => setEditingAutomation({ ...editingAutomation, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Déclencheur (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Déclencheur (non modifiable)
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTriggerColor(editingAutomation.trigger)}`}>
                      {getTriggerLabel(editingAutomation.trigger)}
                    </span>
                  </div>
                </div>

                {/* Sujet de l'email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet de l'email
                  </label>
                  <input
                    type="text"
                    value={editingAutomation.emailSubject}
                    onChange={(e) => setEditingAutomation({ ...editingAutomation, emailSubject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Sujet de l'email..."
                  />
                </div>

                {/* Délai (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Délai avant envoi (minutes) - Optionnel
                  </label>
                  <input
                    type="number"
                    value={editingAutomation.delayMinutes || ''}
                    onChange={(e) => setEditingAutomation({
                      ...editingAutomation,
                      delayMinutes: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Laisser vide ou 0 pour un envoi immédiat
                  </p>
                </div>

                {/* Template HTML */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template HTML de l'email
                  </label>
                  <textarea
                    value={editingAutomation.emailTemplate}
                    onChange={(e) => setEditingAutomation({ ...editingAutomation, emailTemplate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                    rows={15}
                    placeholder="<h1>Titre</h1>
<p>Bonjour {{contactName}},</p>
<p>Votre message ici...</p>"
                  />
                  <div className="mt-2 bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-800">
                      <strong>Variables disponibles :</strong>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <code>{`{{organizationName}}`}</code>
                        <code>{`{{contactName}}`}</code>
                        <code>{`{{contactEmail}}`}</code>
                        <code>{`{{newPlan}}`}</code>
                        <code>{`{{billingUrl}}`}</code>
                        <code>{`{{supportUrl}}`}</code>
                        <code>{`{{dashboardUrl}}`}</code>
                        <code>{`{{calendlyUrl}}`}</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aperçu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aperçu du rendu
                  </label>
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: editingAutomation.emailTemplate }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={saveAutomation}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '💾 Enregistrement...' : '💾 Enregistrer les modifications'}
                </button>
                <button
                  onClick={() => !saving && setShowEditModal(false)}
                  disabled={saving}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
