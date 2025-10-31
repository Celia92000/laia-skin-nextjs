'use client';

import { useState } from 'react';
import { X, ExternalLink, Users, AlertCircle, Loader2 } from 'lucide-react';

interface TreatwellConfigModalProps {
  onClose: () => void;
  onSave: (config: any) => Promise<void>;
  existingConfig?: any;
}

export default function TreatwellConfigModal({ onClose, onSave, existingConfig }: TreatwellConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/integrations/treatwell/connect', {
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

      // Rediriger vers Treatwell OAuth
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
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Treatwell</h2>
                <p className="text-purple-100">Réservations beauté en Europe</p>
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
                  <li>✓ Gestion centralisée du planning</li>
                  <li>✓ Accès aux clients Treatwell (UK, DE, ES, IT...)</li>
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
                <span className="font-semibold">Connecté à Treatwell</span>
              </div>
              {existingConfig?.venueName && (
                <p className="text-sm text-green-600 mt-1">
                  Salon : {existingConfig.venueName}
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
                <span className="font-semibold text-purple-600">1.</span>
                <span>Cliquez sur "Connecter avec Treatwell"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-purple-600">2.</span>
                <span>Connectez-vous à votre compte Treatwell Partner</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-purple-600">3.</span>
                <span>Autorisez LAIA à accéder à vos données de réservation</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-purple-600">4.</span>
                <span>Vous serez redirigé automatiquement vers votre tableau de bord</span>
              </li>
            </ol>
          </div>

          {/* Prérequis */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm">Prérequis</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Avoir un compte Treatwell Partner actif</li>
              <li>• Être administrateur de votre salon sur Treatwell</li>
              <li>• Avoir au moins un service publié sur Treatwell</li>
              <li>• Votre salon doit être vérifié sur la plateforme</li>
            </ul>
          </div>

          {/* Marchés disponibles */}
          <div className="bg-purple-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-purple-900 text-sm">Marchés disponibles</h3>
            <div className="flex flex-wrap gap-2">
              {['🇬🇧 UK', '🇩🇪 Allemagne', '🇪🇸 Espagne', '🇮🇹 Italie', '🇳🇱 Pays-Bas', '🇫🇷 France'].map(country => (
                <span key={country} className="bg-white px-3 py-1 rounded-full text-sm text-purple-700">
                  {country}
                </span>
              ))}
            </div>
          </div>

          {/* Documentation */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Documentation Treatwell</p>
              <p className="text-sm text-gray-500">Guide d'intégration API</p>
            </div>
            <a
              href="https://developers.treatwell.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
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
            className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connexion...
              </>
            ) : existingConfig?.connected ? (
              'Reconnecter'
            ) : (
              'Connecter avec Treatwell'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
