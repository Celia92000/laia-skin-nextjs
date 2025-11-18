'use client'

import { useState, useEffect } from 'react'
import { Database, CheckCircle, AlertCircle, RefreshCw, Settings } from 'lucide-react'

export default function DatabaseMigrationPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/site-config/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'check_status' })
      })

      const data = await response.json()
      if (response.ok) {
        setStatus(data)
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la vérification' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    } finally {
      setLoading(false)
    }
  }

  const configureSiteConfig = async () => {
    if (!confirm('Voulez-vous configurer l\'organizationId dans SiteConfig ?')) return

    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/site-config/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'configure_site_config' })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        checkStatus()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la configuration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    } finally {
      setLoading(false)
    }
  }

  const migrateGiftCards = async () => {
    if (!confirm('Voulez-vous migrer toutes les cartes cadeaux vers votre organisation ?')) return

    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/site-config/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'migrate_gift_cards' })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        checkStatus()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la migration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Migration de données</h1>
        </div>
        <p className="text-gray-600">
          Gérez la configuration multi-tenant et migrez les données existantes
        </p>
      </div>

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

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* SiteConfig Status */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Configuration du site
              </h2>
              {status.siteConfig.hasOrganizationId ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-orange-600" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">OrganizationId configuré :</span>
                <span className={`font-semibold ${status.siteConfig.hasOrganizationId ? 'text-green-600' : 'text-orange-600'}`}>
                  {status.siteConfig.hasOrganizationId ? 'Oui ✓' : 'Non ✗'}
                </span>
              </div>
              {status.siteConfig.organizationId && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs font-mono break-all">
                  {status.siteConfig.organizationId}
                </div>
              )}
            </div>

            {!status.siteConfig.hasOrganizationId && (
              <button
                onClick={configureSiteConfig}
                disabled={loading}
                className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Configurer maintenant
              </button>
            )}
          </div>

          {/* Gift Cards Status */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Cartes cadeaux</h2>
              {status.giftCards.migrationNeeded ? (
                <AlertCircle className="w-6 h-6 text-orange-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total :</span>
                <span className="font-semibold">{status.giftCards.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avec organization :</span>
                <span className="font-semibold text-green-600">{status.giftCards.withOrganization}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sans organization :</span>
                <span className="font-semibold text-orange-600">{status.giftCards.withoutOrganization}</span>
              </div>
            </div>

            {status.giftCards.migrationNeeded && (
              <button
                onClick={migrateGiftCards}
                disabled={loading || !status.siteConfig.hasOrganizationId}
                className="w-full mt-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Migrer les cartes cadeaux
              </button>
            )}

            {!status.siteConfig.hasOrganizationId && status.giftCards.migrationNeeded && (
              <p className="mt-2 text-xs text-gray-500">
                * Configurez d'abord SiteConfig avant de migrer les données
              </p>
            )}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={checkStatus}
          disabled={loading}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir le statut
        </button>
      </div>

      {/* Documentation */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">📚 Documentation</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>1. Configurer SiteConfig :</strong> Associe la configuration du site à votre organisation</p>
          <p><strong>2. Migrer les cartes cadeaux :</strong> Rattache toutes les cartes cadeaux existantes à votre organisation</p>
          <p className="mt-3 text-xs text-blue-700">
            ⚠️ Ces opérations sont irréversibles. Assurez-vous de bien comprendre leur impact avant de les exécuter.
          </p>
        </div>
      </div>
    </div>
  )
}
