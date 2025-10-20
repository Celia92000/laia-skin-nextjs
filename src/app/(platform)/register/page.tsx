"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)

  const [formData, setFormData] = useState({
    // Plan
    plan: 'DUO',

    // Informations institut
    name: '',
    legalName: '',
    slug: '',
    subdomain: '',
    city: '',
    siret: '',

    // Contact
    ownerEmail: '',
    ownerPhone: '',
    billingEmail: '',
    billingAddress: '',

    // SEPA
    sepaIban: '',
    sepaBic: '',
    sepaAccountHolder: '',
    sepaMandate: false
  })

  const plans = [
    {
      id: 'SOLO',
      name: 'Solo',
      price: 49,
      features: ['1 emplacement', '1 utilisateur', '5 GB stockage']
    },
    {
      id: 'DUO',
      name: 'Duo',
      price: 99,
      popular: true,
      features: ['1 emplacement', '3 utilisateurs', '10 GB stockage']
    },
    {
      id: 'TEAM',
      name: 'Team',
      price: 199,
      features: ['3 emplacements', '10 utilisateurs', '50 GB stockage']
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: 399,
      features: ['Illimité', 'Illimité', '999 GB stockage']
    }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value }

      // Auto-générer slug et subdomain depuis le nom
      if (name === 'name' && value) {
        const slugValue = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        updated.slug = slugValue
        updated.subdomain = slugValue
      }

      // Auto-remplir legalName si vide
      if (name === 'name' && !prev.legalName) {
        updated.legalName = value
      }

      // Auto-remplir billingEmail si vide
      if (name === 'ownerEmail' && !prev.billingEmail) {
        updated.billingEmail = value
      }

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/super-admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setCredentials({
          email: data.adminEmail,
          password: data.defaultPassword
        })
        setSuccess(true)
      } else {
        const error = await response.json()
        setError(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  if (success && credentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Félicitations !
            </h1>
            <p className="text-gray-600">
              Votre institut a été créé avec succès. Voici vos identifiants de connexion :
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Email de connexion</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 font-mono font-bold text-lg text-gray-900 bg-white px-4 py-2 rounded-lg">
                    {credentials.email}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(credentials.email)
                      alert('✅ Email copié !')
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Mot de passe temporaire</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 font-mono font-bold text-lg text-gray-900 bg-white px-4 py-2 rounded-lg">
                    {credentials.password}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(credentials.password)
                      alert('✅ Mot de passe copié !')
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Important :</strong> Notez bien ces identifiants, ils ne seront plus affichés.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/connexion"
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Se connecter maintenant
            </Link>
            <Link
              href="/platform"
              className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/platform" className="inline-block mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 rounded-2xl shadow-xl inline-block">
              <h1 className="text-4xl font-bold text-white">
                LAIA Beauty
              </h1>
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 mt-4">
            Commencez votre essai gratuit de 30 jours
          </h2>
          <p className="text-gray-600">
            Aucune carte bancaire requise • Annulation à tout moment
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between">
            {['Plan', 'Informations', 'Paiement'].map((label, idx) => (
              <div key={idx} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${idx < step ? 'text-purple-600' : idx === step ? 'text-purple-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    idx < step ? 'bg-purple-600 text-white' : idx === step ? 'bg-purple-100 text-purple-600' : 'bg-gray-100'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="hidden sm:inline font-medium">{label}</span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-2 ${idx < step ? 'bg-purple-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Step 1: Plan Selection */}
            {step === 1 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Choisissez votre plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`relative cursor-pointer border-2 rounded-xl p-6 transition ${
                        formData.plan === plan.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={formData.plan === plan.id}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {plan.popular && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                          ⭐ POPULAIRE
                        </div>
                      )}
                      <div className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</div>
                      <div className="text-3xl font-bold text-purple-600 mb-4">
                        {plan.price}€<span className="text-sm text-gray-600">/mois</span>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="text-green-500 mr-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Continuer
                </button>
              </div>
            )}

            {/* Step 2: Institut Information */}
            {step === 2 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Informations sur votre institut</h3>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de l'institut *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Mon Institut Beauté"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Raison sociale
                      </label>
                      <input
                        type="text"
                        name="legalName"
                        value={formData.legalName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Nom légal de l'entreprise"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Paris"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SIRET
                      </label>
                      <input
                        type="text"
                        name="siret"
                        value={formData.siret}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="123 456 789 00010"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email de contact *
                      </label>
                      <input
                        type="email"
                        name="ownerEmail"
                        required
                        value={formData.ownerEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="contact@institut.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="ownerPhone"
                        value={formData.ownerPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse de facturation
                    </label>
                    <textarea
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="123 Rue de la Beauté, 75001 Paris"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment SEPA */}
            {step === 3 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Informations de paiement</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configurez le prélèvement SEPA pour la facturation automatique après la période d'essai
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IBAN *
                    </label>
                    <input
                      type="text"
                      name="sepaIban"
                      required
                      value={formData.sepaIban}
                      onChange={handleChange}
                      pattern="[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                      placeholder="FR76 1234 5678 9012 3456 7890 123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BIC *
                    </label>
                    <input
                      type="text"
                      name="sepaBic"
                      required
                      value={formData.sepaBic}
                      onChange={handleChange}
                      pattern="[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?"
                      maxLength={11}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                      placeholder="BNPAFRPPXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titulaire du compte *
                    </label>
                    <input
                      type="text"
                      name="sepaAccountHolder"
                      required
                      value={formData.sepaAccountHolder}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Nom du titulaire"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        name="sepaMandate"
                        required
                        checked={formData.sepaMandate}
                        onChange={handleChange}
                        className="mt-1 mr-3"
                      />
                      <span className="text-sm text-gray-700">
                        J'autorise LAIA Beauty à effectuer des prélèvements SEPA sur mon compte. Je bénéficie de <strong>30 jours d'essai gratuit</strong>, après quoi mon abonnement sera automatiquement renouvelé à <strong>{plans.find(p => p.id === formData.plan)?.price}€/mois</strong>. Je peux annuler à tout moment.
                      </span>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Création en cours...
                      </span>
                    ) : (
                      '🎁 Commencer mon essai gratuit'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 mb-2">
            En créant un compte, vous acceptez nos <a href="/cgv" className="text-purple-600 hover:underline">CGV</a> et notre <a href="/politique-de-confidentialite" className="text-purple-600 hover:underline">politique de confidentialité</a>
          </p>
          <Link href="/platform" className="text-gray-600 hover:text-purple-600 transition">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
