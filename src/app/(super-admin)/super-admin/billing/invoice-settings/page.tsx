'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface InvoiceSettings {
  id: string
  isCompany: boolean
  legalStatus: string
  companyName: string
  address: string
  postalCode: string
  city: string
  country: string
  siret: string
  tvaNumber: string
  capitalSocial: string
  rcs: string
  apeCode: string
  email: string
  phone: string
  website: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  invoicePrefix: string
  tvaRate: number
  paymentTerms: string
  latePenalty: string
  footerText: string
  contractArticle1: string
  contractArticle3: string
  contractArticle4: string
  contractArticle6: string
}

export default function InvoiceSettingsPage() {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/super-admin/invoice-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      } else {
        setMessage({ type: 'error', text: 'Impossible de charger les paramètres' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/super-admin/invoice-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès !' })
        setSettings(data.settings)
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'enregistrement' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur réseau' })
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof InvoiceSettings, value: any) {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Impossible de charger les paramètres de facturation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/super-admin/billing" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la facturation
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres de facturation</h1>
        <p className="text-gray-600 mt-2">
          Configurez les informations qui apparaîtront sur vos factures et contrats
        </p>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Statut juridique */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Statut juridique</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.isCompany}
                  onChange={(e) => updateField('isCompany', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Entreprise (société)</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">Cochez si vous êtes une société (SARL, SAS, etc.)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut juridique
              </label>
              <select
                value={settings.legalStatus}
                onChange={(e) => updateField('legalStatus', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Auto-Entrepreneur">Auto-Entrepreneur</option>
                <option value="SARL">SARL</option>
                <option value="SAS">SAS</option>
                <option value="SASU">SASU</option>
                <option value="EURL">EURL</option>
                <option value="SA">SA</option>
                <option value="SCI">SCI</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Coordonnées */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Coordonnées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => updateField('address', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal *
              </label>
              <input
                type="text"
                value={settings.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => updateField('city', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays *
              </label>
              <input
                type="text"
                value={settings.country}
                onChange={(e) => updateField('country', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                type="url"
                value={settings.website}
                onChange={(e) => updateField('website', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Informations légales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations légales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SIRET * <span className="text-xs text-gray-500">(14 chiffres)</span>
              </label>
              <input
                type="text"
                value={settings.siret}
                onChange={(e) => updateField('siret', e.target.value)}
                pattern="\d{14}"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de TVA intracommunautaire
              </label>
              <input
                type="text"
                value={settings.tvaNumber}
                onChange={(e) => updateField('tvaNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code APE/NAF
              </label>
              <input
                type="text"
                value={settings.apeCode}
                onChange={(e) => updateField('apeCode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capital social
              </label>
              <input
                type="text"
                value={settings.capitalSocial}
                onChange={(e) => updateField('capitalSocial', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RCS
              </label>
              <input
                type="text"
                value={settings.rcs}
                onChange={(e) => updateField('rcs', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mentions légales (pied de page)
              </label>
              <textarea
                value={settings.footerText}
                onChange={(e) => updateField('footerText', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Paramètres de facturation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Paramètres de facturation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Préfixe des factures
              </label>
              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(e) => updateField('invoicePrefix', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de TVA (%) <span className="text-xs text-gray-500">0 si non assujetti</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.tvaRate}
                onChange={(e) => updateField('tvaRate', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conditions de paiement
              </label>
              <textarea
                value={settings.paymentTerms}
                onChange={(e) => updateField('paymentTerms', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pénalités de retard
              </label>
              <textarea
                value={settings.latePenalty}
                onChange={(e) => updateField('latePenalty', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Apparence */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Apparence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur principale
              </label>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur secondaire
              </label>
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => updateField('secondaryColor', e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du logo
              </label>
              <input
                type="url"
                value={settings.logoUrl || ''}
                onChange={(e) => updateField('logoUrl', e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Articles de contrat */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Articles de contrat (templates)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Ces textes apparaîtront dans les contrats générés automatiquement
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article 1 - Objet du contrat
              </label>
              <textarea
                value={settings.contractArticle1}
                onChange={(e) => updateField('contractArticle1', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article 3 - Période d'essai
              </label>
              <textarea
                value={settings.contractArticle3}
                onChange={(e) => updateField('contractArticle3', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article 4 - Durée et résiliation
              </label>
              <textarea
                value={settings.contractArticle4}
                onChange={(e) => updateField('contractArticle4', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article 6 - CGV
              </label>
              <textarea
                value={settings.contractArticle6}
                onChange={(e) => updateField('contractArticle6', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Bouton d'enregistrement */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer les paramètres
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
