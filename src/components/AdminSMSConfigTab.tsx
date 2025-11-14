'use client'

import { useState, useEffect } from 'react'
import { Smartphone, CreditCard, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import SMSCreditsWidget from './SMS/SMSCreditsWidget'

interface Organization {
  id: string
  smsCredits: number
  smsTotalPurchased: number
  smsLastPurchaseDate: string | null
}

export default function AdminSMSConfigTab() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organization')
      if (response.ok) {
        const data = await response.json()
        setOrganization(data.organization)
      }
    } catch (error) {
      console.error('Erreur chargement organisation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Erreur de chargement de l'organisation</p>
      </div>
    )
  }

  const hasCredits = organization.smsCredits > 0
  const hasPurchasedBefore = organization.smsTotalPurchased > 0

  return (
    <div className="space-y-6">
      {/* Message d'activation si aucun crédit */}
      {!hasPurchasedBefore && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Activez le module SMS Marketing
              </h3>

              <p className="text-gray-700 mb-6 text-lg">
                Communiquez directement avec vos clients par SMS pour les rappels de rendez-vous,
                les promotions et bien plus encore.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">SMS Individuels</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Envoyez des SMS personnalisés à vos clients
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Campagnes</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Contactez plusieurs clients en même temps
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Automatisations</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Rappels automatiques et messages d'anniversaire
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">
                      Pour activer ce service
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Achetez des crédits SMS pour commencer à envoyer des messages.
                      L'onglet SMS Marketing apparaîtra automatiquement dans votre tableau de bord.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    // Scroll vers le widget d'achat
                    const widget = document.getElementById('sms-credits-widget')
                    widget?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <CreditCard className="w-5 h-5" />
                  Acheter des crédits SMS
                </button>

                <div className="text-sm text-gray-600">
                  À partir de <span className="font-bold text-blue-600">5€</span> pour 100 SMS
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget crédits SMS */}
      <div id="sms-credits-widget">
        <SMSCreditsWidget
          currentCredits={organization.smsCredits}
          organizationId={organization.id}
          onPurchase={fetchOrganization}
        />
      </div>

      {/* Statistiques si l'utilisateur a déjà acheté */}
      {hasPurchasedBefore && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Statistiques SMS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total acheté</div>
              <div className="text-2xl font-bold text-gray-900">
                {organization.smsTotalPurchased}
              </div>
              <div className="text-xs text-gray-500 mt-1">SMS au total</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Utilisés</div>
              <div className="text-2xl font-bold text-gray-900">
                {organization.smsTotalPurchased - organization.smsCredits}
              </div>
              <div className="text-xs text-gray-500 mt-1">SMS envoyés</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Dernier achat</div>
              <div className="text-lg font-semibold text-gray-900">
                {organization.smsLastPurchaseDate
                  ? new Date(organization.smsLastPurchaseDate).toLocaleDateString('fr-FR')
                  : 'Jamais'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Date</div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Brevo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuration Brevo (API SMS)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clé API Brevo
            </label>
            <input
              type="password"
              value="••••••••••••••••••••••••"
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              La clé API Brevo est configurée dans les variables d'environnement
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ À propos de Brevo</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Plateforme d'envoi de SMS professionnelle</li>
              <li>• Taux de délivrabilité : 99%+</li>
              <li>• Coût : 0.035€ par SMS via Brevo</li>
              <li>• Rapports détaillés et statistiques en temps réel</li>
              <li>• Support technique disponible 24/7</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Informations importantes */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">📚 Informations importantes</h4>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <div>
              <strong>Pas d'expiration :</strong> Vos crédits SMS n'expirent jamais
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <div>
              <strong>Comptage intelligent :</strong> 1 crédit = 1 SMS (160 caractères max)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <div>
              <strong>Messages longs :</strong> Les messages de plus de 160 caractères utilisent plusieurs crédits (153 caractères par SMS)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <div>
              <strong>Réductions :</strong> Économisez jusqu'à 40% avec les packs de gros volume
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <div>
              <strong>Facturation :</strong> Une facture vous est automatiquement envoyée par email après chaque achat
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
