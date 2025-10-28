'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Organization {
  id: string
  name: string
  slug: string
  clientCount: number
}

type TemplateType = 'welcome' | 'reminder' | 'promotion' | 'loyalty' | 'birthday' | 'reactivation' | 'reviewRequest'

export default function EmailCampaignsPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  // Formulaire
  const [selectedOrg, setSelectedOrg] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('promotion')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailData, setEmailData] = useState({
    discount: '-15%',
    offer: '-20%',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
    gift: '-25%',
    reward: '-30€',
    sessionsCount: '6'
  })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  async function fetchOrganizations() {
    try {
      const response = await fetch('/api/super-admin/organizations-list')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data)
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const templateLabels: Record<TemplateType, string> = {
    welcome: '🎁 Bienvenue',
    reminder: '📅 Rappel RDV',
    promotion: '💝 Offre Spéciale',
    loyalty: '⭐ Fidélité',
    birthday: '🎂 Anniversaire',
    reactivation: '💔 Réactivation',
    reviewRequest: '⭐ Demande Avis'
  }

  async function handlePreview() {
    try {
      const response = await fetch('/api/super-admin/preview-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: selectedOrg === 'all' ? null : selectedOrg,
          templateType: selectedTemplate,
          subject: emailSubject,
          data: emailData
        })
      })

      const result = await response.json()

      if (response.ok) {
        setPreviewHtml(result.html)
        setShowPreview(true)
      } else {
        alert(`❌ Erreur: ${result.error}`)
      }
    } catch (error) {
      console.error('Error previewing email:', error)
      alert('❌ Erreur lors de la prévisualisation')
    }
  }

  async function handleSendEmails() {
    if (!emailSubject.trim()) {
      alert('Veuillez saisir un sujet pour l\'email')
      return
    }

    const selectedOrgData = organizations.find(o => o.id === selectedOrg)
    const clientCount = selectedOrg === 'all'
      ? organizations.reduce((sum, org) => sum + org.clientCount, 0)
      : selectedOrgData?.clientCount || 0

    if (clientCount === 0) {
      alert('Aucun client à qui envoyer l\'email')
      return
    }

    const confirmMessage = selectedOrg === 'all'
      ? `Envoyer ${selectedTemplate} à ${clientCount} clients de TOUTES les organisations ?`
      : `Envoyer ${selectedTemplate} à ${clientCount} clients de ${selectedOrgData?.name} ?`

    if (!confirm(confirmMessage)) return

    setSending(true)

    try {
      const response = await fetch('/api/super-admin/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: selectedOrg === 'all' ? null : selectedOrg,
          templateType: selectedTemplate,
          subject: emailSubject,
          data: emailData
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ Email envoyé avec succès à ${result.sent} clients !`)
        setEmailSubject('')
      } else {
        alert(`❌ Erreur: ${result.error}`)
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
      alert('❌ Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#d4b5a0" }}></div>
      </div>
    )
  }

  const totalClients = organizations.reduce((sum, org) => sum + org.clientCount, 0)
  const selectedOrgData = organizations.find(o => o.id === selectedOrg)
  const recipientCount = selectedOrg === 'all' ? totalClients : (selectedOrgData?.clientCount || 0)

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          📧 Campagnes Email Clients
        </h1>
        <p className="text-gray-600">
          Envoyez des emails personnalisés aux clients de vos instituts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total Clients</p>
          <p className="text-3xl font-bold" style={{ color: "#b8935f" }}>{totalClients}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Organisations</p>
          <p className="text-3xl font-bold text-blue-600">{organizations.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Destinataires sélectionnés</p>
          <p className="text-3xl font-bold text-green-600">{recipientCount}</p>
        </div>
      </div>

      {/* Formulaire d'envoi */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Créer une campagne</h2>

        <div className="space-y-6">
          {/* Organisation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organisation cible
            </label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="all">🌍 Toutes les organisations ({totalClients} clients)</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.clientCount} clients)
                </option>
              ))}
            </select>
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'email
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              {Object.entries(templateLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Sujet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sujet de l'email
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Ex: 🎁 Offre exclusive pour vous !"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          {/* Données du template */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Personnalisation</h3>

            {selectedTemplate === 'promotion' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Réduction offerte</label>
                  <input
                    type="text"
                    value={emailData.offer}
                    onChange={(e) => setEmailData({ ...emailData, offer: e.target.value })}
                    placeholder="-20%"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Valable jusqu'au</label>
                  <input
                    type="text"
                    value={emailData.validUntil}
                    onChange={(e) => setEmailData({ ...emailData, validUntil: e.target.value })}
                    placeholder="31/12/2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </>
            )}

            {selectedTemplate === 'welcome' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Réduction bienvenue</label>
                <input
                  type="text"
                  value={emailData.discount}
                  onChange={(e) => setEmailData({ ...emailData, discount: e.target.value })}
                  placeholder="-15%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            {selectedTemplate === 'birthday' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cadeau d'anniversaire</label>
                <input
                  type="text"
                  value={emailData.gift}
                  onChange={(e) => setEmailData({ ...emailData, gift: e.target.value })}
                  placeholder="-25%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            {selectedTemplate === 'loyalty' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre de séances</label>
                  <input
                    type="text"
                    value={emailData.sessionsCount}
                    onChange={(e) => setEmailData({ ...emailData, sessionsCount: e.target.value })}
                    placeholder="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Récompense</label>
                  <input
                    type="text"
                    value={emailData.reward}
                    onChange={(e) => setEmailData({ ...emailData, reward: e.target.value })}
                    placeholder="-30€"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </>
            )}
          </div>

          {/* Boutons prévisualisation et envoi */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handlePreview}
              className="w-full py-3 rounded-lg font-semibold border-2 hover:bg-gray-50 transition-all"
              style={{ color: "#b8935f", borderColor: "#d4b5a0" }}
            >
              👁️ Prévisualiser l'email
            </button>

            <button
              onClick={handleSendEmails}
              disabled={sending || !emailSubject.trim()}
              className={`w-full py-4 rounded-lg font-semibold text-white text-lg transition-all ${
                sending || !emailSubject.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r style={{ background: "linear-gradient(to right, #d4b5a0, #c9a589)" }} className=" hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Envoi en cours...
                </span>
              ) : (
                `📧 Envoyer à ${recipientCount} client${recipientCount > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Prévisualisation de l'email</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-[600px] border-0"
                title="Email Preview"
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowPreview(false)
                  handleSendEmails()
                }}
                disabled={sending}
                className="px-4 py-2 text-white rounded-lg"
                style={{ background: "linear-gradient(to right, #d4b5a0, #c9a589)" }}
              >
                Envoyer maintenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
