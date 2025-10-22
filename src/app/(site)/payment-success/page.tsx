'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('session_id')
    setSessionId(id)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icône de succès */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Message de succès */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Paiement réussi !
          </h1>

          <p className="text-gray-600 mb-6">
            Votre paiement a été traité avec succès. Vous allez recevoir un email de confirmation avec votre facture.
          </p>

          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">ID de transaction</p>
              <p className="text-xs font-mono text-gray-700 break-all">
                {sessionId}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-6 py-3 text-white rounded-lg font-medium transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(to right, #d4b5a0, #c9a589)' }}
            >
              Retour à l'accueil
            </Link>

            <button
              onClick={() => window.close()}
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
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
