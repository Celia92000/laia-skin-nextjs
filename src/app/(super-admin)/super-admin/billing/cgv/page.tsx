'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Download, Eye, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface CGVContent {
  id: string
  version: string
  lastUpdated: string
  companyName: string
  companyAddress: string
  companyPostalCode: string
  companyCity: string
  companySiret: string
  companyEmail: string
  companyPhone: string
  companyWebsite: string
  // Tarifs
  priceSolo: number
  priceDuo: number
  priceTeam: number
  pricePremium: number
  tvaRate: number
  trialDays: number
  // Clauses modifiables
  supportResponseTime: string
  dataRetentionDays: number
  liabilityCapMonths: number
  modificationNoticeDays: number
  priceChangeNoticeDays: number
}

const defaultCGV: CGVContent = {
  id: '',
  version: '1.0',
  lastUpdated: new Date().toISOString(),
  companyName: 'LAIA Connect',
  companyAddress: '65 rue de la Croix',
  companyPostalCode: '92000',
  companyCity: 'Nanterre',
  companySiret: '988 691 937 00001',
  companyEmail: 'contact@laiaconnect.fr',
  companyPhone: '',
  companyWebsite: 'https://www.laiaconnect.fr',
  priceSolo: 49,
  priceDuo: 69,
  priceTeam: 119,
  pricePremium: 179,
  tvaRate: 20,
  trialDays: 30,
  supportResponseTime: '48h ouvrées',
  dataRetentionDays: 30,
  liabilityCapMonths: 3,
  modificationNoticeDays: 30,
  priceChangeNoticeDays: 60,
}

export default function CGVManagementPage() {
  const [cgv, setCgv] = useState<CGVContent>(defaultCGV)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchCGV()
  }, [])

  async function fetchCGV() {
    try {
      const res = await fetch('/api/super-admin/cgv')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setCgv({ ...defaultCGV, ...data })
        }
      }
    } catch (error) {
      console.error('Erreur chargement CGV:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/super-admin/cgv', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cgv,
          version: incrementVersion(cgv.version),
          lastUpdated: new Date().toISOString()
        })
      })

      if (res.ok) {
        const data = await res.json()
        setCgv(data)
        setMessage({ type: 'success', text: 'CGV mises à jour avec succès ! Les nouvelles conditions sont effectives immédiatement.' })
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur réseau' })
    } finally {
      setSaving(false)
    }
  }

  function incrementVersion(version: string): string {
    const parts = version.split('.')
    const minor = parseInt(parts[1] || '0') + 1
    return `${parts[0]}.${minor}`
  }

  async function downloadPDF() {
    setDownloading(true)
    try {
      const res = await fetch('/api/super-admin/cgv/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cgv)
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `CGV_LAIA_Connect_v${cgv.version}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la génération du PDF' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur réseau' })
    } finally {
      setDownloading(false)
    }
  }

  function updateField(field: keyof CGVContent, value: any) {
    setCgv({ ...cgv, [field]: value })
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/super-admin/billing" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la facturation
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conditions Générales de Vente</h1>
            <p className="text-gray-600 mt-2">
              Gérez et personnalisez vos CGV. Les modifications sont appliquées immédiatement.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/cgv-laia-connect"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Eye className="w-5 h-5" />
              Voir en ligne
            </Link>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Génération...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Télécharger PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Version info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-purple-700">Version actuelle :</span>
            <span className="ml-2 font-bold text-purple-900">v{cgv.version}</span>
          </div>
          <div className="text-sm text-purple-700">
            Dernière mise à jour : {new Date(cgv.lastUpdated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
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
        {/* Section 1: Informations de l'entreprise */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🏢</span> Informations de l'entreprise
          </h2>
          <p className="text-sm text-gray-600 mb-4">Ces informations apparaissent dans l'Article 18 (Contact)</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={cgv.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SIRET *
              </label>
              <input
                type="text"
                value={cgv.companySiret}
                onChange={(e) => updateField('companySiret', e.target.value)}
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
                value={cgv.companyAddress}
                onChange={(e) => updateField('companyAddress', e.target.value)}
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
                value={cgv.companyPostalCode}
                onChange={(e) => updateField('companyPostalCode', e.target.value)}
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
                value={cgv.companyCity}
                onChange={(e) => updateField('companyCity', e.target.value)}
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
                value={cgv.companyEmail}
                onChange={(e) => updateField('companyEmail', e.target.value)}
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
                value={cgv.companyPhone}
                onChange={(e) => updateField('companyPhone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                type="url"
                value={cgv.companyWebsite}
                onChange={(e) => updateField('companyWebsite', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Tarification */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💰</span> Tarification (Article 4)
          </h2>
          <p className="text-sm text-gray-600 mb-4">Modifiez les prix des abonnements affichés dans les CGV</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SOLO (€ HT/mois)
              </label>
              <input
                type="number"
                value={cgv.priceSolo}
                onChange={(e) => updateField('priceSolo', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DUO (€ HT/mois)
              </label>
              <input
                type="number"
                value={cgv.priceDuo}
                onChange={(e) => updateField('priceDuo', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TEAM (€ HT/mois)
              </label>
              <input
                type="number"
                value={cgv.priceTeam}
                onChange={(e) => updateField('priceTeam', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PREMIUM (€ HT/mois)
              </label>
              <input
                type="number"
                value={cgv.pricePremium}
                onChange={(e) => updateField('pricePremium', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de TVA (%)
              </label>
              <input
                type="number"
                value={cgv.tvaRate}
                onChange={(e) => updateField('tvaRate', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Période d'essai (jours)
              </label>
              <input
                type="number"
                value={cgv.trialDays}
                onChange={(e) => updateField('trialDays', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Clauses importantes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span> Clauses importantes
          </h2>
          <p className="text-sm text-gray-600 mb-4">Paramètres clés mentionnés dans les CGV</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Délai de réponse support (Article 8.3)
              </label>
              <input
                type="text"
                value={cgv.supportResponseTime}
                onChange={(e) => updateField('supportResponseTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: 48h ouvrées"
              />
              <p className="text-xs text-gray-500 mt-1">Mentionné dans la section Support Technique</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conservation données post-résiliation (jours) (Article 7.4)
              </label>
              <input
                type="number"
                value={cgv.dataRetentionDays}
                onChange={(e) => updateField('dataRetentionDays', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Période pendant laquelle le client peut récupérer ses données</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plafond responsabilité (mois) (Article 11.3)
              </label>
              <input
                type="number"
                value={cgv.liabilityCapMonths}
                onChange={(e) => updateField('liabilityCapMonths', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Limite de responsabilité = X derniers mois facturés</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Préavis modification CGV (jours) (Article 2)
              </label>
              <input
                type="number"
                value={cgv.modificationNoticeDays}
                onChange={(e) => updateField('modificationNoticeDays', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Délai d'information avant modification des CGV</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Préavis modification tarifs (jours) (Article 4)
              </label>
              <input
                type="number"
                value={cgv.priceChangeNoticeDays}
                onChange={(e) => updateField('priceChangeNoticeDays', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Délai d'information avant changement de tarif</p>
            </div>
          </div>
        </div>

        {/* Avertissement légal */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Important - Mentions légales</h3>
              <p className="text-sm text-amber-800 mt-1">
                Les CGV constituent un document contractuel. Toute modification substantielle doit être communiquée aux clients existants selon le préavis défini ({cgv.modificationNoticeDays} jours).
              </p>
              <p className="text-sm text-amber-800 mt-2">
                Pour des modifications majeures (changement de tarifs, limitation de responsabilité, etc.), consultez un avocat spécialisé.
              </p>
            </div>
          </div>
        </div>

        {/* Bouton d'enregistrement */}
        <div className="flex justify-end gap-4">
          <Link
            href="/super-admin/billing"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </Link>
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
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
