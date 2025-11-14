'use client'

import { useState } from 'react'
import { SMS_PACKAGES } from '@/lib/sms-packages'

interface SMSCreditsWidgetProps {
  currentCredits: number
  organizationId: string
  onPurchase?: () => void
}

export default function SMSCreditsWidget({
  currentCredits,
  organizationId,
  onPurchase
}: SMSCreditsWidgetProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePurchase = async (packageId: string) => {
    setLoading(true)

    try {
      const response = await fetch('/api/admin/sms/purchase-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      })

      if (response.ok) {
        const data = await response.json()

        // Rediriger vers la page de paiement Stripe
        if (data.url) {
          window.location.href = data.url
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la création de la session de paiement')
      }
    } catch (error) {
      console.error('Erreur achat crédits SMS:', error)
      alert('Erreur lors de l\'achat de crédits SMS')
    } finally {
      setLoading(false)
    }
  }

  const getCreditsColor = () => {
    if (currentCredits === 0) return 'text-red-600 bg-red-50'
    if (currentCredits < 50) return 'text-orange-600 bg-orange-50'
    if (currentCredits < 200) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Crédits SMS</h3>
            <div className="mt-2">
              <span className={`text-3xl font-bold ${getCreditsColor().split(' ')[0]}`}>
                {currentCredits}
              </span>
              <span className="text-gray-500 ml-2">SMS restants</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              0.035€ par SMS via Brevo
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2"
          >
            <span>💳</span>
            Acheter des crédits
          </button>
        </div>

        {currentCredits < 50 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              ⚠️ Vos crédits SMS sont faibles. Rechargez pour continuer à envoyer des SMS.
            </p>
          </div>
        )}
      </div>

      {/* Modal Achat de crédits */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Acheter des crédits SMS</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {SMS_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border rounded-lg p-6 hover:shadow-lg transition-shadow ${
                      pkg.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                        POPULAIRE
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {pkg.name}
                    </h3>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {pkg.price}€
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="text-green-500 mr-2">✓</span>
                        {pkg.credits} SMS
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="text-green-500 mr-2">✓</span>
                        {pkg.pricePerSMS}€ par SMS
                      </div>
                      {pkg.savings && (
                        <div className="flex items-center text-sm font-medium text-green-600">
                          <span className="mr-2">💰</span>
                          Économie {pkg.savings}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                      {pkg.description}
                    </p>

                    <button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={loading}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        pkg.popular
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Chargement...' : 'Acheter'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">ℹ️ Informations</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Paiement sécurisé par Stripe (CB ou SEPA)</li>
                  <li>• Crédits ajoutés immédiatement après paiement</li>
                  <li>• Pas d'expiration des crédits</li>
                  <li>• Facture envoyée automatiquement par email</li>
                  <li>• Support technique disponible 7j/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
