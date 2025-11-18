'use client'

import { useState, useEffect } from 'react'
import { formatDateLocal } from '@/lib/date-utils'
import { calculateSMSCount, calculateSMSCost } from '@/lib/sms-service'
import { Smartphone, Users, Send, Clock, CheckCircle, AlertCircle, X, Edit2, Trash2, Calendar, RefreshCw } from 'lucide-react'
import ClientAdvancedFilters, { ClientFilterCriteria } from '@/components/ClientAdvancedFilters'

interface SMSCampaign {
  id: string
  name: string
  message: string
  filters?: ClientFilterCriteria // Remplace segmentId
  recipientCount: number
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED'
  scheduledAt?: string
  sentAt?: string
  sentCount: number
  deliveredCount: number
  failedCount: number
  totalCost?: number
  createdAt: string
}

interface SMSCampaignsTabProps {
  organizationId: string
  smsCredits: number
  onSent?: () => void
}

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  loyaltyPoints: number
  totalSpent: number
  lastVisit?: string
  skinType?: string
  birthDate?: string
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  _count?: {
    reservations: number
  }
}

export default function SMSCampaignsTab({ organizationId, smsCredits, onSent }: SMSCampaignsTabProps) {
  const [campaigns, setCampaigns] = useState<SMSCampaign[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<SMSCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set())
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(false)

  useEffect(() => {
    fetchCampaigns()
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoadingClients(true)
    try {
      const response = await fetch('/api/admin/crm/clients')
      if (response.ok) {
        const data = await response.json()
        // Filtrer uniquement les clients avec numéro de téléphone
        const clientsWithPhone = data.filter((c: Client) => c.phone && c.phone.trim() !== '')
        setClients(clientsWithPhone)
        console.log(`📱 ${clientsWithPhone.length} clients avec téléphone chargés pour filtrage`)
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error)
    } finally {
      setLoadingClients(false)
    }
  }

  // Fonction pour filtrer les clients selon les critères
  const filterClients = (filters: ClientFilterCriteria): Client[] => {
    let filtered = [...clients]

    // Recherche texte
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone?.includes(search)
      )
    }

    // Points de fidélité
    if (filters.minPoints) {
      filtered = filtered.filter(c => c.loyaltyPoints >= filters.minPoints!)
    }
    if (filters.maxPoints) {
      filtered = filtered.filter(c => c.loyaltyPoints <= filters.maxPoints!)
    }

    // Tier
    if (filters.tier) {
      filtered = filtered.filter(c => c.tier === filters.tier)
    }

    // Dépenses
    if (filters.minSpent) {
      filtered = filtered.filter(c => c.totalSpent >= filters.minSpent!)
    }
    if (filters.maxSpent) {
      filtered = filtered.filter(c => c.totalSpent <= filters.maxSpent!)
    }

    // Dernière visite
    if (filters.lastVisitDays) {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - filters.lastVisitDays)
      filtered = filtered.filter(c => {
        if (!c.lastVisit) return true
        return new Date(c.lastVisit) <= daysAgo
      })
    }

    // Statut d'activité
    if (filters.status) {
      const now = new Date()
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(c => {
        if (filters.status === 'new') {
          // Client créé il y a moins d'1 mois
          const createdAt = c.lastVisit ? new Date(c.lastVisit) : new Date()
          return createdAt >= oneMonthAgo
        } else if (filters.status === 'active') {
          // Dernière visite dans les 3 derniers mois
          if (!c.lastVisit) return false
          return new Date(c.lastVisit) >= threeMonthsAgo
        } else if (filters.status === 'inactive') {
          // Aucune visite depuis 3+ mois
          if (!c.lastVisit) return true
          return new Date(c.lastVisit) < threeMonthsAgo
        }
        return true
      })
    }

    // Nombre de visites
    if (filters.minVisits) {
      filtered = filtered.filter(c => (c._count?.reservations || 0) >= filters.minVisits!)
    }
    if (filters.maxVisits) {
      filtered = filtered.filter(c => (c._count?.reservations || 0) <= filters.maxVisits!)
    }

    // Type de peau
    if (filters.skinType) {
      filtered = filtered.filter(c => c.skinType === filters.skinType)
    }

    // Mois d'anniversaire
    if (filters.birthdayMonth !== undefined) {
      filtered = filtered.filter(c => {
        if (!c.birthDate) return false
        const birthMonth = new Date(c.birthDate).getMonth()
        return birthMonth === filters.birthdayMonth
      })
    }

    return filtered
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/sms/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Erreur chargement campagnes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCampaign = async (campaign: SMSCampaign) => {
    try {
      const url = campaign.id === 'new'
        ? '/api/admin/sms/campaigns'
        : `/api/admin/sms/campaigns/${campaign.id}`

      const method = campaign.id === 'new' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign)
      })

      if (response.ok) {
        await fetchCampaigns()
        setShowModal(false)
        setEditingCampaign(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Erreur enregistrement:', error)
      alert('Erreur lors de l\'enregistrement de la campagne')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette campagne ?')) return

    try {
      const response = await fetch(`/api/admin/sms/campaigns/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCampaigns()
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const handleSendCampaign = async (campaign: SMSCampaign) => {
    const smsCount = calculateSMSCount(campaign.message)
    const totalNeeded = smsCount * campaign.recipientCount

    if (smsCredits < totalNeeded) {
      alert(`Crédits insuffisants. Vous avez ${smsCredits} crédits, mais ${totalNeeded} sont nécessaires (${campaign.recipientCount} destinataires × ${smsCount} SMS).`)
      return
    }

    if (!confirm(`Envoyer cette campagne à ${campaign.recipientCount} destinataires (${totalNeeded} crédits) ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/sms/campaigns/${campaign.id}/send`, {
        method: 'POST'
      })

      if (response.ok) {
        await fetchCampaigns()
        if (onSent) onSent()
        alert('Campagne envoyée avec succès !')
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur envoi campagne:', error)
      alert('Erreur lors de l\'envoi de la campagne')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Brouillon' },
      SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Planifiée' },
      SENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Envoi en cours' },
      SENT: { bg: 'bg-green-100', text: 'text-green-800', label: 'Envoyée' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Échec' }
    }

    const badge = badges[status] || badges.DRAFT
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const CampaignForm = ({ campaign, onClose }: { campaign: SMSCampaign | null; onClose: () => void }) => {
    const [formData, setFormData] = useState<SMSCampaign>(campaign || {
      id: 'new',
      name: '',
      message: '',
      filters: {},
      recipientCount: 0,
      status: 'DRAFT',
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString()
    })

    // Calculer le nombre de destinataires en temps réel selon les filtres
    const filteredRecipients = filterClients(formData.filters || {})
    const actualRecipientCount = filteredRecipients.length

    const smsCount = calculateSMSCount(formData.message)
    const totalCost = calculateSMSCost(formData.message) * actualRecipientCount

    // Mettre à jour recipientCount quand les filtres changent
    useEffect(() => {
      setFormData(prev => ({ ...prev, recipientCount: actualRecipientCount }))
    }, [actualRecipientCount])

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-3xl w-full my-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-green-600" />
              {formData.id === 'new' ? 'Nouvelle Campagne SMS' : `Modifier ${formData.name}`}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveCampaign(formData); }} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la campagne *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Promo Saint-Valentin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Message SMS *
                </label>
                <div className="text-sm">
                  <span className={`font-medium ${formData.message.length > 160 ? 'text-orange-600' : 'text-green-600'}`}>
                    {formData.message.length}/160
                  </span>
                  <span className="text-gray-500 ml-2">({smsCount} SMS)</span>
                </div>
              </div>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Votre message ici..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                maxLength={612}
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Variables: {'{{'} prenom {'}}'},  {'{{'} nom {'}}'},  {'{{'} dateRDV {'}}'},  {'{{'} heureRDV {'}}'},  {'{{'} service {'}}'},  {'{{'} institut {'}}'},  {'{{'} points {'}}'}
              </p>
            </div>

            {/* Filtres avancés */}
            <div>
              <ClientAdvancedFilters
                filters={formData.filters || {}}
                onChange={(newFilters) => setFormData({ ...formData, filters: newFilters })}
                onReset={() => setFormData({ ...formData, filters: {} })}
              />

              {/* Affichage du nombre de destinataires */}
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Destinataires</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={fetchClients}
                      disabled={loadingClients}
                      className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="Actualiser la liste des clients"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingClients ? 'animate-spin' : ''}`} />
                    </button>
                    <span className="text-2xl font-bold text-green-600">
                      {actualRecipientCount}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  {actualRecipientCount === 0
                    ? '⚠️ Aucun client ne correspond à vos critères'
                    : actualRecipientCount === clients.length
                    ? '✅ Tous les clients avec téléphone'
                    : `✅ ${actualRecipientCount} client${actualRecipientCount > 1 ? 's' : ''} sélectionné${actualRecipientCount > 1 ? 's' : ''} sur ${clients.length}`
                  }
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planification (optionnel)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt ? formatDateLocal(formData.scheduledAt, true) : ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  status: e.target.value ? 'SCHEDULED' : 'DRAFT'
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Laissez vide pour envoyer immédiatement après validation
              </p>
            </div>

            {actualRecipientCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Coût estimé :</strong> {totalCost.toFixed(3)}€ ({actualRecipientCount} destinataires × {smsCount} SMS)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {smsCredits >= (actualRecipientCount * smsCount)
                    ? `✅ Vous avez assez de crédits (${smsCredits} disponibles)`
                    : `⚠️ Crédits insuffisants (${smsCredits} disponibles, ${actualRecipientCount * smsCount} requis)`
                  }
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                {formData.id === 'new' ? 'Créer' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Campagnes SMS</h3>
          <p className="text-sm text-gray-500 mt-1">
            Envoyez des SMS à plusieurs clients en même temps
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCampaign(null)
            setShowModal(true)
          }}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
        >
          + Nouvelle campagne
        </button>
      </div>

      {/* Liste des campagnes */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune campagne</h3>
          <p className="text-gray-500 mb-6">Créez votre première campagne SMS pour communiquer avec vos clients</p>
          <button
            onClick={() => {
              setEditingCampaign(null)
              setShowModal(true)
            }}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            Créer une campagne
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-sm text-gray-600">{campaign.message}</p>
                  {campaign.scheduledAt && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                      <Calendar className="w-4 h-4" />
                      Planifiée pour le {new Date(campaign.scheduledAt).toLocaleString('fr-FR')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {campaign.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSendCampaign(campaign)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Envoyer"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingCampaign(campaign)
                      setShowModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {campaign.status === 'SENT' && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{campaign.sentCount}</div>
                    <div className="text-xs text-gray-500">Envoyés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{campaign.deliveredCount}</div>
                    <div className="text-xs text-gray-500">Délivrés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{campaign.failedCount}</div>
                    <div className="text-xs text-gray-500">Échecs</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CampaignForm
          campaign={editingCampaign}
          onClose={() => {
            setShowModal(false)
            setEditingCampaign(null)
          }}
        />
      )}
    </div>
  )
}
