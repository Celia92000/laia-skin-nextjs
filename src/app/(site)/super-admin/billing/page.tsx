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
  organization: {
    id: string
    name: string
    slug: string
    plan: string
  }
  payments: any[]
}

export default function BillingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, failed: 0, totalRevenue: 0 })
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showExtendTrialModal, setShowExtendTrialModal] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<any>(null)

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

  useEffect(() => {
    fetchInvoices()
  }, [pagination.page, statusFilter])

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
      REFUNDED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/super-admin" className="text-purple-200 hover:text-white mb-2 inline-block">
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">💳 Facturation & Abonnements</h1>
              <p className="text-purple-100">Gestion des factures et paiements</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExtendTrialModal(true)}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium"
              >
                ⏰ Prolonger essai
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50"
              >
                ➕ Créer facture
              </button>
            </div>
          </div>
        </div>
      </div>

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
            <div className="text-2xl font-bold text-purple-800">{formatCurrency(stats.totalRevenue)}</div>
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
                          #{invoice.id.substring(0, 8)}
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
                          <Link
                            href={`/super-admin/organizations/${invoice.organizationId}`}
                            className="text-purple-600 hover:text-purple-800"
                            title="Voir organisation"
                          >
                            👁️
                          </Link>
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Suivant →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Créer une facture</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Organisation</label>
                <input
                  type="text"
                  value={newInvoice.organizationId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, organizationId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="cmxxx..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="99.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'échéance</label>
                <input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
                <input
                  type="text"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Abonnement mensuel..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createInvoice}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="cmxxx..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de jours</label>
                <select
                  value={extendTrial.days}
                  onChange={(e) => setExtendTrial({ ...extendTrial, days: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
