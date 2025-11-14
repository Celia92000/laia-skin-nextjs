'use client'

import { useState, useEffect } from 'react'
import { Mail, CheckCircle, AlertCircle, Save, Eye, EyeOff, Globe } from 'lucide-react'

interface Integration {
  id: string
  type: string
  enabled: boolean
  config: any
  status: string
  displayName?: string
  description?: string
}

interface Organization {
  id: string
  name: string
}

export default function AdminEmailConfigTab() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [integration, setIntegration] = useState<Integration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  const [formData, setFormData] = useState({
    resendApiKey: '',
    senderEmail: '',
    senderName: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch organization
      const orgResponse = await fetch('/api/admin/organization')
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganization(orgData.organization)
      }

      // Fetch email integration
      const token = localStorage.getItem('token')
      const intResponse = await fetch('/api/admin/integrations?type=resend', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (intResponse.ok) {
        const intData = await intResponse.json()
        if (intData.integration) {
          setIntegration(intData.integration)
          setFormData({
            resendApiKey: intData.integration.config?.apiKey || '',
            senderEmail: intData.integration.config?.senderEmail || '',
            senderName: intData.integration.config?.senderName || ''
          })
        }
      }
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'resend',
          enabled: true,
          config: {
            apiKey: formData.resendApiKey,
            senderEmail: formData.senderEmail,
            senderName: formData.senderName
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Configuration Email enregistrée avec succès !')
        setIntegration(data.integration)
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(data.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/integrations/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'resend',
          config: {
            apiKey: formData.resendApiKey,
            senderEmail: formData.senderEmail,
            senderName: formData.senderName
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('✅ Connexion Resend réussie !')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(data.error || 'Erreur de connexion')
      }
    } catch (error) {
      setError('Erreur de connexion')
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

  const isConfigured = integration && integration.enabled

  return (
    <div className="space-y-6">
      {/* Message d'activation si pas configuré */}
      {!isConfigured && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Activez le module Emailing
              </h3>

              <p className="text-gray-700 mb-6 text-lg">
                Envoyez des emails professionnels à vos clients : confirmations de rendez-vous,
                newsletters, promotions et bien plus encore.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Emails Transactionnels</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Confirmations, rappels, factures
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Newsletters</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Campagnes marketing ciblées
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Automatisations</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Emails automatiques d'anniversaire, relance
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">
                      Pour activer ce service
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Configurez votre compte Resend ci-dessous. Resend offre 3000 emails gratuits par mois !
                      L'onglet Emailing apparaîtra automatiquement dans votre tableau de bord.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de configuration */}
      <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-500" />
          Configuration Resend (Emails)
        </h3>

        {/* Messages */}
        {success && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Clé API Resend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clé API Resend <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.resendApiKey}
                onChange={(e) => setFormData({ ...formData, resendApiKey: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Obtenez votre clé API sur <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">resend.com/api-keys</a>
            </p>
          </div>

          {/* Email expéditeur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email expéditeur <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.senderEmail}
              onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="contact@votre-domaine.fr"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Domaine vérifié dans Resend requis (ex: contact@votre-institut.fr)
            </p>
          </div>

          {/* Nom expéditeur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'expéditeur <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={organization?.name || 'Mon Institut'}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Apparaîtra comme nom d'expéditeur dans les emails
            </p>
          </div>

          {/* Boutons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={!formData.resendApiKey || saving}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tester la connexion
            </button>
          </div>
        </div>
      </form>

      {/* Informations Resend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📧 À propos de Resend
        </h3>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <div>
                  <strong>Plan gratuit :</strong> 3000 emails/mois + 100 emails/jour
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <div>
                  <strong>Délivrabilité :</strong> 99%+ avec infrastructure AWS SES
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <div>
                  <strong>Domaine personnalisé :</strong> Envoyez depuis votre propre domaine
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <div>
                  <strong>Analytics :</strong> Statistiques détaillées (ouvertures, clics, bounces)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <div>
                  <strong>Support :</strong> Documentation complète et support réactif
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">🚀 Comment configurer Resend ?</h4>
            <ol className="space-y-2 text-sm text-purple-800 list-decimal list-inside">
              <li>Créez un compte gratuit sur <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a></li>
              <li>Vérifiez votre domaine (ou utilisez onboarding@resend.dev pour tester)</li>
              <li>Générez une clé API dans Settings → API Keys</li>
              <li>Copiez la clé et configurez-la ci-dessus</li>
              <li>Testez la connexion et enregistrez !</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Statut actuel */}
      {isConfigured && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="text-lg font-semibold text-green-900">
                ✅ Module Emailing actif
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Vous pouvez maintenant envoyer des emails depuis l'onglet Emailing du tableau de bord.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
