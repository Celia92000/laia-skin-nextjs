"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, Users, Calendar, Package, Settings, Eye, Key,
  MapPin, CreditCard, BarChart3, FileText, UserCircle,
  Mail, Phone, Clock, TrendingUp, ShoppingBag
} from 'lucide-react'

export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'config' | 'access' | 'billing'>('overview')

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/super-admin/organizations/${id}`)
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Data received:', data)
          setOrganization(data.organization)
        } else if (response.status === 401) {
          router.push('/login?redirect=/super-admin')
        } else if (response.status === 403) {
          router.push('/admin')
        } else {
          console.error('Error response:', response.status, await response.text())
        }
      } catch (error) {
        console.error('Error fetching organization:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#7c3aed" }}></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Organisation non trouvée</h1>
          <Link href="/super-admin" className="text-[#7c3aed] hover:text-[#c9a084] underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig = {
    ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Actif' },
    TRIAL: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Essai' },
    SUSPENDED: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Suspendu' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' },
  }

  const status = statusConfig[organization.status as keyof typeof statusConfig]
  const staff = organization.staffAccounts || []
  const clients = organization.topClients || []
  const stats = organization.activityStats || {}
  const userStats = organization.userStats || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplifié */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/super-admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-3 text-sm">
            ← Retour aux organisations
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7c3aed] to-[#6b46c1] rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">Plan {organization.plan}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{userStats.total || 0} utilisateurs</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/super-admin/impersonate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ organizationId: organization.id })
                    })
                    if (response.ok) {
                      const data = await response.json()
                      window.location.href = data.redirect
                    }
                  } catch (error) {
                    console.error('Error:', error)
                  }
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-medium"
              >
                <Key className="w-4 h-4" />
                Se connecter
              </button>
              <Link
                href={`/super-admin/organizations/${organization.id}/settings`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Paramètres
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-[#7c3aed] text-[#7c3aed]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'team'
                  ? 'border-[#7c3aed] text-[#7c3aed]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Équipe ({staff.length})
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'config'
                  ? 'border-[#7c3aed] text-[#7c3aed]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'access'
                  ? 'border-[#7c3aed] text-[#7c3aed]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Accès
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'billing'
                  ? 'border-[#7c3aed] text-[#7c3aed]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Facturation
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-5 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Équipe</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.totalStaff || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-5 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.totalClients || 0}</p>
                  </div>
                  <UserCircle className="w-8 h-8 text-pink-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-5 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Réservations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.reservations || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-emerald-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-5 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Services</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeServices || 0}/{stats.services || 0}</p>
                  </div>
                  <Package className="w-8 h-8 text-purple-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Informations */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Informations générales</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Raison sociale</p>
                    <p className="text-sm font-medium text-gray-900">{organization.legalName || organization.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900">{organization.ownerEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {organization.ownerPhone || organization.config?.phone || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">SIRET</p>
                      <p className="text-sm font-medium text-gray-900">
                        {organization.siret || organization.config?.siret || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">N° TVA</p>
                      <p className="text-sm font-medium text-gray-900">
                        {organization.tvaNumber || organization.config?.tvaNumber || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Créée le</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(organization.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fin d'essai</p>
                      <p className="text-sm font-medium text-gray-900">
                        {organization.trialEndsAt
                          ? new Date(organization.trialEndsAt).toLocaleDateString('fr-FR')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Domaines</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Slug</p>
                    <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded border">@{organization.slug}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sous-domaine</p>
                    <p className="text-sm font-mono bg-blue-50 px-3 py-2 rounded border border-blue-200">
                      {organization.subdomain}.laia.fr
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Domaine personnalisé</p>
                    <p className={`text-sm font-mono px-3 py-2 rounded border ${
                      organization.domain
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}>
                      {organization.domain || 'Non configuré'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Clients */}
            {clients.length > 0 && (
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Top 5 clients</h2>
                <div className="space-y-2">
                  {clients.map((client: any, index: number) => (
                    <div key={client.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.email}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded">
                        {client.reservationCount} réservations
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Équipe */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Comptes de l'équipe ({staff.length})</h2>
                <Link
                  href={`/super-admin/organizations/${organization.id}/users`}
                  className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6b46c1] transition text-sm font-medium"
                >
                  Gérer les utilisateurs
                </Link>
              </div>

              {staff.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun membre d'équipe</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {staff.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-[#6b46c1] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </div>
                            {member.phone && (
                              <>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Phone className="w-3 h-3" />
                                  {member.phone}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {member.roleLabel}
                        </span>
                        {member.lastLoginAt && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(member.lastLoginAt).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Répartition par rôle */}
              {userStats.byRole && Object.keys(userStats.byRole).length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Répartition par rôle</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(userStats.byRole).filter(([role]) => role !== 'CLIENT').map(([role, count]) => {
                      const roleLabels: Record<string, string> = {
                        'ORG_OWNER': 'Propriétaire',
                        'ORG_ADMIN': 'Administrateur',
                        'LOCATION_MANAGER': 'Responsable',
                        'STAFF': 'Praticien(ne)',
                        'EMPLOYEE': 'Employé(e)',
                        'RECEPTIONIST': 'Réceptionniste',
                        'ACCOUNTANT': 'Comptable',
                      }
                      return (
                        <div key={role} className="text-center p-3 bg-gray-50 rounded-lg border">
                          <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                          <p className="text-xs text-gray-600 mt-1">{roleLabels[role] || role}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Informations du site */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Configuration du site</h2>
              {organization.config ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Nom du site</p>
                      <p className="text-sm font-medium text-gray-900">{organization.config.siteName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Slogan</p>
                      <p className="text-sm font-medium text-gray-900">{organization.config.siteTagline || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email de contact</p>
                      <p className="text-sm font-medium text-gray-900">{organization.config?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Téléphone de contact</p>
                      <p className="text-sm font-medium text-gray-900">{organization.config?.phone || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Adresse</p>
                      <p className="text-sm font-medium text-gray-900">
                        {organization.config.address && organization.config.city
                          ? `${organization.config.address}, ${organization.config.postalCode} ${organization.config.city}`
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Informations légales complètes */}
                  {(organization.config?.siret || organization.config?.siren || organization.config?.apeCode ||
                    organization.config?.rcs || organization.config?.capital || organization.config?.legalForm ||
                    organization.config?.insuranceCompany) && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-sm font-bold text-gray-700 mb-3">Informations légales</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {organization.config?.siret && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">SIRET</p>
                            <p className="text-sm font-medium text-gray-900">{organization.config.siret}</p>
                          </div>
                        )}
                        {organization.config?.siren && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">SIREN</p>
                            <p className="text-sm font-medium text-gray-900">{organization.config.siren}</p>
                          </div>
                        )}
                        {organization.config?.apeCode && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Code APE</p>
                            <p className="text-sm font-medium text-gray-900">{organization.config.apeCode}</p>
                          </div>
                        )}
                        {organization.config?.rcs && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">RCS</p>
                            <p className="text-sm font-medium text-gray-900">{organization.config.rcs}</p>
                          </div>
                        )}
                        {organization.config?.capital && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Capital social</p>
                            <p className="text-sm font-medium text-gray-900">{organization.config.capital}</p>
                          </div>
                        )}
                        {organization.config?.legalForm && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Forme juridique</p>
                            <p className="text-sm font-medium text-gray-900">{organization.config.legalForm}</p>
                          </div>
                        )}
                      </div>

                      {/* Assurance */}
                      {organization.config?.insuranceCompany && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Assurance</p>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Compagnie</p>
                              <p className="text-sm font-medium text-gray-900">{organization.config.insuranceCompany}</p>
                            </div>
                            {organization.config?.insuranceContract && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">N° de contrat</p>
                                <p className="text-sm font-medium text-gray-900">{organization.config.insuranceContract}</p>
                              </div>
                            )}
                            {organization.config?.insuranceAddress && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Adresse de la compagnie</p>
                                <p className="text-sm font-medium text-gray-900">{organization.config.insuranceAddress}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Informations bancaires */}
                  {(organization.config?.bankName || organization.config?.bankIban || organization.config?.bankBic) && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-sm font-bold text-gray-700 mb-3">Informations bancaires</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {organization.config?.bankName && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Nom de la banque</p>
                            <p className="text-sm font-medium text-gray-900">{organization.config.bankName}</p>
                          </div>
                        )}
                        {organization.config?.bankIban && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">IBAN</p>
                            <p className="text-sm font-mono text-gray-900">{organization.config.bankIban}</p>
                          </div>
                        )}
                        {organization.config?.bankBic && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">BIC</p>
                            <p className="text-sm font-mono text-gray-900">{organization.config.bankBic}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Représentant légal */}
                  {(organization.config?.legalRepName || organization.config?.legalRepTitle) && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-sm font-bold text-gray-700 mb-3">Représentant légal</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {organization.config?.legalRepName && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Nom du représentant</p>
                            <p className="text-sm font-medium text-gray-900">{organization.config.legalRepName}</p>
                          </div>
                        )}
                        {organization.config?.legalRepTitle && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Titre / Fonction</p>
                            <p className="text-sm font-medium text-gray-900">{organization.config.legalRepTitle}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Horaires d'ouverture */}
                  {organization.config?.businessHours && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Horaires d'ouverture</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(organization.config.businessHours).map(([day, hours]: [string, any]) => {
                        const dayLabels: Record<string, string> = {
                          monday: 'Lundi',
                          tuesday: 'Mardi',
                          wednesday: 'Mercredi',
                          thursday: 'Jeudi',
                          friday: 'Vendredi',
                          saturday: 'Samedi',
                          sunday: 'Dimanche'
                        }
                        return (
                          <div key={day} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium text-gray-700">{dayLabels[day]}</span>
                            <span className="text-gray-600">
                              {hours?.closed ? 'Fermé' : `${hours?.open || '-'} - ${hours?.close || '-'}`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Réseaux sociaux */}
                {(organization.config?.facebook || organization.config?.instagram || organization.config?.tiktok) && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Réseaux sociaux</h3>
                    <div className="space-y-2">
                      {organization.config?.facebook && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 w-24">Facebook:</span>
                          <a href={organization.config.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {organization.config.facebook}
                          </a>
                        </div>
                      )}
                      {organization.config?.instagram && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 w-24">Instagram:</span>
                          <a href={organization.config.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {organization.config.instagram}
                          </a>
                        </div>
                      )}
                      {organization.config?.tiktok && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 w-24">TikTok:</span>
                          <a href={organization.config.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {organization.config.tiktok}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">Aucune configuration définie pour le moment</p>
              )}
            </div>

            {/* Établissements */}
            {organization.locations && organization.locations.length > 0 ? (
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Établissements ({organization.locations.length})</h2>
                <div className="space-y-3">
                  {organization.locations.map((location: any) => (
                    <div key={location.id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{location.name}</p>
                              {location.isMainLocation && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                  Principal
                                </span>
                              )}
                            </div>
                            {location.address && (
                              <p className="text-sm text-gray-600 mt-1">
                                {location.address}, {location.postalCode} {location.city}
                              </p>
                            )}
                            {location.phone && (
                              <p className="text-sm text-gray-500 mt-1">
                                <Phone className="w-3 h-3 inline mr-1" />
                                {location.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Paramètres de paiement */}
            {organization.paymentSettings ? (
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Paramètres de paiement</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Paiement en ligne</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.paymentSettings.onlinePaymentEnabled ? '✅ Activé' : '❌ Désactivé'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Paiement sur place</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.paymentSettings.onSitePaymentEnabled ? '✅ Activé' : '❌ Désactivé'}
                    </p>
                  </div>
                  {organization.paymentSettings.stripeAccountId && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Compte Stripe</p>
                      <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded border">
                        {organization.paymentSettings.stripeAccountId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Programme de fidélité */}
            {organization.loyaltyProgram ? (
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Programme de fidélité</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Statut</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.loyaltyProgram.enabled ? '✅ Activé' : '❌ Désactivé'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Points par euro</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.loyaltyProgram.pointsPerEuro || 0} pts
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Valeur d'un point</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.loyaltyProgram.pointValue || 0}€
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Paramètres de réservation */}
            {organization.bookingSettings ? (
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Paramètres de réservation</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Délai minimum de réservation</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.bookingSettings.minBookingDelay || 0} heures
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Délai maximum de réservation</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.bookingSettings.maxBookingDelay || 0} jours
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Durée du créneau</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.bookingSettings.slotDuration || 30} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Confirmation automatique</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.bookingSettings.autoConfirm ? '✅ Activée' : '❌ Désactivée'}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Accès */}
        {activeTab === 'access' && (
          <div className="space-y-6">
            {/* Identifiants d'accès */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Identifiants d'accès client</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email de connexion</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      defaultValue={organization.ownerEmail}
                      id="admin-email"
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('admin-email') as HTMLInputElement
                        navigator.clipboard.writeText(input.value)
                        alert('✅ Email copié!')
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Copier
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL de connexion</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="http://localhost:3001/admin"
                      readOnly
                      className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('http://localhost:3001/admin')
                        alert('✅ URL copiée!')
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Copier
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Se connecter en tant qu'admin de cette organisation</p>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/super-admin/impersonate`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ organizationId: organization.id })
                          })
                          if (response.ok) {
                            const data = await response.json()
                            window.location.href = data.redirect || '/admin'
                          } else {
                            alert('❌ Erreur lors de la connexion')
                          }
                        } catch (error) {
                          alert('❌ Erreur')
                        }
                      }}
                      className="w-full px-4 py-3 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6b46c1] font-medium"
                    >
                      🔐 Accéder à l'admin
                    </button>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-3">Générer un nouveau mot de passe temporaire</p>
                    <button
                      onClick={async () => {
                        if (!confirm('Générer un nouveau mot de passe ?')) return
                        try {
                          const response = await fetch(`/api/super-admin/organizations/${organization.id}/reset-password`, {
                            method: 'POST'
                          })
                          if (response.ok) {
                            const data = await response.json()
                            navigator.clipboard.writeText(data.newPassword)
                            alert(`✅ Nouveau mot de passe copié !\n\n${data.newPassword}`)
                          }
                        } catch (error) {
                          alert('❌ Erreur')
                        }
                      }}
                      className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                    >
                      Générer un nouveau mot de passe
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations légales */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informations légales</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">SIRET</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.siret || organization.config?.siret || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">SIREN</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.config?.siren || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Code APE</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.config?.apeCode || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">RCS</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.config?.rcs || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Capital social</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.config?.capital || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Forme juridique</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.config?.legalForm || '-'}
                  </p>
                </div>
              </div>

              {/* Assurance */}
              {organization.config?.insuranceCompany && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Assurance</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Compagnie</p>
                      <p className="text-sm font-medium text-gray-900">{organization.config.insuranceCompany}</p>
                    </div>
                    {organization.config?.insuranceContract && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">N° de contrat</p>
                        <p className="text-sm font-medium text-gray-900">{organization.config.insuranceContract}</p>
                      </div>
                    )}
                    {organization.config?.insuranceAddress && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Adresse</p>
                        <p className="text-sm font-medium text-gray-900">{organization.config.insuranceAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Informations bancaires */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informations bancaires</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nom de la banque</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.config?.bankName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">IBAN</p>
                  <p className="text-sm font-mono text-gray-900">
                    {organization.config?.bankIban || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">BIC</p>
                  <p className="text-sm font-mono text-gray-900">
                    {organization.config?.bankBic || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Représentant légal */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Représentant légal</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nom du représentant</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.config?.legalRepName || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Titre / Fonction</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.config?.legalRepTitle || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Facturation */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-5 border">
                <p className="text-sm text-gray-500 mb-1">Plan actuel</p>
                <p className="text-xl font-bold text-gray-900">{organization.plan}</p>
              </div>
              <div className="bg-white rounded-lg p-5 border">
                <p className="text-sm text-gray-500 mb-1">Statut</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>
              <div className="bg-white rounded-lg p-5 border">
                <p className="text-sm text-gray-500 mb-1">Montant mensuel</p>
                <p className="text-xl font-bold text-gray-900">{organization.monthlyAmount || 0}€ /mois</p>
              </div>
              <div className="bg-white rounded-lg p-5 border">
                <p className="text-sm text-gray-500 mb-1">Prochaine facturation</p>
                <p className="text-sm font-medium text-gray-900">
                  {organization.nextBillingDate
                    ? new Date(organization.nextBillingDate).toLocaleDateString('fr-FR')
                    : '-'}
                </p>
              </div>
              {organization.status === 'TRIAL' && organization.trialEndsAt && (
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                  <p className="text-sm text-blue-600 mb-1">🎁 Période d&apos;essai gratuite</p>
                  <p className="text-xl font-bold text-blue-900">
                    {Math.max(0, Math.ceil((new Date(organization.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} jours restants
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Fin le {new Date(organization.trialEndsAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Détails de l'abonnement</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date de création</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(organization.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Fin de période d'essai</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.trialEndsAt
                        ? new Date(organization.trialEndsAt).toLocaleDateString('fr-FR')
                        : 'Aucune'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mandat SEPA</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      organization.sepaMandate
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {organization.sepaMandate ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                {organization.sepaMandate && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2">Informations SEPA</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">IBAN:</span>{' '}
                        <span className="font-mono">{organization.sepaIban || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Titulaire:</span>{' '}
                        <span>{organization.sepaAccountHolder || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Informations de facturation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Raison sociale</p>
                  <p className="text-sm font-medium text-gray-900">{organization.legalName || organization.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">SIRET</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.siret || organization.config?.siret || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email de facturation</p>
                  <p className="text-sm font-medium text-gray-900">{organization.billingEmail || organization.ownerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">N° TVA</p>
                  <p className="text-sm font-medium text-gray-900">
                    {organization.tvaNumber || organization.config?.tvaNumber || '-'}
                  </p>
                </div>
                {organization.billingAddress && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Adresse de facturation</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.billingAddress}
                      {organization.billingPostalCode && organization.billingCity &&
                        `, ${organization.billingPostalCode} ${organization.billingCity}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Liste des factures */}
            {organization.invoices && organization.invoices.length > 0 && (
              <div className="bg-white rounded-lg p-6 border">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Dernières factures ({organization.invoices.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">N° Facture</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Plan</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">Montant</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">Statut</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Échéance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organization.invoices.map((invoice: any) => {
                        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                          PAID: { bg: 'bg-green-100', text: 'text-green-800', label: 'Payée' },
                          PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
                          OVERDUE: { bg: 'bg-red-100', text: 'text-red-800', label: 'En retard' },
                          CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Annulée' },
                          REFUNDED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Remboursée' },
                        }
                        const status = statusConfig[invoice.status] || statusConfig.PENDING

                        return (
                          <tr key={invoice.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-mono text-gray-900">{invoice.invoiceNumber}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                {invoice.plan}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right">
                              {invoice.amount.toFixed(2)}€
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Link
                href={`/super-admin/organizations/${organization.id}/edit`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6b46c1] font-medium"
              >
                <CreditCard className="w-4 h-4" />
                Modifier les informations
              </Link>
              <Link
                href={`/super-admin/billing?organization=${organization.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#7c3aed] text-[#7c3aed] rounded-lg hover:bg-[#7c3aed] hover:text-white font-medium"
              >
                Voir toutes les factures
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
