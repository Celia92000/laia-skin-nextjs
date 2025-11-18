'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OnboardingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setError('Session ID manquant')
      setLoading(false)
      return
    }

    // Attendre que le webhook Stripe ait créé l'organisation
    // En production, tu pourrais vérifier l'état avec une API
    const timer = setTimeout(() => {
      setLoading(false)
      // Nettoyer le localStorage de l'onboarding
      localStorage.removeItem('onboarding_data')
      localStorage.removeItem('onboarding_step')
      localStorage.removeItem('onboarding_answers')
    }, 3000)

    return () => clearTimeout(timer)
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Validation en cours...
          </h1>
          <p className="text-gray-600">
            Nous créons votre organisation et votre compte admin.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Cela ne prend que quelques secondes ⏱️
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur
          </h1>
          <p className="text-gray-600 mb-8">
            {error}
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Retour à l'onboarding
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-2xl">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenue chez LAIA Connect !
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Votre compte a été créé avec succès.
        </p>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">📧 Vérifiez votre boîte mail</h3>
          <div className="space-y-3 text-left max-w-md mx-auto text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span>✉️</span>
              <span>Email de bienvenue avec vos identifiants</span>
            </div>
            <div className="flex items-start gap-3">
              <span>📄</span>
              <span>Facture d'activation (0€ - 30 jours gratuits)</span>
            </div>
            <div className="flex items-start gap-3">
              <span>📋</span>
              <span>Contrat d'abonnement signé électroniquement</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-blue-800">
            <strong>💡 Prochaine étape :</strong> Connectez-vous à votre espace admin avec les identifiants reçus par email pour finaliser la configuration de votre institut.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Accéder à mon espace admin
          </Link>
          <Link
            href="https://laiaconnect.fr"
            className="px-8 py-3 border-2 border-purple-300 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all"
          >
            Retour à LAIA Connect
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          Session ID: {sessionId}
        </p>
      </div>
    </div>
  )
}
