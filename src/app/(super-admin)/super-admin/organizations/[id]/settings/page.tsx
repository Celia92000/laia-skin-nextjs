"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrganizationSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organization, setOrganization] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [paymentSettings, setPaymentSettings] = useState<any>(null)
  const [loyaltyProgram, setLoyaltyProgram] = useState<any>(null)
  const [bookingSettings, setBookingSettings] = useState<any>(null)
  const [locations, setLocations] = useState<any[]>([])
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/super-admin/organizations/${id}/settings`)
        if (response.ok) {
          const data = await response.json()
          setOrganization(data.organization)
          setConfig(data.config || {})
          setPaymentSettings(data.paymentSettings || {})
          setLoyaltyProgram(data.loyaltyProgram || {})
          setBookingSettings(data.bookingSettings || {})
          setLocations(data.locations || [])
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
    fetchData()
  }, [id, router])

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`/api/super-admin/organizations/${id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          paymentSettings,
          loyaltyProgram,
          bookingSettings
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès !' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7c3aed' }}></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!organization || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Organisation non trouvée</h1>
          <Link href="/super-admin" className="text-indigo-600 hover:text-indigo-800 underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href={`/super-admin/organizations/${id}`} className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour à l'organisation
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              Paramètres de {organization.name}
            </h2>
            <p className="text-gray-700">Contrôle total des paramètres du client</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Info importante */}
        <div className="mb-8 p-6 rounded-xl border-2" style={{ borderColor: '#7c3aed', backgroundColor: '#faf7f3' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#7c3aed' }}>
            🔐 Contrôle Super Admin
          </h3>
          <p className="text-gray-700 mb-2">
            Vous pouvez modifier tous les paramètres de cette organisation. Les modifications seront immédiatement visibles sur leur site.
          </p>
          <p className="text-gray-700">
            <strong>Attention :</strong> Toutes les modifications ici écrasent les paramètres définis par le client dans son admin.
          </p>
        </div>

        <div className="space-y-8">
          {/* Informations de base */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
              Informations de base
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={config.siteName || ''}
                  onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slogan
                </label>
                <input
                  type="text"
                  value={config.siteTagline || ''}
                  onChange={(e) => setConfig({ ...config, siteTagline: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du site
                </label>
                <textarea
                  value={config.siteDescription || ''}
                  onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Informations légales et facturation */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
              Informations légales & Facturation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET *
                </label>
                <input
                  type="text"
                  value={config.siret || ''}
                  onChange={(e) => setConfig({ ...config, siret: e.target.value })}
                  pattern="[0-9]{14}"
                  maxLength={14}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  placeholder="14 chiffres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison sociale
                </label>
                <input
                  type="text"
                  value={config.legalName || ''}
                  onChange={(e) => setConfig({ ...config, legalName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° TVA intracommunautaire
                </label>
                <input
                  type="text"
                  value={config.tvaNumber || ''}
                  onChange={(e) => setConfig({ ...config, tvaNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code APE/NAF
                </label>
                <input
                  type="text"
                  value={config.apeCode || ''}
                  onChange={(e) => setConfig({ ...config, apeCode: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forme juridique
                </label>
                <input
                  type="text"
                  value={config.legalForm || ''}
                  onChange={(e) => setConfig({ ...config, legalForm: e.target.value })}
                  placeholder="SARL, SAS, EURL, etc."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capital social
                </label>
                <input
                  type="text"
                  value={config.capital || ''}
                  onChange={(e) => setConfig({ ...config, capital: e.target.value })}
                  placeholder="Ex: 10000€"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
              Coordonnées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={config.email || ''}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={config.phone || ''}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète
                </label>
                <input
                  type="text"
                  value={config.address || ''}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={config.city || ''}
                  onChange={(e) => setConfig({ ...config, city: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={config.postalCode || ''}
                  onChange={(e) => setConfig({ ...config, postalCode: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
              Réseaux sociaux
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={config.instagram || ''}
                  onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={config.facebook || ''}
                  onChange={(e) => setConfig({ ...config, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TikTok
                </label>
                <input
                  type="url"
                  value={config.tiktok || ''}
                  onChange={(e) => setConfig({ ...config, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={config.whatsapp || ''}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Couleurs du site */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
              Apparence du site
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur principale
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.primaryColor || '#7c3aed'}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="h-12 w-16 border-2 border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor || '#7c3aed'}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="#7c3aed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur secondaire
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.secondaryColor || '#2c3e50'}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="h-12 w-16 border-2 border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.secondaryColor || '#2c3e50'}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="#2c3e50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur d'accent
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.accentColor || '#20b2aa'}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="h-12 w-16 border-2 border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.accentColor || '#20b2aa'}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="#20b2aa"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Horaires d'ouverture */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
              Horaires d'ouverture
            </h2>
            <div className="space-y-4">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day, index) => {
                const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index]
                const hours = config.businessHours?.[dayKey] || { open: '09:00', close: '18:00', closed: false }
                return (
                  <div key={dayKey} className="flex items-center gap-4">
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700">{day}</label>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => setConfig({
                          ...config,
                          businessHours: {
                            ...config.businessHours,
                            [dayKey]: { ...hours, closed: !e.target.checked }
                          }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Ouvert</span>
                    </label>
                    {!hours.closed && (
                      <>
                        <input
                          type="time"
                          value={hours.open || '09:00'}
                          onChange={(e) => setConfig({
                            ...config,
                            businessHours: {
                              ...config.businessHours,
                              [dayKey]: { ...hours, open: e.target.value }
                            }
                          })}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg"
                        />
                        <span className="text-gray-500">à</span>
                        <input
                          type="time"
                          value={hours.close || '18:00'}
                          onChange={(e) => setConfig({
                            ...config,
                            businessHours: {
                              ...config.businessHours,
                              [dayKey]: { ...hours, close: e.target.value }
                            }
                          })}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Paramètres de paiement */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
              Paramètres de paiement
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentSettings?.onlinePaymentEnabled ?? true}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, onlinePaymentEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Activer le paiement en ligne</span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentSettings?.onSitePaymentEnabled ?? true}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, onSitePaymentEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Activer le paiement sur place</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Compte Stripe
                </label>
                <input
                  type="text"
                  value={paymentSettings?.stripeAccountId || ''}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeAccountId: e.target.value })}
                  placeholder="acct_..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentSettings?.stripeLiveMode ?? false}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeLiveMode: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Mode production Stripe (⚠️ attention)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Programme de fidélité */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
              Programme de fidélité
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={loyaltyProgram?.enabled ?? false}
                    onChange={(e) => setLoyaltyProgram({ ...loyaltyProgram, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Activer le programme de fidélité</span>
                </label>
              </div>
              {loyaltyProgram?.enabled && (
                <>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points par euro dépensé
                      </label>
                      <input
                        type="number"
                        value={loyaltyProgram?.pointsPerEuro || 1}
                        onChange={(e) => setLoyaltyProgram({ ...loyaltyProgram, pointsPerEuro: parseFloat(e.target.value) })}
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valeur d'un point (€)
                      </label>
                      <input
                        type="number"
                        value={loyaltyProgram?.pointValue || 0.01}
                        onChange={(e) => setLoyaltyProgram({ ...loyaltyProgram, pointValue: parseFloat(e.target.value) })}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points minimum pour utiliser
                      </label>
                      <input
                        type="number"
                        value={loyaltyProgram?.minPointsForRedemption || 100}
                        onChange={(e) => setLoyaltyProgram({ ...loyaltyProgram, minPointsForRedemption: parseInt(e.target.value) })}
                        min="0"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Paramètres de réservation */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
              Paramètres de réservation
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Délai minimum de réservation (heures)
                </label>
                <input
                  type="number"
                  value={bookingSettings?.minBookingDelay || 24}
                  onChange={(e) => setBookingSettings({ ...bookingSettings, minBookingDelay: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Délai maximum de réservation (jours)
                </label>
                <input
                  type="number"
                  value={bookingSettings?.maxBookingDelay || 90}
                  onChange={(e) => setBookingSettings({ ...bookingSettings, maxBookingDelay: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée du créneau (minutes)
                </label>
                <input
                  type="number"
                  value={bookingSettings?.slotDuration || 30}
                  onChange={(e) => setBookingSettings({ ...bookingSettings, slotDuration: parseInt(e.target.value) })}
                  min="15"
                  step="15"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Délai d'annulation (heures)
                </label>
                <input
                  type="number"
                  value={bookingSettings?.cancellationDeadline || 24}
                  onChange={(e) => setBookingSettings({ ...bookingSettings, cancellationDeadline: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                />
              </div>
              <div className="col-span-2 space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bookingSettings?.autoConfirm ?? true}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, autoConfirm: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Confirmation automatique des réservations</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bookingSettings?.requireDeposit ?? false}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, requireDeposit: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Exiger un acompte</span>
                </label>
                {bookingSettings?.requireDeposit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pourcentage d'acompte (%)
                    </label>
                    <input
                      type="number"
                      value={bookingSettings?.depositPercentage || 30}
                      onChange={(e) => setBookingSettings({ ...bookingSettings, depositPercentage: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Établissements */}
          {locations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
                Établissements ({locations.length})
              </h2>
              <div className="space-y-4">
                {locations.map((location: any) => (
                  <div key={location.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{location.name}</h3>
                          {location.isMainLocation && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                              Principal
                            </span>
                          )}
                          {!location.active && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                              Inactif
                            </span>
                          )}
                        </div>
                        {location.address && (
                          <p className="text-sm text-gray-600 mt-1">
                            {location.address}, {location.postalCode} {location.city}
                          </p>
                        )}
                        {location.phone && (
                          <p className="text-sm text-gray-500 mt-1">📞 {location.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                ℹ️ La gestion des établissements se fait dans l'interface admin du client.
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              href={`/super-admin/organizations/${id}`}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Annuler
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #e8b4b8 100%)'
              }}
            >
              {saving ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
