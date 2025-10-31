'use client';

import { useState } from 'react';
import { X, ExternalLink, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';

interface ShopifyConfigModalProps {
  onClose: () => void;
  onSave: (config: any) => Promise<void>;
  existingConfig?: any;
}

export default function ShopifyConfigModal({ onClose, onSave, existingConfig }: ShopifyConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/integrations/shopify/connect', {
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
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Shopify</h2>
                <p className="text-green-100">E-commerce pour produits beauté</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Connexion OAuth Shopify</p>
                <ul className="space-y-1 text-blue-800">
                  <li>✓ Synchronisation automatique des produits</li>
                  <li>✓ Gestion du stock en temps réel</li>
                  <li>✓ Commandes e-commerce intégrées</li>
                  <li>✓ Clients unifiés LAIA + Shopify</li>
                </ul>
              </div>
            </div>
          </div>

          {existingConfig?.connected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Connecté à Shopify</span>
              </div>
              {existingConfig?.shopName && (
                <p className="text-sm text-green-600 mt-1">
                  Boutique : {existingConfig.shopName}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Comment ça marche ?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-semibold text-green-600">1.</span>
                <span>Cliquez sur "Connecter avec Shopify"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-green-600">2.</span>
                <span>Connectez-vous à votre boutique Shopify</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-green-600">3.</span>
                <span>Autorisez LAIA à accéder à vos produits et commandes</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-green-600">4.</span>
                <span>Vos produits Shopify sont disponibles dans LAIA</span>
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm">Prérequis</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Avoir une boutique Shopify active</li>
              <li>• Au moins un produit publié</li>
              <li>• Accès administrateur à la boutique</li>
            </ul>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Documentation Shopify</p>
              <p className="text-sm text-gray-500">API et guides développeur</p>
            </div>
            <a
              href="https://shopify.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Voir la doc
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="border-t p-6 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            Annuler
          </button>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connexion...
              </>
            ) : existingConfig?.connected ? (
              'Reconnecter'
            ) : (
              'Connecter avec Shopify'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
