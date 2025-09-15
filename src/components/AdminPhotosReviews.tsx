"use client";

import { useState, useEffect } from "react";
import { Camera, Star, Download, Trash2, Eye, Check, X, Calendar, User, Heart, MessageCircle, Share2, Instagram, Filter, Search, Image as ImageIcon, Grid, List } from "lucide-react";

interface ClientPhoto {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  photoUrl: string;
  serviceName: string;
  serviceDate: string;
  rating?: number;
  review?: string;
  beforePhoto?: string;
  afterPhoto?: string;
  daysAfterService: number;
  approved: boolean;
  featured: boolean;
  createdAt: string;
  source: 'email' | 'whatsapp' | 'instagram' | 'upload';
  tags?: string[];
}

interface Review {
  id: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  serviceName: string;
  date: string;
  photos?: string[];
  approved: boolean;
  featured: boolean;
  source: 'google' | 'instagram' | 'facebook' | 'email' | 'website';
}

export default function AdminPhotosReviews() {
  const [photos, setPhotos] = useState<ClientPhoto[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'photos' | 'reviews' | 'gallery'>('photos');
  const [selectedPhoto, setSelectedPhoto] = useState<ClientPhoto | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Données de démonstration
  useEffect(() => {
    // Simuler le chargement des photos reçues
    setPhotos([
      {
        id: "1",
        clientId: "c1",
        clientName: "Marie Dupont",
        clientEmail: "marie@example.com",
        photoUrl: "/api/placeholder/400/400",
        serviceName: "Hydro'Naissance",
        serviceDate: "2024-01-10",
        daysAfterService: 3,
        rating: 5,
        review: "Ma peau est transformée ! Les résultats sont incroyables.",
        approved: false,
        featured: false,
        createdAt: new Date().toISOString(),
        source: 'whatsapp',
        tags: ["hydratation", "éclat", "pores"]
      },
      {
        id: "2",
        clientId: "c2",
        clientName: "Sophie Martin",
        clientEmail: "sophie@example.com",
        photoUrl: "/api/placeholder/400/400",
        beforePhoto: "/api/placeholder/400/400",
        afterPhoto: "/api/placeholder/400/400",
        serviceName: "BB Glow",
        serviceDate: "2024-01-08",
        daysAfterService: 5,
        rating: 5,
        review: "Teint unifié et lumineux, exactement ce que je voulais !",
        approved: true,
        featured: true,
        createdAt: new Date().toISOString(),
        source: 'instagram',
        tags: ["bb-glow", "teint", "luminosité"]
      }
    ]);

    setReviews([
      {
        id: "r1",
        clientId: "c1",
        clientName: "Marie Dupont",
        rating: 5,
        comment: "Service exceptionnel, Laïa est très professionnelle et attentionnée.",
        serviceName: "Hydro'Naissance",
        date: "2024-01-10",
        photos: ["/api/placeholder/400/400"],
        approved: true,
        featured: false,
        source: 'google'
      }
    ]);
  }, []);

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          photo.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'pending') return matchesSearch && !photo.approved;
    if (filterStatus === 'approved') return matchesSearch && photo.approved;
    return matchesSearch;
  });

  const handleApprovePhoto = async (photoId: string) => {
    setPhotos(photos.map(p => 
      p.id === photoId ? { ...p, approved: true } : p
    ));
    // API call to approve photo
  };

  const handleFeaturePhoto = async (photoId: string) => {
    setPhotos(photos.map(p => 
      p.id === photoId ? { ...p, featured: !p.featured } : p
    ));
    // API call to feature photo
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (confirm('Supprimer cette photo ?')) {
      setPhotos(photos.filter(p => p.id !== photoId));
      // API call to delete photo
    }
  };

  const handleShareToInstagram = (photo: ClientPhoto) => {
    alert(`Partager sur Instagram:\n\n@${photo.clientName.toLowerCase().replace(' ', '.')} après son soin ${photo.serviceName} ✨\n\n#laiaskin #resultat #${photo.serviceName.toLowerCase().replace(/\s+/g, '')}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2c3e50] flex items-center gap-2">
              <Camera className="w-6 h-6 text-[#d4b5a0]" />
              Avis & Photos Clients
            </h2>
            <p className="text-[#2c3e50]/60 mt-1">
              Gérez les photos et avis reçus de vos clientes
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-colors flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Ajouter une photo
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'photos' 
                ? 'text-[#d4b5a0] border-[#d4b5a0]' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Photos reçues ({photos.filter(p => !p.approved).length} en attente)
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'reviews' 
                ? 'text-[#d4b5a0] border-[#d4b5a0]' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Avis clients
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'gallery' 
                ? 'text-[#d4b5a0] border-[#d4b5a0]' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Galerie publique
          </button>
        </div>
      </div>

      {/* Contenu Photos */}
      {activeTab === 'photos' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
            >
              <option value="all">Toutes les photos</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#d4b5a0] text-white' : 'bg-gray-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#d4b5a0] text-white' : 'bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grille de photos */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPhotos.map(photo => (
                <div key={photo.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square bg-gray-100">
                    <img 
                      src={photo.photoUrl} 
                      alt={`${photo.clientName} - ${photo.serviceName}`}
                      className="w-full h-full object-cover"
                    />
                    {!photo.approved && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                        En attente
                      </div>
                    )}
                    {photo.featured && (
                      <div className="absolute top-2 left-2 bg-[#d4b5a0] text-white px-2 py-1 rounded text-xs">
                        ⭐ Featured
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                      <p className="font-semibold">{photo.clientName}</p>
                      <p className="text-sm opacity-90">{photo.serviceName}</p>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        J+{photo.daysAfterService} après le soin
                      </span>
                      <div className="flex gap-1">
                        {photo.source === 'whatsapp' && <MessageCircle className="w-4 h-4 text-green-500" />}
                        {photo.source === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                        {photo.source === 'email' && <MessageCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                    </div>
                    
                    {photo.review && (
                      <p className="text-sm text-gray-600 italic mb-3">"{photo.review}"</p>
                    )}
                    
                    {photo.rating && (
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < photo.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {!photo.approved && (
                        <button
                          onClick={() => handleApprovePhoto(photo.id)}
                          className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4 inline mr-1" />
                          Approuver
                        </button>
                      )}
                      <button
                        onClick={() => handleFeaturePhoto(photo.id)}
                        className={`flex-1 px-3 py-1.5 rounded text-sm transition-colors ${
                          photo.featured 
                            ? 'bg-[#d4b5a0] text-white hover:bg-[#c4a590]' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <Star className="w-4 h-4 inline mr-1" />
                        {photo.featured ? 'Featured' : 'Mettre en avant'}
                      </button>
                      <button
                        onClick={() => setSelectedPhoto(photo)}
                        className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShareToInstagram(photo)}
                        className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:opacity-90 transition-opacity"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vue liste
            <div className="space-y-4">
              {filteredPhotos.map(photo => (
                <div key={photo.id} className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <img 
                    src={photo.photoUrl} 
                    alt={`${photo.clientName} - ${photo.serviceName}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-[#2c3e50]">{photo.clientName}</h3>
                        <p className="text-sm text-gray-600">{photo.serviceName} - J+{photo.daysAfterService}</p>
                      </div>
                      <div className="flex gap-2">
                        {!photo.approved && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            En attente
                          </span>
                        )}
                        {photo.featured && (
                          <span className="px-2 py-1 bg-[#d4b5a0]/20 text-[#d4b5a0] text-xs rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    {photo.review && (
                      <p className="text-sm text-gray-600 italic mb-2">"{photo.review}"</p>
                    )}
                    <div className="flex gap-2">
                      {!photo.approved && (
                        <button
                          onClick={() => handleApprovePhoto(photo.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Approuver
                        </button>
                      )}
                      <button
                        onClick={() => handleFeaturePhoto(photo.id)}
                        className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
                      >
                        {photo.featured ? 'Retirer' : 'Mettre en avant'}
                      </button>
                      <button
                        onClick={() => handleShareToInstagram(photo)}
                        className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-sm"
                      >
                        Partager
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contenu Avis */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-[#2c3e50]">{review.clientName}</h3>
                    <p className="text-sm text-gray-600">{review.serviceName} - {review.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    {review.source === 'google' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Google</span>}
                    {review.source === 'instagram' && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Instagram</span>}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {review.photos.map((photo, idx) => (
                      <img key={idx} src={photo} alt="" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">
                    {review.approved ? 'Masquer' : 'Approuver'}
                  </button>
                  <button className="px-3 py-1 bg-[#d4b5a0]/20 text-[#d4b5a0] rounded text-sm hover:bg-[#d4b5a0]/30">
                    {review.featured ? 'Retirer de la une' : 'Mettre en avant'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenu Galerie */}
      {activeTab === 'gallery' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-4">Photos approuvées et mises en avant pour le site public</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.filter(p => p.approved && p.featured).map(photo => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={photo.photoUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-sm">
                  {photo.serviceName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal détail photo */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#2c3e50]">{selectedPhoto.clientName}</h3>
                  <p className="text-gray-600">{selectedPhoto.serviceName} - {selectedPhoto.serviceDate}</p>
                </div>
                <button onClick={() => setSelectedPhoto(null)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {selectedPhoto.beforePhoto && selectedPhoto.afterPhoto ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Avant</p>
                      <img src={selectedPhoto.beforePhoto} alt="Avant" className="w-full rounded-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Après (J+{selectedPhoto.daysAfterService})</p>
                      <img src={selectedPhoto.afterPhoto} alt="Après" className="w-full rounded-lg" />
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2">
                    <img src={selectedPhoto.photoUrl} alt="Résultat" className="w-full rounded-lg" />
                  </div>
                )}
              </div>
              
              {selectedPhoto.review && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="italic">"{selectedPhoto.review}"</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  Approuver pour le site
                </button>
                <button className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590]">
                  Mettre en avant
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                  Partager sur Instagram
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}