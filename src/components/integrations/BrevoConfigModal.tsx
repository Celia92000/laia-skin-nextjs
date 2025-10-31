'use client';

import { useState } from 'react';
import { X, Send, AlertCircle, Loader2, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface BrevoConfigModalProps {
  onClose: () => void;
  onSave?: (config: any) => Promise<void>;
  existingConfig?: any;
}

export default function BrevoConfigModal({ onClose, onSave, existingConfig }: BrevoConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [config, setConfig] = useState({
    apiKey: existingConfig?.apiKey || '',
    senderEmail: existingConfig?.senderEmail || '',
    senderName: existingConfig?.senderName || '',
  });

  const handleSave = async () => {
    if (!config.apiKey || !config.senderEmail || !config.senderName) {
      setError('Tous les champs sont requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/integrations/brevo/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSave) onSave(config);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Brevo (Sendinblue)</h2>
                <p className="text-teal-100">Email marketing & automation RGPD</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Fonctionnalités Brevo</p>
                <ul className="space-y-1 text-blue-800">
                  <li>✓ Campagnes email automatiques (nouveaux clients, anniversaires...)</li>
                  <li>✓ SMS transactionnels (rappels RDV)</li>
                  <li>✓ Segmentation clients avancée</li>
                  <li>✓ Conformité RGPD garantie</li>
                </ul>
              </div>
            </div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-semibold">✅ Configuration Brevo enregistrée avec succès !</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé API Brevo *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="xkeysib-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Obtenez votre clé API sur <a href="https://app.brevo.com/settings/keys/api" target="_blank" className="text-teal-600 hover:underline">Brevo → Paramètres → Clés API</a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email expéditeur *
              </label>
              <input
                type="email"
                value={config.senderEmail}
                onChange={(e) => setConfig({ ...config, senderEmail: e.target.value })}
                placeholder="contact@votre-institut.fr"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Doit être un email vérifié dans Brevo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'expéditeur *
              </label>
              <input
                type="text"
                value={config.senderName}
                onChange={(e) => setConfig({ ...config, senderName: e.target.value })}
                placeholder="Mon Institut de Beauté"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Documentation Brevo</p>
              <p className="text-sm text-gray-500">API et guides d'intégration</p>
            </div>
            <a
              href="https://developers.brevo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              Voir la doc
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="border-t p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer la configuration'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
