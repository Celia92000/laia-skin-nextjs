'use client'

import { useState, useEffect } from 'react'
import CreateOrganizationModal from './CreateOrganizationModal'

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DEMO_SCHEDULED' | 'DEMO_DONE' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST' | 'ON_HOLD'
type InteractionType = 'EMAIL' | 'PHONE' | 'MEETING' | 'DEMO' | 'PROPOSAL' | 'NOTE'
type LeadQualification = 'COLD' | 'WARM' | 'HOT'

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

const QUALIFICATION_OPTIONS: { value: LeadQualification; label: string; emoji: string; color: string; bgColor: string }[] = [
  { value: 'COLD', label: 'Froid', emoji: '❄️', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { value: 'WARM', label: 'Moyen', emoji: '🌤️', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  { value: 'HOT', label: 'Chaud', emoji: '🔥', color: 'text-red-700', bgColor: 'bg-red-100' }
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
  qualification?: LeadQualification
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
  demoBooking?: {
    id: string
    status: string
    type: string
    createdAt: string
    slot: {
      date: string
      duration: number
    }
    completedAt: string | null
    cancelledAt: string | null
    notes: string | null
  } | null
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
  const [showQualificationMenu, setShowQualificationMenu] = useState(false)
  const [editMode, setEditMode] = useState<'contact' | 'institut' | 'location' | 'commercial' | null>(null)
  const [showBookDemo, setShowBookDemo] = useState(false)
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false)
  const [editForm, setEditForm] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    institutName: '',
    numberOfLocations: 1,
    website: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
    source: '',
    estimatedValue: 0
  })

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
    markAsViewed()
  }, [leadId])

  const markAsViewed = async () => {
    try {
      await fetch(`/api/super-admin/leads/${leadId}/mark-viewed`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Erreur marquage lead comme vu:', error)
    }
  }

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/super-admin/leads/${leadId}`)
      if (response.ok) {
        const data = await response.json()
        setLead(data)
        // Initialize edit form with lead data
        setEditForm({
          contactName: data.contactName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          institutName: data.institutName || '',
          numberOfLocations: data.numberOfLocations || 1,
          website: data.website || '',
          address: data.address || '',
          postalCode: data.postalCode || '',
          city: data.city || '',
          country: data.country || '',
          source: data.source || '',
          estimatedValue: data.estimatedValue || 0
        })
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSection = (section: 'contact' | 'institut' | 'location' | 'commercial') => {
    setEditMode(section)
  }

  const handleCancelEdit = () => {
    setEditMode(null)
    if (lead) {
      setEditForm({
        contactName: lead.contactName || '',
        contactEmail: lead.contactEmail || '',
        contactPhone: lead.contactPhone || '',
        institutName: lead.institutName || '',
        numberOfLocations: lead.numberOfLocations || 1,
        website: lead.website || '',
        address: lead.address || '',
        postalCode: lead.postalCode || '',
        city: lead.city || '',
        country: lead.country || '',
        source: lead.source || '',
        estimatedValue: lead.estimatedValue || 0
      })
    }
  }

  const handleSaveEdit = async () => {
    setSavingStatus(true)
    try {
      const response = await fetch(`/api/super-admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        await fetchLead()
        setEditMode(null)
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating lead:', error)
    } finally {
      setSavingStatus(false)
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

  const handleUpdateQualification = async (newQualification: LeadQualification | null) => {
    setSavingStatus(true)
    try {
      const response = await fetch(`/api/super-admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qualification: newQualification })
      })

      if (response.ok) {
        await fetchLead()
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating qualification:', error)
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
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <div className="px-3 py-1 bg-white/20 rounded-lg text-sm">
                  Score: {lead.score}/100
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-lg text-sm">
                  Probabilité: {lead.probability}%
                </div>

                {/* Badge de qualification cliquable */}
                <div className="relative">
                  {lead.qualification ? (
                    <div
                      onClick={() => setShowQualificationMenu(!showQualificationMenu)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer hover:opacity-80 flex items-center gap-1 ${QUALIFICATION_OPTIONS.find(q => q.value === lead.qualification)?.bgColor} ${QUALIFICATION_OPTIONS.find(q => q.value === lead.qualification)?.color}`}
                    >
                      {QUALIFICATION_OPTIONS.find(q => q.value === lead.qualification)?.emoji} {QUALIFICATION_OPTIONS.find(q => q.value === lead.qualification)?.label}
                      <span className="text-[10px]">▼</span>
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowQualificationMenu(!showQualificationMenu)}
                      className="px-3 py-1 bg-white/20 rounded-lg text-sm cursor-pointer hover:bg-white/30 flex items-center gap-1"
                    >
                      ➕ Qualifier
                    </div>
                  )}

                  {/* Menu déroulant */}
                  {showQualificationMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[140px]">
                      {lead.qualification && (
                        <button
                          onClick={() => {
                            handleUpdateQualification(null)
                            setShowQualificationMenu(false)
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex items-center gap-2 text-gray-600 border-b border-gray-200"
                        >
                          <span>✕</span>
                          <span>Retirer</span>
                        </button>
                      )}
                      {QUALIFICATION_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleUpdateQualification(option.value)
                            setShowQualificationMenu(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:${option.bgColor.replace('bg-', 'bg-opacity-50 bg-')} flex items-center gap-2 ${lead.qualification === option.value ? `${option.bgColor} font-semibold` : ''} ${option === QUALIFICATION_OPTIONS[QUALIFICATION_OPTIONS.length - 1] ? 'rounded-b-lg' : ''}`}
                        >
                          <span>{option.emoji}</span>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
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

        {/* Bouton Réserver une démo */}
        {!lead.demoBooking && (
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <button
              onClick={() => setShowBookDemo(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              📅 Réserver une démo pour ce lead
            </button>
          </div>
        )}

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
              💬 Interactions ({(lead.interactions?.length || 0) + (lead.demoBooking ? 1 : 0)})
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

              {/* Informations de contact */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <span>👤</span>
                    <span>Informations de contact</span>
                  </h3>
                  {editMode !== 'contact' && (
                    <button
                      onClick={() => handleEditSection('contact')}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      ✏️ Modifier
                    </button>
                  )}
                </div>
                {editMode === 'contact' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">Nom du contact *</label>
                        <input
                          type="text"
                          value={editForm.contactName}
                          onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={editForm.contactEmail}
                          onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-blue-700 mb-1">Téléphone</label>
                        <input
                          type="tel"
                          value={editForm.contactPhone}
                          onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingStatus}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingStatus ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-blue-700 font-medium mb-1">Nom du contact</div>
                      <div className="text-gray-900">{lead.contactName}</div>
                    </div>
                    <div>
                      <div className="text-blue-700 font-medium mb-1">Email</div>
                      <div className="text-gray-900">{lead.contactEmail}</div>
                    </div>
                    <div>
                      <div className="text-blue-700 font-medium mb-1">Téléphone</div>
                      <div className="text-gray-900">{lead.contactPhone || '—'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Informations Institut */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                    <span>🏢</span>
                    <span>Informations Institut</span>
                  </h3>
                  {editMode !== 'institut' && (
                    <button
                      onClick={() => handleEditSection('institut')}
                      className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                    >
                      ✏️ Modifier
                    </button>
                  )}
                </div>
                {editMode === 'institut' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-purple-700 mb-1">Nom de l'institut *</label>
                        <input
                          type="text"
                          value={editForm.institutName}
                          onChange={(e) => setEditForm({ ...editForm, institutName: e.target.value })}
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-purple-700 mb-1">Nombre d'emplacements</label>
                        <input
                          type="number"
                          min="1"
                          value={editForm.numberOfLocations}
                          onChange={(e) => setEditForm({ ...editForm, numberOfLocations: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-purple-700 mb-1">Site web</label>
                        <input
                          type="url"
                          value={editForm.website}
                          onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingStatus}
                        className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {savingStatus ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-purple-700 font-medium mb-1">Nom de l'institut</div>
                      <div className="text-gray-900">{lead.institutName}</div>
                    </div>
                    <div>
                      <div className="text-purple-700 font-medium mb-1">Nombre d'emplacements</div>
                      <div className="text-gray-900">{lead.numberOfLocations || '—'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-purple-700 font-medium mb-1">Site web</div>
                      {lead.website ? (
                        <a href={lead.website} target="_blank" className="text-purple-600 hover:underline">
                          🌐 {lead.website}
                        </a>
                      ) : (
                        <div className="text-gray-900">—</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Localisation */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-green-900 flex items-center gap-2">
                    <span>📍</span>
                    <span>Localisation</span>
                  </h3>
                  {editMode !== 'location' && (
                    <button
                      onClick={() => handleEditSection('location')}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      ✏️ Modifier
                    </button>
                  )}
                </div>
                {editMode === 'location' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-green-700 mb-1">Adresse</label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-green-700 mb-1">Code postal</label>
                        <input
                          type="text"
                          value={editForm.postalCode}
                          onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-green-700 mb-1">Ville</label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-green-700 mb-1">Pays</label>
                        <input
                          type="text"
                          value={editForm.country}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingStatus}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {savingStatus ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2">
                      <div className="text-green-700 font-medium mb-1">Adresse</div>
                      <div className="text-gray-900">{lead.address || '—'}</div>
                    </div>
                    <div>
                      <div className="text-green-700 font-medium mb-1">Code postal</div>
                      <div className="text-gray-900">{lead.postalCode || '—'}</div>
                    </div>
                    <div>
                      <div className="text-green-700 font-medium mb-1">Ville</div>
                      <div className="text-gray-900">{lead.city || '—'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-green-700 font-medium mb-1">Pays</div>
                      <div className="text-gray-900">{lead.country || '—'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Informations commerciales */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                    <span>💼</span>
                    <span>Informations commerciales</span>
                  </h3>
                  {editMode !== 'commercial' && (
                    <button
                      onClick={() => handleEditSection('commercial')}
                      className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition"
                    >
                      ✏️ Modifier
                    </button>
                  )}
                </div>
                {editMode === 'commercial' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-orange-700 mb-1">Source du lead</label>
                        <input
                          type="text"
                          value={editForm.source}
                          onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                          className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-orange-700 mb-1">Valeur estimée (€)</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.estimatedValue}
                          onChange={(e) => setEditForm({ ...editForm, estimatedValue: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingStatus}
                        className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                      >
                        {savingStatus ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-orange-700 font-medium mb-1">Source du lead</div>
                      <div className="text-gray-900">{lead.source}</div>
                    </div>
                    <div>
                      <div className="text-orange-700 font-medium mb-1">Valeur estimée</div>
                      <div className="text-gray-900 font-semibold">
                        {lead.estimatedValue ? `${lead.estimatedValue.toLocaleString('fr-FR')}€` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-orange-700 font-medium mb-1">Score de qualification</div>
                      <div className="text-gray-900">{lead.score}/100</div>
                    </div>
                    <div>
                      <div className="text-orange-700 font-medium mb-1">Probabilité de conversion</div>
                      <div className="text-gray-900">{lead.probability}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates et suivi */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📅</span>
                  <span>Dates et suivi</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-700 font-medium mb-1">Créé le</div>
                    <div className="text-gray-900">{new Date(lead.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div>
                    <div className="text-gray-700 font-medium mb-1">Dernier contact</div>
                    <div className="text-gray-900">
                      {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-700 font-medium mb-1">Prochain suivi prévu</div>
                    <div className={lead.nextFollowUpDate ? 'text-purple-600 font-medium' : 'text-gray-900'}>
                      {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <span>📝</span>
                    <span>Notes</span>
                  </h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
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
                {/* Démonstration réservée */}
                {lead.demoBooking && (() => {
                  const slotDate = new Date(lead.demoBooking.slot.date)
                  const endDate = new Date(slotDate.getTime() + lead.demoBooking.slot.duration * 60000)
                  const startTime = slotDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  const endTime = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

                  return (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎯</span>
                          <span className="font-semibold text-purple-900">
                            Démonstration {lead.demoBooking.type === 'ONLINE' ? 'en ligne' : 'physique'}
                          </span>
                          {lead.demoBooking.status === 'CONFIRMED' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              ✓ Confirmée
                            </span>
                          )}
                          {lead.demoBooking.status === 'COMPLETED' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              ✓ Effectuée
                            </span>
                          )}
                          {lead.demoBooking.status === 'CANCELLED' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              ✕ Annulée
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          Réservée le {new Date(lead.demoBooking.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">📅 Date:</span> {slotDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">🕐 Horaire:</span> {startTime} - {endTime} ({lead.demoBooking.slot.duration} min)
                      </div>
                      {lead.demoBooking.notes && (
                        <div className="text-sm text-gray-600 bg-white/50 p-2 rounded mt-2">
                          📝 {lead.demoBooking.notes}
                        </div>
                      )}
                      {lead.demoBooking.completedAt && (
                        <div className="text-xs text-green-600 mt-2">
                          ✓ Effectuée le {new Date(lead.demoBooking.completedAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      {lead.demoBooking.cancelledAt && (
                        <div className="text-xs text-red-600 mt-2">
                          Annulée le {new Date(lead.demoBooking.cancelledAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Interactions */}
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
                ) : !lead.demoBooking ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune interaction enregistrée
                  </div>
                ) : null}
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
                <div className="max-w-md mx-auto text-center py-12">
                  <button
                    onClick={() => setShowCreateOrgModal(true)}
                    className="w-full px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-bold text-lg"
                  >
                    🏢 Créer l'organisation
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    Convertir ce lead en organisation cliente
                  </p>
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

      {/* Modal Réservation de démo */}
      {showBookDemo && (
        <BookDemoModal
          lead={lead}
          onClose={() => setShowBookDemo(false)}
          onSuccess={() => {
            setShowBookDemo(false)
            fetchLead()
            onUpdate()
          }}
        />
      )}

      {/* Modal Création organisation */}
      {showCreateOrgModal && lead && (
        <CreateOrganizationModal
          lead={lead}
          onClose={() => setShowCreateOrgModal(false)}
          onSuccess={() => {
            setShowCreateOrgModal(false)
            fetchLead()
            onUpdate()
          }}
        />
      )}
    </div>
  )
}

// Modal de réservation de démo
function BookDemoModal({ lead, onClose, onSuccess }: {
  lead: { id: string; institutName: string; contactName: string; contactEmail: string; contactPhone: string | null }
  onClose: () => void
  onSuccess: () => void
}) {
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [demoType, setDemoType] = useState<'ONLINE' | 'PHYSICAL'>('ONLINE')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchAvailableSlots()
  }, [])

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch('/api/super-admin/demo-slots')
      if (response.ok) {
        const data = await response.json()
        // Filter available slots (not booked and in the future)
        const available = data.slots.filter((slot: any) =>
          slot.isAvailable &&
          slot.bookings.length === 0 &&
          new Date(slot.date) > new Date()
        )
        setAvailableSlots(available)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookDemo = async () => {
    if (!selectedSlot) {
      alert('Veuillez sélectionner un créneau')
      return
    }

    setBooking(true)
    try {
      const response = await fetch('/api/super-admin/demo-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot,
          institutName: lead.institutName,
          contactName: lead.contactName,
          contactEmail: lead.contactEmail,
          contactPhone: lead.contactPhone,
          message: notes,
          leadId: lead.id,
          type: demoType,
          location: demoType === 'PHYSICAL' ? location : null
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        alert('Erreur lors de la réservation')
      }
    } catch (error) {
      console.error('Error booking demo:', error)
      alert('Erreur réseau')
    } finally {
      setBooking(false)
    }
  }

  const groupSlotsByDate = () => {
    const grouped: { [key: string]: any[] } = {}
    availableSlots.forEach(slot => {
      const date = new Date(slot.date)
      const dateKey = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(slot)
    })
    return grouped
  }

  const groupedSlots = groupSlotsByDate()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-lg z-10">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">📅 Réserver une démo</h3>
              <p className="text-purple-100">{lead.institutName} - {lead.contactName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Type de démo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Type de démonstration</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDemoType('ONLINE')}
                className={`p-4 border-2 rounded-lg transition ${
                  demoType === 'ONLINE'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-300'
                }`}
              >
                <div className="text-3xl mb-2">💻</div>
                <div className="font-semibold text-gray-900">En ligne</div>
                <div className="text-xs text-gray-600 mt-1">Lien Jitsi automatique</div>
              </button>
              <button
                onClick={() => setDemoType('PHYSICAL')}
                className={`p-4 border-2 rounded-lg transition ${
                  demoType === 'PHYSICAL'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-300'
                }`}
              >
                <div className="text-3xl mb-2">🏢</div>
                <div className="font-semibold text-gray-900">Physique</div>
                <div className="text-xs text-gray-600 mt-1">Sur place</div>
              </button>
            </div>
          </div>

          {/* Lieu si physique */}
          {demoType === 'PHYSICAL' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu du rendez-vous</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Adresse du rendez-vous"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Points à aborder, attentes particulières..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Créneaux disponibles */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Sélectionner un créneau</label>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Chargement des créneaux...</div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-4xl mb-2">📅</div>
                <p className="font-semibold">Aucun créneau disponible</p>
                <p className="text-sm mt-1">Créez des créneaux depuis l'onglet Démos</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {Object.entries(groupedSlots).map(([date, slots]) => (
                  <div key={date}>
                    <h4 className="font-bold text-gray-800 mb-2 capitalize sticky top-0 bg-white py-2 border-b">
                      {date}
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((slot: any) => {
                        const slotTime = new Date(slot.date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot.id)}
                            className={`px-3 py-2 rounded-lg border-2 transition ${
                              selectedSlot === slot.id
                                ? 'border-purple-600 bg-purple-600 text-white font-bold'
                                : 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {slotTime}
                            <div className="text-xs opacity-75">{slot.duration}min</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-semibold"
            >
              Annuler
            </button>
            <button
              onClick={handleBookDemo}
              disabled={booking || !selectedSlot}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booking ? 'Réservation...' : '✨ Confirmer la réservation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
