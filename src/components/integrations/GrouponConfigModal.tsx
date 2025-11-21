'use client';

import { useState } from 'react';
import { X, ExternalLink, Gift, AlertCircle, Loader2 } from 'lucide-react';

interface GrouponConfigModalProps {
  onClose: () => void;
  onSave: (config: any) => Promise<void>;
  existingConfig?: any;
}

export default function GrouponConfigModal({ onClose, onSave, existingConfig }: GrouponConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/integrations/groupon/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la connexion');
      }

      const data = await response.json();

      // Rediriger vers Groupon OAuth
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Groupon</h2>
                <p className="text-green-100">Gestion des bons de réduction et promotions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Connexion sécurisée via Groupon Partner API</p>
                <ul className="space-y-1 text-blue-800">
                  <li>✓ Synchronisation automatique des offres</li>
                  <li>✓ Gestion des bons de réduction clients</li>
                  <li>✓ Suivi des ventes Groupon en temps réel</li>
                  <li>✓ Validation automatique des vouchers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status actuel */}
          {existingConfig?.connected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Connecté à Groupon</span>
              </div>
              {existingConfig?.merchantName && (
                <p className="text-sm text-green-600 mt-1">
                  Marchand : {existingConfig.merchantName}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Comment ça marche ?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-semibold text-green-600">1.</span>
                <span>Cliquez sur "Connecter avec Groupon"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-green-600">2.</span>
                <span>Connectez-vous à votre compte Groupon Merchant</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-green-600">3.</span>
                <span>Autorisez LAIA à accéder à vos offres et bons</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-green-600">4.</span>
                <span>Les bons Groupon sont automatiquement validés dans LAIA</span>
              </li>
            </ol>
          </div>

          {/* Prérequis */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm">Prérequis</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Avoir un compte Groupon Merchant actif</li>
              <li>• Au moins une offre publiée sur Groupon</li>
              <li>• Accès à Groupon Partner Dashboard</li>
            </ul>
          </div>

          {/* Avantages */}
          <div className="bg-green-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-green-900 text-sm">💚 Avantages</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Validation instantanée des vouchers Groupon</li>
              <li>• Statistiques des ventes Groupon dans LAIA</li>
              <li>• Pas de saisie manuelle des codes</li>
              <li>• Évite les fraudes et doublons</li>
            </ul>
          </div>

          {/* Documentation */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Documentation Groupon Partner API</p>
              <p className="text-sm text-gray-500">Guide d'intégration</p>
            </div>
            <a
              href="https://partner-api.groupon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Voir la doc
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connexion...
              </>
            ) : existingConfig?.connected ? (
              'Reconnecter'
            ) : (
              'Connecter avec Groupon'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
