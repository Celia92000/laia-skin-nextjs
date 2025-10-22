'use client';

import { useState } from 'react';
import { X, Check, AlertCircle, Loader2, ExternalLink, CreditCard, Key, Shield, Eye, EyeOff } from 'lucide-react';

interface PayPalConfigModalProps {
  onClose: () => void;
  onSave: (config: any) => Promise<void>;
  existingConfig?: any;
}

export default function PayPalConfigModal({ onClose, onSave, existingConfig }: PayPalConfigModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showClientSecret, setShowClientSecret] = useState(false);

  const [config, setConfig] = useState({
    clientId: existingConfig?.clientId || '',
    clientSecret: existingConfig?.clientSecret || '',
    mode: existingConfig?.mode || 'sandbox', // 'sandbox' ou 'live'
    currency: existingConfig?.currency || 'EUR',
    webhookId: existingConfig?.webhookId || '',
  });

  const handleTestConnection = async () => {
    setTesting(true);
    setError('');
    setTestSuccess(false);

    try {
      const response = await fetch('/api/admin/integrations/paypal/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          mode: config.mode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTestSuccess(true);
        setTimeout(() => setStep(3), 1500);
      } else {
        setError(data.error || 'Erreur de connexion à PayPal');
      }
    } catch (err) {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      await onSave(config);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Configuration PayPal</h2>
                <p className="text-white/80 text-sm">Acceptez les paiements via PayPal et cartes bancaires</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-4 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-white text-blue-600' : 'bg-white/20 text-white/60'
                }`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <div className="flex-1 h-1 bg-white/20 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all ${step > s ? 'bg-white w-full' : 'w-0'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Mode & Documentation */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1. Choisissez votre mode</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Commencez en mode sandbox pour tester vos paiements sans frais réels.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setConfig({ ...config, mode: 'sandbox' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      config.mode === 'sandbox'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Mode Sandbox</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Testez sans frais réels avec des comptes PayPal de test.
                    </p>
                  </button>

                  <button
                    onClick={() => setConfig({ ...config, mode: 'live' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      config.mode === 'live'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">Mode Production</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Acceptez de vrais paiements de vos clients.
                    </p>
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Comment obtenir vos identifiants PayPal ?</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                      <li>Créez un compte sur <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">developer.paypal.com</a></li>
                      <li>Allez dans <strong>Apps & Credentials</strong></li>
                      <li>Créez une nouvelle app (ou sélectionnez une existante)</li>
                      <li>Copiez votre <strong>Client ID</strong> et <strong>Secret</strong></li>
                    </ol>
                    <a
                      href="https://developer.paypal.com/dashboard/applications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ouvrir le dashboard PayPal <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Step 2: API Keys */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2. Entrez vos identifiants API</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ces identifiants permettent à votre logiciel de communiquer avec PayPal.
                </p>
              </div>

              {/* Client ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Key className="inline w-4 h-4 mr-1" />
                  Client ID
                </label>
                <input
                  type="text"
                  value={config.clientId}
                  onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                  placeholder="AYpN..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'identifiant public de votre application PayPal
                </p>
              </div>

              {/* Client Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="inline w-4 h-4 mr-1" />
                  Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showClientSecret ? 'text' : 'password'}
                    value={config.clientSecret}
                    onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                    placeholder="EHQ..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientSecret(!showClientSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showClientSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Le secret ne doit jamais être exposé (sera chiffré)
                </p>
              </div>

              {/* Webhook ID (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook ID (optionnel)
                </label>
                <input
                  type="text"
                  value={config.webhookId}
                  onChange={(e) => setConfig({ ...config, webhookId: e.target.value })}
                  placeholder="WH-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pour recevoir les notifications PayPal (paiement confirmé, remboursement, etc.)
                </p>
              </div>

              {/* Options */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Options</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise
                  </label>
                  <select
                    value={config.currency}
                    onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {testSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-green-800">✅ Connexion réussie à PayPal !</p>
                </div>
              )}

              <div className="flex gap-3 justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Retour
                </button>
                <button
                  onClick={handleTestConnection}
                  disabled={!config.clientId || !config.clientSecret || testing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    'Tester la connexion'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Configuration réussie !</h3>
                <p className="text-gray-600">
                  Votre compte PayPal est maintenant connecté.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">📋 Récapitulatif</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode :</span>
                    <span className={`font-medium ${config.mode === 'sandbox' ? 'text-blue-600' : 'text-green-600'}`}>
                      {config.mode === 'sandbox' ? '🧪 Sandbox' : '✅ Production'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Devise :</span>
                    <span className="font-medium">{config.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Webhooks :</span>
                    <span className="font-medium">{config.webhookId ? 'Configurés' : 'Non configurés'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Prochaines étapes :</strong> Les paiements PayPal sont maintenant disponibles dans :
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
                  <li>Le module de réservation en ligne</li>
                  <li>La vente de produits/prestations</li>
                  <li>Les cartes cadeaux</li>
                  <li>Les paiements d'acomptes</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Activer PayPal
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
