'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AddLeadModal from '@/components/crm/AddLeadModal'
import LeadDetailModal from '@/components/crm/LeadDetailModal'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DEMO_SCHEDULED' | 'DEMO_DONE' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'CONTRACT_SIGNED' | 'WON' | 'LOST' | 'ON_HOLD'
type LeadSource = 'WEBSITE' | 'REFERRAL' | 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'GOOGLE_ADS' | 'EMAIL_CAMPAIGN' | 'COLD_EMAIL' | 'COLD_CALL' | 'NETWORKING' | 'PARTNER' | 'OTHER'

interface Lead {
  id: string
  institutName: string
  contactName: string
  contactEmail: string
  contactPhone: string | null
  city: string | null
  status: LeadStatus
  source: LeadSource
  score: number
  probability: number
  estimatedValue: number | null
  assignedTo: {
    id: string
    name: string
    email: string
  } | null
  createdAt: string
  lastContactDate: string | null
  nextFollowUpDate: string | null
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; emoji: string }> = {
  NEW: { label: 'Nouveau', color: 'bg-blue-100 text-blue-800', emoji: '🆕' },
  CONTACTED: { label: 'Contacté', color: 'bg-cyan-100 text-cyan-800', emoji: '📧' },
  QUALIFIED: { label: 'Qualifié', color: 'bg-green-100 text-green-800', emoji: '✅' },
  DEMO_SCHEDULED: { label: 'Démo planifiée', color: 'bg-purple-100 text-beige-800', emoji: '📅' },
  DEMO_DONE: { label: 'Démo faite', color: 'bg-indigo-100 text-indigo-800', emoji: '🎯' },
  PROPOSAL_SENT: { label: 'Proposition envoyée', color: 'bg-yellow-100 text-yellow-800', emoji: '📤' },
  NEGOTIATION: { label: 'Négociation', color: 'bg-orange-100 text-orange-800', emoji: '💬' },
  CONTRACT_SIGNED: { label: 'Contrat signé', color: 'bg-teal-100 text-teal-800', emoji: '📝' },
  WON: { label: 'Gagné', color: 'bg-emerald-100 text-emerald-800', emoji: '🎉' },
  LOST: { label: 'Perdu', color: 'bg-red-100 text-red-800', emoji: '❌' },
  ON_HOLD: { label: 'En attente', color: 'bg-gray-100 text-gray-800', emoji: '⏸️' }
}

// Composant carte draggable
function DraggableLeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { lead }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow-md transition cursor-move touch-none"
    >
      <div className="font-medium text-gray-900 text-sm mb-1">
        {lead.institutName}
      </div>
      <div className="text-xs text-gray-600 mb-2">
        {lead.contactName}
      </div>
      {lead.city && (
        <div className="text-xs text-gray-500 mb-2">
          📍 {lead.city}
        </div>
      )}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Score: {lead.score}/100</span>
        {lead.estimatedValue && (
          <span className="font-semibold" style={{ color: "#7c3aed" }}>
            {lead.estimatedValue.toLocaleString('fr-FR')}€
          </span>
        )}
      </div>
    </div>
  )
}

// Composant colonne droppable
function DroppableColumn({
  id,
  children,
  className
}: {
  id: string
  children: React.ReactNode
  className?: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id
  })

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-purple-50 ring-2 ring-purple-400' : ''}`}
    >
      {children}
    </div>
  )
}

export default function CRMPage() {
  const router = useRouter()
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline')
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Configuration du sensor pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Empêche le drag accidentel lors du clic
      },
    })
  )

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    setLoading(true)
    try {
      const response = await fetch('/api/super-admin/leads')
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
        setStats(data.stats)
      } else if (response.status === 401) {
        router.push('/login?redirect=/super-admin/crm')
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  // Gérer le drag & drop
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus

    // Trouver le lead déplacé
    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === newStatus) return

    // Mise à jour optimiste de l'interface
    setLeads(prevLeads =>
      prevLeads.map(l =>
        l.id === leadId ? { ...l, status: newStatus } : l
      )
    )

    // Mise à jour dans la base de données
    try {
      const response = await fetch(`/api/super-admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        // Rollback en cas d'erreur
        setLeads(prevLeads =>
          prevLeads.map(l =>
            l.id === leadId ? { ...l, status: lead.status } : l
          )
        )
        alert('Erreur lors de la mise à jour du statut')
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
      // Rollback en cas d'erreur
      setLeads(prevLeads =>
        prevLeads.map(l =>
          l.id === leadId ? { ...l, status: lead.status } : l
        )
      )
    }
  }

  const pipelineStages: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'DEMO_SCHEDULED', 'DEMO_DONE', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED']

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(l => l.status === status)
  }

  const wonLeads = leads.filter(l => l.status === 'WON')
  const lostLeads = leads.filter(l => l.status === 'LOST')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#7c3aed" }}></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <Link href="/super-admin" className="text-gray-600 hover:text-purple-600 mb-4 inline-block">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#7c3aed' }}>
              CRM Prospection
            </h2>
            <p className="text-gray-700">Pipeline commercial & gestion des leads</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-white rounded-lg hover:bg-gray-100 transition font-semibold border-2 shadow-sm"
            style={{ color: '#7c3aed', borderColor: '#7c3aed' }}
          >
            + Nouvelle entreprise
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setView('pipeline')}
          className={`px-6 py-3 rounded-lg font-medium transition-all border-2 ${
            view === 'pipeline'
              ? 'bg-white shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border-gray-300'
          }`}
          style={view === 'pipeline' ? { color: '#7c3aed', borderColor: '#7c3aed' } : {}}
        >
          📊 Pipeline
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-6 py-3 rounded-lg font-medium transition-all border-2 ${
            view === 'list'
              ? 'bg-white shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border-gray-300'
          }`}
          style={view === 'list' ? { color: '#7c3aed', borderColor: '#7c3aed' } : {}}
        >
          📋 Liste
        </button>
      </div>

      {/* Stats globales */}
      <div className="space-y-4 mb-8">
        {/* Première ligne : 4 cartes - Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: '#7c3aed' }}>
            <div className="text-sm text-white/80 mb-1">Total Leads</div>
            <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
          </div>
          <div className="rounded-lg shadow-md p-6 bg-blue-500">
            <div className="text-sm text-white/80 mb-1">En cours</div>
            <div className="text-3xl font-bold text-white">
              {leads.filter(l => !['WON', 'LOST'].includes(l.status)).length}
            </div>
          </div>
          <div className="rounded-lg shadow-md p-6 bg-green-500">
            <div className="text-sm text-white/80 mb-1">🎉 Gagnés</div>
            <div className="text-3xl font-bold text-white">{wonLeads.length}</div>
            {wonLeads.length > 0 && (
              <div className="text-xs text-white/80 mt-2">
                {wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0).toLocaleString('fr-FR')}€
              </div>
            )}
          </div>
          <div className="rounded-lg shadow-md p-6 bg-red-500">
            <div className="text-sm text-white/80 mb-1">❌ Perdus</div>
            <div className="text-3xl font-bold text-white">{lostLeads.length}</div>
            {lostLeads.length > 0 && (
              <div className="text-xs text-white/80 mt-2">
                {lostLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0).toLocaleString('fr-FR')}€ manqués
              </div>
            )}
          </div>
        </div>

        {/* Deuxième ligne : 3 cartes - Stats détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: '#7c3aed' }}>
            <div className="text-sm text-white/80 mb-1">Valeur pipeline</div>
            <div className="text-2xl font-bold text-white">
              {(stats?.totalValue?._sum?.estimatedValue || 0).toLocaleString('fr-FR')}€
            </div>
          </div>
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: '#7c3aed' }}>
            <div className="text-sm text-white/80 mb-1">Prob. moyenne</div>
            <div className="text-3xl font-bold text-white">
              {Math.round(stats?.avgProbability?._avg?.probability || 0)}%
            </div>
          </div>
          <div className="rounded-lg shadow-md p-6 bg-amber-500">
            <div className="text-sm text-white/80 mb-1">Taux de conversion</div>
            <div className="text-3xl font-bold text-white">
              {stats?.total && stats.total > 0
                ? Math.round((wonLeads.length / stats.total) * 100)
                : 0}%
            </div>
            <div className="text-xs text-white/80 mt-2">
              {wonLeads.length} gagnés / {stats?.total || 0} leads
            </div>
          </div>
        </div>
      </div>

        {/* Vue Pipeline Kanban avec Drag & Drop */}
        {view === 'pipeline' && (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="space-y-6">
              {/* Pipeline principal */}
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {pipelineStages.map(status => {
                  const stageLeads = getLeadsByStatus(status)
                  const config = STATUS_CONFIG[status]
                  const totalValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

                  return (
                    <div key={status} className="flex-shrink-0 w-80">
                      <div className="bg-white rounded-lg shadow-md">
                        <div className="p-4 border-b">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <span>{config.emoji}</span>
                              <span>{config.label}</span>
                            </h3>
                            <span className="text-sm font-bold text-gray-500">{stageLeads.length}</span>
                          </div>
                          {totalValue > 0 && (
                            <div className="text-xs text-gray-500">
                              {totalValue.toLocaleString('fr-FR')}€
                            </div>
                          )}
                        </div>

                        <DroppableColumn
                          id={status}
                          className="p-2 space-y-2 max-h-[600px] overflow-y-auto min-h-[200px] transition-colors"
                        >
                          <SortableContext
                            id={status}
                            items={stageLeads.map(l => l.id)}
                          >
                            {stageLeads.map(lead => (
                              <DraggableLeadCard
                                key={lead.id}
                                lead={lead}
                                onClick={() => setSelectedLead(lead)}
                              />
                            ))}

                            {stageLeads.length === 0 && (
                              <div className="text-center py-8 text-gray-400 text-sm">
                                Glissez une entreprise ici
                              </div>
                            )}
                          </SortableContext>
                        </DroppableColumn>
                      </div>
                    </div>
                  )
                })}
                </div>
              </div>

            {/* Section séparée pour Gagnés et Perdus */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4">📊 Résultats finaux</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Leads gagnés */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>{STATUS_CONFIG.WON.emoji}</span>
                        <span>{STATUS_CONFIG.WON.label}</span>
                      </h3>
                      <span className="text-sm font-bold text-gray-500">{wonLeads.length}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0).toLocaleString('fr-FR')}€
                    </div>
                  </div>

                  <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                    {wonLeads.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="p-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition cursor-pointer"
                      >
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {lead.institutName}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {lead.contactName}
                        </div>
                        {lead.estimatedValue && (
                          <div className="text-xs font-semibold text-green-600">
                            {lead.estimatedValue.toLocaleString('fr-FR')}€
                          </div>
                        )}
                      </div>
                    ))}

                    {wonLeads.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Aucun lead gagné
                      </div>
                    )}
                  </div>
                </div>

                {/* Leads perdus */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-4 border-b bg-gradient-to-r from-red-50 to-pink-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>{STATUS_CONFIG.LOST.emoji}</span>
                        <span>{STATUS_CONFIG.LOST.label}</span>
                      </h3>
                      <span className="text-sm font-bold text-gray-500">{lostLeads.length}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {lostLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0).toLocaleString('fr-FR')}€ perdus
                    </div>
                  </div>

                  <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                    {lostLeads.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="p-3 bg-red-50 rounded-lg border border-red-200 hover:border-red-400 hover:shadow-md transition cursor-pointer"
                      >
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {lead.institutName}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {lead.contactName}
                        </div>
                        {lead.city && (
                          <div className="text-xs text-gray-500">
                            📍 {lead.city}
                          </div>
                        )}
                      </div>
                    ))}

                    {lostLeads.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Aucun lead perdu
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </DndContext>
        )}

      {/* Vue Liste */}
      {view === 'list' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochaine action</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Gagné</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Perdu</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map(lead => {
                  const config = STATUS_CONFIG[lead.status]

                  const handleStatusChange = async (newStatus: 'WON' | 'LOST', e: React.MouseEvent) => {
                    e.stopPropagation() // Empêcher l'ouverture du modal

                    if (lead.status === newStatus) return // Déjà dans ce statut

                    // Mise à jour optimiste
                    setLeads(prevLeads =>
                      prevLeads.map(l =>
                        l.id === lead.id ? { ...l, status: newStatus } : l
                      )
                    )

                    // Mise à jour serveur
                    try {
                      const response = await fetch(`/api/super-admin/leads/${lead.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                      })

                      if (!response.ok) {
                        // Rollback
                        setLeads(prevLeads =>
                          prevLeads.map(l =>
                            l.id === lead.id ? { ...l, status: lead.status } : l
                          )
                        )
                        alert('Erreur lors de la mise à jour')
                      }
                    } catch (error) {
                      console.error('Error:', error)
                      // Rollback
                      setLeads(prevLeads =>
                        prevLeads.map(l =>
                          l.id === lead.id ? { ...l, status: lead.status } : l
                        )
                      )
                    }
                  }

                  return (
                    <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{lead.institutName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lead.contactName}</div>
                        <div className="text-xs text-gray-500">{lead.contactEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{lead.city || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${config.color}`}>
                          {config.emoji} {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{lead.score}/100</td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: "#7c3aed" }}>
                        {lead.estimatedValue ? `${lead.estimatedValue.toLocaleString('fr-FR')}€` : '-'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {lead.nextFollowUpDate
                          ? new Date(lead.nextFollowUpDate).toLocaleDateString('fr-FR')
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleStatusChange('WON', e)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                            lead.status === 'WON'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                          }`}
                          title="Marquer comme gagné"
                        >
                          {lead.status === 'WON' ? '✓ Gagné' : 'Gagner'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleStatusChange('LOST', e)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                            lead.status === 'LOST'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                          }`}
                          title="Marquer comme perdu"
                        >
                          {lead.status === 'LOST' ? '✗ Perdu' : 'Perdre'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {leads.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucun lead. Cliquez sur "+ Nouvelle entreprise" pour commencer.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal détail lead */}
      {selectedLead && (
        <LeadDetailModal
          leadId={selectedLead.id}
          onClose={() => setSelectedLead(null)}
          onUpdate={fetchLeads}
        />
      )}

      {/* Modal ajout lead */}
      {showAddModal && <AddLeadModal onClose={() => setShowAddModal(false)} onSuccess={fetchLeads} />}
    </div>
  )
}
