'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Calendar } from 'lucide-react';

interface InvoiceMetadata {
  plan: string;
  planPrice: number;
  addons: string[];
  addonsTotal: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  billingPeriod: {
    start: string;
    end: string;
  };
  changeType?: 'upgrade' | 'downgrade' | 'addon_added' | 'addon_removed';
  previousPlan?: string;
  previousAddons?: string[];
  prorata?: {
    creditAmount?: number;
    chargeAmount?: number;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  plan: string;
  description: string;
  metadata: InvoiceMetadata;
  createdAt: string;
  pdfPath?: string;
}

interface Stats {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export default function SubscriptionInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/invoices');

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des factures');
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
      setStats(data.stats || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'En attente'
      },
      PAID: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Payée'
      },
      OVERDUE: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        label: 'En retard'
      },
      CANCELLED: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: XCircle,
        label: 'Annulée'
      }
    };

    const statusConfig = config[status as keyof typeof config] || config.PENDING;
    const Icon = statusConfig.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d4b5a0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info abonnement */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Votre abonnement LAIA Connect</h3>
            <p className="text-sm text-gray-600 mb-4">
              Retrouvez ci-dessous l'historique de vos factures d'abonnement LAIA Connect.
              Les factures sont envoyées automatiquement par email et seront prélevées à la date d'échéance.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-purple-700">
                <Calendar className="w-4 h-4" />
                <span>Facturation mensuelle</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <CreditCard className="w-4 h-4" />
                <span>Prélèvement automatique</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historique des factures</h3>
          <p className="text-sm text-gray-600 mt-1">
            {invoices.length} facture{invoices.length > 1 ? 's' : ''}
          </p>
        </div>

        {invoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Aucune facture pour le moment</p>
            <p className="text-sm text-gray-500 mt-2">
              Vos factures d'abonnement apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedInvoice(invoice)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-gray-600">{invoice.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Émise le {formatDate(invoice.issueDate)} • Échéance : {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{formatPrice(invoice.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">Forfait {invoice.plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal détails facture */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedInvoice.invoiceNumber}</h2>
                <div className="flex items-center gap-2">
                  {selectedInvoice.pdfPath ? (
                    <a
                      href={selectedInvoice.pdfPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">Télécharger PDF</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 opacity-50 cursor-not-allowed"
                      title="PDF en cours de génération"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">PDF indisponible</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div>
                <p className="text-purple-100 text-sm">Montant total</p>
                <p className="text-3xl font-bold">{formatPrice(selectedInvoice.amount)}</p>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date d'émission</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedInvoice.issueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date d'échéance</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedInvoice.dueDate)}</p>
                </div>
              </div>

              {/* Période de facturation */}
              {selectedInvoice.metadata?.billingPeriod && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium mb-2">Période de facturation</p>
                  <p className="text-sm text-gray-700">
                    Du {formatDate(selectedInvoice.metadata.billingPeriod.start)} au {formatDate(selectedInvoice.metadata.billingPeriod.end)}
                  </p>
                </div>
              )}

              {/* Prorata si applicable */}
              {selectedInvoice.metadata?.prorata && (
                <div className="space-y-2">
                  {selectedInvoice.metadata.prorata.creditAmount && selectedInvoice.metadata.prorata.creditAmount > 0 && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Crédit au prorata</p>
                          <p className="text-sm">
                            {formatPrice(selectedInvoice.metadata.prorata.creditAmount)} déduit de votre ancien forfait
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedInvoice.metadata.prorata.chargeAmount && selectedInvoice.metadata.prorata.chargeAmount > 0 && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <AlertCircle className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Facturation au prorata</p>
                          <p className="text-sm">
                            {formatPrice(selectedInvoice.metadata.prorata.chargeAmount)} pour la période restante
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lignes de facturation */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Détails de la facture</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Qté</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Prix unitaire</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoice.metadata?.lineItems?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatPrice(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-purple-600 text-right">{formatPrice(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Total à payer</td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-purple-600">{formatPrice(selectedInvoice.amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Info paiement */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Modalités de paiement</p>
                    <p>
                      Paiement par prélèvement SEPA automatique à la date d'échéance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
