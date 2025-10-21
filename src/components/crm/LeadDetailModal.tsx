'use client'

import { useState, useEffect } from 'react'

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DEMO_SCHEDULED' | 'DEMO_DONE' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST' | 'ON_HOLD'
type InteractionType = 'EMAIL' | 'PHONE' | 'MEETING' | 'DEMO' | 'PROPOSAL' | 'NOTE'

const STATUS_OPTIONS: { value: LeadStatus; label: string; emoji: string }[] = [
  { value: 'NEW', label: 'Nouveau', emoji: '🆕' },
  { value: 'CONTACTED', label: 'Contacté', emoji: '📧' },
  { value: 'QUALIFIED', label: 'Qualifié', emoji: '✅' },
  { value: 'DEMO_SCHEDULED', label: 'Démo planifiée', emoji: '📅' },
  { value: 'DEMO_DONE', label: 'Démo faite', emoji: '🎯' },
  { value: 'PROPOSAL_SENT', label: 'Proposition envoyée', emoji: '📤' },
  { value: 'NEGOTIATION', label: 'Négociation', emoji: '💬' },
  { value: 'WON', label: 'Gagné', emoji: '🎉' },
  { value: 'LOST', label: 'Perdu', emoji: '❌' },
  { value: 'ON_HOLD', label: 'En attente', emoji: '⏸️' }
]

const INTERACTION_TYPES: { value: InteractionType; label: string; emoji: string }[] = [
  { value: 'EMAIL', label: 'Email', emoji: '📧' },
  { value: 'PHONE', label: 'Appel téléphonique', emoji: '📞' },
  { value: 'MEETING', label: 'Réunion', emoji: '👥' },
  { value: 'DEMO', label: 'Démonstration', emoji: '🎯' },
  { value: 'PROPOSAL', label: 'Proposition commerciale', emoji: '📄' },
  { value: 'NOTE', label: 'Note interne', emoji: '📝' }
]

interface LeadDetailModalProps {
  leadId: string
  onClose: () => void
  onUpdate: () => void
}

interface Lead {
  id: string
  institutName: string
  contactName: string
  contactEmail: string
  contactPhone: string | null
  website: string | null
  address: string | null
  postalCode: string | null
  city: string | null
  country: string | null
  status: LeadStatus
  source: string
  score: number
  probability: number
  estimatedValue: number | null
  notes: string | null
  numberOfLocations: number | null
  createdAt: string
  lastContactDate: string | null
  nextFollowUpDate: string | null
  assignedTo: { id: string; name: string; email: string } | null
  organization: any | null
  interactions: Interaction[]
}

interface Interaction {
  id: string
  type: InteractionType
  subject: string | null
  content: string
  nextAction: string | null
  nextActionDate: string | null
  createdAt: string
  user: { id: string; name: string }
}

export default function LeadDetailModal({ leadId, onClose, onUpdate }: LeadDetailModalProps) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'details' | 'interactions' | 'convert'>('details')
  const [showAddInteraction, setShowAddInteraction] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  // Form states
  const [interactionForm, setInteractionForm] = useState({
    type: 'NOTE' as InteractionType,
    subject: '',
    content: '',
    nextAction: '',
    nextActionDate: ''
  })

  useEffect(() => {
    fetchLead()
  }, [leadId])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/super-admin/leads/${leadId}`)
      if (response.ok) {
        const data = await response.json()
        setLead(data)
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: LeadStatus) => {
    setSavingStatus(true)
    try {
      const response = await fetch(`/api/super-admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchLead()
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setSavingStatus(false)
    }
  }

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/super-admin/leads/${leadId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interactionForm)
      })

      if (response.ok) {
        setInteractionForm({
          type: 'NOTE',
          subject: '',
          content: '',
          nextAction: '',
          nextActionDate: ''
        })
        setShowAddInteraction(false)
        await fetchLead()
        onUpdate()
      }
    } catch (error) {
      console.error('Error adding interaction:', error)
    }
  }

  const handleConvert = async () => {
    if (!confirm(`Convertir ce lead en organisation cliente (Trial 14 jours) ?\n\nInstitut: ${lead?.institutName}\nContact: ${lead?.contactEmail}`)) {
      return
    }

    try {
      const response = await fetch(`/api/super-admin/leads/${leadId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'SOLO', sendWelcomeEmail: true })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ Lead converti avec succès!\n\nOrganisation créée: ${data.organization.name}\nEmail: ${data.credentials.email}\nMot de passe temporaire: ${data.credentials.temporaryPassword}\nURL de connexion: ${data.credentials.loginUrl}`)
        onUpdate()
        onClose()
      } else {
        const data = await response.json()
        alert(`❌ Erreur: ${data.error}`)
      }
    } catch (error) {
      console.error('Error converting lead:', error)
      alert('❌ Erreur lors de la conversion')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return null
  }

  const statusConfig = STATUS_OPTIONS.find(s => s.value === lead.status)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{lead.institutName}</h2>
              <div className="flex items-center gap-4 text-purple-100">
                <span>{lead.contactName}</span>
                <span>•</span>
                <span>{lead.contactEmail}</span>
                {lead.contactPhone && (
                  <>
                    <span>•</span>
                    <span>{lead.contactPhone}</span>
                  </>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="px-3 py-1 bg-white/20 rounded-lg text-sm">
                  Score: {lead.score}/100
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-lg text-sm">
                  Probabilité: {lead.probability}%
                </div>
                {lead.estimatedValue && (
                  <div className="px-3 py-1 bg-white/20 rounded-lg text-sm font-semibold">
                    {lead.estimatedValue.toLocaleString('fr-FR')}€
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-2xl font-bold ml-4"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setTab('details')}
              className={`px-6 py-3 font-medium border-b-2 transition ${
                tab === 'details'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Détails
            </button>
            <button
              onClick={() => setTab('interactions')}
              className={`px-6 py-3 font-medium border-b-2 transition ${
                tab === 'interactions'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              💬 Interactions ({lead.interactions?.length || 0})
            </button>
            <button
              onClick={() => setTab('convert')}
              className={`px-6 py-3 font-medium border-b-2 transition ${
                tab === 'convert'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🎯 Conversion
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Tab: Détails */}
          {tab === 'details' && (
            <div className="space-y-6">
              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut du lead</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleUpdateStatus(option.value)}
                      disabled={savingStatus}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        lead.status === option.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${savingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {option.emoji} {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">📍 Localisation</h3>
                  <div className="space-y-2 text-sm">
                    {lead.address && <div className="text-gray-600">{lead.address}</div>}
                    <div className="text-gray-600">
                      {lead.postalCode} {lead.city}
                    </div>
                    {lead.country && <div className="text-gray-600">{lead.country}</div>}
                    {lead.website && (
                      <a href={lead.website} target="_blank" className="text-purple-600 hover:underline block">
                        🌐 {lead.website}
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">ℹ️ Informations</h3>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-600">
                      Source: <span className="font-medium">{lead.source}</span>
                    </div>
                    {lead.numberOfLocations && (
                      <div className="text-gray-600">
                        Emplacements: <span className="font-medium">{lead.numberOfLocations}</span>
                      </div>
                    )}
                    <div className="text-gray-600">
                      Créé le: <span className="font-medium">{new Date(lead.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {lead.lastContactDate && (
                      <div className="text-gray-600">
                        Dernier contact: <span className="font-medium">{new Date(lead.lastContactDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {lead.nextFollowUpDate && (
                      <div className="text-gray-600">
                        Prochain suivi: <span className="font-medium text-purple-600">{new Date(lead.nextFollowUpDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">📝 Notes</h3>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {lead.notes}
                  </div>
                </div>
              )}

              {/* Organisation convertie */}
              {lead.organization && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">✅ Lead converti</h3>
                  <div className="text-sm text-green-700">
                    Organisation: <span className="font-medium">{lead.organization.name}</span>
                  </div>
                  <div className="text-sm text-green-700">
                    Plan: <span className="font-medium">{lead.organization.plan}</span>
                  </div>
                  <div className="text-sm text-green-700">
                    Statut: <span className="font-medium">{lead.organization.status}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Interactions */}
          {tab === 'interactions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Historique des interactions</h3>
                <button
                  onClick={() => setShowAddInteraction(!showAddInteraction)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  {showAddInteraction ? 'Annuler' : '+ Ajouter'}
                </button>
              </div>

              {/* Formulaire ajout interaction */}
              {showAddInteraction && (
                <form onSubmit={handleAddInteraction} className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={interactionForm.type}
                        onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value as InteractionType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {INTERACTION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.emoji} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                      <input
                        type="text"
                        value={interactionForm.subject}
                        onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Sujet de l'interaction"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
                    <textarea
                      required
                      rows={3}
                      value={interactionForm.content}
                      onChange={(e) => setInteractionForm({ ...interactionForm, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Détails de l'interaction..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prochaine action</label>
                      <input
                        type="text"
                        value={interactionForm.nextAction}
                        onChange={(e) => setInteractionForm({ ...interactionForm, nextAction: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Appeler pour suivi..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date prochaine action</label>
                      <input
                        type="date"
                        value={interactionForm.nextActionDate}
                        onChange={(e) => setInteractionForm({ ...interactionForm, nextActionDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddInteraction(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}

              {/* Timeline */}
              <div className="space-y-3">
                {lead.interactions && lead.interactions.length > 0 ? (
                  lead.interactions.map((interaction) => {
                    const typeConfig = INTERACTION_TYPES.find(t => t.value === interaction.type)
                    return (
                      <div key={interaction.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{typeConfig?.emoji}</span>
                            <span className="font-medium text-gray-900">
                              {typeConfig?.label}
                            </span>
                            {interaction.subject && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-700">{interaction.subject}</span>
                              </>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(interaction.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{interaction.content}</div>
                        {interaction.nextAction && (
                          <div className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded inline-block">
                            ➡️ {interaction.nextAction}
                            {interaction.nextActionDate && ` - ${new Date(interaction.nextActionDate).toLocaleDateString('fr-FR')}`}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          Par {interaction.user.name}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucune interaction enregistrée
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Conversion */}
          {tab === 'convert' && (
            <div className="space-y-6">
              {lead.organization ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Lead déjà converti !</h3>
                  <p className="text-gray-600 mb-4">
                    Ce lead a été converti en organisation cliente
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
                    <div className="text-sm text-green-900">
                      <div>Organisation: <span className="font-bold">{lead.organization.name}</span></div>
                      <div>Plan: <span className="font-bold">{lead.organization.plan}</span></div>
                      <div>Statut: <span className="font-bold">{lead.organization.status}</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Convertir en organisation cliente</h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-purple-900 mb-3">Ce qui va être créé :</h4>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li>✅ Organisation "{lead.institutName}" en mode Trial (14 jours)</li>
                      <li>✅ Compte utilisateur propriétaire pour {lead.contactEmail}</li>
                      <li>✅ Configuration initiale de l'organisation</li>
                      <li>✅ Email de bienvenue avec identifiants (si activé)</li>
                      <li>✅ Lead marqué comme "WON" (Gagné)</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Important:</strong> Un mot de passe temporaire sera généré et affiché une seule fois. Assurez-vous de le noter ou de l'envoyer au client.
                    </p>
                  </div>

                  <button
                    onClick={handleConvert}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold text-lg"
                  >
                    🚀 Convertir en organisation Trial
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
