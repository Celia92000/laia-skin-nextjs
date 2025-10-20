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
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/super-admin/organizations/${id}/settings`)
        if (response.ok) {
          const data = await response.json()
          setOrganization(data.organization)
          setConfig(data.config || {})
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
        body: JSON.stringify({ config })
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#d4b5a0' }}></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-md" style={{ backgroundColor: '#d4b5a0' }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href={`/super-admin/organizations/${params.id}`}
            className="text-white/90 hover:text-white mb-2 inline-block"
          >
            ← Retour à l'organisation
          </Link>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            ⚙️ Paramètres de {organization.name}
          </h1>
          <p className="text-white/90">Contrôle total des paramètres du client</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
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
        <div className="mb-8 p-6 rounded-xl border-2" style={{ borderColor: '#d4b5a0', backgroundColor: '#faf7f3' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#d4b5a0' }}>
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#d4b5a0' }}>
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: '#d4b5a0' }}
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#d4b5a0' }}>
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#d4b5a0' }}>
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#d4b5a0' }}>
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#d4b5a0' }}>
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
                    value={config.primaryColor || '#d4b5a0'}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="h-12 w-16 border-2 border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor || '#d4b5a0'}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="#d4b5a0"
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

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              href={`/super-admin/organizations/${params.id}`}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Annuler
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #d4b5a0 0%, #e8b4b8 100%)'
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
