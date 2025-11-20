'use client';

import { X, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Cancel Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paiement annulé
          </h1>
          <p className="text-gray-600 text-lg">
            Votre commande n'a pas été finalisée
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Vous avez changé d'avis ?
              </h3>
              <p className="text-sm text-blue-800">
                Pas de problème ! Vous pouvez reprendre votre commande à tout moment.
                Vos informations ont été sauvegardées et vous pouvez continuer là où vous vous êtes arrêté.
              </p>
            </div>
          </div>
        </div>

        {/* Raisons */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Pourquoi reprendre maintenant ?</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span><strong>30 jours d'essai gratuit</strong> - Testez toutes les fonctionnalités sans risque</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span><strong>Aucun engagement</strong> - Annulez à tout moment</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span><strong>Support inclus</strong> - Notre équipe vous accompagne dans la configuration</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span><strong>Site en ligne en 24h</strong> - Commencez à prendre des réservations rapidement</span>
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="space-y-4">
          <Link
            href="/checkout"
            className="block w-full text-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
          >
            Reprendre ma commande
          </Link>

          <Link
            href="/platform"
            className="flex items-center justify-center gap-2 w-full text-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Des questions avant de vous lancer ?{' '}
            <a href="mailto:contact@laiaconnect.fr" className="text-purple-600 hover:underline">
              Contactez-nous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
