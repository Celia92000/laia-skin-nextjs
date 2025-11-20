"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function UniversalLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [savedEmails, setSavedEmails] = useState<string[]>([])
  const [showEmailDropdown, setShowEmailDropdown] = useState(false)

  // Charger l'email sauvegardé et la liste des emails au chargement de la page
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }))
      setRememberMe(true)
    }

    // Charger les emails sauvegardés
    const savedEmailsStr = localStorage.getItem('savedEmails')
    if (savedEmailsStr) {
      try {
        const emails = JSON.parse(savedEmailsStr)
        setSavedEmails(emails)
      } catch (e) {
        console.error('Erreur chargement emails:', e)
      }
    }
  }, [])

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showEmailDropdown && !target.closest('.email-dropdown-container')) {
        setShowEmailDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmailDropdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/universal-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()

        // Stocker le token et les infos utilisateur dans localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('userRole', data.user.role)

        // Cookie httpOnly déjà défini par l'API
        const maxAge = rememberMe ? 2592000 : 604800 // 30 jours si "Se souvenir", sinon 7 jours
        document.cookie = `token=${data.token}; path=/; max-age=${maxAge}; SameSite=Strict`

        // Sauvegarder l'email dans la liste des emails utilisés
        const currentSavedEmails = [...savedEmails]
        if (!currentSavedEmails.includes(formData.email)) {
          currentSavedEmails.unshift(formData.email)
          // Garder max 5 emails
          if (currentSavedEmails.length > 5) {
            currentSavedEmails.pop()
          }
          localStorage.setItem('savedEmails', JSON.stringify(currentSavedEmails))
          setSavedEmails(currentSavedEmails)
        }

        // Sauvegarder ou supprimer l'email selon la checkbox
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email)
        } else {
          localStorage.removeItem('rememberedEmail')
        }

        // Redirection automatique selon le rôle
        window.location.href = data.redirect
      } else {
        const error = await response.json()
        setError(error.error || 'Email ou mot de passe incorrect')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <Link href="/platform" className="inline-block">
            <div className="bg-white p-8 rounded-2xl shadow-xl mb-4 inline-block">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image
                  src="/logo-laia-connect.png?v=3"
                  alt="LAIA Connect Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                LAIA Connect
              </h1>
            </div>
          </Link>
          <p className="text-gray-600 text-lg">Connexion à votre espace</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="email-dropdown-container">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  onFocus={() => setShowEmailDropdown(savedEmails.length > 0)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="votre@email.com"
                  disabled={loading}
                />
                {savedEmails.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowEmailDropdown(!showEmailDropdown)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${showEmailDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dropdown des emails sauvegardés */}
              {showEmailDropdown && savedEmails.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">Comptes récents</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {savedEmails.map((email, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, email }))
                          setShowEmailDropdown(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-2 group"
                      >
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-700 group-hover:text-purple-600">{email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link href="/mot-de-passe-oublie" className="text-sm text-purple-600 hover:text-purple-700 transition">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Checkbox Se souvenir de moi */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-purple-500"
                style={{ accentColor: '#7c3aed' }}
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer">
                Se souvenir de mon adresse email
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        {/* Lien retour accueil */}
        <div className="text-center mt-6">
          <Link href="/platform" className="text-gray-600 hover:text-purple-600 transition">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
