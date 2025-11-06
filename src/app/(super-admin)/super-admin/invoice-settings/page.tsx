"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InvoiceSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    // Statut juridique
    isCompany: false,
    legalStatus: 'Auto-Entrepreneur',

    // Informations émetteur
    companyName: 'LAIA Connect',
    address: '[Votre adresse]',
    postalCode: '[Code postal]',
    city: '[Ville]',
    country: 'France',
    siret: '[Votre SIRET]',
    tvaNumber: '',
    capitalSocial: '',
    rcs: '',
    apeCode: '6201Z',

    // Contact
    email: '[Votre email]',
    phone: '[Votre téléphone]',
    website: 'https://www.laia-connect.fr',

    // Design
    logoUrl: '',
    primaryColor: '#7c3aed',
    secondaryColor: '#c9a88e',

    // Paramètres
    invoicePrefix: 'LAIA',
    tvaRate: 0.0,

    // Mentions légales
    paymentTerms: 'Prélèvement SEPA automatique',
    latePenalty: 'En cas de retard de paiement, indemnité forfaitaire de 40€',
    footerText: 'Dispensé d\'immatriculation au RCS et au RM',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/super-admin/invoice-settings')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setSettings(data)
        }
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/super-admin/invoice-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        alert('✅ Paramètres sauvegardés avec succès !')
      } else {
        alert('❌ Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Paramètres de Facturation</h1>
        <p className="text-gray-600">Configurez les informations qui apparaîtront sur vos factures LAIA</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Statut Juridique */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⚖️ Statut Juridique
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!settings.isCompany}
                  onChange={() => setSettings({
                    ...settings,
                    isCompany: false,
                    legalStatus: 'Auto-Entrepreneur',
                    tvaRate: 0.0,
                    tvaNumber: '',
                    capitalSocial: '',
                    rcs: '',
                    footerText: 'Dispensé d\'immatriculation au RCS et au RM'
                  })}
                  className="w-4 h-4"
                />
                <span className="font-medium">Auto-Entrepreneur</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={settings.isCompany}
                  onChange={() => setSettings({
                    ...settings,
                    isCompany: true,
                    legalStatus: 'Société',
                    tvaRate: 20.0,
                    footerText: ''
                  })}
                  className="w-4 h-4"
                />
                <span className="font-medium">Société (SARL, SAS, etc.)</span>
              </label>
            </div>

            {!settings.isCompany && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-yellow-800 mb-1">💡 Mode Auto-Entrepreneur :</p>
                <ul className="text-yellow-700 space-y-1 list-disc list-inside">
                  <li>TVA non applicable (art. 293 B du CGI)</li>
                  <li>Pas de numéro de TVA intracommunautaire requis</li>
                  <li>Dispensé d'immatriculation au RCS et au RM</li>
                </ul>
              </div>
            )}

            {settings.isCompany && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-800 mb-1">🏢 Mode Société :</p>
                <ul className="text-blue-700 space-y-1 list-disc list-inside">
                  <li>TVA applicable (par défaut 20%)</li>
                  <li>Numéro de TVA intracommunautaire requis</li>
                  <li>RCS et capital social à renseigner</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Informations Émetteur */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🏢 Informations de l'Entreprise LAIA
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SIRET *
              </label>
              <input
                type="text"
                value={settings.siret}
                onChange={(e) => setSettings({ ...settings, siret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code APE *
              </label>
              <input
                type="text"
                value={settings.apeCode}
                onChange={(e) => setSettings({ ...settings, apeCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
                placeholder="Ex: 6201Z"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal *
              </label>
              <input
                type="text"
                value={settings.postalCode}
                onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays *
              </label>
              <input
                type="text"
                value={settings.country}
                onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {settings.isCompany && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N° TVA Intracommunautaire *
                  </label>
                  <input
                    type="text"
                    value={settings.tvaNumber || ''}
                    onChange={(e) => setSettings({ ...settings, tvaNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required={settings.isCompany}
                    placeholder="Ex: FR12345678901"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capital Social *
                  </label>
                  <input
                    type="text"
                    value={settings.capitalSocial || ''}
                    onChange={(e) => setSettings({ ...settings, capitalSocial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required={settings.isCompany}
                    placeholder="Ex: 10 000 €"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RCS *
                  </label>
                  <input
                    type="text"
                    value={settings.rcs || ''}
                    onChange={(e) => setSettings({ ...settings, rcs: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required={settings.isCompany}
                    placeholder="Ex: Paris B 123 456 789"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📧 Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                type="url"
                value={settings.website || ''}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Design */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🎨 Design
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du logo
              </label>
              <input
                type="url"
                value={settings.logoUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur principale
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="h-10 w-16 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur secondaire
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="h-10 w-16 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paramètres Facture */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            💰 Paramètres de Facturation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Préfixe des factures *
              </label>
              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Ex: LAIA-2025-001234</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de TVA (%) *
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.tvaRate}
                onChange={(e) => setSettings({ ...settings, tvaRate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
                disabled={!settings.isCompany}
                title={!settings.isCompany ? 'TVA non applicable en Auto-Entrepreneur' : ''}
              />
              {!settings.isCompany && (
                <p className="text-xs text-gray-500 mt-1">TVA non applicable (art. 293 B du CGI)</p>
              )}
            </div>
          </div>
        </div>

        {/* Mentions Légales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📝 Mentions Légales
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conditions de paiement
              </label>
              <input
                type="text"
                value={settings.paymentTerms}
                onChange={(e) => setSettings({ ...settings, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pénalités de retard
              </label>
              <textarea
                value={settings.latePenalty}
                onChange={(e) => setSettings({ ...settings, latePenalty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texte pied de page
              </label>
              <input
                type="text"
                value={settings.footerText || ''}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/super-admin')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  )
}
