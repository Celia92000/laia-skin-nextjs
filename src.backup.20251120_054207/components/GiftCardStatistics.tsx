'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Euro,
  Gift,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  CreditCard,
  X
} from 'lucide-react';

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  expiryDate?: string;
  purchasedFor?: string;
  recipientEmail?: string;
}

interface GiftCardStatisticsProps {
  giftCards: GiftCard[];
}

export default function GiftCardStatistics({ giftCards }: GiftCardStatisticsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fonction pour filtrer les cartes par période
  const filterByPeriod = (cards: GiftCard[]) => {
    const safeCards = Array.isArray(cards) ? cards : [];
    if (period === 'all') return safeCards;

    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return safeCards.filter(card => new Date(card.createdAt) >= startDate);
  };

  const filteredCards = filterByPeriod(giftCards);

  // Calcul des statistiques
  const stats = {
    total: filteredCards.length,
    totalRevenue: filteredCards
      .filter(c => c.paymentStatus === 'paid')
      .reduce((sum, c) => sum + c.amount, 0),
    totalUsed: filteredCards
      .reduce((sum, c) => sum + (c.amount - c.balance), 0),
    active: filteredCards.filter(c => c.status === 'active' && c.balance > 0).length,
    used: filteredCards.filter(c => c.balance === 0 || c.status === 'used').length,
    expired: filteredCards.filter(c => c.status === 'expired').length,
    pending: filteredCards.filter(c => c.paymentStatus === 'pending').length,
    averageAmount: filteredCards.length > 0
      ? filteredCards.reduce((sum, c) => sum + c.amount, 0) / filteredCards.length
      : 0,
    conversionRate: filteredCards.length > 0
      ? (filteredCards.filter(c => c.balance < c.amount).length / filteredCards.length) * 100
      : 0
  };

  // Données pour graphique par montant
  const amountRanges = [
    { label: '< 50€', min: 0, max: 49, count: 0, revenue: 0 },
    { label: '50-99€', min: 50, max: 99, count: 0, revenue: 0 },
    { label: '100-149€', min: 100, max: 149, count: 0, revenue: 0 },
    { label: '150€+', min: 150, max: Infinity, count: 0, revenue: 0 }
  ];

  filteredCards.forEach(card => {
    const range = amountRanges.find(r => card.amount >= r.min && card.amount <= r.max);
    if (range) {
      range.count++;
      if (card.paymentStatus === 'paid') {
        range.revenue += card.amount;
      }
    }
  });

  // Données pour graphique chronologique (derniers 6 mois)
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: { count: number; revenue: number } } = {};
    const now = new Date();

    // Initialiser les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { count: 0, revenue: 0 };
    }

    // Compter les cartes par mois
    const safeGiftCards = Array.isArray(giftCards) ? giftCards : [];
    safeGiftCards.forEach(card => {
      const date = new Date(card.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        monthlyData[key].count++;
        if (card.paymentStatus === 'paid') {
          monthlyData[key].revenue += card.amount;
        }
      }
    });

    return Object.entries(monthlyData).map(([key, data]) => ({
      month: key,
      label: new Date(key + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      count: data.count,
      revenue: data.revenue
    }));
  };

  const monthlyData = getMonthlyData();
  const maxMonthlyRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de période */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-pink-600" />
            Statistiques de ventes
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Analyse des performances de vos cartes cadeaux
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex gap-2">
          {(['week', 'month', 'year', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'week' ? '7 jours' : p === 'month' ? '30 jours' : p === 'year' ? '1 an' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total ventes */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-pink-700 font-medium text-sm">Chiffre d'affaires</span>
            <Euro className="w-5 h-5 text-pink-600" />
          </div>
          <div className="text-3xl font-bold text-pink-900">{stats.totalRevenue.toFixed(0)}€</div>
          <div className="text-xs text-pink-600 mt-1">{stats.total} cartes vendues</div>
        </div>

        {/* Montant moyen */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-700 font-medium text-sm">Montant moyen</span>
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-900">{stats.averageAmount.toFixed(0)}€</div>
          <div className="text-xs text-purple-600 mt-1">par carte cadeau</div>
        </div>

        {/* Taux d'utilisation */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-700 font-medium text-sm">Taux d'utilisation</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">{stats.conversionRate.toFixed(0)}%</div>
          <div className="text-xs text-green-600 mt-1">{stats.used} cartes utilisées</div>
        </div>

        {/* Montant utilisé */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 font-medium text-sm">Montant consommé</span>
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">{stats.totalUsed.toFixed(0)}€</div>
          <div className="text-xs text-blue-600 mt-1">déjà dépensés</div>
        </div>
      </div>

      {/* Graphique par statut */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-pink-600" />
          Répartition par statut
          <span className="text-xs text-gray-500 font-normal ml-auto">Cliquez pour voir le détail</span>
        </h4>
        <div className="space-y-3">
          {[
            { label: 'Actives', count: stats.active, color: 'bg-green-500', bgColor: 'bg-green-50', statusValue: 'active' },
            { label: 'Utilisées', count: stats.used, color: 'bg-gray-500', bgColor: 'bg-gray-50', statusValue: 'used' },
            { label: 'En attente paiement', count: stats.pending, color: 'bg-orange-500', bgColor: 'bg-orange-50', statusValue: 'pending' },
            { label: 'Expirées', count: stats.expired, color: 'bg-red-500', bgColor: 'bg-red-50', statusValue: 'expired' }
          ].map(({ label, count, color, bgColor, statusValue }) => {
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <button
                key={label}
                onClick={() => {
                  if (count > 0) {
                    setSelectedStatus(statusValue);
                    setShowModal(true);
                  }
                }}
                disabled={count === 0}
                className={`${bgColor} rounded-lg p-3 w-full text-left transition-all hover:shadow-md ${count > 0 ? 'cursor-pointer hover:scale-102' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Graphique par montant */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Répartition par montant
        </h4>
        <div className="space-y-3">
          {amountRanges.map((range) => {
            const maxCount = Math.max(...amountRanges.map(r => r.count), 1);
            const widthPercentage = (range.count / maxCount) * 100;
            return (
              <div key={range.label} className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{range.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{range.count} cartes</span>
                    <span className="text-xs text-gray-500 ml-2">({range.revenue.toFixed(0)}€)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphique chronologique */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Évolution sur 6 mois
        </h4>
        <div className="space-y-4">
          {/* Graphique à barres */}
          <div className="flex items-end justify-between gap-2 h-48">
            {monthlyData.map((data) => {
              const heightPercentage = (data.revenue / maxMonthlyRevenue) * 100;
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <div className="text-xs font-bold text-gray-700 mb-1">
                      {data.revenue > 0 ? `${data.revenue}€` : ''}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-400 cursor-pointer relative group"
                      style={{ height: `${heightPercentage}%`, minHeight: data.count > 0 ? '8px' : '0' }}
                      title={`${data.count} cartes - ${data.revenue}€`}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {data.count} cartes
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 font-medium">{data.label}</div>
                </div>
              );
            })}
          </div>

          {/* Légende */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Chiffre d'affaires mensuel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal détail par statut */}
      {showModal && selectedStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Cartes cadeaux : {
                  selectedStatus === 'active' ? '✅ Actives' :
                  selectedStatus === 'used' ? '✔️ Utilisées' :
                  selectedStatus === 'pending' ? '⏳ En attente' :
                  '❌ Expirées'
                }
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {filteredCards
                .filter(card => {
                  if (selectedStatus === 'active') return card.status === 'active' && card.balance > 0;
                  if (selectedStatus === 'used') return card.balance === 0 || card.status === 'used';
                  if (selectedStatus === 'pending') return card.paymentStatus === 'pending';
                  if (selectedStatus === 'expired') return card.status === 'expired';
                  return false;
                })
                .map(card => (
                  <div key={card.id} className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold text-lg text-gray-900">{card.code}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedStatus === 'active' ? 'bg-green-100 text-green-700' :
                            selectedStatus === 'used' ? 'bg-gray-100 text-gray-700' :
                            selectedStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {selectedStatus === 'active' ? 'Active' :
                             selectedStatus === 'used' ? 'Utilisée' :
                             selectedStatus === 'pending' ? 'En attente' :
                             'Expirée'}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-600">
                          {card.purchasedFor && (
                            <div>👤 <strong>Pour:</strong> {card.purchasedFor}</div>
                          )}
                          {card.recipientEmail && (
                            <div>📧 {card.recipientEmail}</div>
                          )}
                          <div>📅 <strong>Créée:</strong> {new Date(card.createdAt).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-gray-900">{card.amount}€</div>
                        <div className="text-sm text-gray-600">
                          Solde: <span className="font-semibold">{card.balance}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {filteredCards.filter(card => {
              if (selectedStatus === 'active') return card.status === 'active' && card.balance > 0;
              if (selectedStatus === 'used') return card.balance === 0 || card.status === 'used';
              if (selectedStatus === 'pending') return card.paymentStatus === 'pending';
              if (selectedStatus === 'expired') return card.status === 'expired';
              return false;
            }).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucune carte trouvée pour ce statut
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
