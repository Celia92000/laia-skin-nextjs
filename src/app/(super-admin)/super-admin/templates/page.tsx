'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface WebsiteTemplate {
  id: string
  name: string
  description: string
  minTier: string
  category: string
  previewImageUrl: string | null
  config: any
  displayOrder: number
  isActive: boolean
  createdAt: string
  _count?: {
    organizations: number
  }
}

interface TemplateFormData {
  name: string
  description: string
  minTier: string
  category: string
  previewImageUrl: string
  displayOrder: number
  isActive: boolean
  config: {
    colors?: {
      primary?: string
      secondary?: string
      accent?: string
    }
    layout?: string
  }
}

export default function TemplatesManagementPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WebsiteTemplate | null>(null)
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    minTier: 'SOLO',
    category: 'beauty',
    previewImageUrl: '',
    displayOrder: 0,
    isActive: true,
    config: {
      colors: {
        primary: '#E8B4B8',
        secondary: '#D4A5A5',
        accent: '#C78D8D'
      },
      layout: 'modern'
    }
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/super-admin/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/super-admin/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        fetchTemplates()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Erreur toggle active:', error)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le template "${name}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/super-admin/templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTemplates()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const handleOpenModal = (template?: WebsiteTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        name: template.name,
        description: template.description,
        minTier: template.minTier,
        category: template.category,
        previewImageUrl: template.previewImageUrl || '',
        displayOrder: template.displayOrder,
        isActive: template.isActive,
        config: template.config || {
          colors: { primary: '#E8B4B8', secondary: '#D4A5A5', accent: '#C78D8D' },
          layout: 'modern'
        }
      })
    } else {
      setEditingTemplate(null)
      setFormData({
        name: '',
        description: '',
        minTier: 'SOLO',
        category: 'beauty',
        previewImageUrl: '',
        displayOrder: templates.length,
        isActive: true,
        config: {
          colors: {
            primary: '#E8B4B8',
            secondary: '#D4A5A5',
            accent: '#C78D8D'
          },
          layout: 'modern'
        }
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTemplate
        ? `/api/super-admin/templates/${editingTemplate.id}`
        : '/api/super-admin/templates'

      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowModal(false)
        fetchTemplates()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Erreur enregistrement:', error)
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'SOLO':
        return 'bg-gray-100 text-gray-800'
      case 'DUO':
        return 'bg-blue-100 text-blue-800'
      case 'TEAM':
        return 'bg-purple-100 text-purple-800'
      case 'PREMIUM':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      beauty: 'Beauté',
      spa: 'Spa',
      salon: 'Salon',
      barbershop: 'Barbier',
      wellness: 'Bien-être'
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/super-admin')}
              className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
            >
              ← Retour au dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Templates</h1>
            <p className="text-gray-600 mt-2">
              {templates.length} template{templates.length > 1 ? 's' : ''} • {templates.filter(t => t.isActive).length} actif{templates.filter(t => t.isActive).length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium"
          >
            + Nouveau Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {template.displayOrder}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {template.previewImageUrl && (
                        <img
                          src={template.previewImageUrl}
                          alt={template.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {template.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getCategoryLabel(template.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTierBadgeColor(template.minTier)}`}>
                      {template.minTier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {template._count?.organizations || 0} org.
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(template.id, template.isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        template.isActive ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          template.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(template)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(template.id, template.name)}
                        className="text-red-600 hover:text-red-900"
                        disabled={(template._count?.organizations || 0) > 0}
                        title={(template._count?.organizations || 0) > 0 ? 'Template utilisé par des organisations' : 'Supprimer'}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du template *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Ex: Élégance Rose"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    rows={3}
                    placeholder="Description du template..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan minimum *
                    </label>
                    <select
                      required
                      value={formData.minTier}
                      onChange={(e) => setFormData({ ...formData, minTier: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="SOLO">SOLO (49€)</option>
                      <option value="DUO">DUO (69€)</option>
                      <option value="TEAM">TEAM (119€)</option>
                      <option value="PREMIUM">PREMIUM (179€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="beauty">Beauté</option>
                      <option value="spa">Spa</option>
                      <option value="salon">Salon</option>
                      <option value="barbershop">Barbier</option>
                      <option value="wellness">Bien-être</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'image de prévisualisation
                  </label>
                  <input
                    type="url"
                    value={formData.previewImageUrl}
                    onChange={(e) => setFormData({ ...formData, previewImageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Configuration des couleurs</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Couleur principale
                      </label>
                      <input
                        type="color"
                        value={formData.config.colors?.primary || '#E8B4B8'}
                        onChange={(e) => setFormData({
                          ...formData,
                          config: {
                            ...formData.config,
                            colors: {
                              ...formData.config.colors,
                              primary: e.target.value
                            }
                          }
                        })}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Couleur secondaire
                      </label>
                      <input
                        type="color"
                        value={formData.config.colors?.secondary || '#D4A5A5'}
                        onChange={(e) => setFormData({
                          ...formData,
                          config: {
                            ...formData.config,
                            colors: {
                              ...formData.config.colors,
                              secondary: e.target.value
                            }
                          }
                        })}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Couleur accent
                      </label>
                      <input
                        type="color"
                        value={formData.config.colors?.accent || '#C78D8D'}
                        onChange={(e) => setFormData({
                          ...formData,
                          config: {
                            ...formData.config,
                            colors: {
                              ...formData.config.colors,
                              accent: e.target.value
                            }
                          }
                        })}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Template actif (visible dans l'onboarding)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                  >
                    {editingTemplate ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
