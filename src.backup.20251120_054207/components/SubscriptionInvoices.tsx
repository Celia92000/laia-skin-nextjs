'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Calendar, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { OrgPlan } from '@prisma/client';
import { getPlanName, getPlanPrice, getPlanDescription, PLAN_FEATURES } from '@/lib/features-simple';
import CancelSubscriptionSection from './CancelSubscriptionSection';

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
  const [currentPlan, setCurrentPlan] = useState<OrgPlan | null>(null);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<OrgPlan | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [planChangeSuccess, setPlanChangeSuccess] = useState(false);
  const [orgInfo, setOrgInfo] = useState<any>(null);

  useEffect(() => {
    fetchInvoices();
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/organization/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan);
        setOrgInfo(data); // Stocker toutes les infos (status, currentPeriodEnd, etc.)
      }
    } catch (err) {
      console.error('Erreur chargement plan:', err);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedNewPlan) return;

    try {
      setChangingPlan(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/subscription/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPlan: selectedNewPlan })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du changement de plan');
      }

      setPlanChangeSuccess(true);
      setCurrentPlan(selectedNewPlan);

      setTimeout(() => {
        setShowChangePlanModal(false);
        setPlanChangeSuccess(false);
        setSelectedNewPlan(null);
      }, 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setChangingPlan(false);
    }
  };

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

  const plans: OrgPlan[] = ['SOLO', 'DUO', 'TEAM', 'PREMIUM'];

  return (
    <div className="space-y-6">
      {/* Carte plan actuel */}
      {currentPlan && (
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Votre formule actuelle</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Formule {getPlanName(currentPlan)}</h2>
              <p className="text-purple-100 text-sm mb-4">{getPlanDescription(currentPlan)}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">{getPlanPrice(currentPlan)}€</div>
              <div className="text-sm opacity-90">par mois</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {Object.entries(PLAN_FEATURES[currentPlan]).map(([key, enabled]) => {
              if (key === 'featureMultiLocation' || key === 'featureMultiUser') return null;
              const featureNames: Record<string, string> = {
                featureBlog: 'Blog',
                featureCRM: 'CRM',
                featureEmailing: 'Email Marketing',
                featureShop: 'Boutique',
                featureWhatsApp: 'WhatsApp',
                featureSMS: 'SMS',
                featureSocialMedia: 'Réseaux Sociaux',
                featureStock: 'Stock Avancé',
              };
              return (
                <div key={key} className={`flex items-center gap-2 text-sm ${enabled ? 'text-white' : 'text-purple-200 opacity-50'}`}>
                  {enabled ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{featureNames[key]}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowChangePlanModal(true)}
            className="w-full bg-white text-purple-600 px-4 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Changer de formule
          </button>
        </div>
      )}

      {/* Section de résiliation */}
      <CancelSubscriptionSection
        currentPeriodEnd={orgInfo?.currentPeriodEnd}
        status={orgInfo?.status}
      />

      {/* Info abonnement */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Historique des factures</h3>
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

      {/* Modal changement de plan */}
      {showChangePlanModal && currentPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Changer de formule</h2>
                <button
                  onClick={() => {
                    setShowChangePlanModal(false);
                    setSelectedNewPlan(null);
                    setPlanChangeSuccess(false);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-purple-100 text-sm mt-2">
                Sélectionnez votre nouvelle formule. Le changement prendra effet au prochain cycle de facturation.
              </p>
            </div>

            {/* Contenu */}
            <div className="p-6">
              {planChangeSuccess ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">Changement confirmé !</h3>
                  <p className="text-green-700">
                    Votre nouvelle formule {selectedNewPlan && getPlanName(selectedNewPlan)} sera active au prochain cycle de facturation.
                  </p>
                </div>
              ) : (
                <>
                  {/* Grille des plans */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {plans.map((plan) => {
                      const isCurrentPlan = plan === currentPlan;
                      const isSelected = plan === selectedNewPlan;
                      const features = PLAN_FEATURES[plan];

                      return (
                        <div
                          key={plan}
                          onClick={() => !isCurrentPlan && setSelectedNewPlan(plan)}
                          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                            isCurrentPlan
                              ? 'bg-gray-50 border-gray-300 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          {isCurrentPlan && (
                            <div className="absolute top-3 right-3 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                              Actuel
                            </div>
                          )}

                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Formule {getPlanName(plan)}</h3>
                            <p className="text-sm text-gray-600 mb-3">{getPlanDescription(plan)}</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold text-purple-600">{getPlanPrice(plan)}€</span>
                              <span className="text-sm text-gray-500">/mois</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {Object.entries(features).map(([key, enabled]) => {
                              if (key === 'featureMultiLocation' || key === 'featureMultiUser') return null;
                              const featureNames: Record<string, string> = {
                                featureBlog: 'Blog',
                                featureCRM: 'CRM',
                                featureEmailing: 'Email Marketing',
                                featureShop: 'Boutique',
                                featureWhatsApp: 'WhatsApp',
                                featureSMS: 'SMS',
                                featureSocialMedia: 'Réseaux Sociaux',
                                featureStock: 'Stock Avancé',
                              };
                              return (
                                <div key={key} className={`flex items-center gap-2 text-xs ${enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                                  {enabled ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3" />}
                                  <span>{featureNames[key]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Info facturation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Comment fonctionne le changement de formule ?</p>
                        <ul className="space-y-1 text-xs">
                          <li className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" />
                            <span><strong>Upgrade</strong> (formule supérieure) : Le nouveau tarif sera appliqué au prochain cycle de facturation</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" />
                            <span><strong>Downgrade</strong> (formule inférieure) : Le nouveau tarif sera appliqué au prochain cycle de facturation</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" />
                            <span>Les fonctionnalités s'activeront/désactiveront immédiatement selon votre nouvelle formule</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Bouton de confirmation */}
                  <button
                    onClick={handleChangePlan}
                    disabled={!selectedNewPlan || changingPlan}
                    className={`w-full py-4 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                      selectedNewPlan && !changingPlan
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {changingPlan ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Changement en cours...
                      </>
                    ) : selectedNewPlan ? (
                      <>
                        <Zap className="w-5 h-5" />
                        Confirmer le changement vers {getPlanName(selectedNewPlan)} ({getPlanPrice(selectedNewPlan)}€/mois)
                      </>
                    ) : (
                      'Sélectionnez une nouvelle formule'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
