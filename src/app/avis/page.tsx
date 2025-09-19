'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, ThumbsUp, MessageSquare, Award } from 'lucide-react';

export default function AvisPage() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('id');
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showGoogleRedirect, setShowGoogleRedirect] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null);

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
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          rating,
          comment,
          userId: reservationData?.userId,
          serviceName: reservationData?.serviceName,
          source: 'email'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitted(true);
        
        // Si 5 étoiles, proposer Google Review
        if (rating === 5 && data.googleUrl) {
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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Merci infiniment ! 💜
            </h1>
            <p className="text-gray-600 mb-6">
              Votre avis 5 étoiles me touche énormément !
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <Award className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h2 className="font-semibold text-lg mb-2">
                Aidez-moi sur Google Business
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Votre avis sur Google aide d'autres clientes à découvrir l'institut
              </p>
              <a
                href="https://www.google.com/maps/place/?q=place_id:3014602962211627658"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Laisser un avis sur Google ⭐
              </a>
            </div>
            
            <a
              href="/"
              className="text-gray-600 underline hover:text-gray-800"
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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <ThumbsUp className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Merci pour votre avis !
          </h1>
          <p className="text-gray-600 mb-6">
            Votre retour m'aide à améliorer mes services
          </p>
          <a
            href="/"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour au site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Votre avis compte ! ✨
            </h1>
            <p className="text-gray-600">
              Aidez-moi à améliorer mes services en partageant votre expérience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Étoiles de notation */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-3">
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
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="inline w-4 h-4 mr-1" />
                Partagez votre expérience (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Qu'avez-vous apprécié ? Qu'est-ce qui pourrait être amélioré ?"
              />
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Envoyer mon avis
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Votre avis sera publié de manière anonyme si vous le souhaitez
          </p>
        </div>
      </div>
    </div>
  );
}