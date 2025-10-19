'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  content: string
  target: 'ALL' | 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'PLAN_SOLO' | 'PLAN_DUO' | 'PLAN_TEAM' | 'PLAN_PREMIUM'
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED'
  scheduledAt?: Date
  sentAt?: Date
  stats?: {
    sent: number
    opened: number
    clicked: number
  }
  createdAt: Date
}

export default function EmailCampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)

  // Formulaire de création
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    target: 'ALL' as EmailCampaign['target'],
    scheduledAt: ''
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    try {
      const response = await fetch('/api/super-admin/email-campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/email-campaigns')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/super-admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', subject: '', content: '', target: 'ALL', scheduledAt: '' })
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  async function handleSendCampaign(id: string) {
    if (!confirm('Voulez-vous vraiment envoyer cette campagne ?')) return

    try {
      const response = await fetch(`/api/super-admin/email-campaigns/${id}/send`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
    }
  }

  const getTargetLabel = (target: EmailCampaign['target']) => {
    const labels = {
      ALL: 'Toutes les organisations',
      TRIAL: 'Organisations en essai',
      ACTIVE: 'Organisations actives',
      SUSPENDED: 'Organisations suspendues',
      PLAN_SOLO: 'Plan SOLO',
      PLAN_DUO: 'Plan DUO',
      PLAN_TEAM: 'Plan TEAM',
      PLAN_PREMIUM: 'Plan PREMIUM'
    }
    return labels[target] || target
  }

  const getStatusBadge = (status: EmailCampaign['status']) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      SENDING: 'bg-yellow-100 text-yellow-800',
      SENT: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">=ç Campagnes Email</h1>
          <p className="text-gray-600">Envoyez des emails marketing à vos organisations clientes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          + Nouvelle Campagne
        </button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total campagnes</p>
          <p className="text-3xl font-bold text-purple-600">{campaigns.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Envoyées</p>
          <p className="text-3xl font-bold text-green-600">
            {campaigns.filter(c => c.status === 'SENT').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Brouillons</p>
          <p className="text-3xl font-bold text-gray-600">
            {campaigns.filter(c => c.status === 'DRAFT').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Programmées</p>
          <p className="text-3xl font-bold text-blue-600">
            {campaigns.filter(c => c.status === 'SCHEDULED').length}
          </p>
        </div>
      </div>

      {/* Liste des campagnes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Toutes les campagnes</h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">Aucune campagne pour le moment</p>
            <p className="text-sm">Créez votre première campagne pour commencer</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistiques</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getTargetLabel(campaign.target)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {campaign.stats ? (
                        <div>
                          <div>{campaign.stats.sent} envoyés</div>
                          <div className="text-xs text-gray-500">
                            {campaign.stats.opened} ouverts · {campaign.stats.clicked} clics
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {campaign.sentAt
                        ? new Date(campaign.sentAt).toLocaleDateString('fr-FR')
                        : campaign.scheduledAt
                        ? new Date(campaign.scheduledAt).toLocaleDateString('fr-FR')
                        : new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {campaign.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSendCampaign(campaign.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Envoyer
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouvelle Campagne Email</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la campagne
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Ex: Nouveautés janvier 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet de l'email
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Ex: Découvrez les nouvelles fonctionnalités LAIA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cible
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value as EmailCampaign['target'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="ALL">Toutes les organisations</option>
                  <option value="TRIAL">Organisations en essai</option>
                  <option value="ACTIVE">Organisations actives</option>
                  <option value="SUSPENDED">Organisations suspendues</option>
                  <option value="PLAN_SOLO">Plan SOLO uniquement</option>
                  <option value="PLAN_DUO">Plan DUO uniquement</option>
                  <option value="PLAN_TEAM">Plan TEAM uniquement</option>
                  <option value="PLAN_PREMIUM">Plan PREMIUM uniquement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu de l'email
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Rédigez votre email ici..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programmer l'envoi (optionnel)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Créer la campagne
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détail */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCampaign.name}</h2>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Sujet</label>
                <p className="text-lg text-gray-900">{selectedCampaign.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Cible</label>
                <p className="text-gray-900">{getTargetLabel(selectedCampaign.target)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">{getStatusBadge(selectedCampaign.status)}</div>
              </div>

              {selectedCampaign.stats && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Statistiques</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedCampaign.stats.sent}</p>
                      <p className="text-xs text-gray-600">Envoyés</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedCampaign.stats.opened}</p>
                      <p className="text-xs text-gray-600">Ouverts</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedCampaign.stats.clicked}</p>
                      <p className="text-xs text-gray-600">Clics</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Contenu</label>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                  {selectedCampaign.content}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
