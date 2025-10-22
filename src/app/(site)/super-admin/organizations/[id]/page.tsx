"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<any>(null)
  const [stats, setStats] = useState({
    usersCount: 0,
    reservationsCount: 0,
    servicesCount: 0,
    productsCount: 0
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/super-admin/organizations/${id}`)
        if (response.ok) {
          const data = await response.json()
          setOrganization(data.organization)
          setStats(data.stats)
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
    fetchData()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#d4b5a0" }} className=" mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Organisation non trouvée</h1>
          <Link
            href="/super-admin"
            className="text-[#b8935f] hover:text-beige-800 underline"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-300',
    TRIAL: 'bg-blue-100 text-blue-800 border-blue-300',
    SUSPENDED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  }

  const planColors = {
    SOLO: 'bg-gray-100 text-gray-800',
    DUO: 'bg-blue-100 text-blue-800',
    TEAM: 'bg-purple-100 text-beige-800',
    PREMIUM: 'bg-indigo-100 text-indigo-800',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="text-white" style={{ background: "linear-gradient(to right, #d4b5a0, #c9a589)" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/super-admin"
                className="text-white/80 hover:text-white mb-2 inline-block"
              >
                ← Retour au dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">{organization.name}</h1>
              <p className="text-white/90">@{organization.slug}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-lg font-semibold border-2 ${statusColors[organization.status as keyof typeof statusColors]}`}>
                {organization.status}
              </span>
              <span className={`px-4 py-2 rounded-lg font-semibold ${planColors[organization.plan as keyof typeof planColors]}`}>
                {organization.plan}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Utilisateurs</p>
                <p className="text-3xl font-bold" style={{ color: "#b8935f" }}>{stats.usersCount}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Réservations</p>
                <p className="text-3xl font-bold text-pink-600">{stats.reservationsCount}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Services</p>
                <p className="text-3xl font-bold text-teal-600">{stats.servicesCount}</p>
              </div>
              <div className="text-4xl">💆</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Produits</p>
                <p className="text-3xl font-bold text-orange-600">{stats.productsCount}</p>
              </div>
              <div className="text-4xl">🛍️</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-8">
            {/* Identifiants Admin - À communiquer au client */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-green-300 flex items-center gap-2">
                🔑 Identifiants Admin (à communiquer au client)
              </h2>

              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Email de connexion</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      defaultValue={organization.ownerEmail}
                      id="admin-email-input"
                      className="flex-1 font-mono font-bold text-lg text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        const emailInput = document.getElementById('admin-email-input') as HTMLInputElement
                        navigator.clipboard.writeText(emailInput.value)
                        alert('✅ Email copié !')
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium whitespace-nowrap"
                    >
                      📋 Copier
                    </button>
                    <button
                      onClick={async () => {
                        const emailInput = document.getElementById('admin-email-input') as HTMLInputElement
                        const newEmail = emailInput.value.trim()

                        if (!newEmail || !newEmail.includes('@')) {
                          alert('❌ Email invalide')
                          return
                        }

                        if (!confirm(`Modifier l'email de connexion vers ${newEmail} ?`)) return

                        try {
                          const response = await fetch(`/api/super-admin/organizations/${organization.id}/update-admin-email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ newEmail })
                          })

                          if (response.ok) {
                            alert('✅ Email modifié avec succès')
                            window.location.reload()
                          } else {
                            const error = await response.json()
                            alert(`❌ ${error.error}`)
                          }
                        } catch (error) {
                          alert('❌ Erreur de connexion')
                        }
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium whitespace-nowrap"
                    >
                      💾 Modifier
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">URL de connexion</p>
                    <p className="font-mono font-bold text-blue-600">http://localhost:3001/admin</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('http://localhost:3001/admin')
                      alert('✅ URL copiée !')
                    }}
                    className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                  >
                    📋 Copier
                  </button>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Mot de passe :</strong> Le mot de passe a été généré automatiquement lors de la création et ne peut plus être affiché pour des raisons de sécurité.
                  </p>
                  <p className="text-sm text-yellow-800 mt-2">
                    💡 <strong>Solution :</strong> Utilisez le bouton "Générer un nouveau mot de passe" ci-dessous.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    if (!confirm('Générer un nouveau mot de passe pour cet administrateur ?')) return

                    try {
                      const response = await fetch(`/api/super-admin/organizations/${organization.id}/reset-password`, {
                        method: 'POST'
                      })

                      if (response.ok) {
                        const data = await response.json()
                        alert(`✅ Nouveau mot de passe généré :\n\n${data.newPassword}\n\n(Copiez-le maintenant, il ne sera plus affiché !)`)
                        navigator.clipboard.writeText(data.newPassword)
                      } else {
                        alert('❌ Erreur lors de la génération du mot de passe')
                      }
                    } catch (error) {
                      alert('❌ Erreur de connexion')
                    }
                  }}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  🔄 Générer un nouveau mot de passe
                </button>
              </div>
            </div>

            {/* Détails de l'organisation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Informations
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom légal</p>
                  <p className="font-medium text-gray-900">{organization.legalName || organization.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium text-gray-900">
                    {organization.type === 'SINGLE_LOCATION' ? 'Mono-emplacement' : 'Multi-emplacements'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email propriétaire</p>
                  <p className="font-medium text-gray-900">{organization.ownerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">{organization.ownerPhone || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Créée le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(organization.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fin d'essai</p>
                  <p className="font-medium text-gray-900">
                    {organization.trialEndsAt
                      ? new Date(organization.trialEndsAt).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Domaines */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Domaines
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Subdomain</p>
                  <p className="font-medium text-gray-900">
                    {organization.subdomain}.platform.com
                  </p>
                </div>
                {organization.domain && (
                  <div>
                    <p className="text-sm text-gray-600">Domaine personnalisé</p>
                    <p className="font-medium text-gray-900">{organization.domain}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Emplacements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Emplacements ({organization.locations?.length || 0})
              </h2>
              <div className="space-y-3">
                {organization.locations && organization.locations.length > 0 ? (
                  organization.locations.map((location: any) => (
                    <div key={location.id} className="border rounded-lg p-4 hover:border-purple-300 transition">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{location.name}</h3>
                        {location.isMainLocation && (
                          <span className="px-2 py-1 bg-purple-100 text-beige-800 text-xs font-semibold rounded">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {location.address}, {location.postalCode} {location.city}
                      </p>
                      {location.phone && (
                        <p className="text-sm text-gray-600 mt-1">📞 {location.phone}</p>
                      )}
                      <div className="mt-3 pt-3 border-t flex gap-2">
                        <a
                          href={`/${organization.slug}/${location.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center px-3 py-1.5 text-xs bg-teal-50 text-teal-700 rounded hover:bg-teal-100 transition"
                        >
                          🌐 Site
                        </a>
                        <a
                          href={`/${organization.slug}/${location.slug}/admin`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center px-3 py-1.5 text-xs bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition"
                        >
                          🔧 Admin
                        </a>
                        <a
                          href={`/${organization.slug}/${location.slug}/espace-client`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center px-3 py-1.5 text-xs bg-pink-50 text-pink-700 rounded hover:bg-pink-100 transition"
                        >
                          👤 Client
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun emplacement</p>
                )}
              </div>
            </div>
          </div>

          {/* Barre latérale - Actions */}
          <div className="space-y-6">
            {/* Limites du plan */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Limites du plan
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Emplacements</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: "#d4b5a0",
                          width: `${Math.min(
                            ((organization.locations?.length || 0) / organization.maxLocations) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {organization.locations?.length || 0}/{organization.maxLocations}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Utilisateurs</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((stats.usersCount / organization.maxUsers) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {stats.usersCount}/{organization.maxUsers}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Stockage</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <span className="text-sm font-medium">~1/{organization.maxStorage} GB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href={`/super-admin/organizations/${organization.id}/edit`}
                  className="block w-full text-center px-4 py-2 className=" style={{ backgroundColor: "#d4b5a0" }}text-white rounded-lg hover:bg-purple-700 transition"
                >
                  ✏️ Modifier
                </Link>
                <Link
                  href={`/super-admin/organizations/${organization.id}/locations`}
                  className="block w-full text-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                  📍 Gérer les emplacements
                </Link>
                <Link
                  href={`/super-admin/organizations/${organization.id}/users`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  👥 Utilisateurs
                </Link>
                <Link
                  href={`/super-admin/organizations/${organization.id}/settings`}
                  className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  ⚙️ Paramètres
                </Link>
                <button
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
                      } else {
                        const error = await response.json()
                        alert(`Erreur: ${error.error}`)
                      }
                    } catch (error) {
                      console.error('Error:', error)
                      alert('Erreur lors de la connexion')
                    }
                  }}
                >
                  🔐 Se connecter en tant que propriétaire
                </button>
              </div>
            </div>

            {/* Aperçus */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Aperçus
              </h2>
              <div className="space-y-3">
                <a
                  href={`/${organization.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  🌐 Voir le site
                </a>
                <a
                  href={`/${organization.slug}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  🔧 Voir l'admin
                </a>
                <a
                  href={`/${organization.slug}/espace-client`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                >
                  👤 Voir l'espace client
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
