'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icône d'annulation */}
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Message d'annulation */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Paiement annulé
          </h1>

          <p className="text-gray-600 mb-6">
            Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 <strong>Besoin d'aide ?</strong><br />
              Si vous rencontrez des difficultés pour effectuer votre paiement, n'hésitez pas à nous contacter.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="block w-full px-6 py-3 text-white rounded-lg font-medium transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(to right, #d4b5a0, #c9a589)' }}
            >
              Réessayer le paiement
            </button>

            <Link
              href="/"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              Retour à l'accueil
            </Link>

            <button
              onClick={() => window.close()}
              className="block w-full px-6 py-3 text-gray-500 hover:text-gray-700 transition-all"
            >
              Fermer cette fenêtre
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Questions ? Contactez-nous à{' '}
              <a href="mailto:contact@laiaskininstitut.fr" className="text-amber-600 hover:underline">
                contact@laiaskininstitut.fr
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
