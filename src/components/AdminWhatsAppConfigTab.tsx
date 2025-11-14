'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, CheckCircle, AlertCircle, Save, Eye, EyeOff, Smartphone } from 'lucide-react'

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

export default function AdminWhatsAppConfigTab() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [integration, setIntegration] = useState<Integration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  const [formData, setFormData] = useState({
    whatsappApiKey: '',
    whatsappPhoneId: '',
    whatsappBusinessId: ''
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

      // Fetch WhatsApp integration
      const token = localStorage.getItem('token')
      const intResponse = await fetch('/api/admin/integrations?type=whatsapp', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (intResponse.ok) {
        const intData = await intResponse.json()
        if (intData.integration) {
          setIntegration(intData.integration)
          setFormData({
            whatsappApiKey: intData.integration.config?.apiKey || '',
            whatsappPhoneId: intData.integration.config?.phoneId || '',
            whatsappBusinessId: intData.integration.config?.businessId || ''
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
          type: 'whatsapp',
          enabled: true,
          config: {
            apiKey: formData.whatsappApiKey,
            phoneId: formData.whatsappPhoneId,
            businessId: formData.whatsappBusinessId
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Configuration WhatsApp enregistrée avec succès !')
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
          type: 'whatsapp',
          config: {
            apiKey: formData.whatsappApiKey,
            phoneId: formData.whatsappPhoneId,
            businessId: formData.whatsappBusinessId
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('✅ Connexion WhatsApp Business réussie !')
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
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
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Activez le module WhatsApp Business
              </h3>

              <p className="text-gray-700 mb-6 text-lg">
                Communiquez avec vos clients via WhatsApp : confirmations, rappels,
                promotions et conversations en temps réel.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Messages Individuels</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Conversations 1-à-1 avec vos clients
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Campagnes</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Envois groupés à plusieurs clients
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Templates</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Messages pré-approuvés par Meta
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
                      Configurez votre compte WhatsApp Business API ci-dessous.
                      L'onglet WhatsApp apparaîtra automatiquement dans votre tableau de bord.
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
          <Smartphone className="w-5 h-5 text-green-500" />
          Configuration WhatsApp Business API
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
          {/* Token API WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token API WhatsApp Business <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.whatsappApiKey}
                onChange={(e) => setFormData({ ...formData, whatsappApiKey: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="EAAxxxxxxxxxxxxxxxxx"
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
              Token d'accès permanent généré depuis Meta Business Suite
            </p>
          </div>

          {/* Phone Number ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.whatsappPhoneId}
              onChange={(e) => setFormData({ ...formData, whatsappPhoneId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="123456789012345"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              ID du numéro de téléphone depuis Meta Business
            </p>
          </div>

          {/* WhatsApp Business Account ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Business Account ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.whatsappBusinessId}
              onChange={(e) => setFormData({ ...formData, whatsappBusinessId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="987654321098765"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              ID du compte WhatsApp Business
            </p>
          </div>

          {/* Boutons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              disabled={!formData.whatsappApiKey || saving}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tester la connexion
            </button>
          </div>
        </div>
      </form>

      {/* Informations WhatsApp Business API */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💬 À propos de WhatsApp Business API
        </h3>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <div>
                  <strong>WhatsApp officiel :</strong> API Meta officielle avec badge vérifié
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <div>
                  <strong>Taux d'ouverture :</strong> 98% (vs 20% pour les emails)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <div>
                  <strong>Templates approuvés :</strong> Messages marketing validés par Meta
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <div>
                  <strong>Conversations 24h :</strong> Fenêtre de 24h pour répondre gratuitement
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <div>
                  <strong>Rich Media :</strong> Envoi d'images, vidéos, documents, boutons
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">🚀 Comment configurer WhatsApp Business API ?</h4>
            <ol className="space-y-2 text-sm text-green-800 list-decimal list-inside">
              <li>Créez un compte Meta Business sur <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">business.facebook.com</a></li>
              <li>Ajoutez WhatsApp Business API dans Paramètres → API WhatsApp</li>
              <li>Vérifiez votre numéro de téléphone professionnel</li>
              <li>Créez un token d'accès permanent (System User Token)</li>
              <li>Récupérez le Phone Number ID et Business Account ID</li>
              <li>Copiez les identifiants et configurez-les ci-dessus</li>
              <li>Créez vos templates de messages dans Meta Business</li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important</h4>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• Votre numéro doit être un numéro professionnel (pas votre WhatsApp personnel)</li>
              <li>• Les templates doivent être pré-approuvés par Meta (délai 24-48h)</li>
              <li>• Les conversations initiées par vous sont payantes (0.005€-0.10€/message selon pays)</li>
              <li>• Les réponses clients dans les 24h sont gratuites</li>
              <li>• Respectez les politiques WhatsApp Business pour éviter le bannissement</li>
            </ul>
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
                ✅ Module WhatsApp actif
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Vous pouvez maintenant envoyer des messages WhatsApp depuis l'onglet WhatsApp du tableau de bord.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
