'use client';

import { useState, useEffect } from 'react';

interface FunnelStats {
  totalEntries: number;
  converted: number;
  conversionRate: number;
  stageCounts: { [key: string]: number };
  stageRates: { [key: string]: number };
  totalValue: number;
  averageValue: number;
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

const STAGE_LABELS: { [key: string]: string } = {
  AWARENESS: 'Prise de conscience',
  INTEREST: 'Intérêt',
  CONSIDERATION: 'Considération',
  INTENT: 'Intention',
  EVALUATION: 'Évaluation',
  PURCHASE: 'Achat'
};

const STAGE_COLORS: { [key: string]: string } = {
  AWARENESS: '#60A5FA',
  INTEREST: '#34D399',
  CONSIDERATION: '#FBBF24',
  INTENT: '#F472B6',
  EVALUATION: '#A78BFA',
  PURCHASE: '#10B981'
};

export default function FunnelPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stages: [
      { name: 'Visite site', stage: 'AWARENESS' },
      { name: 'Demande info', stage: 'INTEREST' },
      { name: 'Devis demandé', stage: 'CONSIDERATION' },
      { name: 'RDV pris', stage: 'INTENT' },
      { name: 'Test service', stage: 'EVALUATION' },
      { name: 'Achat', stage: 'PURCHASE' }
    ]
  });

  useEffect(() => {
    loadFunnels();
  }, []);

  const loadFunnels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/funnel', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFunnels(data);
        if (data.length > 0 && !selectedFunnel) {
          setSelectedFunnel(data[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des funnels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/funnel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        loadFunnels();
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce funnel ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/funnel?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadFunnels();
        if (selectedFunnel?.id === id) {
          setSelectedFunnel(null);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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
                <div className="w-40 text-sm font-medium text-gray-700">
                  {STAGE_LABELS[stage]}
                </div>
                <div className="flex-1">
                  <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
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
                <div className="w-24 text-right text-sm text-gray-600">
                  {count > 0 && funnel.stats!.totalEntries > 0
                    ? `${((count / funnel.stats!.totalEntries) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
              </div>

              {/* Taux de drop-off */}
              {nextStage && dropoffRate > 0 && (
                <div className="ml-40 mt-1 text-xs text-red-600">
                  ↓ {dropoffRate.toFixed(1)}% de perte vers {STAGE_LABELS[nextStage]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funnel de Conversion</h1>
          <p className="text-gray-600 mt-2">Analysez le parcours de vos prospects jusqu'à l'achat</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + Nouveau funnel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des funnels */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold text-lg mb-4">Vos funnels</h2>
            <div className="space-y-2">
              {funnels.map((funnel) => (
                <div
                  key={funnel.id}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedFunnel?.id === funnel.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedFunnel(funnel)}
                >
                  <div className="font-medium text-gray-900">{funnel.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {funnel._count?.entries || 0} entrées
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(funnel.id);
                    }}
                    className="text-xs text-red-600 hover:text-red-800 mt-2"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Détails du funnel sélectionné */}
        <div className="lg:col-span-3">
          {selectedFunnel ? (
            <div className="space-y-6">
              {/* Statistiques globales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-sm text-gray-600">Total entrées</div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {selectedFunnel.stats?.totalEntries || 0}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-sm text-gray-600">Conversions</div>
                  <div className="text-3xl font-bold text-green-600 mt-2">
                    {selectedFunnel.stats?.converted || 0}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-sm text-gray-600">Taux conversion</div>
                  <div className="text-3xl font-bold text-purple-600 mt-2">
                    {selectedFunnel.stats?.conversionRate || 0}%
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-sm text-gray-600">Valeur moyenne</div>
                  <div className="text-3xl font-bold text-orange-600 mt-2">
                    {selectedFunnel.stats?.averageValue?.toFixed(0) || 0}€
                  </div>
                </div>
              </div>

              {/* Visualisation du funnel */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Parcours de conversion</h2>
                {renderFunnelVisualization(selectedFunnel)}
              </div>

              {/* Valeur totale */}
              {selectedFunnel.stats && selectedFunnel.stats.totalValue > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">Valeur totale générée</div>
                      <div className="text-4xl font-bold text-green-600 mt-2">
                        {selectedFunnel.stats.totalValue.toFixed(2)} €
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Panier moyen</div>
                      <div className="text-2xl font-semibold text-blue-600 mt-2">
                        {selectedFunnel.stats.averageValue.toFixed(2)} €
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">Sélectionnez un funnel pour voir les détails</p>
            </div>
          )}
        </div>
      </div>

      {funnels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun funnel créé pour le moment</p>
          <p className="text-gray-400 mt-2">Créez votre premier funnel pour commencer le tracking</p>
        </div>
      )}

      {/* Modal création funnel */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Nouveau funnel</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du funnel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Funnel inscription newsletter, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    rows={3}
                    placeholder="Description du funnel..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Étapes du funnel
                  </label>
                  <div className="space-y-3 text-sm">
                    {formData.stages.map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: STAGE_COLORS[s.stage] }}
                        />
                        <span className="font-medium">{STAGE_LABELS[s.stage]}</span>
                        <span className="text-gray-600">- {s.name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Les étapes sont prédéfinies selon le modèle AIDA classique
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Créer le funnel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
