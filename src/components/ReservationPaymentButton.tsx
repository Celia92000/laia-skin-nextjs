'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle, XCircle, Mail, Copy, Check, ExternalLink } from 'lucide-react';

interface ReservationPaymentButtonProps {
  reservationId: string;
  amount: number;
  serviceName: string;
  paymentStatus: string;
  paymentMethod?: string;
  onPaymentInitiated?: () => void;
  customerEmail?: string;
  customerName?: string;
  provider?: 'stripe' | 'paypal' | 'mollie' | 'sumup'; // Provider de paiement
}

export default function ReservationPaymentButton({
  reservationId,
  amount,
  serviceName,
  paymentStatus,
  paymentMethod,
  onPaymentInitiated,
  customerEmail,
  customerName,
  provider = 'stripe' // Par défaut Stripe pour compatibilité
}: ReservationPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [lastAmount, setLastAmount] = useState(amount);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Réinitialiser le lien si le montant change
  useEffect(() => {
    if (amount !== lastAmount) {
      setPaymentUrl('');
      setLastAmount(amount);
      setError('');
    }
  }, [amount, lastAmount]);

  // Si déjà payée, afficher le badge
  if (paymentStatus === 'paid') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
        <CheckCircle size={16} />
        Payée {paymentMethod && `(${paymentMethod})`}
      </div>
    );
  }

  // Si en attente de paiement - afficher quand même le bouton
  // (on ne bloque plus l'affichage)

  const createPaymentSession = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Non authentifié');
        setLoading(false);
        return null;
      }

      // Déterminer l'endpoint selon le provider
      const endpoints = {
        stripe: '/api/stripe/create-checkout-session',
        paypal: '/api/paypal/create-order',
        mollie: '/api/mollie/create-payment',
        sumup: '/api/sumup/create-checkout'
      };

      const endpoint = endpoints[provider];

      // Créer une session de paiement
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          currency: 'eur',
          description: serviceName,
          reservationId,
          metadata: {
            source: 'admin_panel'
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
      }

      if (!data.url) {
        throw new Error('URL de paiement manquante');
      }

      setPaymentUrl(data.url);
      return data.url;

    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'initialisation du paiement');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = async () => {
    let url = paymentUrl;

    if (!url) {
      url = await createPaymentSession();
      if (!url) return;
    }

    // Ouvrir le lien AVANT d'appeler onPaymentInitiated pour éviter le rechargement
    window.open(url, '_blank');
    // Ne pas appeler onPaymentInitiated ici car ça recharge la page
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setError('');

    try {
      let url = paymentUrl;

      // Si on n'a pas encore de lien, le créer
      if (!url) {
        url = await createPaymentSession();
        if (!url) {
          setSendingEmail(false);
          return;
        }
      }

      if (!customerEmail || !customerName) {
        throw new Error('Email ou nom du client manquant');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Non authentifié');
      }

      // Déterminer l'endpoint d'envoi d'email selon le provider
      const emailEndpoints = {
        stripe: '/api/stripe/send-payment-link',
        paypal: '/api/paypal/send-payment-link',
        mollie: '/api/mollie/send-payment-link',
        sumup: '/api/sumup/send-payment-link'
      };

      const emailEndpoint = emailEndpoints[provider];

      // Envoyer l'email avec le lien
      const response = await fetch(emailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentUrl: url,
          reservationId,
          customerEmail,
          customerName,
          amount,
          provider
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de l\'email');
      }

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyLink = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Bouton principal - Générer le lien */}
      {!paymentUrl && (
        <button
          onClick={() => createPaymentSession()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Génération du lien...
            </>
          ) : (
            <>
              <CreditCard size={16} />
              Générer le lien de paiement
            </>
          )}
        </button>
      )}

      {/* Lien généré - Actions */}
      {paymentUrl && (
        <div className="space-y-2">
          {/* Afficher le lien */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-medium mb-2 flex items-center gap-1">
              <CheckCircle size={14} />
              Lien de paiement créé
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={paymentUrl}
                readOnly
                className="flex-1 px-2 py-1 text-xs bg-white border border-blue-300 rounded font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Copier le lien"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1">✓ Lien copié !</p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOpenPayment}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-xs font-medium"
            >
              <ExternalLink size={14} />
              Ouvrir le lien
            </button>

            <button
              onClick={handleSendEmail}
              disabled={sendingEmail || !customerEmail}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium"
            >
              {sendingEmail ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Envoi...
                </>
              ) : emailSent ? (
                <>
                  <CheckCircle size={14} />
                  Envoyé !
                </>
              ) : (
                <>
                  <Mail size={14} />
                  Envoyer par email
                </>
              )}
            </button>
          </div>

          {emailSent && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs">
              <CheckCircle size={14} />
              Email envoyé à {customerEmail}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs">
          <XCircle size={14} />
          {error}
        </div>
      )}

      {paymentStatus === 'unpaid' && !paymentUrl && (
        <div className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs">
          Non payée
        </div>
      )}
    </div>
  );
}
