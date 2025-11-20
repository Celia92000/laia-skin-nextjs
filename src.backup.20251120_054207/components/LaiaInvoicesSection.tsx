'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Eye, Calendar, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'

interface LaiaInvoice {
  id: string
  invoiceNumber: string
  amount: number
  plan: string
  status: string
  issueDate: string
  dueDate: string
  paidAt?: string
  description?: string
  metadata?: any
}

export default function LaiaInvoicesSection() {
  const [invoices, setInvoices] = useState<LaiaInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<LaiaInvoice | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    setLoading(true)
    try {
      // L'API utilise les cookies, pas besoin d'envoyer le token dans le header
      const response = await fetch('/api/admin/laia-invoices', {
        credentials: 'include' // Important pour envoyer les cookies
      })

      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
        console.log('[LaiaInvoices] Factures chargées:', data.invoices.length)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        console.error('[LaiaInvoices] Erreur API:', response.status, errorData)
      }
    } catch (error) {
      console.error('[LaiaInvoices] Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(invoiceId: string, invoiceNumber: string) {
    try {
      const response = await fetch(`/api/admin/laia-invoices/${invoiceId}/download`, {
        credentials: 'include' // Important pour envoyer les cookies
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Facture_${invoiceNumber}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        console.error('[LaiaInvoices] Erreur téléchargement:', response.status, errorData)
        alert('Erreur lors du téléchargement de la facture')
      }
    } catch (error) {
      console.error('[LaiaInvoices] Erreur téléchargement:', error)
      alert('Erreur lors du téléchargement de la facture')
    }
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PAID: { label: 'Payée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    OVERDUE: { label: 'En retard', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    CANCELLED: { label: 'Annulée', color: 'bg-gray-100 text-gray-800', icon: XCircle },
    REFUNDED: { label: 'Remboursée', color: 'bg-purple-100 text-purple-800', icon: XCircle }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Chargement des factures LAIA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Factures d'abonnement LAIA
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Historique de vos factures mensuelles
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {invoices.length} facture{invoices.length > 1 ? 's' : ''}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Aucune facture d'abonnement</p>
          <p className="text-gray-400 text-sm">
            Vos factures mensuelles apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">N° Facture</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Plan</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Montant</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Échéance</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const status = statusConfig[invoice.status] || statusConfig.PENDING
                const StatusIcon = status.icon

                return (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-gray-900 font-medium">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{invoice.description || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        {invoice.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-gray-900">{invoice.amount.toFixed(2)}€</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                      </span>
                      {invoice.paidAt && (
                        <div className="text-xs text-green-600 mt-1">
                          Payée le {new Date(invoice.paidAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition"
                        >
                          <Eye className="w-3 h-3" />
                          Voir
                        </button>
                        <button
                          onClick={() => handleDownload(invoice.id, invoice.invoiceNumber)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de détail de facture */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedInvoice(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Détail de la facture</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownload(selectedInvoice.id, selectedInvoice.invoiceNumber)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </button>
                  <button onClick={() => setSelectedInvoice(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Numéro de facture</p>
                    <p className="text-sm font-mono font-bold">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Montant</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedInvoice.amount.toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date d'émission</p>
                    <p className="text-sm">{new Date(selectedInvoice.issueDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date d'échéance</p>
                    <p className="text-sm">{new Date(selectedInvoice.dueDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {selectedInvoice.metadata?.lineItems && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Détail</h4>
                    <div className="space-y-2">
                      {selectedInvoice.metadata.lineItems.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.description}</span>
                          <span className="font-medium">{item.total?.toFixed(2) || item.unitPrice?.toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-purple-600">{selectedInvoice.amount.toFixed(2)}€</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
