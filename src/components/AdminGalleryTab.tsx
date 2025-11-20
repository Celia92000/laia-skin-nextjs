"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, Eye, EyeOff, GripVertical, Link as LinkIcon, Save, X } from "lucide-react";
import Image from "next/image";

interface GalleryPhoto {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  linkTo: string | null;
  order: number;
  active: boolean;
}

export default function AdminGalleryTab() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [newPhoto, setNewPhoto] = useState({
    url: '',
    title: '',
    description: '',
    linkTo: ''
  });

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/admin/gallery');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhoto.url) {
      alert('URL de la photo requise');
      return;
    }

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto)
      });

      if (res.ok) {
        await fetchPhotos();
        setShowAddModal(false);
        setNewPhoto({ url: '', title: '', description: '', linkTo: '' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la photo:', error);
    }
  };

  const handleUpdatePhoto = async (id: string, updates: Partial<GalleryPhoto>) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        await fetchPhotos();
        setEditingPhoto(null);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo:', error);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Supprimer cette photo ?')) return;

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchPhotos();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
    }
  };

  const handleToggleActive = async (photo: GalleryPhoto) => {
    await handleUpdatePhoto(photo.id, { active: !photo.active });
  };

  const movePhoto = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === photos.length - 1)
    ) {
      return;
    }

    const newPhotos = [...photos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newPhotos[index], newPhotos[targetIndex]] = [newPhotos[targetIndex], newPhotos[index]];

    // Mettre à jour l'ordre
    const updatedPhotos = newPhotos.map((photo, idx) => ({
      id: photo.id,
      order: idx
    }));

    try {
      await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: updatedPhotos })
      });

      await fetchPhotos();
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2c3e50] flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-[#d4b5a0]" />
              Galerie Photos
            </h2>
            <p className="text-[#2c3e50]/60 mt-1">
              Gérez les photos affichées dans la section "Réseaux Sociaux" de votre site
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une photo
          </button>
        </div>
      </div>

      {/* Liste des photos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune photo dans la galerie</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors"
            >
              Ajouter votre première photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className={`border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                  !photo.active ? 'opacity-50' : ''
                }`}
              >
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={photo.url}
                    alt={photo.title || 'Photo de galerie'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {!photo.active && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                      Masquée
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {photo.title && (
                    <h3 className="font-semibold text-[#2c3e50] mb-1">{photo.title}</h3>
                  )}
                  {photo.description && (
                    <p className="text-sm text-gray-600 mb-3">{photo.description}</p>
                  )}

                  {photo.linkTo && (
                    <div className="text-xs text-[#d4b5a0] mb-3 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      {photo.linkTo}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(photo)}
                      className={`flex-1 px-3 py-1.5 rounded text-sm transition-colors ${
                        photo.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={photo.active ? 'Masquer' : 'Afficher'}
                    >
                      {photo.active ? <Eye className="w-4 h-4 inline" /> : <EyeOff className="w-4 h-4 inline" />}
                    </button>

                    <button
                      onClick={() => movePhoto(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-30"
                      title="Monter"
                    >
                      ↑
                    </button>

                    <button
                      onClick={() => movePhoto(index, 'down')}
                      disabled={index === photos.length - 1}
                      className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-30"
                      title="Descendre"
                    >
                      ↓
                    </button>

                    <button
                      onClick={() => setEditingPhoto(photo)}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      title="Modifier"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#2c3e50]">Ajouter une photo</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  URL de la photo *
                </label>
                <input
                  type="text"
                  value={newPhoto.url}
                  onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Titre (optionnel)
                </label>
                <input
                  type="text"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Description (optionnelle)
                </label>
                <textarea
                  value={newPhoto.description}
                  onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Lien (optionnel)
                </label>
                <input
                  type="text"
                  value={newPhoto.linkTo}
                  onChange={(e) => setNewPhoto({ ...newPhoto, linkTo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  placeholder="/services/bb-glow"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lien vers une page de votre site (ex: /services/bb-glow)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddPhoto}
                  className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590]"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#2c3e50]">Modifier la photo</h3>
              <button
                onClick={() => setEditingPhoto(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  URL de la photo *
                </label>
                <input
                  type="text"
                  value={editingPhoto.url}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Titre (optionnel)
                </label>
                <input
                  type="text"
                  value={editingPhoto.title || ''}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Description (optionnelle)
                </label>
                <textarea
                  value={editingPhoto.description || ''}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c3e50] mb-1">
                  Lien (optionnel)
                </label>
                <input
                  type="text"
                  value={editingPhoto.linkTo || ''}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, linkTo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  placeholder="/services/bb-glow"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleUpdatePhoto(editingPhoto.id, editingPhoto)}
                  className="flex-1 px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590]"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
