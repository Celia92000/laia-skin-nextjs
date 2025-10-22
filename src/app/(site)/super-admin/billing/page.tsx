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
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'send-link' | 'settings'>('invoices')

  // Invoices state
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, failed: 0, totalRevenue: 0 })
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showExtendTrialModal, setShowExtendTrialModal] = useState(false)

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

  // Payment link state (pour l'envoi de lien de paiement)
  const [paymentLinkForm, setPaymentLinkForm] = useState({
    organizationId: '',
    amount: '',
    description: '',
    customerEmail: '',
    customerName: ''
  })
  const [sendingPaymentLink, setSendingPaymentLink] = useState(false)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [organizationsLoading, setOrganizationsLoading] = useState(false)
  const [orgSearchTerm, setOrgSearchTerm] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  // Prix des plans LAIA
  const planPrices: Record<string, number> = {
    'SOLO': 49,
    'DUO': 99,
    'TEAM': 199,
    'PREMIUM': 399,
    'CUSTOM': 0 // Montant personnalisé
  }

  // Stripe payments state (pour afficher les paiements reçus)
  const [stripePayments, setStripePayments] = useState<any[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsStats, setPaymentsStats] = useState({
    total: 0,
    succeeded: 0,
    pending: 0,
    failed: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0
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
    primaryColor: '#d4b5a0',
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
    } else if (activeTab === 'settings') {
      fetchSettings()
    } else if (activeTab === 'payments') {
      fetchStripePayments()
    } else if (activeTab === 'send-link') {
      fetchOrganizations()
    }
  }, [activeTab, pagination.page, statusFilter])

  async function fetchInvoices() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/super-admin/billing/invoices?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
        setPagination(data.pagination)
        setStats(data.stats)
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

  // Récupérer les organisations
  async function fetchOrganizations() {
    setOrganizationsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setOrganizationsLoading(false)
    }
  }

  // Récupérer les paiements Stripe depuis l'API
  async function fetchStripePayments() {
    setPaymentsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/billing/stripe-payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStripePayments(data.payments)
        setPaymentsStats(data.stats)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching stripe payments:', error)
    } finally {
      setPaymentsLoading(false)
    }
  }

  // Envoyer un lien de paiement à un client
  async function sendPaymentLink() {
    // Vérifier que tous les champs obligatoires sont remplis
    if (!paymentLinkForm.organizationId || !paymentLinkForm.amount || !paymentLinkForm.customerEmail) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires (Organisation, Montant, Email)')
      return
    }

    setSendingPaymentLink(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/billing/create-payment-link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...paymentLinkForm,
          amount: parseFloat(paymentLinkForm.amount)
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`✅ Lien de paiement envoyé avec succès à ${paymentLinkForm.customerEmail}!\n\nLien: ${data.paymentLink}`)
        // Réinitialiser le formulaire
        setPaymentLinkForm({
          organizationId: '',
          amount: '',
          description: '',
          customerEmail: '',
          customerName: ''
        })
        // Rafraîchir les factures pour voir la nouvelle facture créée
        fetchInvoices()
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending payment link:', error)
      alert('❌ Erreur lors de l\'envoi du lien')
    } finally {
      setSendingPaymentLink(false)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#d4b5a0" }} className=" mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="text-white" style={{ background: "linear-gradient(to right, #d4b5a0, #c9a589)" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/super-admin" className="text-white/80 hover:text-white mb-2 inline-block">
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">💳 Facturation & Abonnements</h1>
              <p className="text-white/90">Gestion des factures, paiements et paramètres</p>
            </div>
            {activeTab === 'invoices' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExtendTrialModal(true)}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium"
                >
                  ⏰ Prolonger essai
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-white rounded-lg font-medium hover:bg-gray-50"
                  style={{ color: "#b8935f" }}
                >
                  ➕ Créer facture
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'invoices'
                  ? 'bg-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={activeTab === 'invoices' ? { color: '#b8935f' } : {}}
            >
              📄 Factures
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={activeTab === 'settings' ? { color: '#b8935f' } : {}}
            >
              ⚙️ Paramètres
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'payments'
                  ? 'bg-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={activeTab === 'payments' ? { color: '#b8935f' } : {}}
            >
              💳 Paiements Stripe
            </button>
            <button
              onClick={() => setActiveTab('send-link')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'send-link'
                  ? 'bg-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              style={activeTab === 'send-link' ? { color: '#b8935f' } : {}}
            >
              📧 Envoyer lien
            </button>
          </div>
        </div>
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
                              <button
                                onClick={() => markAsPaid(invoice.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Marquer comme payée"
                              >
                                ✓
                              </button>
                            )}
                            {invoice.pdfPath ? (
                              <a
                                href={invoice.pdfPath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-beige-800"
                                style={{ color: "#b8935f" }}
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
                            <button
                              onClick={() => deleteInvoice(invoice.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
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
                    style={{ backgroundColor: "#d4b5a0" }}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stripe Payments Tab Content */}
      {activeTab === 'payments' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Total paiements</div>
              <div className="text-3xl font-bold text-gray-800">{paymentsStats.total}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6">
              <div className="text-sm text-green-700 mb-1">Réussis</div>
              <div className="text-3xl font-bold text-green-800">{paymentsStats.succeeded}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6">
              <div className="text-sm text-purple-700 mb-1">Revenus total</div>
              <div className="text-2xl font-bold text-purple-800">{paymentsStats.totalRevenue.toFixed(2)}€</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
              <div className="text-sm text-blue-700 mb-1">Ce mois</div>
              <div className="text-2xl font-bold text-blue-800">{paymentsStats.thisMonthRevenue.toFixed(2)}€</div>
            </div>
          </div>

          {/* Payments List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {paymentsLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#d4b5a0" }}></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : stripePayments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">💳</div>
                <p className="text-gray-600">Aucun paiement trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organisation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stripePayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {payment.id.substring(0, 20)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.invoice?.organization ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.invoice.organization.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Plan: {payment.invoice.organization.plan}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {payment.amount.toFixed(2)} {payment.currency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                            payment.status === 'processing' || payment.status === 'requires_payment_method' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(payment.created).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {payment.customerEmail || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Payment Link Tab Content */}
      {activeTab === 'send-link' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📧 Envoyer un lien de paiement
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organisation *
                </label>
                {organizationsLoading ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    Chargement des organisations...
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={orgSearchTerm}
                      onChange={(e) => setOrgSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 mb-2"
                      placeholder="🔍 Rechercher par nom..."
                    />
                    <select
                      value={paymentLinkForm.organizationId}
                      onChange={(e) => {
                        const org = organizations.find(o => o.id === e.target.value)
                        setPaymentLinkForm({
                          ...paymentLinkForm,
                          organizationId: e.target.value,
                          customerEmail: org?.ownerEmail || paymentLinkForm.customerEmail,
                          customerName: org?.name || paymentLinkForm.customerName
                        })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="">-- Sélectionner une organisation --</option>
                      {organizations
                        .filter(org =>
                          org.name.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
                          org.slug?.toLowerCase().includes(orgSearchTerm.toLowerCase())
                        )
                        .map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name} ({org.slug}) - {org.plan}
                          </option>
                        ))}
                    </select>
                    {paymentLinkForm.organizationId && (
                      <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                        ID: {paymentLinkForm.organizationId}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan / Montant *
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => {
                    setSelectedPlan(e.target.value)
                    if (e.target.value !== 'CUSTOM') {
                      setPaymentLinkForm({
                        ...paymentLinkForm,
                        amount: planPrices[e.target.value].toString()
                      })
                    } else {
                      setPaymentLinkForm({
                        ...paymentLinkForm,
                        amount: ''
                      })
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">-- Sélectionner un plan --</option>
                  <option value="SOLO">Plan SOLO - 49,00€/mois</option>
                  <option value="DUO">Plan DUO - 99,00€/mois</option>
                  <option value="TEAM">Plan TEAM - 199,00€/mois</option>
                  <option value="PREMIUM">Plan PREMIUM - 399,00€/mois</option>
                  <option value="CUSTOM">💰 Montant personnalisé</option>
                </select>
              </div>

              {selectedPlan === 'CUSTOM' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant personnalisé (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    value={paymentLinkForm.amount}
                    onChange={(e) => setPaymentLinkForm({ ...paymentLinkForm, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              )}

              {selectedPlan && selectedPlan !== 'CUSTOM' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-800">
                    <strong>Montant sélectionné :</strong> {paymentLinkForm.amount}€
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email client *
                </label>
                <input
                  type="email"
                  value={paymentLinkForm.customerEmail}
                  onChange={(e) => setPaymentLinkForm({ ...paymentLinkForm, customerEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="client@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du client
                </label>
                <input
                  type="text"
                  value={paymentLinkForm.customerName}
                  onChange={(e) => setPaymentLinkForm({ ...paymentLinkForm, customerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Nom de l'institut..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={paymentLinkForm.description}
                  onChange={(e) => setPaymentLinkForm({ ...paymentLinkForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={3}
                  placeholder="Abonnement mensuel LAIA..."
                />
              </div>

              <button
                onClick={sendPaymentLink}
                disabled={sendingPaymentLink}
                className="w-full px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(to right, #d4b5a0, #c9a589)" }}
              >
                {sendingPaymentLink ? '⏳ Envoi en cours...' : '📧 Créer et envoyer le lien'}
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Le client recevra un email avec un lien de paiement sécurisé</li>
                <li>• Le lien est valable 24 heures</li>
                <li>• Une facture sera automatiquement créée</li>
                <li>• Le webhook Stripe mettra à jour le statut automatiquement</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {settingsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#d4b5a0" }} className=" mx-auto mb-4"></div>
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
                style={{ backgroundColor: "#d4b5a0" }}
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
    </div>
  )
}
