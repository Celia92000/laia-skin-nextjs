"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AddonSelector from '@/components/super-admin/AddonSelector'
import PlanFeaturesPreview from '@/components/super-admin/PlanFeaturesPreview'
import { OrgPlan } from '@prisma/client'

interface Organization {
  id: string
  name: string
  slug: string
  legalName: string | null
  type: string
  subdomain: string
  domain: string | null
  plan: string
  status: string
  ownerEmail: string
  ownerPhone: string | null
  maxLocations: number
  maxUsers: number
  maxStorage: number
  trialEndsAt: string | null
  addons: string | null
}

const PLAN_PRICES = {
  SOLO: 49,
  DUO: 69,
  TEAM: 119,
  PREMIUM: 179,
}

const PLAN_DESCRIPTIONS = {
  SOLO: 'Esthéticienne indépendante seule',
  DUO: 'Petit institut 2-3 personnes',
  TEAM: 'Institut établi, multi-emplacements',
  PREMIUM: 'Chaîne/Franchise',
}

export default function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'plan' | 'info' | 'billing' | 'invoices'>('plan')
  const [invoices, setInvoices] = useState<any[]>([])
  const [invoiceStats, setInvoiceStats] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    legalName: '',
    type: 'SINGLE_LOCATION',
    subdomain: '',
    domain: '',
    plan: 'SOLO',
    status: 'TRIAL',
    ownerEmail: '',
    ownerPhone: '',
    trialEndsAt: ''
  })

  useEffect(() => {
    fetchOrganization()
    fetchInvoices()
  }, [id])

  async function fetchOrganization() {
    try {
      const response = await fetch(`/api/super-admin/organizations/${id}`)
      if (response.ok) {
        const data = await response.json()
        const org = data.organization
        setOrganization(org)
        setFormData({
          name: org.name,
          slug: org.slug,
          legalName: org.legalName || '',
          type: org.type,
          subdomain: org.subdomain,
          domain: org.domain || '',
          plan: org.plan,
          status: org.status,
          ownerEmail: org.ownerEmail,
          ownerPhone: org.ownerPhone || '',
          trialEndsAt: org.trialEndsAt ? new Date(org.trialEndsAt).toISOString().split('T')[0] : ''
        })

        // Charger les add-ons actifs
        if (org.addons) {
          try {
            const addons = JSON.parse(org.addons)
            if (typeof addons === 'object' && addons !== null) {
              const activeAddons = [
                ...(Array.isArray(addons.recurring) ? addons.recurring : []),
                ...(Array.isArray(addons.oneTime) ? addons.oneTime : [])
              ]
              setSelectedAddons(activeAddons)
            }
          } catch (e) {
            console.error('Error parsing addons:', e)
            setSelectedAddons([])
          }
        }
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin')
      } else if (response.status === 403) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchInvoices() {
    try {
      const response = await fetch(`/api/super-admin/organizations/${id}/invoices`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
        setInvoiceStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/super-admin/organizations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          selectedAddons
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert('✅ Organisation mise à jour avec succès' + (data.invoice ? '\n💰 Facture générée automatiquement' : ''))

        // Rafraîchir les factures si une nouvelle a été générée
        if (data.invoice) {
          await fetchInvoices()
        }

        router.push(`/super-admin/organizations/${id}`)
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating organization:', error)
      alert('❌ Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  async function generateInvoice() {
    if (!confirm('Générer une nouvelle facture pour cette organisation ?')) {
      return
    }

    try {
      const response = await fetch('/api/super-admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: id })
      })

      if (response.ok) {
        alert('✅ Facture générée avec succès')
        await fetchInvoices()
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating invoice:', error)
      alert('❌ Erreur lors de la génération de la facture')
    }
  }

  async function deleteInvoice(invoiceId: string) {
    if (!confirm('Supprimer cette facture ?')) {
      return
    }

    try {
      const response = await fetch(`/api/super-admin/invoices/${invoiceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('✅ Facture supprimée')
        await fetchInvoices()
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">❌ Organisation non trouvée</h1>
          <Link href="/super-admin" className="text-[#7c3aed] hover:text-[#7c3aed] underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href={`/super-admin/organizations/${id}`} className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour à l'organisation
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              {organization.name}
            </h2>
            <p className="text-gray-700">Gestion du forfait et des options</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Forfait actuel</div>
            <div className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{formData.plan}</div>
            <div className="text-lg text-gray-700">{PLAN_PRICES[formData.plan as keyof typeof PLAN_PRICES] ?? 0}€/mois</div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-6 py-3 rounded-lg font-medium transition border-2 ${
            activeTab === 'plan'
              ? 'bg-white shadow-md border-purple-600 text-purple-600'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border-gray-300'
          }`}
        >
          Forfait & Options
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-6 py-3 rounded-lg font-medium transition border-2 ${
            activeTab === 'info'
              ? 'bg-white shadow-md border-purple-600 text-purple-600'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border-gray-300'
          }`}
        >
          Informations
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-6 py-3 rounded-lg font-medium transition border-2 ${
            activeTab === 'billing'
              ? 'bg-white shadow-md border-purple-600 text-purple-600'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border-gray-300'
          }`}
        >
          Facturation
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Onglet Forfait & Options */}
          {activeTab === 'plan' && (
            <>
              {/* Sélection du forfait */}
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Choisir un forfait</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(PLAN_PRICES).map(([planKey, price]) => (
                    <button
                      key={planKey}
                      type="button"
                      onClick={() => setFormData({ ...formData, plan: planKey })}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        formData.plan === planKey
                          ? 'border-[#7c3aed] bg-[#7c3aed]/5 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-[#7c3aed]/50 hover:shadow-md'
                      }`}
                    >
                      {formData.plan === planKey && (
                        <div className="absolute -top-3 -right-3 bg-[#7c3aed] text-white rounded-full w-8 h-8 flex items-center justify-center text-xl">
                          ✓
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 mb-1">{planKey}</div>
                        <div className="text-3xl font-bold text-[#7c3aed] mb-2">{price}€</div>
                        <div className="text-xs text-gray-500">/mois</div>
                        <div className="mt-3 text-xs text-gray-600 line-clamp-2">
                          {PLAN_DESCRIPTIONS[planKey as keyof typeof PLAN_DESCRIPTIONS]}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aperçu des fonctionnalités */}
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">✨ Fonctionnalités incluses</h2>
                <PlanFeaturesPreview selectedPlan={formData.plan as OrgPlan} />
              </div>

              {/* Add-ons */}
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🎁 Options supplémentaires</h2>
                <p className="text-gray-600 mb-6">
                  Ajoutez des fonctionnalités à la carte ou retirez celles dont vous n'avez plus besoin
                </p>
                <AddonSelector
                  selectedPlan={formData.plan as OrgPlan}
                  onAddonsChange={setSelectedAddons}
                />
              </div>

              {/* Statut */}
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🔔 Statut de l'abonnement</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition"
                    >
                      <option value="TRIAL">🔵 Essai</option>
                      <option value="ACTIVE">🟢 Actif</option>
                      <option value="SUSPENDED">🟠 Suspendu</option>
                      <option value="CANCELLED">🔴 Annulé</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fin de la période d'essai
                    </label>
                    <input
                      type="date"
                      value={formData.trialEndsAt}
                      onChange={(e) => setFormData({ ...formData, trialEndsAt: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Onglet Informations */}
          {activeTab === 'info' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🏢 Informations générales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'organisation *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom légal
                    </label>
                    <input
                      type="text"
                      value={formData.legalName}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL: /{formData.slug}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition"
                    >
                      <option value="SINGLE_LOCATION">🏪 Mono-emplacement</option>
                      <option value="MULTI_LOCATION">🏢 Multi-emplacements</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🌐 Domaines</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subdomain *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subdomain}
                      onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.subdomain}.laiaconnect.fr</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domaine personnalisé
                    </label>
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="www.exemple.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Onglet Facturation */}
          {activeTab === 'billing' && (
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 Propriétaire & Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email du propriétaire *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone du propriétaire
                  </label>
                  <input
                    type="tel"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions fixes en bas */}
          <div className="sticky bottom-0 bg-white border-t shadow-lg p-6 rounded-t-2xl">
            <div className="max-w-7xl mx-auto flex gap-4">
              <Link
                href={`/super-admin/organizations/${id}`}
                className="flex-1 text-center px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-[#7c3aed] to-[#6b46c1] text-white rounded-xl hover:shadow-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '⏳ Enregistrement...' : '✅ Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
