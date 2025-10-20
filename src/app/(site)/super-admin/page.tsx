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
    <div className="px-4 py-8 min-h-screen bg-gray-50">
        {/* Bienvenue */}
        <div className="mb-8 p-8 rounded-2xl shadow-lg bg-white border-2" style={{
          borderColor: '#d4b5a0'
        }}>
          <h2 className="text-3xl font-bold mb-2" style={{
            fontFamily: 'Playfair Display, serif',
            color: '#d4b5a0'
          }}>
            👋 Bienvenue {user.name}
          </h2>
          <p className="text-gray-700 text-lg">
            Vous êtes connecté en tant que <strong>{user.email}</strong>
          </p>
          <p className="text-gray-600 mt-2">
            Gérez toutes les organisations de la plateforme LAIA depuis ce tableau de bord.
          </p>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-gray-600">Organisations</p>
                <p className="text-3xl font-bold" style={{ color: '#d4b5a0' }}>{organizations.length}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs text-green-600">✓ {activeOrgs} actives</span>
                  <span className="text-xs text-blue-600">△ {trialOrgs} essais</span>
                </div>
              </div>
              <div className="text-5xl opacity-20">🏢</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-gray-600">Utilisateurs</p>
                <p className="text-3xl font-bold" style={{ color: '#e8b4b8' }}>{totalUsers}</p>
                <p className="text-xs mt-2 text-gray-500">Moyenne: {organizations.length > 0 ? Math.round(totalUsers / organizations.length) : 0} par org</p>
              </div>
              <div className="text-5xl opacity-20">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-gray-600">Réservations</p>
                <p className="text-3xl font-bold" style={{ color: '#b8935f' }}>{totalReservations}</p>
                <p className="text-xs mt-2 text-gray-500">Total plateforme</p>
              </div>
              <div className="text-5xl opacity-20">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1 text-gray-600">Services</p>
                <p className="text-3xl font-bold text-teal-600">{totalServices}</p>
                <p className="text-xs mt-2 text-gray-500">Catalogue global</p>
              </div>
              <div className="text-5xl opacity-20">💆</div>
            </div>
          </div>
        </div>

        {/* Statistiques par plan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-2 border-gray-200">
            <div className="text-center">
              <p className="text-sm mb-1 text-gray-600">SOLO</p>
              <p className="text-2xl font-bold text-gray-700">{planStats.SOLO}</p>
              <p className="text-xs mt-1 text-gray-500">49€/mois</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-2 border-blue-200">
            <div className="text-center">
              <p className="text-sm mb-1 text-blue-600">DUO</p>
              <p className="text-2xl font-bold text-blue-700">{planStats.DUO}</p>
              <p className="text-xs mt-1 text-gray-600">99€/mois</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-2" style={{ borderColor: '#d4b5a0' }}>
            <div className="text-center">
              <p className="text-sm mb-1" style={{ color: '#d4b5a0' }}>TEAM</p>
              <p className="text-2xl font-bold" style={{ color: '#d4b5a0' }}>{planStats.TEAM}</p>
              <p className="text-xs mt-1 text-gray-600">199€/mois</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all border-2" style={{ borderColor: '#e8b4b8' }}>
            <div className="text-center">
              <p className="text-sm mb-1" style={{ color: '#e8b4b8' }}>PREMIUM</p>
              <p className="text-2xl font-bold" style={{ color: '#e8b4b8' }}>{planStats.PREMIUM}</p>
              <p className="text-xs mt-1 text-gray-600">399€/mois</p>
            </div>
          </div>
        </div>

        {/* Liste des organisations */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800" style={{
              fontFamily: 'Playfair Display, serif'
            }}>📋 Toutes les Organisations</h2>
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
            className="text-white px-8 py-3 rounded-full font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #d4b5a0 0%, #e8b4b8 100%)',
              boxShadow: '0 4px 12px rgba(212, 181, 160, 0.3)'
            }}
          >
            + Ajouter une Organisation
          </a>
        </div>

        {/* Lien vers admin normal */}
        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="text-gray-600 hover:text-gray-800 hover:underline transition-all"
          >
            ← Retour à l'interface Admin normale
          </a>
        </div>
    </div>
  )
}
