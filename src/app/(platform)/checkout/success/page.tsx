'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Mail, Clock } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering for pages with search params
export const dynamic = 'force-dynamic';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');
  const leadId = searchParams.get('lead_id');

  useEffect(() => {
    if (sessionId && leadId) {
      // Marquer le lead comme PAID
      fetch('/api/public/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, leadId })
      })
        .then(res => {
          if (!res.ok) throw new Error('Erreur confirmation');
          return res.json();
        })
        .then(() => setLoading(false))
        .catch(err => {
          console.error(err);
          setError('Une erreur est survenue');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [sessionId, leadId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Confirmation de votre paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paiement réussi ! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Merci pour votre confiance
          </p>
        </div>

        {/* Info boxes */}
        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Email de confirmation envoyé
                </h3>
                <p className="text-sm text-blue-800">
                  Vous allez recevoir un email de confirmation avec votre reçu de paiement dans quelques instants.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-1">
                  Nous revenons vers vous sous 24h
                </h3>
                <p className="text-sm text-purple-800">
                  Notre équipe va préparer votre espace LAIA Connect et vous envoyer un email avec vos identifiants de connexion et les instructions pour configurer votre site.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Prochaines étapes</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>Vous recevrez un <strong>email de confirmation</strong> avec votre reçu de paiement</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Notre équipe va <strong>créer votre organisation</strong> sur LAIA Connect</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>Vous recevrez un <strong>email avec vos identifiants</strong> et un lien pour configurer votre site</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span>Vous pourrez <strong>personnaliser votre site</strong> (template, couleurs, textes, photos)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                5
              </span>
              <span>Votre site sera <strong>en ligne</strong> et vous pourrez commencer à prendre des réservations !</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/platform"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
          >
            Retour à l'accueil
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Une question ? Contactez-nous à{' '}
            <a href="mailto:support@laia-connect.fr" className="text-purple-600 hover:underline">
              support@laia-connect.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
