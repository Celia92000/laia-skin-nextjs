'use client';

import { useState, useEffect } from 'react';
import { Users, Settings, Save, AlertCircle, CheckCircle, Euro, Percent, ToggleLeft, ToggleRight, DollarSign, Link, Mail } from 'lucide-react';

interface ReferralSettings {
  referralEnabled: boolean;
  referralRewardType: 'FIXED' | 'PERCENTAGE';
  referralRewardAmount: number;
  referralMinimumPurchase: number;
  referralReferrerReward: number;
  referralReferredReward: number;
  referralTermsUrl?: string | null;
  referralEmailTemplate?: string | null;
}

export default function AdminReferralSettingsTab() {
  const [settings, setSettings] = useState<ReferralSettings>({
    referralEnabled: true,
    referralRewardType: 'FIXED',
    referralRewardAmount: 20,
    referralMinimumPurchase: 0,
    referralReferrerReward: 20,
    referralReferredReward: 10,
    referralTermsUrl: null,
    referralEmailTemplate: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Charger les paramètres au montage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/referral-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        showMessage('error', 'Erreur lors du chargement des paramètres');
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      showMessage('error', 'Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/referral-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        showMessage('success', 'Paramètres sauvegardés avec succès');
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      showMessage('error', 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Configuration du Programme de Parrainage
          </h2>
          <p className="text-gray-600 mt-1">
            Paramétrez les récompenses et conditions de votre programme de parrainage
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Activation du programme */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Programme de parrainage</h3>
            <p className="text-sm text-gray-600 mt-1">
              Activez ou désactivez le programme de parrainage pour vos clients
            </p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, referralEnabled: !settings.referralEnabled })}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
              settings.referralEnabled ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
              settings.referralEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Type de récompense */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Type de récompense</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSettings({ ...settings, referralRewardType: 'FIXED' })}
            className={`p-4 rounded-lg border-2 transition-colors ${
              settings.referralRewardType === 'FIXED'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Euro className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold">Montant fixe</div>
              <div className="text-sm text-gray-600 mt-1">Récompense en euros (€)</div>
            </div>
          </button>

          <button
            onClick={() => setSettings({ ...settings, referralRewardType: 'PERCENTAGE' })}
            className={`p-4 rounded-lg border-2 transition-colors ${
              settings.referralRewardType === 'PERCENTAGE'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Percent className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold">Pourcentage</div>
              <div className="text-sm text-gray-600 mt-1">Réduction en %</div>
            </div>
          </button>
        </div>
      </div>

      {/* Montants des récompenses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Récompenses</h3>

        <div className="space-y-4">
          {/* Récompense parrain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Récompense pour le parrain
              {settings.referralRewardType === 'PERCENTAGE' && (
                <span className="text-xs text-gray-500 ml-2">(en %)</span>
              )}
            </label>
            <div className="relative">
              <input
                type="number"
                value={settings.referralReferrerReward}
                onChange={(e) => setSettings({ ...settings, referralReferrerReward: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step={settings.referralRewardType === 'PERCENTAGE' ? '1' : '5'}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {settings.referralRewardType === 'PERCENTAGE' ? '%' : '€'}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Récompense accordée au parrain lorsque le filleul effectue sa première prestation
            </p>
          </div>

          {/* Récompense filleul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Récompense pour le filleul
              {settings.referralRewardType === 'PERCENTAGE' && (
                <span className="text-xs text-gray-500 ml-2">(en %)</span>
              )}
            </label>
            <div className="relative">
              <input
                type="number"
                value={settings.referralReferredReward}
                onChange={(e) => setSettings({ ...settings, referralReferredReward: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step={settings.referralRewardType === 'PERCENTAGE' ? '1' : '5'}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {settings.referralRewardType === 'PERCENTAGE' ? '%' : '€'}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Récompense accordée au filleul pour sa première prestation
            </p>
          </div>

          {/* Montant minimum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant minimum d'achat (€)
            </label>
            <input
              type="number"
              value={settings.referralMinimumPurchase}
              onChange={(e) => setSettings({ ...settings, referralMinimumPurchase: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="5"
            />
            <p className="text-xs text-gray-500 mt-1">
              Montant minimum que le filleul doit dépenser pour débloquer les récompenses (0 = pas de minimum)
            </p>
          </div>
        </div>
      </div>

      {/* Options avancées */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Options avancées</h3>

        <div className="space-y-4">
          {/* Lien CGU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Link className="w-4 h-4" />
              Lien vers les CGU du parrainage
            </label>
            <input
              type="url"
              value={settings.referralTermsUrl || ''}
              onChange={(e) => setSettings({ ...settings, referralTermsUrl: e.target.value || null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://votre-site.fr/cgu-parrainage"
            />
          </div>

          {/* Template email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Template email d'invitation (optionnel)
            </label>
            <textarea
              value={settings.referralEmailTemplate || ''}
              onChange={(e) => setSettings({ ...settings, referralEmailTemplate: e.target.value || null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Template personnalisé pour l'email d'invitation..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Variables disponibles: {'{'}nom_parrain{'}'}, {'{'}nom_filleul{'}'}, {'{'}code_parrainage{'}'}, {'{'}montant_recompense{'}'}
            </p>
          </div>
        </div>
      </div>

      {/* Aperçu de la configuration */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Aperçu de votre configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4">
            <div className="font-semibold text-gray-700">Statut du programme</div>
            <div className={`mt-1 ${settings.referralEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {settings.referralEnabled ? '✓ Activé' : '✗ Désactivé'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-semibold text-gray-700">Type de récompense</div>
            <div className="mt-1 text-gray-900">
              {settings.referralRewardType === 'FIXED' ? 'Montant fixe (€)' : 'Pourcentage (%)'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-semibold text-gray-700">Récompense parrain</div>
            <div className="mt-1 text-gray-900">
              {settings.referralReferrerReward} {settings.referralRewardType === 'PERCENTAGE' ? '%' : '€'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-semibold text-gray-700">Récompense filleul</div>
            <div className="mt-1 text-gray-900">
              {settings.referralReferredReward} {settings.referralRewardType === 'PERCENTAGE' ? '%' : '€'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
