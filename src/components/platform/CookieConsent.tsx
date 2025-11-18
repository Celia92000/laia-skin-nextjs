'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Toujours accepté
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    } else {
      const savedPreferences = JSON.parse(consent)
      setPreferences(savedPreferences)
      loadScripts(savedPreferences)
    }
  }, [])

  const loadScripts = (prefs: typeof preferences) => {
    // Analytics (Google Analytics, Plausible, etc.)
    if (prefs.analytics) {
      // Exemple: charger Google Analytics
      // window.gtag('consent', 'update', { analytics_storage: 'granted' })
    }

    // Marketing (Meta Pixel, TikTok Pixel, etc.)
    if (prefs.marketing) {
      // Exemple: charger Meta Pixel
      // window.fbq('consent', 'grant')
    }
  }

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allAccepted)
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    loadScripts(allAccepted)
    setShowBanner(false)
  }

  const acceptNecessaryOnly = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    setPreferences(necessaryOnly)
    localStorage.setItem('cookie-consent', JSON.stringify(necessaryOnly))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setShowBanner(false)
  }

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    loadScripts(preferences)
    setShowBanner(false)
    setShowPreferences(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center bg-black/50">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-slide-up">
        {/* En-tête */}
        <div className="flex items-start gap-4 mb-6">
          <div className="text-4xl">🍪</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Gestion des cookies
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience sur LAIA Connect.
              Certains cookies sont essentiels au fonctionnement de la plateforme, tandis que
              d'autres nous aident à analyser l'utilisation et à personnaliser votre expérience.
            </p>
          </div>
        </div>

        {/* Préférences détaillées */}
        {showPreferences ? (
          <div className="space-y-4 mb-6">
            {/* Cookies nécessaires */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies nécessaires</h3>
                  <p className="text-sm text-gray-600">
                    Indispensables au fonctionnement de la plateforme
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 cursor-not-allowed"
                  />
                  <span className="ml-2 text-sm text-gray-500">Toujours actifs</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Authentification, sécurité, préférences de session
              </p>
            </div>

            {/* Cookies analytiques */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies analytiques</h3>
                  <p className="text-sm text-gray-600">
                    Nous aident à comprendre comment vous utilisez la plateforme
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Google Analytics, statistiques d'utilisation, performances
              </p>
            </div>

            {/* Cookies marketing */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">Cookies marketing</h3>
                  <p className="text-sm text-gray-600">
                    Personnalisation publicitaire et remarketing
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Meta Pixel, TikTok Pixel, publicités personnalisées
              </p>
            </div>
          </div>
        ) : null}

        {/* Lien vers politique de cookies */}
        <div className="mb-6 text-sm text-gray-600">
          Pour en savoir plus, consultez notre{' '}
          <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline">
            politique de confidentialité
          </Link>
          {' '}et notre{' '}
          <Link href="/rgpd/politique-confidentialite" className="text-purple-600 hover:text-purple-700 underline">
            politique RGPD
          </Link>.
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3">
          {showPreferences ? (
            <>
              <button
                onClick={() => setShowPreferences(false)}
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Retour
              </button>
              <button
                onClick={savePreferences}
                className="flex-1 px-6 py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors shadow-lg"
              >
                Enregistrer mes préférences
              </button>
            </>
          ) : (
            <>
              <button
                onClick={acceptNecessaryOnly}
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Nécessaires uniquement
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="flex-1 px-6 py-3 text-gray-700 border-2 border-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors"
              >
                Personnaliser
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-6 py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors shadow-lg"
              >
                Tout accepter
              </button>
            </>
          )}
        </div>

        {/* Note RGPD */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Conformément au RGPD, vous pouvez modifier vos préférences à tout moment
        </p>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
