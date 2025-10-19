"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface OrganizationSettings {
  organization: {
    id: string
    name: string
    slug: string
    status: string
    plan: string
  }
  paymentSettings: {
    primaryProvider: string
    stripeConnectAccountId: string | null
    stripeLiveMode: boolean
    sumupEnabled: boolean
    sumupMerchantCode: string | null
  }
  bookingSettings: {
    advanceBookingHours: number
    cancellationHours: number
    requireDeposit: boolean
    depositPercentage: number
    sendConfirmationEmail: boolean
    sendReminderEmail: boolean
    reminderHoursBefore: number
    sendWhatsAppReminder: boolean
  }
  loyaltySettings: {
    isEnabled: boolean
    name: string
    currency: string
    pointsPerEuro: number
    minimumPointsToRedeem: number
    pointsExpirationMonths: number | null
  }
  organizationConfig: {
    siteName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    instagramUrl: string | null
    facebookUrl: string | null
    tiktokUrl: string | null
    whatsappNumber: string | null
  }
}

export default function OrganizationSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<OrganizationSettings | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'booking' | 'loyalty'>('general')

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch(`/api/super-admin/organizations/${params.id}/settings`)
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        } else if (response.status === 401) {
          router.push('/login?redirect=/super-admin')
        } else if (response.status === 403) {
          router.push('/admin')
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [params.id, router])

  async function handleSave() {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch(`/api/super-admin/organizations/${params.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Paramètres mis à jour avec succès')
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Paramètres non trouvés</h1>
          <Link href="/super-admin" className="text-purple-600 hover:text-purple-800 underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href={`/super-admin/organizations/${params.id}`}
            className="text-purple-200 hover:text-white mb-2 inline-block"
          >
            ← Retour à l'organisation
          </Link>
          <h1 className="text-3xl font-bold mb-2">Paramètres - {settings.organization.name}</h1>
          <p className="text-purple-100">Configuration complète de l'organisation</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'general'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Général
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'payment'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💳 Paiement
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'booking'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Réservations
            </button>
            <button
              onClick={() => setActiveTab('loyalty')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'loyalty'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⭐ Fidélité
            </button>
          </div>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={settings.organizationConfig.siteName}
                  onChange={(e) => setSettings({
                    ...settings,
                    organizationConfig: { ...settings.organizationConfig, siteName: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={settings.organizationConfig.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    organizationConfig: { ...settings.organizationConfig, email: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={settings.organizationConfig.phone}
                  onChange={(e) => setSettings({
                    ...settings,
                    organizationConfig: { ...settings.organizationConfig, phone: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={settings.organizationConfig.whatsappNumber || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    organizationConfig: { ...settings.organizationConfig, whatsappNumber: e.target.value }
                  })}
                  placeholder="+33612345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={settings.organizationConfig.address}
                  onChange={(e) => setSettings({
                    ...settings,
                    organizationConfig: { ...settings.organizationConfig, address: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={settings.organizationConfig.city}
                  onChange={(e) => setSettings({
                    ...settings,
                    organizationConfig: { ...settings.organizationConfig, city: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={settings.organizationConfig.postalCode}
                  onChange={(e) => setSettings({
                    ...settings,
                    organizationConfig: { ...settings.organizationConfig, postalCode: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={settings.organizationConfig.instagramUrl || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    organizationConfig: { ...settings.organizationConfig, instagramUrl: e.target.value }
                  })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={settings.organizationConfig.facebookUrl || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    organizationConfig: { ...settings.organizationConfig, facebookUrl: e.target.value }
                  })}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TikTok
                </label>
                <input
                  type="url"
                  value={settings.organizationConfig.tiktokUrl || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    organizationConfig: { ...settings.organizationConfig, tiktokUrl: e.target.value }
                  })}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Paramètres de paiement</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fournisseur principal
                </label>
                <select
                  value={settings.paymentSettings.primaryProvider}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentSettings: { ...settings.paymentSettings, primaryProvider: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="STRIPE">Stripe</option>
                  <option value="SUMUP">SumUp</option>
                  <option value="CASH">Espèces uniquement</option>
                </select>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Configuration Stripe</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID compte Stripe Connect
                    </label>
                    <input
                      type="text"
                      value={settings.paymentSettings.stripeConnectAccountId || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentSettings: { ...settings.paymentSettings, stripeConnectAccountId: e.target.value }
                      })}
                      placeholder="acct_..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="stripeLiveMode"
                      checked={settings.paymentSettings.stripeLiveMode}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentSettings: { ...settings.paymentSettings, stripeLiveMode: e.target.checked }
                      })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="stripeLiveMode" className="ml-2 block text-sm text-gray-700">
                      Mode production (Live)
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Configuration SumUp</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sumupEnabled"
                      checked={settings.paymentSettings.sumupEnabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentSettings: { ...settings.paymentSettings, sumupEnabled: e.target.checked }
                      })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sumupEnabled" className="ml-2 block text-sm text-gray-700">
                      Activer SumUp
                    </label>
                  </div>

                  {settings.paymentSettings.sumupEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code marchand SumUp
                      </label>
                      <input
                        type="text"
                        value={settings.paymentSettings.sumupMerchantCode || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          paymentSettings: { ...settings.paymentSettings, sumupMerchantCode: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Settings */}
        {activeTab === 'booking' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Paramètres de réservation</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Réservation à l'avance (heures)
                  </label>
                  <input
                    type="number"
                    value={settings.bookingSettings.advanceBookingHours}
                    onChange={(e) => setSettings({
                      ...settings,
                      bookingSettings: { ...settings.bookingSettings, advanceBookingHours: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum d'heures à l'avance pour réserver</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annulation (heures)
                  </label>
                  <input
                    type="number"
                    value={settings.bookingSettings.cancellationHours}
                    onChange={(e) => setSettings({
                      ...settings,
                      bookingSettings: { ...settings.bookingSettings, cancellationHours: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Heures avant pour annuler sans frais</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Acompte</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireDeposit"
                      checked={settings.bookingSettings.requireDeposit}
                      onChange={(e) => setSettings({
                        ...settings,
                        bookingSettings: { ...settings.bookingSettings, requireDeposit: e.target.checked }
                      })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requireDeposit" className="ml-2 block text-sm text-gray-700">
                      Exiger un acompte à la réservation
                    </label>
                  </div>

                  {settings.bookingSettings.requireDeposit && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pourcentage d'acompte (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.bookingSettings.depositPercentage}
                        onChange={(e) => setSettings({
                          ...settings,
                          bookingSettings: { ...settings.bookingSettings, depositPercentage: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendConfirmationEmail"
                      checked={settings.bookingSettings.sendConfirmationEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        bookingSettings: { ...settings.bookingSettings, sendConfirmationEmail: e.target.checked }
                      })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sendConfirmationEmail" className="ml-2 block text-sm text-gray-700">
                      Envoyer email de confirmation
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendReminderEmail"
                      checked={settings.bookingSettings.sendReminderEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        bookingSettings: { ...settings.bookingSettings, sendReminderEmail: e.target.checked }
                      })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sendReminderEmail" className="ml-2 block text-sm text-gray-700">
                      Envoyer email de rappel
                    </label>
                  </div>

                  {settings.bookingSettings.sendReminderEmail && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rappel avant (heures)
                      </label>
                      <input
                        type="number"
                        value={settings.bookingSettings.reminderHoursBefore}
                        onChange={(e) => setSettings({
                          ...settings,
                          bookingSettings: { ...settings.bookingSettings, reminderHoursBefore: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendWhatsAppReminder"
                      checked={settings.bookingSettings.sendWhatsAppReminder}
                      onChange={(e) => setSettings({
                        ...settings,
                        bookingSettings: { ...settings.bookingSettings, sendWhatsAppReminder: e.target.checked }
                      })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sendWhatsAppReminder" className="ml-2 block text-sm text-gray-700">
                      Envoyer rappel WhatsApp
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loyalty Settings */}
        {activeTab === 'loyalty' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Programme de fidélité</h2>
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="loyaltyEnabled"
                  checked={settings.loyaltySettings.isEnabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    loyaltySettings: { ...settings.loyaltySettings, isEnabled: e.target.checked }
                  })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="loyaltyEnabled" className="ml-2 block text-sm font-medium text-gray-700">
                  Activer le programme de fidélité
                </label>
              </div>

              {settings.loyaltySettings.isEnabled && (
                <div className="space-y-6 border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du programme
                      </label>
                      <input
                        type="text"
                        value={settings.loyaltySettings.name}
                        onChange={(e) => setSettings({
                          ...settings,
                          loyaltySettings: { ...settings.loyaltySettings, name: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monnaie
                      </label>
                      <input
                        type="text"
                        value={settings.loyaltySettings.currency}
                        onChange={(e) => setSettings({
                          ...settings,
                          loyaltySettings: { ...settings.loyaltySettings, currency: e.target.value }
                        })}
                        placeholder="Points, Étoiles, etc."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points par euro dépensé
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settings.loyaltySettings.pointsPerEuro}
                        onChange={(e) => setSettings({
                          ...settings,
                          loyaltySettings: { ...settings.loyaltySettings, pointsPerEuro: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points minimum pour échanger
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settings.loyaltySettings.minimumPointsToRedeem}
                        onChange={(e) => setSettings({
                          ...settings,
                          loyaltySettings: { ...settings.loyaltySettings, minimumPointsToRedeem: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiration des points (mois)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settings.loyaltySettings.pointsExpirationMonths || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          loyaltySettings: {
                            ...settings.loyaltySettings,
                            pointsExpirationMonths: e.target.value ? parseInt(e.target.value) : null
                          }
                        })}
                        placeholder="Laisser vide pour jamais"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <Link
            href={`/super-admin/organizations/${params.id}`}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Annuler
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </div>
    </div>
  )
}
