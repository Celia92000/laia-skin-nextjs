'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, ThumbsUp, MessageSquare, Award, Camera, X, Upload } from 'lucide-react';

export default function AvisPage() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('id');
  const source = searchParams.get('source') || 'website';
  const clientEmail = searchParams.get('email');
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showGoogleRedirect, setShowGoogleRedirect] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null);
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState(clientEmail || '');

  useEffect(() => {
    if (reservationId) {
      fetchReservationData();
    }
  }, [reservationId]);

  const fetchReservationData = async () => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`);
      if (response.ok) {
        const data = await response.json();
        setReservationData(data);
        if (data.clientEmail) setEmail(data.clientEmail);
        if (data.clientName) setClientName(data.clientName);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    const promises: Promise<void>[] = [];

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const promise = new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              newPhotos.push(event.target.result as string);
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
        promises.push(promise);
      }
    });

    Promise.all(promises).then(() => {
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Max 5 photos
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    try {
      const response = await fetch('/api/reviews/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          rating,
          comment,
          clientName,
          clientEmail: email,
          photosBase64: photos,
          userId: reservationData?.userId,
          serviceName: reservationData?.serviceName,
          serviceId: reservationData?.serviceId,
          source: source as 'email' | 'whatsapp' | 'website'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitted(true);
        
        // Si 5 étoiles, proposer Google Review
        if (rating === 5) {
          setShowGoogleRedirect(true);
        }
      } else {
        alert('Erreur lors de l\'envoi de votre avis');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de votre avis');
    }
  };

  if (submitted && showGoogleRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">
              Merci infiniment ! 💜
            </h1>
            <p className="text-[#2c3e50]/60 mb-6">
              Votre avis 5 étoiles me touche énormément !
            </p>
            
            <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-6 mb-6">
              <Award className="w-12 h-12 text-[#d4b5a0] mx-auto mb-3" />
              <h2 className="font-semibold text-lg mb-2 text-[#2c3e50]">
                Aidez-moi sur Google Business
              </h2>
              <p className="text-sm text-[#2c3e50]/60 mb-4">
                Votre avis sur Google aide d'autres clientes à découvrir l'institut
              </p>
              <a
                href="https://www.google.com/maps/place/?q=place_id:3014602962211627658"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#d4b5a0] text-white px-6 py-3 rounded-lg hover:bg-[#c4a590] transition-colors font-medium"
              >
                Laisser un avis sur Google ⭐
              </a>
            </div>
            
            <a
              href="/"
              className="text-[#2c3e50]/60 underline hover:text-[#2c3e50]"
            >
              Retour au site
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <ThumbsUp className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">
            Merci pour votre avis !
          </h1>
          <p className="text-[#2c3e50]/60 mb-6">
            Votre retour m'aide à améliorer mes services
          </p>
          {photos.length > 0 && (
            <p className="text-sm text-[#d4b5a0] mb-4">
              {photos.length} photo{photos.length > 1 ? 's' : ''} ajoutée{photos.length > 1 ? 's' : ''}
            </p>
          )}
          <a
            href="/"
            className="inline-block bg-[#d4b5a0] text-white px-6 py-3 rounded-lg hover:bg-[#c4a590] transition-colors"
          >
            Retour au site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#2c3e50] mb-2">
              Votre avis compte ! ✨
            </h1>
            <p className="text-[#2c3e50]/60">
              Aidez-moi à améliorer mes services en partageant votre expérience
            </p>
            {source !== 'website' && (
              <p className="text-sm text-[#d4b5a0] mt-2">
                Avis via {source === 'email' ? 'Email' : 'WhatsApp'}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Étoiles de notation */}
            <div className="text-center">
              <p className="text-sm font-medium text-[#2c3e50] mb-3">
                Comment évaluez-vous votre expérience ?
              </p>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'text-[#d4b5a0] fill-[#d4b5a0]'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-[#2c3e50]/50">
                {rating === 0 && 'Cliquez sur les étoiles pour noter'}
                {rating === 1 && 'Très insatisfait 😞'}
                {rating === 2 && 'Insatisfait 😐'}
                {rating === 3 && 'Correct 🙂'}
                {rating === 4 && 'Satisfait 😊'}
                {rating === 5 && 'Très satisfait 🤩'}
              </p>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                <MessageSquare className="inline w-4 h-4 mr-1" />
                Partagez votre expérience (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Qu'avez-vous apprécié ? Qu'est-ce qui pourrait être amélioré ?"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                <Camera className="inline w-4 h-4 mr-1" />
                Ajoutez des photos (optionnel)
              </label>
              
              <div className="grid grid-cols-3 gap-3 mb-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {photos.length < 5 && (
                  <label className="border-2 border-dashed border-[#d4b5a0]/30 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-[#d4b5a0] transition-colors">
                    <Camera className="w-6 h-6 text-[#d4b5a0]/50 mb-1" />
                    <span className="text-xs text-[#2c3e50]/50">Ajouter</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {photos.length > 0 && (
                <p className="text-xs text-[#2c3e50]/50">
                  {photos.length}/5 photos ajoutées
                </p>
              )}
            </div>

            {/* Informations client (si non pré-remplies) */}
            {!reservationData && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Votre nom (optionnel)
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                    placeholder="Votre nom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#2c3e50] mb-2">
                    Votre email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-[#d4b5a0]/20 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                    placeholder="votre.email@exemple.com"
                  />
                </div>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="w-full bg-[#d4b5a0] text-white py-3 rounded-lg font-medium hover:bg-[#c4a590] transition-colors"
            >
              Envoyer mon avis
            </button>
          </form>

          <p className="text-xs text-[#2c3e50]/50 text-center mt-6">
            Votre avis sera publié après modération
          </p>
        </div>
      </div>
    </div>
  );
}