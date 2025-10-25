'use client';

import { useState, useEffect } from 'react';
import {
  Key, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  Clock, Shield, Eye, EyeOff, Calendar, Plus, Trash2
} from 'lucide-react';

interface ApiToken {
  id: string;
  service: string;
  name: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export default function ApiTokensManager() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<ApiToken | null>(null);
  const [renewalStatus, setRenewalStatus] = useState<Record<string, string>>({});

  // Form state
  const [formService, setFormService] = useState('WHATSAPP');
  const [formName, setFormName] = useState('access_token');
  const [formToken, setFormToken] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token JWT présent:', !!token);

      const response = await fetch('/api/admin/api-tokens', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📡 Réponse API:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Tokens récupérés:', data.length, 'token(s)');
        console.log('📦 Données:', data);
        setTokens(data);
      } else {
        const error = await response.json();
        console.error('❌ Erreur API:', error);
      }
    } catch (error) {
      console.error('❌ Erreur chargement tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExpiringSoon = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/api-tokens/check-expiring', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`${data.count} token(s) expirent dans les 7 prochains jours`);
        await fetchTokens();
      }
    } catch (error) {
      console.error('Erreur vérification tokens:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renewToken = async (tokenId: string, service: string) => {
    setRenewalStatus({ ...renewalStatus, [tokenId]: 'loading' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/api-tokens/${tokenId}/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ service })
      });

      if (response.ok) {
        setRenewalStatus({ ...renewalStatus, [tokenId]: 'success' });
        await fetchTokens();
        setTimeout(() => {
          setRenewalStatus({ ...renewalStatus, [tokenId]: '' });
        }, 3000);
      } else {
        setRenewalStatus({ ...renewalStatus, [tokenId]: 'error' });
      }
    } catch (error) {
      console.error('Erreur renouvellement token:', error);
      setRenewalStatus({ ...renewalStatus, [tokenId]: 'error' });
    }
  };

  const getTokenStatus = (expiresAt: string | null) => {
    if (!expiresAt) {
      return { status: 'permanent', color: 'green', icon: CheckCircle, text: 'Permanent' };
    }

    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { status: 'expired', color: 'red', icon: XCircle, text: 'Expiré' };
    } else if (daysLeft <= 7) {
      return { status: 'expiring', color: 'orange', icon: AlertTriangle, text: `Expire dans ${daysLeft} jour(s)` };
    } else if (daysLeft <= 30) {
      return { status: 'warning', color: 'yellow', icon: Clock, text: `Expire dans ${daysLeft} jours` };
    } else {
      return { status: 'active', color: 'green', icon: CheckCircle, text: `Actif (${daysLeft} jours)` };
    }
  };

  const getServiceIcon = (service: string) => {
    const icons: Record<string, string> = {
      WHATSAPP: '💬',
      INSTAGRAM: '📷',
      FACEBOOK: '👥',
      STRIPE: '💳',
      RESEND: '📧',
      SNAPCHAT: '👻',
      TIKTOK: '🎵',
      LINKEDIN: '💼',
      TWITTER: '🐦',
      OTHER: '🔑'
    };
    return icons[service] || '🔑';
  };

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/api-tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: formService,
          name: formName,
          token: formToken,
          expiresAt: formExpiresAt || null,
        }),
      });

      if (response.ok) {
        await fetchTokens();
        setShowAddModal(false);
        setFormService('WHATSAPP');
        setFormName('access_token');
        setFormToken('');
        setFormExpiresAt('');
        alert('Token ajouté avec succès !');
      } else {
        const error = await response.json();
        alert(`Erreur : ${error.error || 'Erreur lors de l\'ajout du token'}`);
      }
    } catch (error) {
      console.error('Erreur ajout token:', error);
      alert('Erreur lors de l\'ajout du token');
    } finally {
      setFormSaving(false);
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4b5a0]/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#d4b5a0]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gestion des Tokens API</h2>
              <p className="text-sm text-gray-600">
                {tokens.length} token(s) configuré(s) - Tous les tokens sont chiffrés en base de données
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={checkExpiringSoon}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Vérifier l'expiration
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un token
            </button>
          </div>
        </div>

        {/* Alertes */}
        {tokens.some(t => {
          const status = getTokenStatus(t.expiresAt);
          return status.status === 'expired' || status.status === 'expiring';
        }) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-orange-900 mb-1">Attention : Tokens à renouveler</p>
              <p className="text-sm text-orange-700">
                Certains tokens vont expirer bientôt. Cliquez sur "Renouveler" pour les mettre à jour.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Liste des tokens */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière MAJ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tokens.map((token) => {
              const status = getTokenStatus(token.expiresAt);
              const StatusIcon = status.icon;

              return (
                <tr key={token.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getServiceIcon(token.service)}</span>
                      <span className="font-medium text-gray-900">{token.service}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 font-mono">{token.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 text-${status.color}-700`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{status.text}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {token.expiresAt ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(token.expiresAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">Aucune expiration</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(token.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {status.status === 'expired' || status.status === 'expiring' ? (
                        <button
                          onClick={() => renewToken(token.id, token.service)}
                          disabled={renewalStatus[token.id] === 'loading'}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                            renewalStatus[token.id] === 'success'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : renewalStatus[token.id] === 'error'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'
                          } disabled:opacity-50`}
                        >
                          <RefreshCw className={`w-3 h-3 ${renewalStatus[token.id] === 'loading' ? 'animate-spin' : ''}`} />
                          {renewalStatus[token.id] === 'success' ? 'Renouvelé' :
                           renewalStatus[token.id] === 'error' ? 'Erreur' :
                           'Renouveler'}
                        </button>
                      ) : null}

                      <button
                        onClick={() => setSelectedToken(token)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tokens.length === 0 && (
          <div className="text-center py-12">
            <Key size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">Aucun token configuré</p>
            <p className="text-sm text-gray-500 mt-1">Cliquez sur "Ajouter un token" pour commencer</p>
          </div>
        )}
      </div>

      {/* Guide de renouvellement */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Guide de configuration des tokens
        </h3>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <strong className="text-gray-900">WhatsApp :</strong> Les tokens WhatsApp expirent tous les 60 jours.
              Pour renouveler, rendez-vous dans le{' '}
              <a href="https://business.facebook.com/" target="_blank" className="text-blue-600 underline">
                Meta Business Manager
              </a>
              {' '}→ WhatsApp → Configuration → Tokens d'accès.
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">📷</span>
            <div>
              <strong className="text-gray-900">Instagram :</strong> Les tokens Instagram expirent tous les 60 jours.
              Ajoutez 2 tokens : <code className="bg-white px-1 rounded">access_token</code> et{' '}
              <code className="bg-white px-1 rounded">account_id</code>. Obtenez-les via{' '}
              <a href="https://developers.facebook.com/" target="_blank" className="text-blue-600 underline">
                Facebook Developers
              </a>
              {' '}→ Votre App → Outils de token.
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <strong className="text-gray-900">Facebook :</strong> Ajoutez 2 tokens :{' '}
              <code className="bg-white px-1 rounded">page_access_token</code> et{' '}
              <code className="bg-white px-1 rounded">page_id</code>. Même processus que pour Instagram.
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">👻</span>
            <div>
              <strong className="text-gray-900">Snapchat :</strong> Ajoutez un token{' '}
              <code className="bg-white px-1 rounded">access_token</code>. Obtenez-le depuis{' '}
              <a href="https://businesshelp.snapchat.com/" target="_blank" className="text-blue-600 underline">
                Snapchat Business Manager
              </a>
              {' '}→ API → Tokens.
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🎵</span>
            <div>
              <strong className="text-gray-900">TikTok :</strong> Ajoutez un token{' '}
              <code className="bg-white px-1 rounded">access_token</code>. Créez une app sur{' '}
              <a href="https://developers.tiktok.com/" target="_blank" className="text-blue-600 underline">
                TikTok for Developers
              </a>
              {' '}pour obtenir vos clés.
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">💼</span>
            <div>
              <strong className="text-gray-900">LinkedIn :</strong> Ajoutez 2 tokens :{' '}
              <code className="bg-white px-1 rounded">access_token</code> et{' '}
              <code className="bg-white px-1 rounded">person_id</code>. Créez une app sur{' '}
              <a href="https://www.linkedin.com/developers/" target="_blank" className="text-blue-600 underline">
                LinkedIn Developers
              </a>.
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">🐦</span>
            <div>
              <strong className="text-gray-900">Twitter :</strong> Ajoutez un token{' '}
              <code className="bg-white px-1 rounded">bearer_token</code>. Obtenez-le depuis{' '}
              <a href="https://developer.twitter.com/" target="_blank" className="text-blue-600 underline">
                Twitter Developer Portal
              </a>
              {' '}→ Votre App → Keys and tokens.
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <strong className="text-gray-900">Stripe :</strong> Les clés Stripe n'expirent pas, mais doivent être révoquées
              et régénérées en cas de compromission.
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ajouter un token */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un token API</h3>

            <form onSubmit={handleAddToken} className="space-y-4">
              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service
                </label>
                <select
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0]"
                  required
                >
                  <option value="WHATSAPP">💬 WhatsApp</option>
                  <option value="INSTAGRAM">📷 Instagram</option>
                  <option value="FACEBOOK">👥 Facebook</option>
                  <option value="SNAPCHAT">👻 Snapchat</option>
                  <option value="TIKTOK">🎵 TikTok</option>
                  <option value="LINKEDIN">💼 LinkedIn</option>
                  <option value="TWITTER">🐦 Twitter</option>
                  <option value="STRIPE">💳 Stripe</option>
                  <option value="RESEND">📧 Resend</option>
                  <option value="OTHER">🔑 Autre</option>
                </select>
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du token
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: access_token, secret_key..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0]"
                  required
                />
              </div>

              {/* Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token / Clé API
                </label>
                <textarea
                  value={formToken}
                  onChange={(e) => setFormToken(e.target.value)}
                  placeholder="Collez votre token ici..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0]"
                  required
                />
              </div>

              {/* Date d'expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'expiration (optionnel)
                </label>
                <input
                  type="date"
                  value={formExpiresAt}
                  onChange={(e) => setFormExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4b5a0]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide si le token n'expire pas
                </p>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={formSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition-colors disabled:opacity-50"
                  disabled={formSaving}
                >
                  {formSaving ? 'Enregistrement...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
