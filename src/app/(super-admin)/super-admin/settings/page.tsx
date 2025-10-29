"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [settings, setSettings] = useState({
    platformName: '',
    supportEmail: '',
    supportUrl: '',
    maintenanceMode: false,
    maxOrganizations: 1000,
    defaultStorageLimit: 5,
    trialDurationDays: 14,
    // Couleurs du thème
    primaryColor: '#d4a574',
    roseColor: '#e8b4b8',
    nudeColor: '#f5e6d3',
    darkColor: '#2c1810'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    try {
      const response = await fetch('/api/super-admin/settings')
      if (response.ok) {
        const data = await response.json()
        // Mapper les settings du serveur
        setSettings({
          platformName: data.settings.platformName?.value || 'Laia Skin Multi-Tenant',
          supportEmail: data.settings.supportEmail?.value || 'support@laiaskin.com',
          supportUrl: data.settings.supportUrl?.value || 'https://support.laiaskin.com',
          maintenanceMode: data.settings.maintenanceMode?.value || false,
          maxOrganizations: data.settings.maxOrganizations?.value || 1000,
          defaultStorageLimit: data.settings.defaultStorageLimit?.value || 5,
          trialDurationDays: data.settings.trialDurationDays?.value || 14,
          primaryColor: data.settings.primaryColor?.value || '#d4a574',
          roseColor: data.settings.roseColor?.value || '#e8b4b8',
          nudeColor: data.settings.nudeColor?.value || '#f5e6d3',
          darkColor: data.settings.darkColor?.value || '#2c1810'
        })
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

  async function saveSetting(key: string, value: any, description: string) {
    try {
      const response = await fetch('/api/super-admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description })
      })
      if (!response.ok) {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error(`Error saving ${key}:`, error)
      throw error
    }
  }

  async function handleSaveAll() {
    setSaving(true)
    try {
      await Promise.all([
        saveSetting('platformName', settings.platformName, 'Nom de la plateforme'),
        saveSetting('supportEmail', settings.supportEmail, 'Email de support'),
        saveSetting('supportUrl', settings.supportUrl, 'URL du support'),
        saveSetting('maintenanceMode', settings.maintenanceMode, 'Mode maintenance actif'),
        saveSetting('maxOrganizations', settings.maxOrganizations, 'Limite globale d\'organisations'),
        saveSetting('defaultStorageLimit', settings.defaultStorageLimit, 'Limite de stockage par défaut (GB)'),
        saveSetting('trialDurationDays', settings.trialDurationDays, 'Durée de la période d\'essai (jours)'),
        saveSetting('primaryColor', settings.primaryColor, 'Couleur principale'),
        saveSetting('roseColor', settings.roseColor, 'Couleur rose poudré'),
        saveSetting('nudeColor', settings.nudeColor, 'Couleur nude'),
        saveSetting('darkColor', settings.darkColor, 'Couleur sombre')
      ])
      // Mettre à jour les variables CSS
      document.documentElement.style.setProperty('--laia-primary', settings.primaryColor)
      document.documentElement.style.setProperty('--laia-rose', settings.roseColor)
      document.documentElement.style.setProperty('--laia-nude', settings.nudeColor)
      document.documentElement.style.setProperty('--laia-dark', settings.darkColor)
      alert('Paramètres enregistrés avec succès')
    } catch (error) {
      alert('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7c3aed' }}></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #7c3aed, #6b46c1)' }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/super-admin" className="text-white/80 hover:text-white mb-2 inline-block">
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">⚙️ Configuration Plateforme</h1>
              <p className="text-white/90">Paramètres globaux de la plateforme multi-tenant</p>
            </div>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-6 py-3 bg-white rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
              style={{ color: '#7c3aed' }}
            >
              {saving ? '💾 Enregistrement...' : '💾 Enregistrer tout'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Paramètres généraux */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Paramètres généraux</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la plateforme
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="Laia Skin Multi-Tenant"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nom affiché dans l'interface et les emails
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de support
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="support@laiaskin.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email affiché pour le support technique
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL du support
              </label>
              <input
                type="url"
                value={settings.supportUrl}
                onChange={(e) => setSettings({ ...settings, supportUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="https://support.laiaskin.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL de la page de support ou documentation
              </p>
            </div>
          </div>
        </div>

        {/* Limites globales */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Limites globales</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum d'organisations
              </label>
              <input
                type="number"
                value={settings.maxOrganizations}
                onChange={(e) => setSettings({ ...settings, maxOrganizations: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Limite du nombre total d'organisations sur la plateforme
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stockage par défaut (GB)
              </label>
              <input
                type="number"
                value={settings.defaultStorageLimit}
                onChange={(e) => setSettings({ ...settings, defaultStorageLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Limite de stockage par défaut pour les nouvelles organisations (en GB)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée de l'essai (jours)
              </label>
              <input
                type="number"
                value={settings.trialDurationDays}
                onChange={(e) => setSettings({ ...settings, trialDurationDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                min="1"
                max="90"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nombre de jours pour la période d'essai gratuite
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Maintenance</h2>

          <div className="flex items-start">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-5 h-5 rounded focus:ring-2 focus:ring-amber-500 mt-0.5"
              style={{ color: '#7c3aed' }}
            />
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                Mode maintenance activé
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Lorsque activé, seuls les super admins peuvent accéder à la plateforme.
                Un message de maintenance sera affiché aux autres utilisateurs.
              </p>
            </div>
          </div>

          {settings.maintenanceMode && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="text-yellow-600 text-xl mr-2">⚠️</div>
                <div>
                  <div className="text-sm font-medium text-yellow-800">Mode maintenance actif</div>
                  <div className="text-xs text-yellow-700 mt-1">
                    La plateforme est actuellement inaccessible pour tous les utilisateurs sauf les super admins.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Personnalisation des couleurs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">🎨 Personnalisation des couleurs</h2>
          <p className="text-sm text-gray-600 mb-6">
            Personnalisez la palette de couleurs de l'interface Super Admin.
            Les changements seront appliqués immédiatement après l'enregistrement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur principale (Or rose)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="#d4a574"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Utilisée pour les éléments principaux et boutons</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur rose poudré
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.roseColor}
                  onChange={(e) => setSettings({ ...settings, roseColor: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.roseColor}
                  onChange={(e) => setSettings({ ...settings, roseColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="#e8b4b8"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Utilisée pour les accents et dégradés</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur nude (fond)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.nudeColor}
                  onChange={(e) => setSettings({ ...settings, nudeColor: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.nudeColor}
                  onChange={(e) => setSettings({ ...settings, nudeColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="#f5e6d3"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Utilisée pour les arrière-plans</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur sombre (textes)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.darkColor}
                  onChange={(e) => setSettings({ ...settings, darkColor: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.darkColor}
                  onChange={(e) => setSettings({ ...settings, darkColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="#2c1810"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Utilisée pour les textes et titres</p>
            </div>
          </div>

          {/* Aperçu des couleurs */}
          <div className="mt-6 p-6 rounded-lg border-2 border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Aperçu</h3>
            <div className="flex gap-4 items-center">
              <div
                className="w-24 h-24 rounded-lg shadow-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Primary
              </div>
              <div
                className="w-24 h-24 rounded-lg shadow-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.roseColor }}
              >
                Rose
              </div>
              <div
                className="w-24 h-24 rounded-lg shadow-lg flex items-center justify-center font-bold"
                style={{
                  backgroundColor: settings.nudeColor,
                  color: settings.darkColor
                }}
              >
                Nude
              </div>
              <div
                className="w-24 h-24 rounded-lg shadow-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.darkColor }}
              >
                Dark
              </div>
            </div>
          </div>

          {/* Bouton reset */}
          <div className="mt-6">
            <button
              onClick={() => setSettings({
                ...settings,
                primaryColor: '#d4a574',
                roseColor: '#e8b4b8',
                nudeColor: '#f5e6d3',
                darkColor: '#2c1810'
              })}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              🔄 Réinitialiser les couleurs par défaut
            </button>
          </div>
        </div>

        {/* Informations système */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">ℹ️ Informations système</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-blue-700 font-medium">Environnement</div>
              <div className="text-blue-900">{process.env.NODE_ENV || 'development'}</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">Version</div>
              <div className="text-blue-900">1.0.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
