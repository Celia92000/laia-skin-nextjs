'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AddLeadModal from '@/components/crm/AddLeadModal'
import LeadDetailModal from '@/components/crm/LeadDetailModal'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DEMO_SCHEDULED' | 'DEMO_DONE' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'CONTRACT_SIGNED' | 'WON' | 'LOST' | 'ON_HOLD'
type LeadSource = 'WEBSITE' | 'REFERRAL' | 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'GOOGLE_ADS' | 'EMAIL_CAMPAIGN' | 'COLD_EMAIL' | 'COLD_CALL' | 'NETWORKING' | 'PARTNER' | 'OTHER'
type LeadQualification = 'COLD' | 'WARM' | 'HOT'

interface Lead {
  id: string
  institutName: string
  contactName: string
  contactEmail: string
  contactPhone: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  status: LeadStatus
  source: LeadSource
  score: number
  probability: number
  estimatedValue: number | null
  qualification?: LeadQualification | null
  assignedTo: {
    id: string
    name: string
    email: string
  } | null
  organization?: {
    id: string
    name: string
    plan: string
    createdAt: string
  } | null
  createdAt: string
  lastContactDate: string | null
  nextFollowUpDate: string | null
  convertedAt?: string | null
  lostReason?: string | null
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

const QUALIFICATION_CONFIG: Record<LeadQualification, { label: string; color: string; bgColor: string; emoji: string }> = {
  COLD: { label: 'Froid', color: 'text-blue-700', bgColor: 'bg-blue-100', emoji: '❄️' },
  WARM: { label: 'Moyen', color: 'text-orange-700', bgColor: 'bg-orange-100', emoji: '🌤️' },
  HOT: { label: 'Chaud', color: 'text-red-700', bgColor: 'bg-red-100', emoji: '🔥' }
}

// Composant carte draggable
function DraggableLeadCard({ lead, onClick, onQualificationChange, onQuickSearch }: {
  lead: Lead;
  onClick: () => void;
  onQualificationChange: (qualification: LeadQualification | null) => void;
  onQuickSearch: (text: string) => void;
}) {
  const [showQualificationMenu, setShowQualificationMenu] = React.useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { lead }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const qualificationConfig = lead.qualification ? QUALIFICATION_CONFIG[lead.qualification] : null

  const handleQualificationSelect = (qualification: LeadQualification | null, e: React.MouseEvent) => {
    e.stopPropagation()
    onQualificationChange(qualification)
    setShowQualificationMenu(false)
  }

  const handleRemoveQualification = (e: React.MouseEvent) => {
    e.stopPropagation()
    onQualificationChange(null)
    setShowQualificationMenu(false)
  }

  const toggleQualificationMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowQualificationMenu(!showQualificationMenu)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow-md transition cursor-move touch-none relative"
    >
      {/* Qualification badge/button */}
      <div className="relative mb-2" onPointerDown={(e) => e.stopPropagation()}>
        {qualificationConfig ? (
          <div
            onClick={toggleQualificationMenu}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${qualificationConfig.bgColor} ${qualificationConfig.color}`}
            title="Cliquer pour changer la qualification"
          >
            <span>{qualificationConfig.emoji}</span>
            <span>{qualificationConfig.label}</span>
            <span className="text-[10px]">▼</span>
          </div>
        ) : (
          <div
            onClick={toggleQualificationMenu}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-gray-200 bg-gray-100 text-gray-600"
            title="Cliquer pour définir la qualification"
          >
            <span>➕</span>
            <span>Qualifier</span>
          </div>
        )}

        {/* Menu de sélection */}
        {showQualificationMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[140px]">
            {lead.qualification && (
              <>
                <button
                  onClick={handleRemoveQualification}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex items-center gap-2 text-gray-600 border-b border-gray-200"
                >
                  <span>✕</span>
                  <span>Retirer</span>
                </button>
              </>
            )}
            <button
              onClick={(e) => handleQualificationSelect('COLD', e)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2 ${lead.qualification === 'COLD' ? 'bg-blue-50 font-semibold' : ''}`}
            >
              <span>{QUALIFICATION_CONFIG.COLD.emoji}</span>
              <span>{QUALIFICATION_CONFIG.COLD.label}</span>
            </button>
            <button
              onClick={(e) => handleQualificationSelect('WARM', e)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-orange-50 flex items-center gap-2 ${lead.qualification === 'WARM' ? 'bg-orange-50 font-semibold' : ''}`}
            >
              <span>{QUALIFICATION_CONFIG.WARM.emoji}</span>
              <span>{QUALIFICATION_CONFIG.WARM.label}</span>
            </button>
            <button
              onClick={(e) => handleQualificationSelect('HOT', e)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-red-50 flex items-center gap-2 rounded-b-lg ${lead.qualification === 'HOT' ? 'bg-red-50 font-semibold' : ''}`}
            >
              <span>{QUALIFICATION_CONFIG.HOT.emoji}</span>
              <span>{QUALIFICATION_CONFIG.HOT.label}</span>
            </button>
          </div>
        )}
      </div>

      <div
        className="font-medium text-gray-900 text-sm mb-1 hover:text-purple-600 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onQuickSearch(lead.institutName); }}
        title="Cliquer pour rechercher"
      >
        {lead.institutName}
      </div>
      <div
        className="text-xs text-gray-600 mb-2 hover:text-purple-600 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onQuickSearch(lead.contactName); }}
        title="Cliquer pour rechercher"
      >
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
  const [activeTab, setActiveTab] = useState<'prospection' | 'nouveaux' | 'clients'>('prospection')
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline')
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [openModal, setOpenModal] = useState<'total' | 'inProgress' | 'won' | 'lost' | 'pipeline' | 'probability' | 'conversion' | null>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    status: [] as LeadStatus[],
    source: [] as LeadSource[],
    qualification: [] as LeadQualification[],
    city: '',
    minValue: '',
    maxValue: '',
    minProbability: '',
    maxProbability: ''
  })

  // Suggestions basées sur les données existantes
  const uniqueCities = [...new Set(leads.map(l => l.city).filter(Boolean))] as string[]
  const leadSources: LeadSource[] = ['WEBSITE', 'REFERRAL', 'LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'GOOGLE_ADS', 'EMAIL_CAMPAIGN', 'COLD_EMAIL', 'COLD_CALL', 'NETWORKING', 'PARTNER', 'OTHER']

  const SOURCE_LABELS: Record<LeadSource, string> = {
    WEBSITE: '🌐 Site web',
    REFERRAL: '👥 Recommandation',
    LINKEDIN: '💼 LinkedIn',
    INSTAGRAM: '📷 Instagram',
    FACEBOOK: '📘 Facebook',
    GOOGLE_ADS: '🔍 Google Ads',
    EMAIL_CAMPAIGN: '📧 Campagne email',
    COLD_EMAIL: '✉️ Email à froid',
    COLD_CALL: '📞 Appel à froid',
    NETWORKING: '🤝 Networking',
    PARTNER: '🔗 Partenaire',
    OTHER: '📋 Autre'
  }

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

  useEffect(() => {
    applyFilters()
  }, [leads, searchFilters, activeTab])

  useEffect(() => {
    if (activeTab === 'clients') {
      // Rediriger vers la page organisations qui a déjà toutes les infos
      router.push('/super-admin')
    }
  }, [activeTab, router])

  async function fetchLeads() {
    setLoading(true)
    try {
      const response = await fetch('/api/super-admin/leads')
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads)
        setFilteredLeads(data.leads)
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

  function applyFilters() {
    let filtered = [...leads]

    // Filtre par onglet actif
    if (activeTab === 'prospection') {
      // Prospection : leads sans organisation ET source != WEBSITE (prospects à travailler)
      filtered = filtered.filter(lead => !lead.organization && lead.source !== 'WEBSITE')
    } else if (activeTab === 'nouveaux') {
      // Nouveaux : leads sans organisation ET source == WEBSITE (ont payé via le site)
      filtered = filtered.filter(lead => !lead.organization && lead.source === 'WEBSITE')
    } else if (activeTab === 'clients') {
      // Clients : leads avec organisation (convertis)
      filtered = filtered.filter(lead => lead.organization)
    }

    // Recherche textuelle (nom institut, contact, email)
    if (searchFilters.search) {
      const search = searchFilters.search.toLowerCase()
      filtered = filtered.filter(lead =>
        lead.institutName.toLowerCase().includes(search) ||
        lead.contactName.toLowerCase().includes(search) ||
        lead.contactEmail.toLowerCase().includes(search) ||
        (lead.city && lead.city.toLowerCase().includes(search))
      )
    }

    // Filtre par statut
    if (searchFilters.status.length > 0) {
      filtered = filtered.filter(lead => searchFilters.status.includes(lead.status))
    }

    // Filtre par source
    if (searchFilters.source.length > 0) {
      filtered = filtered.filter(lead => searchFilters.source.includes(lead.source))
    }

    // Filtre par qualification
    if (searchFilters.qualification.length > 0) {
      filtered = filtered.filter(lead =>
        lead.qualification && searchFilters.qualification.includes(lead.qualification)
      )
    }

    // Filtre par ville
    if (searchFilters.city) {
      filtered = filtered.filter(lead =>
        lead.city && lead.city.toLowerCase().includes(searchFilters.city.toLowerCase())
      )
    }

    // Filtre par valeur estimée
    if (searchFilters.minValue) {
      const min = parseFloat(searchFilters.minValue)
      filtered = filtered.filter(lead => lead.estimatedValue && lead.estimatedValue >= min)
    }
    if (searchFilters.maxValue) {
      const max = parseFloat(searchFilters.maxValue)
      filtered = filtered.filter(lead => lead.estimatedValue && lead.estimatedValue <= max)
    }

    // Filtre par probabilité
    if (searchFilters.minProbability) {
      const min = parseInt(searchFilters.minProbability)
      filtered = filtered.filter(lead => lead.probability >= min)
    }
    if (searchFilters.maxProbability) {
      const max = parseInt(searchFilters.maxProbability)
      filtered = filtered.filter(lead => lead.probability <= max)
    }

    setFilteredLeads(filtered)
  }

  function resetFilters() {
    setSearchFilters({
      search: '',
      status: [],
      source: [],
      qualification: [],
      city: '',
      minValue: '',
      maxValue: '',
      minProbability: '',
      maxProbability: ''
    })
  }

  function toggleStatusFilter(status: LeadStatus) {
    setSearchFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }

  function toggleSourceFilter(source: LeadSource) {
    setSearchFilters(prev => ({
      ...prev,
      source: prev.source.includes(source)
        ? prev.source.filter(s => s !== source)
        : [...prev.source, source]
    }))
  }

  function toggleQualificationFilter(qual: LeadQualification) {
    setSearchFilters(prev => ({
      ...prev,
      qualification: prev.qualification.includes(qual)
        ? prev.qualification.filter(q => q !== qual)
        : [...prev.qualification, qual]
    }))
  }

  function quickSearch(text: string) {
    setSearchFilters(prev => ({ ...prev, search: text }))
    setShowSuggestions(false)
    // Scroll to top to see search results
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Générer les suggestions basées sur la recherche
  const suggestions = React.useMemo(() => {
    if (!searchFilters.search || searchFilters.search.length < 2) return []

    const search = searchFilters.search.toLowerCase()
    const matchingLeads = leads.filter(lead =>
      lead.institutName.toLowerCase().includes(search) ||
      lead.contactName.toLowerCase().includes(search) ||
      lead.contactEmail.toLowerCase().includes(search) ||
      (lead.city && lead.city.toLowerCase().includes(search))
    ).slice(0, 8) // Limite à 8 suggestions

    return matchingLeads
  }, [searchFilters.search, leads])

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

  // Gérer le changement de qualification
  async function handleQualificationChange(leadId: string, qualification: LeadQualification | null) {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    // Mise à jour optimiste
    setLeads(prevLeads =>
      prevLeads.map(l =>
        l.id === leadId ? { ...l, qualification } : l
      )
    )

    // Mise à jour serveur
    try {
      const response = await fetch(`/api/super-admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qualification })
      })

      if (!response.ok) {
        // Rollback
        setLeads(prevLeads =>
          prevLeads.map(l =>
            l.id === leadId ? { ...l, qualification: lead.qualification } : l
          )
        )
        alert('Erreur lors de la mise à jour de la qualification')
      }
    } catch (error) {
      console.error('Error updating qualification:', error)
      // Rollback
      setLeads(prevLeads =>
        prevLeads.map(l =>
          l.id === leadId ? { ...l, qualification: lead.qualification } : l
        )
      )
    }
  }

  const pipelineStages: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'DEMO_SCHEDULED', 'DEMO_DONE', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'WON', 'LOST']

  const getLeadsByStatus = (status: LeadStatus) => {
    return filteredLeads.filter(l => l.status === status)
  }

  const wonLeads = filteredLeads.filter(l => l.status === 'WON')
  const lostLeads = filteredLeads.filter(l => l.status === 'LOST')

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

      {/* Onglets Prospection / Nouveaux / Clients */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('prospection')}
          className={`px-6 py-3 rounded-lg font-bold transition-all border-2 ${
            activeTab === 'prospection'
              ? 'bg-white shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border-gray-300'
          }`}
          style={activeTab === 'prospection' ? { color: '#7c3aed', borderColor: '#7c3aed' } : {}}
        >
          🎯 Prospection ({leads.filter(l => !l.organization && l.source !== 'WEBSITE').length})
        </button>
        <button
          onClick={() => setActiveTab('nouveaux')}
          className={`px-6 py-3 rounded-lg font-bold transition-all border-2 ${
            activeTab === 'nouveaux'
              ? 'bg-white shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border-gray-300'
          }`}
          style={activeTab === 'nouveaux' ? { color: '#7c3aed', borderColor: '#7c3aed' } : {}}
        >
          📋 Nouveaux ({leads.filter(l => !l.organization && l.source === 'WEBSITE').length})
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-6 py-3 rounded-lg font-bold transition-all border-2 ${
            activeTab === 'clients'
              ? 'bg-white shadow-md'
              : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm border-gray-300'
          }`}
          style={activeTab === 'clients' ? { color: '#7c3aed', borderColor: '#7c3aed' } : {}}
        >
          ✅ Clients ({leads.filter(l => l.organization).length})
        </button>
      </div>

      {/* Tabs Pipeline/Liste (seulement pour Prospection) */}
      {activeTab === 'prospection' && (
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
      )}

      {/* Recherche Avancée */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher (nom, email, ville...)"
                value={searchFilters.search}
                onChange={(e) => {
                  setSearchFilters({ ...searchFilters, search: e.target.value })
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchFilters.search && (
                <button
                  onClick={() => {
                    setSearchFilters({ ...searchFilters, search: '' })
                    setShowSuggestions(false)
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  ✕
                </button>
              )}

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 px-3 py-2 font-medium">
                      {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}
                    </div>
                    {suggestions.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowSuggestions(false)
                        }}
                        className="px-3 py-2 hover:bg-purple-50 cursor-pointer rounded-lg transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-gray-900">
                              {lead.institutName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {lead.contactName} • {lead.contactEmail}
                            </div>
                            {lead.city && (
                              <div className="text-xs text-gray-500 mt-1">
                                📍 {lead.city}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${STATUS_CONFIG[lead.status].color}`}>
                              {STATUS_CONFIG[lead.status].emoji}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium"
            >
              {showAdvancedSearch ? '− Filtres avancés' : '+ Filtres avancés'}
            </button>
            {(searchFilters.status.length > 0 || searchFilters.source.length > 0 || searchFilters.qualification.length > 0 || searchFilters.city || searchFilters.minValue || searchFilters.maxValue || searchFilters.minProbability || searchFilters.maxProbability) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                ✕ Réinitialiser
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {filteredLeads.length} résultat{filteredLeads.length !== 1 ? 's' : ''}
          </div>
        </div>

        {showAdvancedSearch && (
          <div className="border-t pt-4 space-y-4">
            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
              <div className="flex flex-wrap gap-2">
                {(['COLD', 'WARM', 'HOT'] as LeadQualification[]).map(qual => (
                  <button
                    key={qual}
                    onClick={() => toggleQualificationFilter(qual)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      searchFilters.qualification.includes(qual)
                        ? QUALIFICATION_CONFIG[qual].bgColor + ' ' + QUALIFICATION_CONFIG[qual].color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {QUALIFICATION_CONFIG[qual].emoji} {QUALIFICATION_CONFIG[qual].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Statuts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <div className="flex flex-wrap gap-2">
                {pipelineStages.map(status => (
                  <button
                    key={status}
                    onClick={() => toggleStatusFilter(status)}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      searchFilters.status.includes(status)
                        ? STATUS_CONFIG[status].color + ' ring-2 ring-purple-500'
                        : STATUS_CONFIG[status].color + ' opacity-50 hover:opacity-100'
                    }`}
                  >
                    {STATUS_CONFIG[status].emoji} {STATUS_CONFIG[status].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source du lead</label>
              <div className="flex flex-wrap gap-2">
                {leadSources.map(source => (
                  <button
                    key={source}
                    onClick={() => toggleSourceFilter(source)}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      searchFilters.source.includes(source)
                        ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {SOURCE_LABELS[source]}
                  </button>
                ))}
              </div>
            </div>

            {/* Ville et fourchettes */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                {uniqueCities.length > 0 ? (
                  <select
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Toutes les villes</option>
                    {uniqueCities.sort().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ex: Paris"
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valeur estimée (€)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={searchFilters.minValue}
                    onChange={(e) => setSearchFilters({ ...searchFilters, minValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={searchFilters.maxValue}
                    onChange={(e) => setSearchFilters({ ...searchFilters, maxValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Probabilité (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="100"
                    value={searchFilters.minProbability}
                    onChange={(e) => setSearchFilters({ ...searchFilters, minProbability: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    min="0"
                    max="100"
                    value={searchFilters.maxProbability}
                    onChange={(e) => setSearchFilters({ ...searchFilters, maxProbability: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats globales */}
      <div className="space-y-4 mb-8">
        {/* Première ligne : 4 cartes - Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div onClick={() => setOpenModal('total')} className="rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow" style={{ backgroundColor: '#7c3aed' }}>
            <div className="text-sm text-white/80 mb-1">Total Leads</div>
            <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
            <div className="text-xs text-white/70 mt-2">Cliquer pour voir les détails</div>
          </div>
          <div onClick={() => setOpenModal('inProgress')} className="rounded-lg shadow-md p-6 bg-blue-500 cursor-pointer hover:shadow-xl transition-shadow">
            <div className="text-sm text-white/80 mb-1">En cours</div>
            <div className="text-3xl font-bold text-white">
              {leads.filter(l => !['WON', 'LOST'].includes(l.status)).length}
            </div>
            <div className="text-xs text-white/70 mt-2">Cliquer pour voir les détails</div>
          </div>
          <div onClick={() => setOpenModal('won')} className="rounded-lg shadow-md p-6 bg-green-500 cursor-pointer hover:shadow-xl transition-shadow">
            <div className="text-sm text-white/80 mb-1">🎉 Gagnés</div>
            <div className="text-3xl font-bold text-white">{wonLeads.length}</div>
            {wonLeads.length > 0 && (
              <div className="text-xs text-white/80 mt-2">
                {wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0).toLocaleString('fr-FR')}€
              </div>
            )}
            <div className="text-xs text-white/70 mt-1">Cliquer pour voir les détails</div>
          </div>
          <div onClick={() => setOpenModal('lost')} className="rounded-lg shadow-md p-6 bg-red-500 cursor-pointer hover:shadow-xl transition-shadow">
            <div className="text-sm text-white/80 mb-1">❌ Perdus</div>
            <div className="text-3xl font-bold text-white">{lostLeads.length}</div>
            {lostLeads.length > 0 && (
              <div className="text-xs text-white/80 mt-2">
                {lostLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0).toLocaleString('fr-FR')}€ manqués
              </div>
            )}
            <div className="text-xs text-white/70 mt-1">Cliquer pour voir les détails</div>
          </div>
        </div>

        {/* Deuxième ligne : 3 cartes - Stats détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div onClick={() => setOpenModal('pipeline')} className="rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow" style={{ backgroundColor: '#7c3aed' }}>
            <div className="text-sm text-white/80 mb-1">Valeur pipeline</div>
            <div className="text-2xl font-bold text-white">
              {(stats?.totalValue?._sum?.estimatedValue || 0).toLocaleString('fr-FR')}€
            </div>
            <div className="text-xs text-white/70 mt-2">Cliquer pour voir les détails</div>
          </div>
          <div onClick={() => setOpenModal('probability')} className="rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow" style={{ backgroundColor: '#7c3aed' }}>
            <div className="text-sm text-white/80 mb-1">Prob. moyenne</div>
            <div className="text-3xl font-bold text-white">
              {Math.round(stats?.avgProbability?._avg?.probability || 0)}%
            </div>
            <div className="text-xs text-white/70 mt-2">Cliquer pour voir les détails</div>
          </div>
          <div onClick={() => setOpenModal('conversion')} className="rounded-lg shadow-md p-6 bg-amber-500 cursor-pointer hover:shadow-xl transition-shadow">
            <div className="text-sm text-white/80 mb-1">Taux de conversion</div>
            <div className="text-3xl font-bold text-white">
              {stats?.total && stats.total > 0
                ? Math.round((wonLeads.length / stats.total) * 100)
                : 0}%
            </div>
            <div className="text-xs text-white/80 mt-2">
              {wonLeads.length} gagnés / {stats?.total || 0} leads
            </div>
            <div className="text-xs text-white/70 mt-1">Cliquer pour voir les détails</div>
          </div>
        </div>
      </div>

        {/* Vue Pipeline Kanban avec Drag & Drop (seulement pour Prospection) */}
        {activeTab === 'prospection' && view === 'pipeline' && (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {pipelineStages.map(status => {
                const stageLeads = getLeadsByStatus(status)
                const config = STATUS_CONFIG[status]
                const totalValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)

                // Style spécial pour WON et LOST
                const isWon = status === 'WON'
                const isLost = status === 'LOST'
                const headerBg = isWon ? 'bg-gradient-to-r from-green-50 to-emerald-50' : isLost ? 'bg-gradient-to-r from-red-50 to-pink-50' : ''

                return (
                  <div key={status} className="flex-shrink-0 w-80">
                    <div className="bg-white rounded-lg shadow-md">
                      <div className={`p-4 border-b ${headerBg}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span>{config.emoji}</span>
                            <span>{config.label}</span>
                          </h3>
                          <span className="text-sm font-bold text-gray-500">{stageLeads.length}</span>
                        </div>
                        {totalValue > 0 && (
                          <div className="text-xs text-gray-600">
                            {totalValue.toLocaleString('fr-FR')}€{isLost ? ' perdus' : ''}
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
                              onQualificationChange={(qualification) => handleQualificationChange(lead.id, qualification)}
                              onQuickSearch={quickSearch}
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
          </DndContext>
        )}

      {/* Vue Liste (seulement pour Prospection) */}
      {activeTab === 'prospection' && view === 'list' && (
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
                {filteredLeads.map(lead => {
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
                        <div
                          className="text-sm font-medium text-gray-900 hover:text-purple-600 cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); quickSearch(lead.institutName); }}
                          title="Cliquer pour rechercher"
                        >
                          {lead.institutName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-900 hover:text-purple-600 cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); quickSearch(lead.contactName); }}
                          title="Cliquer pour rechercher"
                        >
                          {lead.contactName}
                        </div>
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

      {/* Vue Nouveaux (clients qui ont payé via le site) */}
      {activeTab === 'nouveaux' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date inscription</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.institutName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{lead.contactName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{lead.contactEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{lead.contactPhone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {lead.city || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLead(lead)
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition"
                        >
                          👁️ Voir
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const params = new URLSearchParams({
                              institutName: lead.institutName,
                              ownerFirstName: lead.contactName.split(' ')[0] || '',
                              ownerLastName: lead.contactName.split(' ').slice(1).join(' ') || '',
                              ownerEmail: lead.contactEmail,
                              ownerPhone: lead.contactPhone || '',
                              city: lead.city || '',
                              address: lead.address || '',
                              postalCode: lead.postalCode || '',
                              leadId: lead.id,
                            })
                            window.open(`/super-admin/organizations/new?${params.toString()}`, '_blank')
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded transition"
                        >
                          📝 Créer organisation
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucun nouveau client. Les clients qui paient via le site apparaîtront ici.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vue Clients - Redirection automatique vers la page organisations */}
      {activeTab === 'clients' && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Redirection en cours...</h3>
          <p className="text-gray-600">Vous allez être redirigé vers la page organisations</p>
        </div>
      )}

      {/* Modales stats détaillées */}
      {openModal === 'total' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: '#7c3aed' }}>📊 Total Leads ({filteredLeads.length})</h3>
                <button onClick={() => setOpenModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <div className="space-y-3">
                {filteredLeads.map(lead => {
                  const config = STATUS_CONFIG[lead.status]
                  return (
                    <div key={lead.id} onClick={() => { setSelectedLead(lead); setOpenModal(null); }} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{lead.institutName}</div>
                          <div className="text-sm text-gray-600">{lead.contactName} • {lead.contactEmail}</div>
                          {lead.city && <div className="text-xs text-gray-500 mt-1">📍 {lead.city}</div>}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${config.color}`}>{config.emoji} {config.label}</span>
                          <div className="text-sm font-semibold mt-1" style={{ color: '#7c3aed' }}>Score: {lead.score}/100</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {openModal === 'inProgress' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-blue-600">🔄 Leads en cours ({leads.filter(l => !['WON', 'LOST'].includes(l.status)).length})</h3>
                <button onClick={() => setOpenModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <div className="space-y-3">
                {leads.filter(l => !['WON', 'LOST'].includes(l.status)).map(lead => {
                  const config = STATUS_CONFIG[lead.status]
                  return (
                    <div key={lead.id} onClick={() => { setSelectedLead(lead); setOpenModal(null); }} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{lead.institutName}</div>
                          <div className="text-sm text-gray-600">{lead.contactName} • {lead.contactEmail}</div>
                          {lead.city && <div className="text-xs text-gray-500 mt-1">📍 {lead.city}</div>}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${config.color}`}>{config.emoji} {config.label}</span>
                          <div className="text-sm text-gray-500 mt-1">Prob: {lead.probability}%</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {openModal === 'won' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-green-600">🎉 Leads gagnés ({wonLeads.length})</h3>
                <button onClick={() => setOpenModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              {wonLeads.length > 0 ? (
                <div className="space-y-3">
                  {wonLeads.map(lead => (
                    <div key={lead.id} onClick={() => { setSelectedLead(lead); setOpenModal(null); }} className="p-4 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition border border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{lead.institutName}</div>
                          <div className="text-sm text-gray-600">{lead.contactName} • {lead.contactEmail}</div>
                          {lead.city && <div className="text-xs text-gray-500 mt-1">📍 {lead.city}</div>}
                        </div>
                        <div className="text-right">
                          {lead.estimatedValue && <div className="text-lg font-semibold text-green-600">{Number(lead.estimatedValue).toLocaleString('fr-FR')}€</div>}
                          <div className="text-xs text-gray-500 mt-1">Converti le {new Date(lead.convertedAt || lead.createdAt).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">Aucun lead gagné pour le moment</div>
              )}
            </div>
          </div>
        </div>
      )}

      {openModal === 'lost' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-red-600">❌ Leads perdus ({lostLeads.length})</h3>
                <button onClick={() => setOpenModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              {lostLeads.length > 0 ? (
                <div className="space-y-3">
                  {lostLeads.map(lead => (
                    <div key={lead.id} onClick={() => { setSelectedLead(lead); setOpenModal(null); }} className="p-4 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition border border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{lead.institutName}</div>
                          <div className="text-sm text-gray-600">{lead.contactName} • {lead.contactEmail}</div>
                          {lead.lostReason && <div className="text-xs text-red-600 mt-1">Raison: {lead.lostReason}</div>}
                        </div>
                        <div className="text-right">
                          {lead.estimatedValue && <div className="text-sm text-gray-500">{Number(lead.estimatedValue).toLocaleString('fr-FR')}€ perdu</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">Aucun lead perdu</div>
              )}
            </div>
          </div>
        </div>
      )}

      {openModal === 'pipeline' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: '#7c3aed' }}>💰 Valeur du pipeline</h3>
                <button onClick={() => setOpenModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold" style={{ color: '#7c3aed' }}>{(stats?.totalValue?._sum?.estimatedValue || 0).toLocaleString('fr-FR')}€</div>
                <div className="text-sm text-gray-500 mt-2">{leads.filter(l => l.estimatedValue).length} leads avec valeur estimée</div>
              </div>
              <div className="space-y-3">
                {leads.filter(l => l.estimatedValue).sort((a, b) => Number(b.estimatedValue || 0) - Number(a.estimatedValue || 0)).map(lead => {
                  const config = STATUS_CONFIG[lead.status]
                  return (
                    <div key={lead.id} onClick={() => { setSelectedLead(lead); setOpenModal(null); }} className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer transition border border-purple-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{lead.institutName}</div>
                          <div className="text-sm text-gray-600">{lead.contactName}</div>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${config.color}`}>{config.emoji} {config.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold" style={{ color: '#7c3aed' }}>{Number(lead.estimatedValue).toLocaleString('fr-FR')}€</div>
                          <div className="text-xs text-gray-500 mt-1">Prob: {lead.probability}%</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {openModal === 'probability' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: '#7c3aed' }}>📊 Probabilité moyenne de conversion</h3>
                <button onClick={() => setOpenModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold" style={{ color: '#7c3aed' }}>{Math.round(stats?.avgProbability?._avg?.probability || 0)}%</div>
                <div className="text-sm text-gray-500 mt-2">Moyenne sur {leads.length} leads</div>
              </div>
              <div className="space-y-3">
                {leads.sort((a, b) => b.probability - a.probability).map(lead => {
                  const config = STATUS_CONFIG[lead.status]
                  const probColor = lead.probability >= 75 ? 'text-green-600' : lead.probability >= 50 ? 'text-orange-600' : 'text-red-600'
                  return (
                    <div key={lead.id} onClick={() => { setSelectedLead(lead); setOpenModal(null); }} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{lead.institutName}</div>
                          <div className="text-sm text-gray-600">{lead.contactName}</div>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${config.color}`}>{config.emoji} {config.label}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${probColor}`}>{lead.probability}%</div>
                          <div className="text-xs text-gray-500 mt-1">Score: {lead.score}/100</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {openModal === 'conversion' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-amber-600">📈 Taux de conversion</h3>
                <button onClick={() => setOpenModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold text-amber-600">
                  {stats?.total && stats.total > 0 ? Math.round((wonLeads.length / stats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500 mt-2">{wonLeads.length} gagnés sur {stats?.total || 0} leads</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-600">Gagnés</div>
                  <div className="text-2xl font-bold text-green-600">{wonLeads.length}</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm text-gray-600">Perdus</div>
                  <div className="text-2xl font-bold text-red-600">{lostLeads.length}</div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 mb-3">Leads gagnés:</h4>
                {wonLeads.length > 0 ? wonLeads.map(lead => (
                  <div key={lead.id} onClick={() => { setSelectedLead(lead); setOpenModal(null); }} className="p-4 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition border border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{lead.institutName}</div>
                        <div className="text-sm text-gray-600">{lead.contactName}</div>
                      </div>
                      <div className="text-right">
                        {lead.estimatedValue && <div className="text-sm font-semibold text-green-600">{Number(lead.estimatedValue).toLocaleString('fr-FR')}€</div>}
                      </div>
                    </div>
                  </div>
                )) : <div className="text-center py-4 text-gray-500">Aucun lead gagné</div>}
              </div>
            </div>
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
