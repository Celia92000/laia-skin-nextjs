"use client";

import { useState, useEffect } from "react";
import { Star, User, ThumbsUp } from "lucide-react";

interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  profile_photo_url?: string;
}

interface GoogleReviewsProps {
  placeId?: string;
  apiKey?: string;
}

export default function GoogleReviews({ placeId, apiKey }: GoogleReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Données de démonstration en attendant la configuration de l'API
  const demoReviews: Review[] = [
    {
      author_name: "Sophie Leclerc",
      rating: 5,
      text: "Après 3 séances d'Hydro'Cleaning, ma peau est complètement transformée ! Les pores sont resserrés, plus de points noirs et un teint éclatant. Laia est très professionnelle et prend le temps d'expliquer chaque étape. Les résultats sont visibles dès la première séance.",
      time: Date.now() - 86400000 * 5,
      relative_time_description: "il y a 5 jours",
      profile_photo_url: ""
    },
    {
      author_name: "Marie Dubois",
      rating: 5,
      text: "Le BB Glow est incroyable ! Fini le fond de teint tous les matins. Mon teint est unifié et lumineux 24h/24. Après 2 séances, les taches de soleil ont disparu et j'ai un effet bonne mine permanent. Je recommande vivement !",
      time: Date.now() - 86400000 * 12,
      relative_time_description: "il y a 2 semaines",
      profile_photo_url: ""
    },
    {
      author_name: "Julie Martin",
      rating: 5,
      text: "Renaissance + LED en combo, c'est magique ! Les ridules du contour des yeux ont vraiment diminué et ma peau est plus ferme. À 45 ans, on me donne 10 ans de moins. Merci Laia pour ton expertise et ta gentillesse !",
      time: Date.now() - 86400000 * 20,
      relative_time_description: "il y a 3 semaines",
      profile_photo_url: ""
    },
    {
      author_name: "Amelia Chen",
      rating: 5,
      text: "L'Hydro'Naissance est mon soin préféré ! La combinaison des deux traitements donne des résultats spectaculaires. Ma peau n'a jamais été aussi belle. L'institut est très propre et l'ambiance est relaxante.",
      time: Date.now() - 86400000 * 30,
      relative_time_description: "il y a 1 mois",
      profile_photo_url: ""
    },
    {
      author_name: "Fatima Benali",
      rating: 5,
      text: "J'avais des problèmes d'acné depuis des années. Après un forfait de 4 séances de Renaissance, ma peau est lisse et les cicatrices se sont estompées. Laia est à l'écoute et adapte vraiment les soins à nos besoins.",
      time: Date.now() - 86400000 * 45,
      relative_time_description: "il y a 1 mois",
      profile_photo_url: ""
    }
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      // Si l'API key et le place ID sont fournis, on pourrait faire un appel réel
      if (placeId && apiKey) {
        try {
          // Pour l'instant, on simule avec les données de démo
          // Dans un cas réel, on ferait :
          // const response = await fetch(`/api/google-reviews?placeId=${placeId}`);
          // const data = await response.json();
          // setReviews(data.reviews);
          
          // Simulation
          setTimeout(() => {
            setReviews(demoReviews);
            const avg = demoReviews.reduce((acc, r) => acc + r.rating, 0) / demoReviews.length;
            setAverageRating(avg);
            setTotalReviews(demoReviews.length);
            setLoading(false);
          }, 1000);
        } catch (err) {
          setError("Impossible de charger les avis");
          setLoading(false);
        }
      } else {
        // Utiliser les données de démo
        setReviews(demoReviews);
        const avg = demoReviews.reduce((acc, r) => acc + r.rating, 0) / demoReviews.length;
        setAverageRating(avg);
        setTotalReviews(demoReviews.length);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [placeId, apiKey]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2c3e50] mb-4">
            Avis Clients Google
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.floor(averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-[#2c3e50]">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-[#2c3e50]/70">
              ({totalReviews} avis)
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <img 
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
              alt="Google" 
              className="h-6"
            />
            <span className="text-sm text-[#2c3e50]/70">Business</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center flex-shrink-0">
                  {review.profile_photo_url ? (
                    <img
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2c3e50]">
                    {review.author_name}
                  </h3>
                  <p className="text-xs text-[#2c3e50]/60">
                    {review.relative_time_description}
                  </p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-[#2c3e50]/80 text-sm line-clamp-4 mb-4">
                {review.text}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-[#2c3e50]/60">
                <img 
                  src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_42x16dp.png" 
                  alt="Google" 
                  className="h-3"
                />
                <span>Avis vérifié</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href={`https://www.google.com/maps/place/?q=place_id:${placeId || 'ChIJN1t_tDeuEmsRUsoyG83frY4'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border-2 border-[#d4b5a0] text-[#d4b5a0] px-6 py-3 rounded-full font-semibold hover:bg-[#d4b5a0] hover:text-white transition-all duration-300"
          >
            Voir tous les avis sur Google
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}