'use client';

import { useState } from 'react';
import { X, ExternalLink, Calendar, AlertCircle, Loader2 } from 'lucide-react';

interface PlanityConfigModalProps {
  onClose: () => void;
  onSave: (config: any) => Promise<void>;
  existingConfig?: any;
}

export default function PlanityConfigModal({ onClose, onSave, existingConfig }: PlanityConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/integrations/planity/connect', {
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

      // Rediriger vers Planity OAuth
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
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Planity</h2>
                <p className="text-pink-100">Plateforme de réservation #1 en France</p>
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
                <p className="font-semibold mb-2">Connexion sécurisée via OAuth 2.0</p>
                <ul className="space-y-1 text-blue-800">
                  <li>✓ Synchronisation automatique des réservations</li>
                  <li>✓ Mise à jour en temps réel de votre planning</li>
                  <li>✓ Gestion centralisée des disponibilités</li>
                  <li>✓ Pas besoin de clés API manuelles</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status actuel */}
          {existingConfig?.connected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Connecté à Planity</span>
              </div>
              {existingConfig?.businessName && (
                <p className="text-sm text-green-600 mt-1">
                  Institut : {existingConfig.businessName}
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
                <span className="font-semibold text-pink-600">1.</span>
                <span>Cliquez sur "Connecter avec Planity"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600">2.</span>
                <span>Connectez-vous à votre compte Planity professionnel</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600">3.</span>
                <span>Autorisez LAIA à accéder à vos réservations</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-600">4.</span>
                <span>Vous serez redirigé automatiquement vers votre tableau de bord</span>
              </li>
            </ol>
          </div>

          {/* Prérequis */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm">Prérequis</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Avoir un compte professionnel Planity actif</li>
              <li>• Être administrateur de votre institut sur Planity</li>
              <li>• Avoir au moins un service publié sur Planity</li>
            </ul>
          </div>

          {/* Documentation */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Documentation Planity</p>
              <p className="text-sm text-gray-500">Guide d'intégration complet</p>
            </div>
            <a
              href="https://developers.planity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm font-medium"
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
            className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connexion...
              </>
            ) : existingConfig?.connected ? (
              'Reconnecter'
            ) : (
              'Connecter avec Planity'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
