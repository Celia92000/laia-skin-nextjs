"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function SecurityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0)
  const [setupMode, setSetupMode] = useState(false)
  const [disableMode, setDisableMode] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/2fa/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setTwoFactorEnabled(data.enabled)
        setBackupCodesRemaining(data.backupCodesRemaining)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/security')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  async function startSetup() {
    setProcessing(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/2fa/setup', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setBackupCodes(data.backupCodes)
        setSetupMode(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la configuration')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setProcessing(false)
    }
  }

  async function verifyAndEnable() {
    if (verificationCode.length !== 6) {
      setError('Le code doit contenir 6 chiffres')
      return
    }

    setProcessing(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: verificationCode })
      })

      if (response.ok) {
        setSuccess('2FA activé avec succès !')
        setTwoFactorEnabled(true)
        setSetupMode(false)
        setBackupCodesRemaining(10)
        setVerificationCode('')
      } else {
        const data = await response.json()
        setError(data.error || 'Code incorrect')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setProcessing(false)
    }
  }

  async function disable2FA() {
    if (!verificationCode || !password) {
      setError('Code et mot de passe requis')
      return
    }

    setProcessing(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: verificationCode, password })
      })

      if (response.ok) {
        setSuccess('2FA désactivé')
        setTwoFactorEnabled(false)
        setDisableMode(false)
        setVerificationCode('')
        setPassword('')
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setProcessing(false)
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
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Link href="/super-admin/settings" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour aux paramètres
        </Link>

        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
          Sécurité du compte
        </h1>
        <p className="text-gray-600 mb-8">
          Gérez l'authentification à deux facteurs (2FA) pour sécuriser votre compte super-admin
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Statut actuel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Authentification à deux facteurs (2FA)
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Ajoutez une couche de sécurité supplémentaire à votre compte
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              twoFactorEnabled
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {twoFactorEnabled ? 'Activé' : 'Désactivé'}
            </div>
          </div>

          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Codes de récupération restants: <strong>{backupCodesRemaining}</strong>
              </p>
              {backupCodesRemaining < 3 && (
                <p className="text-sm text-orange-600 mt-2">
                  Attention: Il vous reste peu de codes de récupération. Pensez à les régénérer.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Mode configuration */}
        {setupMode && !twoFactorEnabled && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Configuration du 2FA
            </h3>

            <div className="space-y-6">
              {/* Étape 1: QR Code */}
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  1. Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
                </p>
                {qrCode && (
                  <div className="flex justify-center">
                    <Image
                      src={qrCode}
                      alt="QR Code 2FA"
                      width={200}
                      height={200}
                      className="border rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Secret manuel */}
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Ou entrez ce code manuellement:
                </p>
                <code className="block p-3 bg-gray-100 rounded-lg text-sm font-mono break-all">
                  {secret}
                </code>
              </div>

              {/* Codes de récupération */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Codes de récupération (à conserver en lieu sûr):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-sm font-mono bg-white p-2 rounded">
                      {code}
                    </code>
                  ))}
                </div>
                <p className="text-xs text-yellow-700 mt-3">
                  Ces codes vous permettront de récupérer l'accès à votre compte si vous perdez votre téléphone.
                </p>
              </div>

              {/* Vérification */}
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  2. Entrez le code à 6 chiffres de votre application:
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-2xl text-center tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSetupMode(false)
                    setVerificationCode('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={verifyAndEnable}
                  disabled={processing || verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {processing ? 'Vérification...' : 'Activer le 2FA'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mode désactivation */}
        {disableMode && twoFactorEnabled && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Désactiver le 2FA
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code 2FA ou code de récupération
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Code à 6 chiffres ou code de récupération"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe du compte
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDisableMode(false)
                    setVerificationCode('')
                    setPassword('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={disable2FA}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Désactivation...' : 'Désactiver le 2FA'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {!setupMode && !disableMode && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {!twoFactorEnabled ? (
              <button
                onClick={startSetup}
                disabled={processing}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                {processing ? 'Chargement...' : 'Configurer le 2FA'}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={startSetup}
                  disabled={processing}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Régénérer les codes de récupération
                </button>
                <button
                  onClick={() => setDisableMode(true)}
                  className="w-full px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                >
                  Désactiver le 2FA
                </button>
              </div>
            )}
          </div>
        )}

        {/* Informations de sécurité */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Pourquoi activer le 2FA ?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Protection contre le vol de mot de passe</li>
            <li>• Sécurité renforcée pour les comptes super-admin</li>
            <li>• Conformité aux bonnes pratiques de sécurité</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
