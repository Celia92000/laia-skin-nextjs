'use client'

import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'

export interface ClientFilterCriteria {
  // Filtres de base
  search?: string

  // Fidélité
  minPoints?: number
  maxPoints?: number
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | ''

  // Dépenses
  minSpent?: number
  maxSpent?: number

  // Activité
  lastVisitDays?: number // Nombre de jours depuis dernière visite
  minVisits?: number
  maxVisits?: number
  status?: 'active' | 'inactive' | 'new' | '' // actif (<3 mois), inactif (>3 mois), nouveau (<1 mois)

  // Services
  lastService?: string
  favoriteServices?: string[]

  // Tags
  tags?: string[]

  // Anniversaire
  birthdayMonth?: number // 0-11 pour janvier-décembre

  // Type de peau
  skinType?: 'Normale' | 'Sèche' | 'Grasse' | 'Mixte' | 'Sensible' | ''
}

interface ClientAdvancedFiltersProps {
  filters: ClientFilterCriteria
  onChange: (filters: ClientFilterCriteria) => void
  availableServices?: string[]
  availableTags?: string[]
  onReset?: () => void
}

export default function ClientAdvancedFilters({
  filters,
  onChange,
  availableServices = [],
  availableTags = [],
  onReset
}: ClientAdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState<'all' | 'loyalty' | 'spending' | 'activity' | 'services'>('all')

  const handleChange = (key: keyof ClientFilterCriteria, value: any) => {
    onChange({ ...filters, [key]: value })
  }

  const handleReset = () => {
    onChange({})
    if (onReset) onReset()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.minPoints || filters.maxPoints) count++
    if (filters.tier) count++
    if (filters.minSpent || filters.maxSpent) count++
    if (filters.lastVisitDays) count++
    if (filters.minVisits || filters.maxVisits) count++
    if (filters.status) count++
    if (filters.lastService) count++
    if (filters.favoriteServices && filters.favoriteServices.length > 0) count++
    if (filters.tags && filters.tags.length > 0) count++
    if (filters.birthdayMonth !== undefined) count++
    if (filters.skinType) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Filtres avancés</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleReset()
              }}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Réinitialiser
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Filtres détaillés */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-6">
          {/* Sections tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'all'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setActiveSection('loyalty')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'loyalty'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Fidélité
            </button>
            <button
              onClick={() => setActiveSection('spending')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'spending'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Dépenses
            </button>
            <button
              onClick={() => setActiveSection('activity')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'activity'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Activité
            </button>
            <button
              onClick={() => setActiveSection('services')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'services'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Services & Profil
            </button>
          </div>

          {/* Recherche - toujours visible */}
          {activeSection === 'all' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Recherche par nom, email ou téléphone
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => handleChange('search', e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Section Fidélité */}
          {(activeSection === 'all' || activeSection === 'loyalty') && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">💎 Fidélité</h4>

              {/* Points de fidélité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points de fidélité
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={filters.minPoints || ''}
                    onChange={(e) => handleChange('minPoints', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Minimum"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number"
                    value={filters.maxPoints || ''}
                    onChange={(e) => handleChange('maxPoints', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Maximum"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Niveau de fidélité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau de fidélité
                </label>
                <select
                  value={filters.tier || ''}
                  onChange={(e) => handleChange('tier', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Tous les niveaux</option>
                  <option value="BRONZE">🥉 Bronze</option>
                  <option value="SILVER">🥈 Silver</option>
                  <option value="GOLD">🥇 Gold</option>
                  <option value="PLATINUM">💎 Platinum</option>
                </select>
              </div>
            </div>
          )}

          {/* Section Dépenses */}
          {(activeSection === 'all' || activeSection === 'spending') && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">💰 Dépenses</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total dépensé (€)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={filters.minSpent || ''}
                    onChange={(e) => handleChange('minSpent', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Minimum"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number"
                    value={filters.maxSpent || ''}
                    onChange={(e) => handleChange('maxSpent', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Maximum"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section Activité */}
          {(activeSection === 'all' || activeSection === 'activity') && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">📊 Activité</h4>

              {/* Statut d'activité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut d'activité
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="new">✨ Nouveaux clients (moins d'1 mois)</option>
                  <option value="active">✅ Actifs (visite dans les 3 derniers mois)</option>
                  <option value="inactive">⚠️ Inactifs (aucune visite depuis 3+ mois)</option>
                </select>
              </div>

              {/* Dernière visite */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dernière visite (jours écoulés)
                </label>
                <input
                  type="number"
                  value={filters.lastVisitDays || ''}
                  onChange={(e) => handleChange('lastVisitDays', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Ex: 30 pour les clients vus il y a plus de 30 jours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Affiche les clients dont la dernière visite remonte à plus de X jours
                </p>
              </div>

              {/* Nombre de visites */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de visites
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={filters.minVisits || ''}
                    onChange={(e) => handleChange('minVisits', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Minimum"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number"
                    value={filters.maxVisits || ''}
                    onChange={(e) => handleChange('maxVisits', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Maximum"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Anniversaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎂 Mois d'anniversaire
                </label>
                <select
                  value={filters.birthdayMonth !== undefined ? filters.birthdayMonth : ''}
                  onChange={(e) => handleChange('birthdayMonth', e.target.value !== '' ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Tous les mois</option>
                  <option value="0">Janvier</option>
                  <option value="1">Février</option>
                  <option value="2">Mars</option>
                  <option value="3">Avril</option>
                  <option value="4">Mai</option>
                  <option value="5">Juin</option>
                  <option value="6">Juillet</option>
                  <option value="7">Août</option>
                  <option value="8">Septembre</option>
                  <option value="9">Octobre</option>
                  <option value="10">Novembre</option>
                  <option value="11">Décembre</option>
                </select>
              </div>
            </div>
          )}

          {/* Section Services & Profil */}
          {(activeSection === 'all' || activeSection === 'services') && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">💆 Services & Profil</h4>

              {/* Type de peau */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de peau
                </label>
                <select
                  value={filters.skinType || ''}
                  onChange={(e) => handleChange('skinType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Tous les types</option>
                  <option value="Normale">Normale</option>
                  <option value="Sèche">Sèche</option>
                  <option value="Grasse">Grasse</option>
                  <option value="Mixte">Mixte</option>
                  <option value="Sensible">Sensible</option>
                </select>
              </div>

              {/* Dernier service */}
              {availableServices.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dernier service utilisé
                  </label>
                  <select
                    value={filters.lastService || ''}
                    onChange={(e) => handleChange('lastService', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Tous les services</option>
                    {availableServices.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tags */}
              {availableTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags clients
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSelected = filters.tags?.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            const currentTags = filters.tags || []
                            const newTags = isSelected
                              ? currentTags.filter(t => t !== tag)
                              : [...currentTags, tag]
                            handleChange('tags', newTags.length > 0 ? newTags : undefined)
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            isSelected
                              ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Résumé des filtres actifs */}
          {activeFiltersCount > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900 mb-2">
                    Filtres actifs ({activeFiltersCount})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Recherche: {filters.search}
                      </span>
                    )}
                    {(filters.minPoints || filters.maxPoints) && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Points: {filters.minPoints || '0'} - {filters.maxPoints || '∞'}
                      </span>
                    )}
                    {filters.tier && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Niveau: {filters.tier}
                      </span>
                    )}
                    {(filters.minSpent || filters.maxSpent) && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Dépensé: {filters.minSpent || '0'}€ - {filters.maxSpent || '∞'}€
                      </span>
                    )}
                    {filters.status && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Statut: {filters.status}
                      </span>
                    )}
                    {filters.lastVisitDays && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Dernière visite: +{filters.lastVisitDays}j
                      </span>
                    )}
                    {(filters.minVisits || filters.maxVisits) && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Visites: {filters.minVisits || '0'} - {filters.maxVisits || '∞'}
                      </span>
                    )}
                    {filters.skinType && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Peau: {filters.skinType}
                      </span>
                    )}
                    {filters.birthdayMonth !== undefined && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Anniversaire: {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][filters.birthdayMonth]}
                      </span>
                    )}
                    {filters.lastService && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Service: {filters.lastService}
                      </span>
                    )}
                    {filters.tags && filters.tags.length > 0 && (
                      <span className="px-2 py-1 bg-white text-purple-700 rounded text-xs">
                        Tags: {filters.tags.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-purple-600 hover:text-purple-800"
                  title="Réinitialiser tous les filtres"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
