"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Euro,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Plus,
  RefreshCw,
  TrendingDown,
  FileText,
  Calendar as CalendarIcon,
  DollarSign
} from "lucide-react";

interface Refund {
  id: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED';
  stripeRefundId: string | null;
  createdAt: string;
  processedAt: string | null;
  notes: string | null;
  invoice: {
    invoiceNumber: string;
    amount: number;
  } | null;
  reservation: {
    id: string;
    date: Date;
    totalPrice: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
}

interface RefundStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  failed: number;
  totalAmount: number;
  completedAmount: number;
}

type StatusFilter = 'all' | 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED';

export default function AdminRemboursements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: 'reservation' as 'invoice' | 'reservation',
    invoiceId: '',
    reservationId: '',
    amount: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/refunds');

      if (response.ok) {
        const data = await response.json();
        setRefunds(data.refunds);
        setStats(data.stats);
      } else {
        console.error('Erreur lors de la récupération des remboursements');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const payload: any = {
        amount: parseFloat(formData.amount),
        reason: formData.reason,
        notes: formData.notes || undefined
      };

      if (formData.type === 'invoice') {
        payload.invoiceId = formData.invoiceId;
      } else {
        payload.reservationId = formData.reservationId;
      }

      const response = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('✅ Remboursement créé avec succès !');
        setShowCreateModal(false);
        setFormData({
          type: 'reservation',
          invoiceId: '',
          reservationId: '',
          amount: '',
          reason: '',
          notes: ''
        });
        fetchRefunds(); // Recharger la liste
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur création remboursement:', error);
      alert('❌ Erreur lors de la création du remboursement');
    } finally {
      setCreating(false);
    }
  };

  // Filtrer les remboursements
  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch =
      refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.invoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.reservation?.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En attente' },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Approuvé' },
      PROCESSING: { color: 'bg-purple-100 text-purple-800', icon: RefreshCw, label: 'En cours' },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Terminé' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Refusé' },
      FAILED: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Échoué' }
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#8B7355] mx-auto mb-4" />
          <p className="text-gray-600">Chargement des remboursements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💸 Remboursements</h1>
          <p className="text-gray-600">Gérez les remboursements pour les factures et réservations</p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-[#8B7355]" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terminés</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Montant total</p>
                  <p className="text-2xl font-bold text-[#8B7355]">{stats.totalAmount.toFixed(2)}€</p>
                </div>
                <DollarSign className="w-8 h-8 text-[#8B7355]" />
              </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par ID, raison, facture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre statut */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="APPROVED">Approuvés</option>
                <option value="PROCESSING">En cours</option>
                <option value="COMPLETED">Terminés</option>
                <option value="REJECTED">Refusés</option>
                <option value="FAILED">Échoués</option>
              </select>
            </div>

            {/* Bouton créer */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#8B7355] hover:bg-[#6B5D54] text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouveau remboursement
            </button>
          </div>
        </div>

        {/* Liste des remboursements */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type / Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client / Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRefunds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Aucun remboursement trouvé
                    </td>
                  </tr>
                ) : (
                  filteredRefunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {refund.invoice ? (
                            <FileText className="w-4 h-4 text-blue-600" />
                          ) : (
                            <CalendarIcon className="w-4 h-4 text-purple-600" />
                          )}
                          <span className="text-sm text-gray-600">
                            {refund.invoice ? 'Facture' : 'Réservation'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {refund.id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {refund.invoice && (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {refund.invoice.invoiceNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              Total: {refund.invoice.amount.toFixed(2)}€
                            </div>
                          </div>
                        )}
                        {refund.reservation && (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {refund.reservation.user.firstName} {refund.reservation.user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {refund.reservation.user.email}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {refund.amount.toFixed(2)}€
                        </div>
                        {refund.stripeRefundId && (
                          <div className="text-xs text-gray-400">
                            Stripe: {refund.stripeRefundId.substring(0, 12)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {refund.reason}
                        </div>
                        {refund.notes && (
                          <div className="text-xs text-gray-500 max-w-xs truncate mt-1">
                            Note: {refund.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(refund.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(refund.createdAt).toLocaleDateString('fr-FR')}
                        <div className="text-xs text-gray-400">
                          {new Date(refund.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal création remboursement */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Créer un remboursement</h2>

            <form onSubmit={handleCreateRefund} className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de remboursement
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="invoice"
                      checked={formData.type === 'invoice'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'invoice' | 'reservation' })}
                      className="mr-2"
                    />
                    Facture (LAIA Connect)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="reservation"
                      checked={formData.type === 'reservation'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'invoice' | 'reservation' })}
                      className="mr-2"
                    />
                    Réservation (Institut)
                  </label>
                </div>
              </div>

              {/* ID de facture ou réservation */}
              {formData.type === 'invoice' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de la facture
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceId}
                    onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="inv_xxxxx"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de la réservation
                  </label>
                  <input
                    type="text"
                    value={formData.reservationId}
                    onChange={(e) => setFormData({ ...formData, reservationId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="res_xxxxx"
                    required
                  />
                </div>
              )}

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Raison */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du remboursement
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                >
                  <option value="">Sélectionnez une raison</option>
                  <option value="Demande client">Demande client</option>
                  <option value="Annulation de service">Annulation de service</option>
                  <option value="Service non conforme">Service non conforme</option>
                  <option value="Erreur de facturation">Erreur de facturation</option>
                  <option value="Geste commercial">Geste commercial</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Informations complémentaires..."
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-[#8B7355] hover:bg-[#6B5D54] text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Créer le remboursement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
