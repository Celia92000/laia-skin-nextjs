'use client';

import React, { useState, useEffect } from 'react';
import {
  Star, Camera, Download, Eye, Check, X, Search,
  Filter, Calendar, MessageSquare, Image, ThumbsUp,
  AlertCircle, Share2, Trash2, ChevronDown, ChevronUp,
  Grid, List as ListIcon, Heart, TrendingUp, Award
} from 'lucide-react';

interface ClientReview {
  reservationId: string;
  service: string;
  date: string;
  rating: number;
  satisfaction: number;
  comment: string;
  photos: string[];
  timestamp: string;
  clientName: string;
  clientEmail: string;
  status?: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

export default function AdminReviewsManager() {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ClientReview[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedReview, setSelectedReview] = useState<ClientReview | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);

  useEffect(() => {
    // Charger les avis depuis le localStorage (simulation)
    const savedReviews = JSON.parse(localStorage.getItem('clientReviews') || '[]');
    
    // Ajouter des avis de démonstration si vide
    if (savedReviews.length === 0) {
      const demoReviews: ClientReview[] = [
        {
          reservationId: '1',
          service: 'HydraFacial Premium',
          date: '2024-11-20',
          rating: 5,
          satisfaction: 5,
          comment: 'Excellent soin ! Ma peau n\'a jamais été aussi éclatante. Laïa est très professionnelle.',
          photos: [
            'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
            'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='
          ],
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          clientName: 'Marie Dupont',
          clientEmail: 'marie.dupont@email.com',
          status: 'approved'
        },
        {
          reservationId: '2',
          service: 'BB Glow',
          date: '2024-11-19',
          rating: 4,
          satisfaction: 4,
          comment: 'Très bon résultat, teint unifié et lumineux.',
          photos: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='],
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          clientName: 'Sophie Martin',
          clientEmail: 'sophie.martin@email.com',
          status: 'pending'
        },
        {
          reservationId: '3',
          service: 'LED Therapy',
          date: '2024-11-18',
          rating: 5,
          satisfaction: 5,
          comment: 'Parfait ! Je vois déjà la différence après 3 séances.',
          photos: [],
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          clientName: 'Julie Bernard',
          clientEmail: 'julie.bernard@email.com',
          status: 'approved'
        }
      ];
      setReviews(demoReviews);
      setFilteredReviews(demoReviews);
    } else {
      // Ajouter le statut par défaut si manquant
      const reviewsWithStatus = savedReviews.map((r: ClientReview) => ({
        ...r,
        status: r.status || 'pending'
      }));
      setReviews(reviewsWithStatus);
      setFilteredReviews(reviewsWithStatus);
    }
  }, []);

  useEffect(() => {
    // Filtrer les avis
    let filtered = [...reviews];

    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Filtre par note
    if (filterRating !== 'all') {
      filtered = filtered.filter(r => r.rating === parseInt(filterRating));
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
  }, [reviews, filterStatus, filterRating, searchTerm]);

  const handleStatusChange = (reviewId: string, newStatus: 'approved' | 'rejected') => {
    const updatedReviews = reviews.map(r => 
      r.reservationId === reviewId ? { ...r, status: newStatus } : r
    );
    setReviews(updatedReviews);
    localStorage.setItem('clientReviews', JSON.stringify(updatedReviews));
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      const updatedReviews = reviews.filter(r => r.reservationId !== reviewId);
      setReviews(updatedReviews);
      localStorage.setItem('clientReviews', JSON.stringify(updatedReviews));
    }
  };

  const downloadPhoto = (photoUrl: string, clientName: string, index: number) => {
    // Si c'est une image base64 ou une URL d'image
    if (photoUrl.startsWith('data:image') || photoUrl.startsWith('blob:')) {
      // Pour les images base64, créer un lien de téléchargement direct
      const link = document.createElement('a');
      link.href = photoUrl;
      link.download = `avis-${clientName.replace(/\s+/g, '-')}-photo-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Pour les autres URLs, créer une image et la convertir en blob
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(function(blob) {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `avis-${clientName.replace(/\s+/g, '-')}-photo-${index + 1}.jpg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          }, 'image/jpeg');
        }
      };
      img.src = photoUrl;
    }
  };

  const downloadAllPhotos = () => {
    const photosToDownload = filteredReviews.flatMap(review => 
      review.photos.map((photo, index) => ({
        url: photo,
        clientName: review.clientName,
        service: review.service,
        index: index
      }))
    );

    if (photosToDownload.length === 0) {
      alert('Aucune photo à télécharger');
      return;
    }

    // Télécharger toutes les photos une par une avec un délai
    let downloadIndex = 0;
    const downloadNext = () => {
      if (downloadIndex < photosToDownload.length) {
        const { url, clientName, service, index } = photosToDownload[downloadIndex];
        downloadPhoto(url, `${clientName}-${service}`, index);
        downloadIndex++;
        setTimeout(downloadNext, 200); // Délai de 200ms entre chaque téléchargement
      }
    };

    alert(`Téléchargement de ${photosToDownload.length} photos en cours...`);
    downloadNext();
  };

  const exportReviewsCSV = () => {
    const csvData = filteredReviews.map(review => ({
      'Client': review.clientName,
      'Email': review.clientEmail,
      'Service': review.service,
      'Date': new Date(review.date).toLocaleDateString('fr-FR'),
      'Note': review.rating,
      'Satisfaction': review.satisfaction,
      'Commentaire': review.comment,
      'Photos': review.photos.length,
      'Statut': review.status || 'pending',
      'Date avis': new Date(review.timestamp).toLocaleDateString('fr-FR')
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => 
          `"${row[header as keyof typeof row] || ''}"`
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `avis-clients-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistiques
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
    totalPhotos: reviews.reduce((sum, r) => sum + r.photos.length, 0),
    satisfaction: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.satisfaction, 0) / reviews.length).toFixed(1)
      : '0'
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des Avis Clients</h2>
            <p className="text-gray-600 mt-1">Modérez et gérez les avis et photos de vos clients</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadAllPhotos}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Télécharger toutes les photos
            </button>
            <button
              onClick={exportReviewsCSV}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg p-3">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total avis</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-600">En attente</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-600">Approuvés</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-blue-600">⭐ {stats.averageRating}</p>
            <p className="text-xs text-gray-600">Note moyenne</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-purple-600">{stats.totalPhotos}</p>
            <p className="text-xs text-gray-600">Photos</p>
          </div>
          <div className="bg-pink-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-pink-600">😊 {stats.satisfaction}/5</p>
            <p className="text-xs text-gray-600">Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un avis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
          </select>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les notes</option>
            <option value="5">5 étoiles</option>
            <option value="4">4 étoiles</option>
            <option value="3">3 étoiles</option>
            <option value="2">2 étoiles</option>
            <option value="1">1 étoile</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
        {filteredReviews.map((review) => {
          const isExpanded = expandedReviews.includes(review.reservationId);
          
          return (
            <div
              key={review.reservationId}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* En-tête de l'avis */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{review.clientName}</p>
                    <p className="text-sm text-gray-500">{review.clientEmail}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    review.status === 'approved' 
                      ? 'bg-green-100 text-green-700'
                      : review.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {review.status === 'approved' ? 'Approuvé' :
                     review.status === 'rejected' ? 'Rejeté' : 'En attente'}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">{review.service}</p>
                  <p className="text-xs text-gray-500">
                    Soin du {new Date(review.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {/* Notes et satisfaction */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl">
                      {review.satisfaction === 1 && '😢'}
                      {review.satisfaction === 2 && '😐'}
                      {review.satisfaction === 3 && '🙂'}
                      {review.satisfaction === 4 && '😊'}
                      {review.satisfaction === 5 && '😍'}
                    </span>
                    <span className="text-sm text-gray-600">
                      Satisfaction: {review.satisfaction}/5
                    </span>
                  </div>
                </div>

                {/* Commentaire */}
                {review.comment && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                  </div>
                )}

                {/* Photos */}
                {review.photos.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Photos ({review.photos.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {review.photos.slice(0, 3).map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg cursor-pointer"
                            onClick={() => {
                              setSelectedPhotos(review.photos);
                              setShowPhotoModal(true);
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadPhoto(photo, review.clientName, index);
                            }}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Download className="w-3 h-3 text-gray-700" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex gap-2">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(review.reservationId, 'approved')}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleStatusChange(review.reservationId, 'rejected')}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Rejeter
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteReview(review.reservationId)}
                      className="px-3 py-1 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Reçu le {new Date(review.timestamp).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal photos */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Photos de l'avis</h3>
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  setSelectedPhotos([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                {selectedPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full rounded-lg"
                    />
                    <button
                      onClick={() => downloadPhoto(photo, 'client', index)}
                      className="absolute top-2 right-2 bg-white rounded-lg p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun avis */}
      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucun avis trouvé</p>
          <p className="text-sm text-gray-500 mt-1">
            Les avis de vos clients apparaîtront ici
          </p>
        </div>
      )}
    </div>
  );
}