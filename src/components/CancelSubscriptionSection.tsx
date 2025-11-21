'use client'

import { useState } from 'react'
import { AlertTriangle, X, Check } from 'lucide-react'

interface CancelSubscriptionSectionProps {
  currentPeriodEnd?: string | null
  status?: string
}

export default function CancelSubscriptionSection({ currentPeriodEnd, status }: CancelSubscriptionSectionProps) {
  const [showModal, setShowModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  const isAlreadyCancelled = status === 'CANCELLED'

  async function handleCancel() {
    setCancelling(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setCancelled(true)
        setTimeout(() => {
          setShowModal(false)
          window.location.reload()
        }, 2000)
      } else {
        const data = await response.json()
        alert('❌ Erreur : ' + (data.error || 'Impossible de résilier'))
      }
    } catch (error) {
      console.error('Erreur résiliation:', error)
      alert('❌ Erreur lors de la résiliation')
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-3xl">🚫</div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Résilier mon abonnement
            </h2>

            {isAlreadyCancelled ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-orange-800 font-medium">
                  ⚠️ Votre abonnement est déjà programmé pour résiliation
                </p>
                {currentPeriodEnd && (
                  <p className="text-sm text-orange-700 mt-2">
                    Vous conservez l'accès jusqu'au <strong>{formatDate(currentPeriodEnd)}</strong>
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Check className="text-green-600 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-green-900 font-semibold">
                        ✅ SANS ENGAGEMENT • SANS PRÉAVIS
                      </p>
                      <p className="text-sm text-green-800 mt-1">
                        Vous pouvez résilier à tout moment, sans frais, sans préavis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-700 mb-4">
                  <p>
                    <strong>Comment ça marche ?</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Vous cliquez sur "Résilier" ci-dessous</li>
                    <li>La résiliation prend effet à la fin de votre période de facturation en cours</li>
                    {currentPeriodEnd && (
                      <li>Vous conservez l'accès jusqu'au <strong>{formatDate(currentPeriodEnd)}</strong></li>
                    )}
                    <li>Aucun prélèvement ne sera effectué après cette date</li>
                    <li>Vos données restent accessibles pendant 30 jours pour export</li>
                  </ul>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
                >
                  <AlertTriangle size={20} />
                  Résilier mon abonnement
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            {cancelled ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Résiliation confirmée
                </h3>
                <p className="text-gray-700">
                  Votre abonnement sera résilié à la fin de la période en cours.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    ⚠️ Confirmer la résiliation
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={cancelling}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-gray-700">
                    Êtes-vous sûr de vouloir résilier votre abonnement LAIA Connect ?
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      📅 Ce qui va se passer :
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                      {currentPeriodEnd && (
                        <li>Vous conservez l'accès jusqu'au <strong>{formatDate(currentPeriodEnd)}</strong></li>
                      )}
                      <li>Aucun prélèvement après cette date</li>
                      <li>30 jours pour exporter vos données</li>
                      <li>Vous pouvez vous réabonner à tout moment</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-900 font-medium mb-2">
                      ⚠️ Attention :
                    </p>
                    <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
                      <li>Votre site web sera mis hors ligne</li>
                      <li>Les réservations en ligne seront désactivées</li>
                      <li>Les clients ne pourront plus accéder à leur espace</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    disabled={cancelling}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={cancelling}
                  >
                    {cancelling ? 'Résiliation...' : 'Confirmer la résiliation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
