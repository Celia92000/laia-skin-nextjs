"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Download, Settings, ArrowLeft } from 'lucide-react'

interface Contract {
  organizationId: string
  organizationName: string
  contractNumber: string
  contractPdfPath: string
  contractSignedAt: string
  plan: string
  monthlyAmount: number
  ownerEmail: string
  ownerFirstName: string | null
  ownerLastName: string | null
}

export default function ContractsPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState('ALL')

  useEffect(() => {
    fetchContracts()
  }, [])

  async function fetchContracts() {
    setLoading(true)
    try {
      const res = await fetch('/api/super-admin/contracts')
      if (res.ok) {
        const data = await res.json()
        setContracts(data.contracts)
      } else if (res.status === 401) {
        router.push('/login?redirect=/super-admin/billing/contracts')
      } else if (res.status === 403) {
        router.push('/super-admin')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch =
      contract.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPlan = planFilter === 'ALL' || contract.plan === planFilter

    return matchesSearch && matchesPlan
  })

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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/super-admin/billing"
          className="text-purple-600 hover:text-purple-700 mb-4 inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Retour à la facturation
        </Link>

        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Contrats d'Abonnement</h1>
            <p className="text-gray-600">
              {filteredContracts.length} contrat{filteredContracts.length > 1 ? 's' : ''} au total
            </p>
          </div>

          <Link
            href="/super-admin/billing/contracts/template"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Settings size={20} />
            Modifier le template
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Organisation, contrat, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan
            </label>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="ALL">Tous les plans</option>
              <option value="SOLO">SOLO</option>
              <option value="DUO">DUO</option>
              <option value="TEAM">TEAM</option>
              <option value="PREMIUM">PREMIUM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des contrats */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun contrat trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contrat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signé le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.contractNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Link
                          href={`/super-admin/organizations/${contract.organizationId}`}
                          className="text-sm font-medium text-purple-600 hover:text-purple-700"
                        >
                          {contract.organizationName}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {contract.ownerFirstName && contract.ownerLastName
                            ? `${contract.ownerFirstName} ${contract.ownerLastName}`
                            : contract.ownerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-600" />
                        <span className="text-sm text-gray-900">{contract.contractNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contract.plan === 'SOLO' ? 'bg-gray-100 text-gray-800' :
                        contract.plan === 'DUO' ? 'bg-blue-100 text-blue-800' :
                        contract.plan === 'TEAM' ? 'bg-amber-100 text-amber-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {contract.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.monthlyAmount.toFixed(2)} € /mois
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contract.contractSignedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/super-admin/download-document?path=${encodeURIComponent(contract.contractPdfPath)}`}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                          download
                        >
                          <Download size={14} />
                          PDF
                        </a>
                        <Link
                          href={`/super-admin/organizations/${contract.organizationId}`}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                        >
                          Voir
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
