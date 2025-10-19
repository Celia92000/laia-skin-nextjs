import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getAllOrganizations } from '@/lib/tenant-service'
import { prisma } from '@/lib/prisma'

export default async function SuperAdminPage() {
  // Vérifier l'authentification
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/login?redirect=/super-admin')
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    redirect('/login?redirect=/super-admin')
  }

  // Vérifier que l'utilisateur est SUPER_ADMIN
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, name: true, email: true, role: true }
  })

  if (!user || user.role !== 'SUPER_ADMIN') {
    redirect('/admin') // Rediriger vers admin normal
  }

  // Récupérer toutes les organisations
  const organizations = await getAllOrganizations()

  // Statistiques globales
  const totalUsers = await prisma.user.count()
  const totalReservations = await prisma.reservation.count()
  const totalServices = await prisma.service.count()

  // Statistiques par statut
  const activeOrgs = organizations.filter(o => o.status === 'ACTIVE').length
  const trialOrgs = organizations.filter(o => o.status === 'TRIAL').length
  const suspendedOrgs = organizations.filter(o => o.status === 'SUSPENDED').length

  // Statistiques par plan
  const planStats = {
    SOLO: organizations.filter(o => o.plan === 'SOLO').length,
    DUO: organizations.filter(o => o.plan === 'DUO').length,
    TEAM: organizations.filter(o => o.plan === 'TEAM').length,
    PREMIUM: organizations.filter(o => o.plan === 'PREMIUM').length
  }

  // Organisations récentes (dernières 5)
  const recentOrgs = organizations.slice(0, 5)

  return (
    <div className="px-4 py-8">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Organisations</p>
                <p className="text-3xl font-bold text-purple-600">{organizations.length}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs text-green-600">✓ {activeOrgs} actives</span>
                  <span className="text-xs text-blue-600">△ {trialOrgs} essais</span>
                </div>
              </div>
              <div className="text-4xl">🏢</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Utilisateurs</p>
                <p className="text-3xl font-bold text-indigo-600">{totalUsers}</p>
                <p className="text-xs text-gray-500 mt-2">Moyenne: {organizations.length > 0 ? Math.round(totalUsers / organizations.length) : 0} par org</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Réservations</p>
                <p className="text-3xl font-bold text-pink-600">{totalReservations}</p>
                <p className="text-xs text-gray-500 mt-2">Total plateforme</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Services</p>
                <p className="text-3xl font-bold text-teal-600">{totalServices}</p>
                <p className="text-xs text-gray-500 mt-2">Catalogue global</p>
              </div>
              <div className="text-4xl">💆</div>
            </div>
          </div>
        </div>

        {/* Statistiques par plan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">SOLO</p>
              <p className="text-2xl font-bold text-gray-700">{planStats.SOLO}</p>
              <p className="text-xs text-gray-500 mt-1">49€/mois</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-sm text-blue-600 mb-1">DUO</p>
              <p className="text-2xl font-bold text-blue-700">{planStats.DUO}</p>
              <p className="text-xs text-blue-500 mt-1">99€/mois</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-sm text-purple-600 mb-1">TEAM</p>
              <p className="text-2xl font-bold text-purple-700">{planStats.TEAM}</p>
              <p className="text-xs text-purple-500 mt-1">199€/mois</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-sm text-indigo-600 mb-1">PREMIUM</p>
              <p className="text-2xl font-bold text-indigo-700">{planStats.PREMIUM}</p>
              <p className="text-xs text-indigo-500 mt-1">399€/mois</p>
            </div>
          </div>
        </div>

        {/* Bienvenue */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">👋 Bienvenue {user.name}</h2>
          <p className="text-purple-100">
            Vous êtes connecté en tant que <strong>{user.email}</strong>
          </p>
          <p className="text-purple-100 mt-2">
            Utilisez les onglets ci-dessus pour naviguer dans les différentes sections de la plateforme.
          </p>
        </div>

        {/* Liste des organisations */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">📋 Toutes les Organisations</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emplacements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domaine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.map((org) => {
                  const statusColors = {
                    ACTIVE: 'bg-green-100 text-green-800',
                    TRIAL: 'bg-blue-100 text-blue-800',
                    SUSPENDED: 'bg-yellow-100 text-yellow-800',
                    CANCELLED: 'bg-red-100 text-red-800',
                  }

                  const planColors: { [key: string]: string } = {
                    SOLO: 'bg-gray-100 text-gray-800',
                    DUO: 'bg-blue-100 text-blue-800',
                    TEAM: 'bg-purple-100 text-purple-800',
                    PREMIUM: 'bg-indigo-100 text-indigo-800',
                    // Anciens noms pour compatibilité
                    STARTER: 'bg-gray-100 text-gray-800',
                    ESSENTIAL: 'bg-blue-100 text-blue-800',
                    PROFESSIONAL: 'bg-purple-100 text-purple-800',
                    ENTERPRISE: 'bg-indigo-100 text-indigo-800',
                  }

                  return (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{org.name}</div>
                            <div className="text-sm text-gray-500">@{org.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${planColors[org.plan]}`}>
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[org.status]}`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {org.locations?.length || 0} emplacements
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {org.domain || (
                          <span className="text-gray-400">{org.subdomain}.platform.com</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(org.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`/super-admin/organizations/${org.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Voir
                        </a>
                        <a
                          href={`/super-admin/organizations/${org.id}/edit`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Éditer
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bouton d'ajout */}
        <div className="mt-6 flex justify-end">
          <a
            href="/super-admin/organizations/new"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            + Ajouter une Organisation
          </a>
        </div>

        {/* Lien vers admin normal */}
        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Retour à l'interface Admin normale
          </a>
        </div>
    </div>
  )
}
