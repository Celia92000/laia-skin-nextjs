'use client';

import { useState } from 'react';
import { Download, Check, AlertCircle } from 'lucide-react';

interface DataTypeConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export default function DataExport() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataTypes: DataTypeConfig[] = [
    { id: 'clients', label: 'Clients', icon: '👥', description: 'Base de données clients' },
    { id: 'services', label: 'Services', icon: '💅', description: 'Prestations proposées' },
    { id: 'products', label: 'Produits', icon: '🛍️', description: 'Produits vendus' },
    { id: 'appointments', label: 'Rendez-vous', icon: '📅', description: 'Historique des RDV' },
    { id: 'formations', label: 'Formations', icon: '📚', description: 'Formations proposées' },
    { id: 'giftcards', label: 'Cartes cadeaux', icon: '🎁', description: 'Cartes cadeaux vendues' },
    { id: 'packages', label: 'Forfaits', icon: '📦', description: 'Forfaits et packages' },
    { id: 'promocodes', label: 'Codes promo', icon: '🎟️', description: 'Codes de réduction' },
    { id: 'reviews', label: 'Avis clients', icon: '⭐', description: 'Avis et témoignages' },
    { id: 'newsletter', label: 'Newsletter', icon: '📧', description: 'Abonnés newsletter' }
  ];

  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter(t => t !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
    setError(null);
  };

  const selectAll = () => {
    setSelectedTypes(dataTypes.map(t => t.id));
    setError(null);
  };

  const deselectAll = () => {
    setSelectedTypes([]);
    setError(null);
  };

  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      setError('Veuillez sélectionner au moins un type de données à exporter');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch('/api/admin/data-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dataTypes: selectedTypes
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      // Télécharger le fichier ZIP
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-laia-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Réinitialiser la sélection
      setSelectedTypes([]);

      alert('✅ Export terminé ! Le fichier ZIP a été téléchargé.');
    } catch (error: any) {
      console.error('Erreur export:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-2xl shadow-lg">
          📤
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Exporter vos données</h2>
          <p className="text-sm text-gray-600">Portabilité RGPD - Format CSV</p>
        </div>
      </div>

      {/* Avertissement RGPD */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2 text-sm text-blue-900">
          <div className="mt-0.5">ℹ️</div>
          <div>
            <strong>Vos données vous appartiennent.</strong> Vous pouvez les exporter à tout
            moment pour les sauvegarder ou les transférer vers un autre logiciel. Cet export
            est conforme au RGPD (Article 20 - Droit à la portabilité).
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2 text-sm text-red-900">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Header sélection */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Sélectionnez les données à exporter</h3>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 hover:bg-blue-50 rounded"
          >
            Tout sélectionner
          </button>
          <button
            onClick={deselectAll}
            className="text-sm text-gray-600 hover:text-gray-700 font-medium px-3 py-1 hover:bg-gray-50 rounded"
          >
            Tout désélectionner
          </button>
        </div>
      </div>

      {/* Grille de sélection */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {dataTypes.map(type => (
          <button
            key={type.id}
            onClick={() => toggleType(type.id)}
            disabled={isExporting}
            className={`
              p-4 rounded-lg border-2 transition-all text-left relative
              ${isExporting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${selectedTypes.includes(type.id)
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">{type.icon}</div>
              {selectedTypes.includes(type.id) && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="font-semibold text-gray-900 mb-1">{type.label}</div>
            <div className="text-xs text-gray-600">{type.description}</div>
          </button>
        ))}
      </div>

      {/* Informations sur l'export */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
          📦 Contenu de l'export
        </h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Fichier ZIP contenant vos données au format CSV</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Compatible Excel, Google Sheets et tous les logiciels</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Fichier README.txt avec instructions incluses</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Données filtrées par votre organisation uniquement</span>
          </li>
        </ul>
      </div>

      {/* Bouton d'export */}
      <button
        onClick={handleExport}
        disabled={isExporting || selectedTypes.length === 0}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
          ${isExporting || selectedTypes.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            <span>Export en cours...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>
              {selectedTypes.length > 0
                ? `Exporter ${selectedTypes.length} type${selectedTypes.length > 1 ? 's' : ''} de données`
                : 'Sélectionnez des données à exporter'
              }
            </span>
          </>
        )}
      </button>

      {/* Footer légal */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center space-y-1">
          <div>Conformément au RGPD (Article 20 - Droit à la portabilité des données)</div>
          <div className="text-gray-400">Export sécurisé • Audit automatique • Support 24/7</div>
        </div>
      </div>
    </div>
  );
}
