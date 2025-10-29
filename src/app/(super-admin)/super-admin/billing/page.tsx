"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Invoice {
  id: string
  organizationId: string
  amount: number
  currency: string
  status: string
  stripeInvoiceId: string | null
  paidAt: string | null
  dueDate: string
  description: string | null
  createdAt: string
  invoiceNumber?: string
  pdfPath?: string
  organization: {
    id: string
    name: string
    slug: string
    plan: string
  }
  payments: any[]
}

interface InvoiceSettings {
  companyName: string
  address: string
  postalCode: string
  city: string
  country: string
  siret: string
  tvaNumber: string
  capitalSocial: string
  rcs: string
  email: string
  phone: string
  website: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  invoicePrefix: string
  tvaRate: number
  paymentTerms: string
  latePenalty: string
  footerText: string
}

export default function BillingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'invoices' | 'settings'>('invoices')

  // Invoices state
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, failed: 0, totalRevenue: 0 })
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showExtendTrialModal, setShowExtendTrialModal] = useState(false)
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const [newInvoice, setNewInvoice] = useState({
    organizationId: '',
    amount: '',
    dueDate: '',
    description: ''
  })

  const [extendTrial, setExtendTrial] = useState({
    organizationId: '',
    days: '7'
  })

  const [creditNoteData, setCreditNoteData] = useState({
    reason: '',
    partialAmount: ''
  })

  // Settings state
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settings, setSettings] = useState<InvoiceSettings>({
    companyName: 'LAIA',
    address: 'Paris',
    postalCode: '75000',
    city: 'Paris',
    country: 'France',
    siret: 'À remplir',
    tvaNumber: 'À remplir',
    capitalSocial: 'À définir',
    rcs: 'À remplir',
    email: 'contact@laiaskin.com',
    phone: 'À remplir',
    website: 'https://laia-skin-institut.com',
    logoUrl: '',
    primaryColor: '#7c3aed',
    secondaryColor: '#c9a88e',
    invoicePrefix: 'LAIA',
    tvaRate: 20.0,
    paymentTerms: 'Prélèvement SEPA automatique',
    latePenalty: 'En cas de retard de paiement, indemnité forfaitaire de 40€ pour frais de recouvrement.',
    footerText: 'Logiciel de gestion pour instituts de beauté',
  })

  useEffect(() => {
    if (activeTab === 'invoices') {
      fetchInvoices()
    } else {
      fetchSettings()
    }
  }, [activeTab, pagination.page, statusFilter])

  async function fetchInvoices() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/super-admin/invoices?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])

        // Adapter les stats au format attendu
        setStats({
          total: data.stats?.total || 0,
          pending: data.stats?.pending || 0,
          paid: data.stats?.paid || 0,
          failed: data.stats?.overdue || 0,
          totalRevenue: data.stats?.totalAmount || 0
        })

        // Pagination simplifiée (toutes les factures pour l'instant)
        setPagination({
          page: 1,
          limit: 50,
          total: data.invoices?.length || 0,
          totalPages: 1
        })
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateInvoiceForOrg(organizationId: string) {
    try {
      const response = await fetch('/api/super-admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId })
      })

      if (response.ok) {
        alert('✅ Facture générée avec succès')
        fetchInvoices()
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating invoice:', error)
      alert('❌ Erreur lors de la génération')
    }
  }

  async function generateAllInvoices() {
    if (!confirm('Générer les factures pour toutes les organisations actives ?')) {
      return
    }

    try {
      const response = await fetch('/api/super-admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateForAllOrganizations: true })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ ${data.invoices?.length || 0} factures générées`)
        fetchInvoices()
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating invoices:', error)
      alert('❌ Erreur lors de la génération')
    }
  }

  async function fetchSettings() {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/super-admin/invoice-settings')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setSettings(data)
        }
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSavingSettings(true)

    try {
      const res = await fetch('/api/super-admin/invoice-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        alert('✅ Paramètres sauvegardés avec succès !')
      } else {
        alert('❌ Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setSavingSettings(false)
    }
  }

  async function createInvoice() {
    try {
      const response = await fetch('/api/super-admin/billing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      })
      if (response.ok) {
        setShowCreateModal(false)
        setNewInvoice({ organizationId: '', amount: '', dueDate: '', description: '' })
        fetchInvoices()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Erreur serveur')
    }
  }

  async function markAsPaid(invoiceId: string) {
    if (!confirm('Marquer cette facture comme payée ?')) return

    try {
      const response = await fetch(`/api/super-admin/billing/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' })
      })
      if (response.ok) {
        fetchInvoices()
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
    }
  }

  async function deleteInvoice(invoiceId: string) {
    if (!confirm('Supprimer cette facture ?')) return

    try {
      const response = await fetch(`/api/super-admin/billing/invoices/${invoiceId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchInvoices()
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
    }
  }

  async function handleExtendTrial() {
    try {
      const response = await fetch('/api/super-admin/billing/extend-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extendTrial)
      })
      if (response.ok) {
        setShowExtendTrialModal(false)
        setExtendTrial({ organizationId: '', days: '7' })
        alert('Période d\'essai prolongée avec succès')
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur')
      }
    } catch (error) {
      console.error('Error extending trial:', error)
      alert('Erreur serveur')
    }
  }

  async function createCreditNote() {
    if (!selectedInvoice) return

    try {
      const response = await fetch(`/api/super-admin/invoices/${selectedInvoice.id}/credit-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: creditNoteData.reason || 'Annulation',
          partialAmount: creditNoteData.partialAmount ? parseFloat(creditNoteData.partialAmount) : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ Avoir ${data.creditNote.invoiceNumber} créé avec succès`)
        setShowCreditNoteModal(false)
        setSelectedInvoice(null)
        setCreditNoteData({ reason: '', partialAmount: '' })
        fetchInvoices()

        // Télécharger le PDF de l'avoir
        if (data.pdfBuffer) {
          const blob = new Blob([Buffer.from(data.pdfBuffer, 'base64')], { type: 'application/pdf' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `Avoir_${data.creditNote.invoiceNumber}.pdf`
          a.click()
          window.URL.revokeObjectURL(url)
        }
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating credit note:', error)
      alert('❌ Erreur serveur')
    }
  }

  async function regenerateInvoice(invoiceId: string) {
    if (!confirm('Créer une nouvelle facture et marquer l\'ancienne comme remplacée ?')) {
      return
    }

    const reason = prompt('Motif de la régénération (optionnel):')

    try {
      const response = await fetch(`/api/super-admin/invoices/${invoiceId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || undefined })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ ${data.message}`)
        fetchInvoices()

        // Télécharger le PDF de la nouvelle facture
        if (data.pdfBuffer) {
          const blob = new Blob([Buffer.from(data.pdfBuffer, 'base64')], { type: 'application/pdf' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `Facture_${data.newInvoice.invoiceNumber}.pdf`
          a.click()
          window.URL.revokeObjectURL(url)
        }
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error regenerating invoice:', error)
      alert('❌ Erreur serveur')
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-purple-100 text-beige-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  if (loading && activeTab === 'invoices') {
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
              Facturation & Abonnements
            </h2>
            <p className="text-gray-700">Gestion des factures, paiements et paramètres</p>
          </div>
          {activeTab === 'invoices' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowExtendTrialModal(true)}
                className="px-6 py-3 bg-white hover:bg-gray-50 rounded-lg font-medium border-2 shadow-sm"
                style={{ color: '#4f46e5', borderColor: '#4f46e5' }}
              >
                Prolonger essai
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-white rounded-lg font-medium hover:bg-gray-50 border-2 shadow-sm"
                style={{ color: '#7c3aed', borderColor: '#7c3aed' }}
              >
                Créer facture
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 rounded-lg font-medium transition-all border-2 ${
            activeTab === 'invoices'
              ? 'bg-white shadow-md border-2'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border-gray-300'
          }`}
          style={activeTab === 'invoices' ? { color: '#7c3aed', borderColor: '#7c3aed' } : {}}
        >
          📄 Factures
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 rounded-lg font-medium transition-all border-2 ${
            activeTab === 'settings'
              ? 'bg-white shadow-md border-2'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border-gray-300'
          }`}
          style={activeTab === 'settings' ? { color: '#7c3aed', borderColor: '#7c3aed' } : {}}
        >
          ⚙️ Paramètres
        </button>
      </div>

      {/* Invoices Tab Content */}
      {activeTab === 'invoices' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Total factures</div>
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-6">
              <div className="text-sm text-yellow-700 mb-1">En attente</div>
              <div className="text-3xl font-bold text-yellow-800">{stats.pending}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6">
              <div className="text-sm text-green-700 mb-1">Payées</div>
              <div className="text-3xl font-bold text-green-800">{stats.paid}</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-6">
              <div className="text-sm text-red-700 mb-1">Échouées</div>
              <div className="text-3xl font-bold text-red-800">{stats.failed}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6">
              <div className="text-sm text-purple-700 mb-1">Revenus total</div>
              <div className="text-2xl font-bold text-beige-800">{formatCurrency(stats.totalRevenue)}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg"
              >
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="PAID">Payées</option>
                <option value="FAILED">Échouées</option>
                <option value="REFUNDED">Remboursées</option>
                <option value="CANCELLED">Annulées</option>
              </select>
            </div>
          </div>

          {/* Invoices List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {invoices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">💳</div>
                <p className="text-gray-600">Aucune facture trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facture #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payée le</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {invoice.invoiceNumber || `#${invoice.id.substring(0, 8)}`}
                          </div>
                          {invoice.description && (
                            <div className="text-xs text-gray-500">{invoice.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invoice.organization.name}</div>
                          <div className="text-xs text-gray-500">Plan: {invoice.organization.plan}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            {invoice.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => markAsPaid(invoice.id)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Marquer comme payée"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => regenerateInvoice(invoice.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Régénérer (nouvelle facture)"
                                >
                                  🔄
                                </button>
                              </>
                            )}
                            {(invoice.status === 'PAID' || invoice.status === 'PENDING') && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setShowCreditNoteModal(true)
                                }}
                                className="text-orange-600 hover:text-orange-800"
                                title="Créer un avoir"
                              >
                                📝
                              </button>
                            )}
                            {invoice.pdfPath ? (
                              <a
                                href={invoice.pdfPath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-beige-800"
                                style={{ color: "#7c3aed" }}
                                title="Voir la facture PDF"
                              >
                                📄
                              </a>
                            ) : (
                              <Link
                                href={`/super-admin/organizations/${invoice.organizationId}`}
                                className="text-gray-400"
                                title="Pas de PDF (voir organisation)"
                              >
                                👁️
                              </Link>
                            )}
                            {invoice.status !== 'PAID' && (
                              <button
                                onClick={() => deleteInvoice(invoice.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Supprimer (uniquement si non payée)"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} sur {pagination.totalPages} ({pagination.total} factures)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    ← Précédent
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-white rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: "#7c3aed" }}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {settingsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#7c3aed" }}></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : (
            <form onSubmit={saveSettings} className="space-y-8">
              {/* Informations Émetteur */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🏢 Informations de l'Entreprise LAIA
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'entreprise *
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SIRET *
                    </label>
                    <input
                      type="text"
                      value={settings.siret}
                      onChange={(e) => setSettings({ ...settings, siret: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      value={settings.postalCode}
                      onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays *
                    </label>
                    <input
                      type="text"
                      value={settings.country}
                      onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      N° TVA Intracommunautaire *
                    </label>
                    <input
                      type="text"
                      value={settings.tvaNumber}
                      onChange={(e) => setSettings({ ...settings, tvaNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capital Social
                    </label>
                    <input
                      type="text"
                      value={settings.capitalSocial}
                      onChange={(e) => setSettings({ ...settings, capitalSocial: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RCS
                    </label>
                    <input
                      type="text"
                      value={settings.rcs}
                      onChange={(e) => setSettings({ ...settings, rcs: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📧 Contact
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={settings.phone || ''}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site web
                    </label>
                    <input
                      type="url"
                      value={settings.website || ''}
                      onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Design */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🎨 Design
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL du logo
                    </label>
                    <input
                      type="url"
                      value={settings.logoUrl || ''}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Couleur principale
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="h-10 w-16 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Couleur secondaire
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="h-10 w-16 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Paramètres Facture */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  💰 Paramètres de Facturation
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Préfixe des factures *
                    </label>
                    <input
                      type="text"
                      value={settings.invoicePrefix}
                      onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Ex: LAIA-2025-001234</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux de TVA (%) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.tvaRate}
                      onChange={(e) => setSettings({ ...settings, tvaRate: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Mentions Légales */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📝 Mentions Légales
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conditions de paiement
                    </label>
                    <input
                      type="text"
                      value={settings.paymentTerms}
                      onChange={(e) => setSettings({ ...settings, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pénalités de retard
                    </label>
                    <textarea
                      value={settings.latePenalty}
                      onChange={(e) => setSettings({ ...settings, latePenalty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texte pied de page
                    </label>
                    <input
                      type="text"
                      value={settings.footerText || ''}
                      onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {savingSettings ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Créer une facture</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'organisation
                  <span className="text-xs text-gray-500 ml-2">(ex: CELIA TEST)</span>
                </label>
                <input
                  type="text"
                  value={newInvoice.organizationId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, organizationId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Nom de l'organisation..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="99.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'échéance</label>
                <input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
                <input
                  type="text"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Abonnement mensuel..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createInvoice}
                className="flex-1 px-4 py-2 text-white rounded-lg"
                style={{ backgroundColor: "#7c3aed" }}
              >
                Créer
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Trial Modal */}
      {showExtendTrialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Prolonger période d'essai</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Organisation</label>
                <input
                  type="text"
                  value={extendTrial.organizationId}
                  onChange={(e) => setExtendTrial({ ...extendTrial, organizationId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="cmxxx..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de jours</label>
                <select
                  value={extendTrial.days}
                  onChange={(e) => setExtendTrial({ ...extendTrial, days: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="7">7 jours</option>
                  <option value="14">14 jours</option>
                  <option value="30">30 jours</option>
                  <option value="60">60 jours</option>
                  <option value="90">90 jours</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExtendTrial}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Prolonger
              </button>
              <button
                onClick={() => setShowExtendTrialModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Note Modal */}
      {showCreditNoteModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">📝 Créer un avoir</h2>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Facture d'origine</p>
              <p className="font-bold text-lg">{selectedInvoice.invoiceNumber || `#${selectedInvoice.id.substring(0, 8)}`}</p>
              <p className="text-gray-700">
                {selectedInvoice.organization.name} - {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de l'avoir *
                </label>
                <textarea
                  value={creditNoteData.reason}
                  onChange={(e) => setCreditNoteData({ ...creditNoteData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Annulation de l'abonnement, Erreur de facturation..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant de l'avoir
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={creditNoteData.partialAmount}
                  onChange={(e) => setCreditNoteData({ ...creditNoteData, partialAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder={`Laisser vide pour un avoir complet (${formatCurrency(selectedInvoice.amount, selectedInvoice.currency)})`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Laisser vide pour créer un avoir du montant total de la facture
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  ⚠️ <strong>Règles légales :</strong><br />
                  • Un avoir annule ou corrige une facture<br />
                  • Il référence la facture d'origine<br />
                  • La facture d'origine reste dans l'historique<br />
                  • Un PDF sera automatiquement généré
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createCreditNote}
                disabled={!creditNoteData.reason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer l'avoir
              </button>
              <button
                onClick={() => {
                  setShowCreditNoteModal(false)
                  setSelectedInvoice(null)
                  setCreditNoteData({ reason: '', partialAmount: '' })
                }}
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
