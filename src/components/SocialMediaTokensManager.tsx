'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Settings, Eye, EyeOff, Save, X, RefreshCw, AlertCircle
} from 'lucide-react';

interface TokenField {
  name: string;
  label: string;
  required: boolean;
  type?: 'text' | 'password' | 'date' | 'url';
  placeholder?: string;
  description?: string;
}

interface PlatformConfig {
  service: string;
  name: string;
  icon: string;
  color: string;
  fields: TokenField[];
  docUrl: string;
  expiresInDays?: number;
}

interface TokenData {
  [key: string]: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    service: 'INSTAGRAM',
    name: 'Instagram',
    icon: '📷',
    color: 'from-pink-500 to-purple-500',
    expiresInDays: 60,
    docUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api',
    fields: [
      { name: 'access_token', label: 'Access Token', required: true, type: 'password', description: 'Token d\'accès Instagram' },
      { name: 'account_id', label: 'Account ID', required: true, type: 'text', description: 'ID du compte Instagram Business' },
      { name: 'client_id', label: 'Client ID', required: false, type: 'text', description: 'ID de l\'application Facebook' },
      { name: 'client_secret', label: 'Client Secret', required: false, type: 'password', description: 'Secret de l\'application' },
    ]
  },
  {
    service: 'FACEBOOK',
    name: 'Facebook',
    icon: '👥',
    color: 'from-blue-500 to-blue-600',
    expiresInDays: 60,
    docUrl: 'https://developers.facebook.com/docs/facebook-login/access-tokens',
    fields: [
      { name: 'page_access_token', label: 'Page Access Token', required: true, type: 'password', description: 'Token d\'accès à la page Facebook' },
      { name: 'page_id', label: 'Page ID', required: true, type: 'text', description: 'ID de la page Facebook' },
      { name: 'app_id', label: 'App ID', required: false, type: 'text', description: 'ID de l\'application Facebook' },
      { name: 'app_secret', label: 'App Secret', required: false, type: 'password', description: 'Secret de l\'application' },
    ]
  },
  {
    service: 'SNAPCHAT',
    name: 'Snapchat',
    icon: '👻',
    color: 'from-yellow-400 to-yellow-500',
    docUrl: 'https://businesshelp.snapchat.com/s/article/custom-audience-api',
    fields: [
      { name: 'access_token', label: 'Access Token', required: true, type: 'password', description: 'Token d\'accès Snapchat Business' },
      { name: 'client_id', label: 'Client ID', required: false, type: 'text', description: 'ID de l\'application' },
      { name: 'client_secret', label: 'Client Secret', required: false, type: 'password', description: 'Secret de l\'application' },
      { name: 'ad_account_id', label: 'Ad Account ID', required: false, type: 'text', description: 'ID du compte publicitaire' },
    ]
  },
  {
    service: 'TIKTOK',
    name: 'TikTok',
    icon: '🎵',
    color: 'from-gray-900 to-pink-500',
    docUrl: 'https://developers.tiktok.com/doc/overview',
    fields: [
      { name: 'access_token', label: 'Access Token', required: true, type: 'password', description: 'Token d\'accès TikTok' },
      { name: 'client_key', label: 'Client Key', required: false, type: 'text', description: 'Clé de l\'application' },
      { name: 'client_secret', label: 'Client Secret', required: false, type: 'password', description: 'Secret de l\'application' },
    ]
  },
  {
    service: 'LINKEDIN',
    name: 'LinkedIn',
    icon: '💼',
    color: 'from-blue-600 to-blue-700',
    docUrl: 'https://www.linkedin.com/developers/apps',
    fields: [
      { name: 'access_token', label: 'Access Token', required: true, type: 'password', description: 'Token d\'accès LinkedIn' },
      { name: 'person_id', label: 'Person ID', required: true, type: 'text', description: 'URN de la personne LinkedIn' },
      { name: 'client_id', label: 'Client ID', required: false, type: 'text', description: 'ID de l\'application' },
      { name: 'client_secret', label: 'Client Secret', required: false, type: 'password', description: 'Secret de l\'application' },
    ]
  },
  {
    service: 'TWITTER',
    name: 'Twitter',
    icon: '🐦',
    color: 'from-sky-400 to-blue-500',
    docUrl: 'https://developer.twitter.com/en/portal/dashboard',
    fields: [
      { name: 'bearer_token', label: 'Bearer Token', required: true, type: 'password', description: 'Token d\'accès Twitter API v2' },
      { name: 'api_key', label: 'API Key', required: false, type: 'text', description: 'Clé API de l\'application' },
      { name: 'api_secret', label: 'API Secret', required: false, type: 'password', description: 'Secret API de l\'application' },
      { name: 'access_token', label: 'Access Token', required: false, type: 'password', description: 'Token d\'accès utilisateur' },
      { name: 'access_token_secret', label: 'Access Token Secret', required: false, type: 'password', description: 'Secret du token d\'accès' },
    ]
  },
];

export default function SocialMediaTokensManager() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null);
  const [platformTokens, setPlatformTokens] = useState<TokenData>({});
  const [showFields, setShowFields] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/api-tokens', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformStatus = (service: string) => {
    const platformConfig = PLATFORMS.find(p => p.service === service);
    if (!platformConfig) return { configured: false, partial: false };

    const requiredFields = platformConfig.fields.filter(f => f.required).map(f => f.name);
    const serviceTokens = tokens.filter(t => t.service === service);

    const configuredRequired = requiredFields.filter(field =>
      serviceTokens.some(t => t.name === field)
    );

    const configured = configuredRequired.length === requiredFields.length;
    const partial = configuredRequired.length > 0 && !configured;

    return { configured, partial, count: serviceTokens.length };
  };

  const openPlatformConfig = async (platform: PlatformConfig) => {
    setSelectedPlatform(platform);
    setError('');
    setSuccess('');

    // Charger les tokens existants pour cette plateforme
    const serviceTokens = tokens.filter(t => t.service === platform.service);
    const data: TokenData = {};

    for (const token of serviceTokens) {
      data[token.name] = '••••••••'; // Masqué par défaut
    }

    setPlatformTokens(data);
    setShowFields(new Set());
  };

  const toggleFieldVisibility = (fieldName: string) => {
    setShowFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldName)) {
        newSet.delete(fieldName);
      } else {
        newSet.add(fieldName);
      }
      return newSet;
    });
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setPlatformTokens(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const savePlatformTokens = async () => {
    if (!selectedPlatform) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const promises = [];

      for (const field of selectedPlatform.fields) {
        const value = platformTokens[field.name];

        // Ne sauvegarder que si la valeur est remplie et n'est pas masquée
        if (value && value !== '••••••••') {
          const expiresAt = selectedPlatform.expiresInDays
            ? new Date(Date.now() + selectedPlatform.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
            : null;

          promises.push(
            fetch('/api/admin/api-tokens', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                service: selectedPlatform.service,
                name: field.name,
                token: value,
                expiresAt,
                metadata: {
                  platform: selectedPlatform.name,
                  fieldLabel: field.label
                }
              }),
            })
          );
        }
      }

      await Promise.all(promises);

      setSuccess(`Configuration ${selectedPlatform.name} enregistrée avec succès !`);
      await fetchTokens();

      setTimeout(() => {
        setSelectedPlatform(null);
        setSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d4b5a0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Réseaux Sociaux</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configurez vos comptes de réseaux sociaux pour la publication automatique
            </p>
          </div>
          <button
            onClick={fetchTokens}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Liste des plateformes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => {
          const status = getPlatformStatus(platform.service);

          return (
            <div
              key={platform.service}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer"
              onClick={() => openPlatformConfig(platform)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center text-2xl`}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <p className="text-xs text-gray-500">
                        {status.count ?? 0} paramètre{(status.count ?? 0) > 1 ? 's' : ''} configuré{(status.count ?? 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {status.configured ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Configuré</span>
                    </div>
                  ) : status.partial ? (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Incomplet</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Non configuré</span>
                    </div>
                  )}
                </div>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700">
                  <Settings className="w-4 h-4" />
                  Configurer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de configuration */}
      {selectedPlatform && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`p-6 bg-gradient-to-br ${selectedPlatform.color} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedPlatform.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold">Configuration {selectedPlatform.name}</h3>
                    <p className="text-sm opacity-90 mt-1">
                      Configurez vos identifiants et tokens d'accès
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlatform(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Messages */}
              {success && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800">{success}</p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Champs */}
              {selectedPlatform.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  <div className="relative">
                    <input
                      type={showFields.has(field.name) ? 'text' : field.type || 'password'}
                      value={platformTokens[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder || `Entrez votre ${field.label.toLowerCase()}`}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    />

                    {(field.type === 'password' || !field.type) && (
                      <button
                        type="button"
                        onClick={() => toggleFieldVisibility(field.name)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showFields.has(field.name) ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {field.description && (
                    <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                  )}
                </div>
              ))}

              {/* Documentation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>📚 Besoin d'aide ?</strong>
                </p>
                <p className="text-xs text-blue-700">
                  Consultez la{' '}
                  <a
                    href={selectedPlatform.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    documentation officielle {selectedPlatform.name}
                  </a>
                  {' '}pour obtenir vos identifiants.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <button
                onClick={() => setSelectedPlatform(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={savePlatformTokens}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-[#d4b5a0] text-white rounded-lg font-medium hover:bg-[#c9a084] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
