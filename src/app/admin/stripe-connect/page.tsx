'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ExternalLink, CheckCircle, AlertCircle, Loader2, DollarSign } from 'lucide-react';

export default function StripeConnectPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stripe-connect/onboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Erreur vérification statut:', err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stripe-connect/onboard', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la connexion');
      }

      const data = await response.json();

      // Rediriger vers Stripe pour l'onboarding
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stripe-connect/dashboard', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'ouverture du dashboard');
      }

      const data = await response.json();

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stripe Connect</h1>
          <p className="text-gray-600">
            Connectez votre compte Stripe pour accepter des paiements en ligne de vos clientes.
          </p>
        </div>

        {/* Statut actuel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={24} />
            Statut de connexion
          </h2>

          {status === null ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 size={20} className="animate-spin" />
              Vérification...
            </div>
          ) : status.connected ? (
            <div className="space-y-4">
              {/* Connecté et configuré */}
              {status.onboardingComplete && status.chargesEnabled ? (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900">Stripe Connect activé !</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Vous pouvez accepter des paiements en ligne. Les paiements de vos clientes
                      vont directement sur votre compte Stripe.
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      ID du compte : {status.accountId}
                    </p>
                  </div>
                </div>
              ) : (
                // Connecté mais onboarding incomplet
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Configuration incomplète</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Votre compte Stripe est connecté mais l'onboarding n'est pas terminé.
                      Complétez les informations demandées par Stripe.
                    </p>
                  </div>
                </div>
              )}

              {/* Détails */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Onboarding</p>
                  <p className={`font-semibold ${status.onboardingComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                    {status.onboardingComplete ? '✓ Complété' : '⚠ Incomplet'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Paiements</p>
                  <p className={`font-semibold ${status.chargesEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {status.chargesEnabled ? '✓ Activés' : '✗ Désactivés'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Virements</p>
                  <p className={`font-semibold ${status.payoutsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {status.payoutsEnabled ? '✓ Activés' : '✗ Désactivés'}
                  </p>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 mt-6">
                {status.requiresAction && (
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} />
                        Compléter la configuration
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleOpenDashboard}
                  disabled={loading || !status.onboardingComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ExternalLink size={16} />
                  Ouvrir le dashboard Stripe
                </button>
              </div>
            </div>
          ) : (
            // Pas connecté
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <CreditCard size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Connectez Stripe pour commencer</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Acceptez les paiements en ligne de vos clientes en toute sécurité.
                    Les paiements vont directement sur votre compte Stripe.
                  </p>
                </div>
              </div>

              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Connecter Stripe
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={24} />
            Comment ça fonctionne ?
          </h2>

          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connectez votre compte Stripe</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Cliquez sur "Connecter Stripe" et remplissez les informations demandées par Stripe
                  (SIRET, IBAN, pièce d'identité).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Validation par Stripe</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Stripe vérifie vos informations (quelques heures à 1-2 jours).
                  Vous recevrez un email de confirmation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Acceptez des paiements !</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Vos clientes peuvent payer en ligne. Les paiements vont directement sur votre compte Stripe.
                  LAIA Platform prélève une commission de 2% sur chaque transaction.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>💡 Bon à savoir :</strong> Stripe est conforme PCI-DSS, vos données bancaires
              sont sécurisées. LAIA Platform ne voit jamais les numéros de carte de vos clientes.
            </p>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Erreur</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
