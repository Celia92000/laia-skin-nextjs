"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CreditCard, FileText, Download, Eye, Building2, Globe, User, Key } from 'lucide-react'
import CommunicationHistory from '@/components/super-admin/CommunicationHistory'

interface Organization {
  id: string
  name: string
  legalName: string | null
  slug: string
  subdomain: string
  domain: string | null
  plan: string
  status: string
  monthlyAmount: number
  trialEndsAt: string | null
  ownerEmail: string
  ownerFirstName: string | null
  ownerLastName: string | null
  ownerPhone: string | null
  billingEmail: string | null
  billingAddress: string | null
  billingPostalCode: string | null
  billingCity: string | null
  siret: string | null
  tvaNumber: string | null
  sepaMandateRef: string | null
  contractNumber: string | null
  contractPdfPath: string | null
  contractSignedAt: string | null
  createdAt: string
  updatedAt: string
  config: {
    siteName: string | null
    email: string | null
    phone: string | null
    city: string | null
    siret: string | null
  }
}

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: string
  issueDate: string
  dueDate: string
  paidAt: string | null
  description: string | null
  pdfPath: string | null
}

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

export default function OrganizationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orgId = params.id as string

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchOrganization()
  }, [orgId])

  async function fetchOrganization() {
    setLoading(true)
    try {
      const res = await fetch(`/api/super-admin/organizations/${orgId}`)
      if (res.ok) {
        const data = await res.json()
        setOrganization(data.organization)
        setInvoices(data.invoices || [])
        setUsers(data.users || [])

        // Récupérer le mot de passe généré depuis l'historique des communications
        if (data.organization?.ownerEmail) {
          fetchGeneratedPassword(data.organization.ownerEmail)
        }
      } else {
        alert('Organisation introuvable')
        router.push('/super-admin/organizations')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function fetchGeneratedPassword(email: string) {
    try {
      const params = new URLSearchParams({ clientEmail: email })
      const res = await fetch(`/api/crm/communications?${params}`)
      if (res.ok) {
        const data = await res.json()
        // Chercher l'email de bienvenue avec les identifiants
        const welcomeEmail = data.history?.find((comm: any) =>
          comm.metadata?.hasCredentials && comm.metadata?.generatedPassword
        )
        if (welcomeEmail?.metadata?.generatedPassword) {
          setGeneratedPassword(welcomeEmail.metadata.generatedPassword)
        }
      }
    } catch (error) {
      console.error('Erreur récupération mot de passe:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return null
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    TRIAL: 'bg-blue-100 text-blue-800',
    SUSPENDED: 'bg-orange-100 text-orange-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PENDING: 'bg-gray-100 text-gray-800'
  }

  const planColors: Record<string, string> = {
    SOLO: 'bg-purple-100 text-purple-800',
    DUO: 'bg-blue-100 text-blue-800',
    TEAM: 'bg-green-100 text-green-800',
    PREMIUM: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  }

  const siteUrl = organization.domain
    ? `https://${organization.domain}`
    : `https://${organization.subdomain}.laia-connect.fr`

  const adminUrl = organization.domain
    ? `https://${organization.domain}/admin`
    : `https://${organization.subdomain}.laia-connect.fr/admin`

  const owner = users.find(u => u.email === organization.ownerEmail)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/super-admin/organizations')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Retour à la liste
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[organization.status] || 'bg-gray-100 text-gray-800'}`}>
                  {organization.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${planColors[organization.plan] || 'bg-gray-100 text-gray-800'}`}>
                  {organization.plan}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Globe size={18} />
                Voir le site
              </a>
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Building2 size={18} />
                Admin
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Raison sociale</p>
                  <p className="font-medium">{organization.legalName || organization.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Slug</p>
                  <p className="font-medium font-mono text-sm">{organization.slug}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subdomain</p>
                  <p className="font-medium font-mono text-sm">{organization.subdomain}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Domaine personnalisé</p>
                  <p className="font-medium">{organization.domain || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Créé le</p>
                  <p className="font-medium">{new Date(organization.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mis à jour le</p>
                  <p className="font-medium">{new Date(organization.updatedAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>

            {/* Identifiants de connexion */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Key size={20} />
                Identifiants de connexion
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email de connexion</p>
                    <p className="font-medium text-lg">{organization.ownerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Propriétaire</p>
                    <p className="font-medium">{owner?.name ?? 'Non renseigné'}</p>
                  </div>
                  {generatedPassword && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Mot de passe généré</p>
                      <div className="flex items-center gap-3">
                        {showPassword ? (
                          <p className="font-mono text-lg font-bold text-blue-900">{generatedPassword}</p>
                        ) : (
                          <p className="font-mono text-lg text-gray-500">••••••••••••</p>
                        )}
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          {showPassword ? '🙈 Masquer' : '👁️ Afficher'}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <p className="text-xs text-blue-600">
                      💡 Le mot de passe a été envoyé par email lors de la création du compte
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Facturation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Facturation</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">SIRET</p>
                  <p className="font-medium">{organization.siret || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">N° TVA</p>
                  <p className="font-medium">{organization.tvaNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Montant mensuel</p>
                  <p className="font-medium text-lg">{organization.monthlyAmount} €</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mandat SEPA</p>
                  <p className="font-medium text-sm">{organization.sepaMandateRef || '-'}</p>
                </div>
                {organization.trialEndsAt && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Fin de l'essai</p>
                    <p className="font-medium">{new Date(organization.trialEndsAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Factures et contrats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} />
                Documents
              </h2>

              <div className="space-y-4">
                {/* Contrat d'abonnement */}
                {organization.contractPdfPath ? (
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                      📄 Contrat d'abonnement
                    </h3>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">{organization.contractNumber ?? 'N/A'}</p>
                            <p className="text-sm text-gray-600">
                              Signé le {organization.contractSignedAt ? new Date(organization.contractSignedAt).toLocaleDateString('fr-FR') : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <a
                        href={`/api/super-admin/download-document?path=${encodeURIComponent(organization.contractPdfPath)}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                        download
                      >
                        <Download size={16} />
                        Télécharger
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-gray-200 bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500 text-sm text-center">Aucun contrat disponible</p>
                  </div>
                )}

                {/* Factures */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 Factures</h3>
                  {invoices.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">Aucune facture disponible</p>
                  ) : (
                    <div className="space-y-2">
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <FileText size={18} className="text-gray-400" />
                              <div>
                                <p className="font-medium">{invoice.invoiceNumber}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(invoice.issueDate).toLocaleDateString('fr-FR')} • {invoice.amount} € • {invoice.status}
                                </p>
                              </div>
                            </div>
                          </div>
                          {invoice.pdfPath && (
                            <a
                              href={`/api/super-admin/download-document?path=${encodeURIComponent(invoice.pdfPath)}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                              download
                            >
                              <Download size={16} />
                              Télécharger
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Historique des communications */}
            <CommunicationHistory
              organizationId={organization.id}
              ownerEmail={organization.ownerEmail}
            />
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${organization.ownerEmail}`} className="text-purple-600 hover:underline">
                      {organization.ownerEmail}
                    </a>
                  </div>
                </div>
                {organization.ownerPhone && (
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <a href={`tel:${organization.ownerPhone}`} className="text-purple-600 hover:underline">
                        {organization.ownerPhone}
                      </a>
                    </div>
                  </div>
                )}
                {organization.config?.city && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Ville</p>
                      <p className="font-medium">{organization.config.city}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Utilisateurs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User size={20} />
                Utilisateurs ({users.length})
              </h2>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{user.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
