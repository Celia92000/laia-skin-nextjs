'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle } from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  description: string;
  color: string;
  criteria: any;
  clientCount: number;
  totalValue: number;
  isAutomatic: boolean;
  isActive: boolean;
  createdAt: string;
}

interface ClientSegmentsTabProps {
  onSegmentAction?: (action: 'email' | 'whatsapp', segmentId: string, segmentName: string) => void;
}

export default function ClientSegmentsTab({ onSegmentAction }: ClientSegmentsTabProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    criteria: {
      totalSpent: { min: undefined, max: undefined },
      lastVisit: { daysAgo: { min: undefined, max: undefined } },
      loyaltyPoints: { min: undefined, max: undefined }
    },
    isAutomatic: true
  });

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/segments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSegments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = editingSegment
        ? '/api/admin/segments'
        : '/api/admin/segments';

      const method = editingSegment ? 'PATCH' : 'POST';

      const body = editingSegment
        ? { ...formData, id: editingSegment.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingSegment(null);
        resetForm();
        loadSegments();
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce segment ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/segments?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadSegments();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleEdit = (segment: Segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      color: segment.color,
      criteria: segment.criteria,
      isAutomatic: segment.isAutomatic
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      criteria: {
        totalSpent: { min: undefined, max: undefined },
        lastVisit: { daysAgo: { min: undefined, max: undefined } },
        loyaltyPoints: { min: undefined, max: undefined }
      },
      isAutomatic: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Segmentation Clients</h1>
          <p className="text-gray-600 mt-2">Créez et gérez vos segments de clients pour des campagnes ciblées</p>
        </div>
        <button
          onClick={() => {
            setEditingSegment(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + Nouveau segment
        </button>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition"
            style={{ borderLeftColor: segment.color }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{segment.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(segment)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(segment.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clients</span>
                <span className="text-2xl font-bold" style={{ color: segment.color }}>
                  {segment.clientCount}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valeur totale</span>
                <span className="text-lg font-semibold text-gray-900">
                  {segment.totalValue?.toFixed(2)} €
                </span>
              </div>

              <div className="pt-3 border-t">
                <div className="flex gap-2 text-xs mb-3">
                  {segment.isAutomatic && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Automatique
                    </span>
                  )}
                  {segment.isActive && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Actif
                    </span>
                  )}
                </div>

                {/* Boutons d'action pour campagnes */}
                {onSegmentAction && segment.clientCount > 0 && (
                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      onClick={() => onSegmentAction('email', segment.id, segment.name)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                    <button
                      onClick={() => onSegmentAction('whatsapp', segment.id, segment.name)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun segment créé pour le moment</p>
          <p className="text-gray-400 mt-2">Créez votre premier segment pour commencer la segmentation</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingSegment ? 'Modifier le segment' : 'Nouveau segment'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du segment *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Clients VIP, Inactifs 6 mois, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    rows={3}
                    placeholder="Description du segment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10 rounded border border-gray-300"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Critères de segmentation</h3>

                  {/* Total dépensé */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total dépensé (€)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Minimum"
                        value={formData.criteria.totalSpent.min || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          criteria: {
                            ...formData.criteria,
                            totalSpent: {
                              ...formData.criteria.totalSpent,
                              min: (e.target.value ? parseFloat(e.target.value) : undefined) as number | undefined
                            }
                          }
                        })}
                        className="border border-gray-300 rounded-lg px-4 py-2"
                      />
                      <input
                        type="number"
                        placeholder="Maximum"
                        value={formData.criteria.totalSpent.max || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          criteria: {
                            ...formData.criteria,
                            totalSpent: {
                              ...formData.criteria.totalSpent,
                              max: (e.target.value ? parseFloat(e.target.value) : undefined) as number | undefined
                            }
                          }
                        })}
                        className="border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>

                  {/* Dernière visite */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dernière visite (jours)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Plus de X jours"
                        value={formData.criteria.lastVisit.daysAgo.min || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          criteria: {
                            ...formData.criteria,
                            lastVisit: {
                              daysAgo: {
                                ...formData.criteria.lastVisit.daysAgo,
                                min: (e.target.value ? parseInt(e.target.value) : undefined) as number | undefined
                              }
                            }
                          }
                        })}
                        className="border border-gray-300 rounded-lg px-4 py-2"
                      />
                      <input
                        type="number"
                        placeholder="Moins de X jours"
                        value={formData.criteria.lastVisit.daysAgo.max || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          criteria: {
                            ...formData.criteria,
                            lastVisit: {
                              daysAgo: {
                                ...formData.criteria.lastVisit.daysAgo,
                                max: (e.target.value ? parseInt(e.target.value) : undefined) as number | undefined
                              }
                            }
                          }
                        })}
                        className="border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>

                  {/* Points de fidélité */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points de fidélité
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Minimum"
                        value={formData.criteria.loyaltyPoints.min || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          criteria: {
                            ...formData.criteria,
                            loyaltyPoints: {
                              ...formData.criteria.loyaltyPoints,
                              min: (e.target.value ? parseInt(e.target.value) : undefined) as number | undefined
                            }
                          }
                        })}
                        className="border border-gray-300 rounded-lg px-4 py-2"
                      />
                      <input
                        type="number"
                        placeholder="Maximum"
                        value={formData.criteria.loyaltyPoints.max || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          criteria: {
                            ...formData.criteria,
                            loyaltyPoints: {
                              ...formData.criteria.loyaltyPoints,
                              max: (e.target.value ? parseInt(e.target.value) : undefined) as number | undefined
                            }
                          }
                        })}
                        className="border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAutomatic"
                    checked={formData.isAutomatic}
                    onChange={(e) => setFormData({ ...formData, isAutomatic: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isAutomatic" className="text-sm text-gray-700">
                    Mise à jour automatique du segment
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingSegment ? 'Mettre à jour' : 'Créer le segment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSegment(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
