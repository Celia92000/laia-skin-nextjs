'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Save, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminStripeConfigTab() {
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stripe-config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.publishableKey) {
          setPublishableKey(data.publishableKey);
        }
        setIsConfigured(data.isConfigured);
      }
    } catch (error) {
      console.error('Erreur chargement config Stripe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!publishableKey || !secretKey) {
      setMessage({ type: 'error', text: 'Veuillez remplir au moins la clé publique et la clé secrète' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stripe-config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publishableKey,
          secretKey,
          webhookSecret: webhookSecret || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuration Stripe sauvegardée avec succès !' });
        setIsConfigured(true);
        // Cacher les clés après la sauvegarde
        setSecretKey('');
        setWebhookSecret('');
        setShowSecretKey(false);
        setShowWebhookSecret(false);
        // Recharger la config
        await fetchConfig();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-[#6772e5]" />
          <h2 className="text-2xl font-bold text-[#2c3e50]">Configuration Stripe</h2>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {isConfigured && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Stripe est configuré et prêt à l'emploi</p>
            </div>
          </div>
        )}

        <div className="mb-6 p-4 bg-[#6772e5]/5 border border-[#6772e5]/20 rounded-lg">
          <h3 className="font-semibold text-[#2c3e50] mb-2">📖 Comment obtenir vos clés Stripe ?</h3>
          <ol className="text-sm text-gray-700 space-y-2">
            <li>1. Connectez-vous à votre <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-[#6772e5] hover:underline">Dashboard Stripe</a></li>
            <li>2. Allez dans <strong>Développeurs → Clés API</strong></li>
            <li>3. Copiez votre <strong>Clé publique</strong> (commence par <code className="bg-gray-100 px-1 rounded">pk_</code>)</li>
            <li>4. Copiez votre <strong>Clé secrète</strong> (commence par <code className="bg-gray-100 px-1 rounded">sk_</code>)</li>
            <li>5. (Optionnel) Dans <strong>Développeurs → Webhooks</strong>, créez un endpoint et copiez le <strong>Secret de signature</strong></li>
          </ol>
        </div>

        <div className="space-y-6">
          {/* Clé publique */}
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Clé publique (Publishable Key) *
            </label>
            <input
              type="text"
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              placeholder="pk_live_... ou pk_test_..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6772e5] focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Cette clé commence par <code className="bg-gray-100 px-1 rounded">pk_live_</code> ou <code className="bg-gray-100 px-1 rounded">pk_test_</code>
            </p>
          </div>

          {/* Clé secrète */}
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Clé secrète (Secret Key) *
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_live_... ou sk_test_..."
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6772e5] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showSecretKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Cette clé commence par <code className="bg-gray-100 px-1 rounded">sk_live_</code> ou <code className="bg-gray-100 px-1 rounded">sk_test_</code>
            </p>
            <p className="mt-1 text-xs text-orange-600 font-medium">
              ⚠️ Ne partagez jamais cette clé ! Elle donne un accès complet à votre compte Stripe.
            </p>
          </div>

          {/* Secret webhook */}
          <div>
            <label className="block text-sm font-medium text-[#2c3e50] mb-2">
              Secret Webhook (Optionnel)
            </label>
            <div className="relative">
              <input
                type={showWebhookSecret ? "text" : "password"}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="whsec_..."
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6772e5] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showWebhookSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Nécessaire pour recevoir les notifications de paiement. Commence par <code className="bg-gray-100 px-1 rounded">whsec_</code>
            </p>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving || !publishableKey || !secretKey}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6772e5] to-[#5469d4] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Sauvegarde en cours...' : 'Sauvegarder la configuration'}
            </button>
          </div>
        </div>

        {/* Avertissement sécurité */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Sécurité et confidentialité</p>
              <p>Vos clés Stripe sont stockées de manière sécurisée dans la base de données. Seuls les administrateurs peuvent les voir et les modifier. Ne les partagez avec personne.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
