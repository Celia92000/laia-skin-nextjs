'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FunnelStats {
  totalEntries: number;
  converted: number;
  conversionRate: number;
  stageCounts: { [key: string]: number };
  stageRates: { [key: string]: number };
  totalValue: number;
  averageValue: number;
  averageTimeToConvert: number;
}

interface Funnel {
  id: string;
  name: string;
  description: string;
  stages: any;
  isActive: boolean;
  createdAt: string;
  _count?: { entries: number };
  stats?: FunnelStats;
}

// Parcours SaaS LAIA Connect
const STAGE_LABELS: { [key: string]: string } = {
  AWARENESS: 'Découverte',
  INTEREST: 'Intérêt',
  CONSIDERATION: 'Considération',
  INTENT: 'Intention',
  EVALUATION: 'Évaluation',
  PURCHASE: 'Souscription'
};

const STAGE_DESCRIPTIONS: { [key: string]: string } = {
  AWARENESS: 'Visite du site laia-connect.fr',
  INTEREST: 'Inscription newsletter / Téléchargement documentation',
  CONSIDERATION: 'Demande de démo',
  INTENT: 'Inscription essai gratuit 30 jours',
  EVALUATION: 'Utilisation de la plateforme pendant l\'essai',
  PURCHASE: 'Souscription plan payant (SOLO/DUO/TEAM/PREMIUM)'
};

const STAGE_COLORS: { [key: string]: string } = {
  AWARENESS: '#60A5FA',      // Bleu clair
  INTEREST: '#34D399',        // Vert
  CONSIDERATION: '#FBBF24',   // Jaune
  INTENT: '#F472B6',          // Rose
  EVALUATION: '#A78BFA',      // Violet
  PURCHASE: '#10B981'         // Vert foncé
};

export default function ConversionFunnelPage() {
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadFunnel();
  }, [period]);

  const loadFunnel = async () => {
    try {
      const response = await fetch(`/api/super-admin/funnel/laia-connect?period=${period}`);

      if (response.ok) {
        const data = await response.json();
        setFunnel(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du funnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFunnelVisualization = (funnel: Funnel) => {
    if (!funnel.stats) return null;

    const stages = ['AWARENESS', 'INTEREST', 'CONSIDERATION', 'INTENT', 'EVALUATION', 'PURCHASE'];
    const maxCount = Math.max(...stages.map(s => funnel.stats!.stageCounts[s] || 0));

    return (
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const count = funnel.stats!.stageCounts[stage] || 0;
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const nextStage = stages[index + 1];
          const dropoffRate = nextStage && funnel.stats!.stageRates[`${stage}_to_${nextStage}`]
            ? 100 - funnel.stats!.stageRates[`${stage}_to_${nextStage}`]
            : 0;

          return (
            <div key={stage}>
              <div className="flex items-center gap-4">
                <div className="w-48">
                  <div className="text-sm font-semibold text-gray-800">
                    {STAGE_LABELS[stage]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {STAGE_DESCRIPTIONS[stage]}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative h-14 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-500 flex items-center justify-end px-4 text-white font-semibold"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: STAGE_COLORS[stage]
                      }}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                </div>
                <div className="w-32 text-right">
                  <div className="text-sm font-semibold text-gray-700">
                    {count > 0 && funnel.stats!.totalEntries > 0
                      ? `${((count / funnel.stats!.totalEntries) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {count} {stage === 'PURCHASE' ? 'clients' : 'prospects'}
                  </div>
                </div>
              </div>

              {/* Taux de drop-off */}
              {nextStage && dropoffRate > 0 && (
                <div className="ml-48 mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-red-100 rounded">
                    <div
                      className="h-full bg-red-400 rounded"
                      style={{ width: `${dropoffRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-red-600 font-medium">
                    ↓ {dropoffRate.toFixed(1)}% d'abandon
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const formatDuration = (days: number) => {
    if (days < 1) return `${Math.round(days * 24)}h`;
    if (days < 7) return `${Math.round(days)}j`;
    if (days < 30) return `${Math.round(days / 7)} sem`;
    return `${Math.round(days / 30)} mois`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7c3aed' }}></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href="/super-admin" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              🎯 Funnel de Conversion LAIA Connect
            </h1>
            <p className="text-gray-600 mt-2">Parcours client du visiteur au client payant</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période d'analyse
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
              <option value="all">Depuis le début</option>
            </select>
          </div>
        </div>
      </div>

      {funnel && funnel.stats ? (
        <div className="space-y-6">
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Total visiteurs</div>
              <div className="text-3xl font-bold text-blue-600">
                {funnel.stats.totalEntries || 0}
              </div>
              <div className="text-xs text-gray-500 mt-2">Première étape du parcours</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200">
              <div className="text-sm text-gray-600 mb-1">Clients convertis</div>
              <div className="text-3xl font-bold text-green-600">
                {funnel.stats.converted || 0}
              </div>
              <div className="text-xs text-gray-500 mt-2">Ont souscrit à un plan payant</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
              <div className="text-sm text-gray-600 mb-1">Taux de conversion</div>
              <div className="text-3xl font-bold text-purple-600">
                {funnel.stats.conversionRate || 0}%
              </div>
              <div className="text-xs text-gray-500 mt-2">Visiteur → Client payant</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-amber-200">
              <div className="text-sm text-gray-600 mb-1">Temps moyen de conversion</div>
              <div className="text-3xl font-bold text-amber-600">
                {formatDuration(funnel.stats.averageTimeToConvert || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-2">De la découverte à l'abonnement</div>
            </div>
          </div>

          {/* Visualisation du funnel */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Parcours de conversion détaillé
            </h2>
            {renderFunnelVisualization(funnel)}
          </div>

          {/* Métriques par étape */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-800">Phase Découverte</h3>
                <span className="text-3xl">🌐</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Visiteurs site</span>
                  <span className="font-semibold text-blue-900">
                    {funnel.stats.stageCounts.AWARENESS || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Taux d'intérêt</span>
                  <span className="font-semibold text-blue-900">
                    {funnel.stats.stageRates.AWARENESS_to_INTEREST?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-800">Phase Essai</h3>
                <span className="text-3xl">🎁</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">Inscriptions essai</span>
                  <span className="font-semibold text-amber-900">
                    {funnel.stats.stageCounts.INTENT || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">Taux d'activation</span>
                  <span className="font-semibold text-amber-900">
                    {funnel.stats.stageRates.INTENT_to_EVALUATION?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-800">Phase Conversion</h3>
                <span className="text-3xl">💳</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Essai → Payant</span>
                  <span className="font-semibold text-green-900">
                    {funnel.stats.stageRates.EVALUATION_to_PURCHASE?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Revenus générés</span>
                  <span className="font-semibold text-green-900">
                    {funnel.stats.totalValue?.toLocaleString('fr-FR') || 0}€/mois
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Insights & recommandations */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-md p-6 border-2 border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
              <span>💡</span>
              <span>Insights & Recommandations</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recommandation basée sur le taux de conversion le plus faible */}
              {(() => {
                const transitions = [
                  { from: 'AWARENESS', to: 'INTEREST', rate: funnel.stats.stageRates.AWARENESS_to_INTEREST, action: 'Améliorer le contenu de la homepage et ajouter des calls-to-action plus visibles' },
                  { from: 'INTEREST', to: 'CONSIDERATION', rate: funnel.stats.stageRates.INTEREST_to_CONSIDERATION, action: 'Proposer des webinaires ou des études de cas convaincantes' },
                  { from: 'CONSIDERATION', to: 'INTENT', rate: funnel.stats.stageRates.CONSIDERATION_to_INTENT, action: 'Simplifier le processus d\'inscription à l\'essai gratuit' },
                  { from: 'INTENT', to: 'EVALUATION', rate: funnel.stats.stageRates.INTENT_to_EVALUATION, action: 'Améliorer l\'onboarding et l\'accompagnement initial' },
                  { from: 'EVALUATION', to: 'PURCHASE', rate: funnel.stats.stageRates.EVALUATION_to_PURCHASE, action: 'Optimiser le parcours d\'achat et proposer des offres personnalisées' }
                ];

                const lowestTransition = transitions.reduce((min, t) =>
                  (t.rate || 0) < (min.rate || 0) ? t : min
                );

                const highestTransition = transitions.reduce((max, t) =>
                  (t.rate || 0) > (max.rate || 0) ? t : max
                );

                return (
                  <>
                    <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                      <div className="text-sm font-semibold text-red-700 mb-2">
                        ⚠️ Point faible détecté
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">{STAGE_LABELS[lowestTransition.from]}</span>
                        {' → '}
                        <span className="font-medium">{STAGE_LABELS[lowestTransition.to]}</span>
                        {' : '}
                        <span className="text-red-600 font-semibold">{lowestTransition.rate?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {lowestTransition.action}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                      <div className="text-sm font-semibold text-green-700 mb-2">
                        ✅ Point fort
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">{STAGE_LABELS[highestTransition.from]}</span>
                        {' → '}
                        <span className="font-medium">{STAGE_LABELS[highestTransition.to]}</span>
                        {' : '}
                        <span className="text-green-600 font-semibold">{highestTransition.rate?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Continuez sur cette lancée et dupliquez ces bonnes pratiques ailleurs
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Aucune donnée disponible</h3>
          <p className="text-gray-600">
            Les données du funnel de conversion apparaîtront ici une fois que des prospects commenceront à parcourir le site LAIA Connect.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
            <div className="text-sm font-semibold text-blue-800 mb-2">
              📌 Comment fonctionne le tracking ?
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Les visiteurs sont automatiquement trackés lors de leur visite sur laia-connect.fr</li>
              <li>• Chaque action importante (inscription newsletter, démo, essai) est enregistrée</li>
              <li>• La conversion finale se produit lors de la souscription à un plan payant</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
