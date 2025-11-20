"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PlanFeaturesPreview from '@/components/super-admin/PlanFeaturesPreview'
import AddonSelector from '@/components/super-admin/AddonSelector'
import { OrgPlan } from '@prisma/client'
import { websiteTemplates, getTemplatesForPlan } from '@/lib/website-templates'

export default function NewOrganizationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [formData, setFormData] = useState({
    // Informations essentielles
    name: '',               // Nom de l'institut
    ownerFirstName: '',     // Prénom du propriétaire
    ownerLastName: '',      // Nom du propriétaire
    ownerEmail: '',         // Email du propriétaire
    ownerPhone: '',         // Téléphone (optionnel)
    plan: 'SOLO',          // Plan d'abonnement
    city: '',              // Ville

    // Informations légales/facturation (essentielles pour vous)
    legalName: '',         // Raison sociale (si différente du nom commercial)
    siret: '',             // SIRET obligatoire pour facturation
    tvaNumber: '',         // Numéro TVA intracommunautaire (optionnel)
    billingEmail: '',      // Email de facturation (peut être différent)
    billingAddress: '',    // Adresse de facturation (rue, numéro)
    billingPostalCode: '', // Code postal
    billingCity: '',       // Ville de facturation
    billingCountry: 'France', // Pays (par défaut France)

    // Mandat SEPA pour prélèvement automatique
    sepaIban: '',          // IBAN
    sepaBic: '',           // BIC
    sepaAccountHolder: '', // Titulaire du compte
    sepaMandate: false,    // Acceptation du mandat

    // Auto-générés
    slug: '',
    subdomain: '',
    domain: '',            // Domaine personnalisé (optionnel)

    // Design et template
    websiteTemplateId: 'modern',  // Template de site web
    primaryColor: '#d4b5a0',      // Couleur principale
    secondaryColor: '#c9a084',    // Couleur secondaire
    accentColor: '#2c3e50',       // Couleur d'accent

    // Déblocages spéciaux (négociation manuelle)
    customFeatureCRM: false,
    customFeatureEmailing: false,
    customFeatureBlog: false,
    customFeatureShop: false,
    customFeatureWhatsApp: false,
    customFeatureSMS: false,
    customFeatureSocialMedia: false,
    customFeatureStock: false,
    customAddonPrice: 0, // Prix mensuel additionnel pour les déblocages
  })

  // Pré-remplir le formulaire avec les données depuis l'URL (depuis le CRM)
  useEffect(() => {
    const institutName = searchParams.get('institutName')
    const ownerFirstName = searchParams.get('ownerFirstName')
    const ownerLastName = searchParams.get('ownerLastName')
    const ownerEmail = searchParams.get('ownerEmail')
    const ownerPhone = searchParams.get('ownerPhone')
    const city = searchParams.get('city')
    const address = searchParams.get('address')
    const postalCode = searchParams.get('postalCode')
    const leadId = searchParams.get('leadId')

    if (institutName || ownerEmail) {
      // Génération automatique du slug
      const name = institutName || ''
      const slug = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      setFormData(prev => ({
        ...prev,
        name: institutName || '',
        ownerFirstName: ownerFirstName || '',
        ownerLastName: ownerLastName || '',
        ownerEmail: ownerEmail || '',
        ownerPhone: ownerPhone || '',
        city: city || '',
        billingAddress: address || '',
        billingPostalCode: postalCode || '',
        billingCity: city || '',
        billingEmail: ownerEmail || '',
        slug,
        subdomain: slug,
      }))
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))

    // Auto-générer le slug à partir du nom
    if (name === 'name') {
      const slug = value.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
        .replace(/(^-|-$)/g, '') // Enlever les tirets au début et à la fin
      setFormData(prev => ({ ...prev, slug, subdomain: slug }))
    }
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
        setSuccess(data)
        // Ne pas rediriger automatiquement, laisser le temps de copier les identifiants
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href="/super-admin/organizations" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour aux organisations
        </Link>
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
            Nouvelle Organisation
          </h2>
          <p className="text-gray-700">Créer un nouvel institut avec le modèle LAIA</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Message de succès avec identifiants */}
          {success && (
            <div className="mb-6 p-6 bg-green-50 border-2 border-green-500 rounded-xl">
              <h3 className="text-2xl font-bold text-green-800 mb-4">✅ Organisation créée avec succès !</h3>

              <div className="bg-white border-2 border-green-300 rounded-lg p-6 mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">🔑 Identifiants à communiquer au client :</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm text-gray-600">Email de connexion</p>
                      <p className="font-mono font-bold text-lg">{success.adminEmail}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(success.adminEmail)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      📋 Copier
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm text-gray-600">Mot de passe provisoire</p>
                      <p className="font-mono font-bold text-lg text-red-600">{success.defaultPassword}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(success.defaultPassword)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      📋 Copier
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm text-gray-600">URL de connexion</p>
                      <p className="font-mono font-bold text-blue-600">http://localhost:3001/admin</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText('http://localhost:3001/admin')}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      📋 Copier
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Important :</strong> Le client devra changer ce mot de passe lors de sa première connexion.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/super-admin/organizations/${success.id}`)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Voir l'organisation
                </button>
                <button
                  onClick={() => {
                    setSuccess(null)
                    setFormData({
                      // Informations essentielles
                      name: '',
                      ownerFirstName: '',
                      ownerLastName: '',
                      ownerEmail: '',
                      ownerPhone: '',
                      plan: 'SOLO',
                      city: '',
                      // Informations légales/facturation
                      legalName: '',
                      siret: '',
                      tvaNumber: '',
                      billingEmail: '',
                      billingAddress: '',
                      billingPostalCode: '',
                      billingCity: '',
                      billingCountry: 'France',
                      // Mandat SEPA
                      sepaIban: '',
                      sepaBic: '',
                      sepaAccountHolder: '',
                      sepaMandate: false,
                      // Auto-générés
                      slug: '',
                      subdomain: '',
                      domain: '',
                      // Design et template
                      websiteTemplateId: 'modern',
                      primaryColor: '#d4b5a0',
                      secondaryColor: '#c9a084',
                      accentColor: '#2c3e50',
                      // Déblocages spéciaux
                      customFeatureCRM: false,
                      customFeatureEmailing: false,
                      customFeatureBlog: false,
                      customFeatureShop: false,
                      customFeatureWhatsApp: false,
                      customFeatureSMS: false,
                      customFeatureSocialMedia: false,
                      customFeatureStock: false,
                      customAddonPrice: 0
                    })
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
                >
                  Créer une autre organisation
                </button>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* Info importante */}
              <div className="mb-8 p-6 rounded-xl border-2" style={{ borderColor: '#7c3aed', backgroundColor: '#faf7f3' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#7c3aed' }}>
                  ℹ️ Informations importantes
                </h3>
                <p className="text-gray-700 mb-3">
                  Vous n'avez besoin que de <strong>5 informations essentielles</strong> pour créer l'organisation.
                </p>
                <p className="text-gray-700">
                  L'admin pourra ensuite <strong>personnaliser entièrement son site</strong> (logo, couleurs, textes, services, etc.)
                  depuis son espace admin après sa première connexion.
                </p>
              </div>
            </>
          )}

          {!success && <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations essentielles */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
                Informations Essentielles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Nom de l'institut */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1️⃣ Nom de l'institut *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Ex: Beauté Parisienne"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Le nom de l'institut (sera affiché sur le site)
                  </p>
                </div>

                {/* 2. Prénom propriétaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2️⃣ Prénom du propriétaire *
                  </label>
                  <input
                    type="text"
                    name="ownerFirstName"
                    value={formData.ownerFirstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Marie"
                  />
                </div>

                {/* 3. Nom propriétaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3️⃣ Nom du propriétaire *
                  </label>
                  <input
                    type="text"
                    name="ownerLastName"
                    value={formData.ownerLastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Dupont"
                  />
                </div>

                {/* 4. Email propriétaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4️⃣ Email du propriétaire *
                  </label>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="proprietaire@email.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Servira à créer le compte admin (identifiants envoyés par email)
                  </p>
                </div>

                {/* 5. Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    5️⃣ Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>

                {/* 4. Ville */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4️⃣ Ville *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Paris"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Pour personnaliser le contenu du site
                  </p>
                </div>

                {/* 5. Plan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    5️⃣ Plan d'abonnement *
                  </label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ backgroundColor: 'white' }}
                  >
                    <option value="SOLO">SOLO - 49€/mois (Pour démarrer • ROI +500€/mois) - 1 user</option>
                    <option value="DUO">DUO - 69€/mois (Développer son CA • ROI +1200€/mois) - 3 users</option>
                    <option value="TEAM">TEAM - 119€/mois ⭐ LE PLUS RENTABLE (E-commerce • ROI +3500€/mois) - 10 users</option>
                    <option value="PREMIUM">PREMIUM - 179€/mois (Instituts établis • ROI +8000€/mois) - Illimité</option>
                  </select>
                </div>

                {/* 6. Domaine personnalisé (optionnel) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    6️⃣ Domaine personnalisé (optionnel)
                  </label>
                  <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="exemple: mon-institut-beaute.fr"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    🌐 Si le client a déjà un nom de domaine, indiquez-le ici. Sinon, un sous-domaine sera créé automatiquement ({formData.slug || 'exemple'}.laia-connect.fr)
                  </p>
                </div>
              </div>

              {/* Prévisualisation des fonctionnalités selon le plan */}
              <div className="mt-6">
                <PlanFeaturesPreview selectedPlan={formData.plan as OrgPlan} />
              </div>

              {/* Déblocages spéciaux (négociation manuelle) */}
              <div className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl">
                <h3 className="text-lg font-bold text-orange-900 mb-2">
                  🤝 Déblocages spéciaux (négociation)
                </h3>
                <p className="text-sm text-orange-700 mb-4">
                  Activez manuellement des fonctionnalités supplémentaires pour ce client après négociation commerciale.
                  Ces déblocages s'ajoutent au prix de base de la formule.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 bg-white border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <input
                      type="checkbox"
                      name="customFeatureCRM"
                      checked={formData.customFeatureCRM}
                      onChange={(e) => setFormData({ ...formData, customFeatureCRM: e.target.checked })}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🎯 CRM Commercial</div>
                      <div className="text-xs text-gray-600">Pipeline + Prospects + Leads</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <input
                      type="checkbox"
                      name="customFeatureEmailing"
                      checked={formData.customFeatureEmailing}
                      onChange={(e) => setFormData({ ...formData, customFeatureEmailing: e.target.checked })}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📧 Email Marketing</div>
                      <div className="text-xs text-gray-600">Campagnes illimitées</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <input
                      type="checkbox"
                      name="customFeatureBlog"
                      checked={formData.customFeatureBlog}
                      onChange={(e) => setFormData({ ...formData, customFeatureBlog: e.target.checked })}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📝 Blog</div>
                      <div className="text-xs text-gray-600">SEO optimisé</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <input
                      type="checkbox"
                      name="customFeatureShop"
                      checked={formData.customFeatureShop}
                      onChange={(e) => setFormData({ ...formData, customFeatureShop: e.target.checked })}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🛍️ Boutique</div>
                      <div className="text-xs text-gray-600">E-commerce complet</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <input
                      type="checkbox"
                      name="customFeatureWhatsApp"
                      checked={formData.customFeatureWhatsApp}
                      onChange={(e) => setFormData({ ...formData, customFeatureWhatsApp: e.target.checked })}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📱 WhatsApp</div>
                      <div className="text-xs text-gray-600">WhatsApp Business</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <input
                      type="checkbox"
                      name="customFeatureSMS"
                      checked={formData.customFeatureSMS}
                      onChange={(e) => setFormData({ ...formData, customFeatureSMS: e.target.checked })}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">💬 SMS</div>
                      <div className="text-xs text-gray-600">SMS Marketing</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <input
                      type="checkbox"
                      name="customFeatureSocialMedia"
                      checked={formData.customFeatureSocialMedia}
                      onChange={(e) => setFormData({ ...formData, customFeatureSocialMedia: e.target.checked })}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📱 Réseaux sociaux</div>
                      <div className="text-xs text-gray-600">Instagram + Facebook</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white border-2 border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50 transition">
                    <input
                      type="checkbox"
                      name="customFeatureStock"
                      checked={formData.customFeatureStock}
                      onChange={(e) => setFormData({ ...formData, customFeatureStock: e.target.checked })}
                      className="w-5 h-5 text-orange-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">📦 Stock avancé</div>
                      <div className="text-xs text-gray-600">Gestion multi-sites</div>
                    </div>
                  </label>
                </div>

                {/* Prix custom pour les déblocages */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-orange-900 mb-2">
                    💰 Prix mensuel additionnel pour ces déblocages (€)
                  </label>
                  <input
                    type="number"
                    name="customAddonPrice"
                    value={formData.customAddonPrice}
                    onChange={(e) => setFormData({ ...formData, customAddonPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="5"
                  />
                  <p className="mt-2 text-sm text-orange-700">
                    Exemple : SOLO (49€) + déblocages (20€) = <strong>69€/mois total</strong>
                  </p>
                </div>

                {/* Calcul total */}
                {formData.customAddonPrice > 0 && (
                  <div className="mt-4 p-4 bg-white border-2 border-green-400 rounded-lg">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-700">💳 Prix total mensuel :</span>
                      <span className="text-green-600">
                        {(
                          (formData.plan === 'SOLO' ? 49 :
                           formData.plan === 'DUO' ? 69 :
                           formData.plan === 'TEAM' ? 119 : 179) +
                          formData.customAddonPrice
                        )}€/mois
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-généré */}
              {formData.slug && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Généré automatiquement :</strong>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Slug :</span>
                      <span className="ml-2 font-mono text-gray-800">{formData.slug}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">URL :</span>
                      <span className="ml-2 font-mono text-gray-800">{formData.subdomain}.laia-platform.com</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Informations légales et facturation */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
                Informations Légales & Facturation
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Ces informations sont nécessaires pour facturer le client et votre comptabilité
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SIRET */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro SIRET * 🏢
                  </label>
                  <input
                    type="text"
                    name="siret"
                    value={formData.siret}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{14}"
                    maxLength={14}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="12345678901234 (14 chiffres)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Obligatoire pour la facturation
                  </p>
                </div>

                {/* Raison sociale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison sociale
                  </label>
                  <input
                    type="text"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="SARL Beauté Parisienne (si différent du nom commercial)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Laissez vide si identique au nom de l'institut
                  </p>
                </div>

                {/* Email de facturation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de facturation
                  </label>
                  <input
                    type="email"
                    name="billingEmail"
                    value={formData.billingEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="compta@institut.fr"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Si différent de l'email du propriétaire
                  </p>
                </div>

                {/* Numéro TVA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro TVA Intracommunautaire
                  </label>
                  <input
                    type="text"
                    name="tvaNumber"
                    value={formData.tvaNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="FR12345678901"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optionnel - Si le client assujetti à la TVA
                  </p>
                </div>

                {/* Adresse de facturation - Rue */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse de facturation * 🏠
                  </label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="123 Rue de la Beauté"
                  />
                </div>

                {/* Code postal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal * 📮
                  </label>
                  <input
                    type="text"
                    name="billingPostalCode"
                    value={formData.billingPostalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="75001"
                  />
                </div>

                {/* Ville de facturation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville de facturation * 🏙️
                  </label>
                  <input
                    type="text"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Paris"
                  />
                </div>

                {/* Pays */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays * 🌍
                  </label>
                  <input
                    type="text"
                    name="billingCountry"
                    value={formData.billingCountry}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="France"
                  />
                </div>
              </div>

              {/* Info importante */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Important :</strong> Ces informations apparaîtront sur les factures mensuelles envoyées au client.
                  Vérifiez qu'elles sont correctes.
                </p>
              </div>
            </div>

            {/* Mandat SEPA pour prélèvement automatique */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
                💳 Mandat SEPA - Prélèvement Automatique
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Le prélèvement automatique démarrera automatiquement à la fin de la période d'essai (30 jours)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IBAN */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN * 🏦
                  </label>
                  <input
                    type="text"
                    name="sepaIban"
                    value={formData.sepaIban}
                    onChange={handleChange}
                    required
                    pattern="[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent font-mono"
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Numéro IBAN du compte bancaire (commence par FR pour la France)
                  </p>
                </div>

                {/* BIC */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BIC / SWIFT *
                  </label>
                  <input
                    type="text"
                    name="sepaBic"
                    value={formData.sepaBic}
                    onChange={handleChange}
                    required
                    pattern="[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?"
                    maxLength={11}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent font-mono uppercase"
                    placeholder="BNPAFRPP"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Code BIC de la banque (8 ou 11 caractères)
                  </p>
                </div>

                {/* Titulaire du compte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titulaire du compte *
                  </label>
                  <input
                    type="text"
                    name="sepaAccountHolder"
                    value={formData.sepaAccountHolder}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="SARL Beauté Parisienne"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Nom du titulaire du compte bancaire
                  </p>
                </div>
              </div>

              {/* Acceptation du mandat SEPA */}
              <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="sepaMandate"
                    checked={formData.sepaMandate}
                    onChange={handleChange}
                    required
                    className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 mb-2">
                      ✅ J'autorise LAIA à effectuer des prélèvements SEPA sur le compte bancaire indiqué *
                    </p>
                    <p className="text-gray-700 mb-2">
                      En cochant cette case, le client autorise LAIA à prélever automatiquement le montant de l'abonnement mensuel :
                    </p>
                    <ul className="text-gray-700 space-y-1 ml-4 mb-2">
                      <li>• <strong>SOLO</strong> : 49€/mois (Pour démarrer • ROI +500€/mois)</li>
                      <li>• <strong>DUO</strong> : 69€/mois (Développer son CA • ROI +1200€/mois)</li>
                      <li>• <strong>TEAM</strong> : 119€/mois (E-commerce • ROI +3500€/mois) ⭐</li>
                      <li>• <strong>PREMIUM</strong> : 179€/mois (Instituts établis • ROI +8000€/mois)</li>
                    </ul>
                    <p className="text-gray-700 text-xs">
                      Le premier prélèvement aura lieu automatiquement à la fin de la période d'essai de 30 jours.
                      Le client pourra annuler ce mandat à tout moment depuis son espace admin.
                    </p>
                  </div>
                </label>
              </div>

              {/* Info RGPD */}
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600">
                  🔒 <strong>Sécurité :</strong> Les informations bancaires sont stockées de manière sécurisée et conforme au RGPD.
                  Elles ne seront utilisées que pour les prélèvements automatiques de l'abonnement LAIA.
                </p>
              </div>
            </div>

            {/* Design et Template */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b-2" style={{ borderColor: '#7c3aed' }}>
                🎨 Design et Template
              </h2>

              {/* Sélection du template */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Template de site web
                </label>
                <select
                  name="websiteTemplateId"
                  value={formData.websiteTemplateId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  {getTemplatesForPlan(formData.plan as OrgPlan).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Templates disponibles pour le plan {formData.plan}
                </p>
              </div>

              {/* Couleurs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur principale
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="h-12 w-16 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg"
                      placeholder="#d4b5a0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur secondaire
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      className="h-12 w-16 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg"
                      placeholder="#c9a084"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur d'accent
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="accentColor"
                      value={formData.accentColor}
                      onChange={handleChange}
                      className="h-12 w-16 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg"
                      placeholder="#2c3e50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #e8b4b8 100%)'
                }}
              >
                {loading ? 'Création en cours...' : 'Créer l\'organisation avec le modèle LAIA'}
              </button>
            </div>

            {/* Ce qui sera créé */}
            <div className="mt-6 p-6 rounded-xl" style={{ backgroundColor: '#f0f9ff', borderLeft: '4px solid #7c3aed' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#7c3aed' }}>
                ✨ Ce qui sera créé automatiquement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">📱 Site web complet :</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Page d'accueil personnalisée</li>
                    <li>• 5 services de démonstration</li>
                    <li>• 3 produits de démonstration</li>
                    <li>• 2 formations</li>
                    <li>• 2 articles de blog</li>
                    <li>• Système de réservation</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">👤 Compte administrateur :</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Email : {formData.ownerEmail || 'à définir'}</li>
                    <li>• Mot de passe : généré automatiquement (16 caractères ultra-sécurisés)</li>
                    <li>• Accès complet à l'admin</li>
                    <li>• Peut personnaliser le site</li>
                    <li>• Peut ajouter des services/produits</li>
                    <li>• Peut gérer les réservations</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-600 italic">
                💡 L'admin pourra ensuite personnaliser entièrement son site (logo, couleurs, textes, horaires, etc.)
              </p>
            </div>
          </form>}
        </div>
      </div>
    </div>
  )
}
