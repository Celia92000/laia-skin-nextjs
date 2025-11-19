'use client';

import { useState, useMemo } from 'react';
import {
  ChevronDown, ChevronUp, Phone, Mail, Star, CheckCircle2, Play, Shield, Clock, Heart, Zap, TrendingUp, Search
} from 'lucide-react';
import Link from 'next/link';

// Types
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  gif?: string; // URL du GIF animé
}

interface Testimonial {
  id: string;
  name: string;
  institute: string;
  photo: string;
  rating: number;
  text: string;
  date: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  youtubeId: string;
  thumbnail: string;
}

export default function AidePage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // FAQ rassurante pour prospects
  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'Puis-je essayer LAIA Connect gratuitement ?',
      answer: 'Oui ! Vous bénéficiez de 30 jours d\'essai gratuit sans engagement. Aucune carte bancaire n\'est demandée à l\'inscription. Vous pouvez tester toutes les fonctionnalités de votre formule choisie pendant un mois complet.',
      category: 'essai',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTlxdHZpZ3E3NXp3ZmN5YXdtYnQ5bHdoZWFsbHRkdWNxanBzNGkxZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6Ztl7JcvsWMZPfTq/giphy.gif'
    },
    {
      id: '2',
      question: 'Y a-t-il un engagement de durée ?',
      answer: 'Non, aucun engagement ! Votre abonnement est mensuel et vous pouvez l\'annuler à tout moment depuis votre espace admin. L\'annulation prend effet à la fin du mois en cours, sans pénalité.',
      category: 'engagement',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejdqZGFndmY0OHoyOWViMHRlbTNhbWJ3MWJnN2ZsMXM0dmM3ZWNncSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6Mb7fO6MJHpxOyuA/giphy.gif'
    },
    {
      id: '3',
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Absolument. Vos données sont hébergées sur des serveurs sécurisés en Europe (conformité RGPD). Nous utilisons un chiffrement SSL/TLS pour toutes les communications. Vos données clients sont isolées et sauvegardées quotidiennement. Nous ne vendons ni ne partageons jamais vos données.',
      category: 'securite',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2VhNnV6aGJjbWhnN2J5aGhseGJlOGw0cDdmbWExNGxtcTRrN3VwbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9DPofgEkyu9t4wPm/giphy.gif'
    },
    {
      id: '4',
      question: 'Le support est-il inclus dans l\'abonnement ?',
      answer: 'Oui, le support technique est inclus dans toutes les formules sans exception. Vous pouvez nous contacter par email (réponse sous 24h) ou par téléphone du lundi au vendredi de 9h à 18h. Un centre d\'aide complet avec tutoriels vidéo est également disponible 24/7.',
      category: 'support',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXVqa3dpcnlqcHFhYjZnbjFsNGl2NGc5ZDN1eWkzeWd5NWN0MjV1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohzdGu4kGeeSUX7iw/giphy.gif'
    },
    {
      id: '5',
      question: 'Puis-je annuler à tout moment ?',
      answer: 'Oui, vous gardez le contrôle total. Vous pouvez annuler votre abonnement en quelques clics depuis votre espace admin. L\'annulation prend effet à la fin de votre période de facturation en cours, et vous conservez l\'accès jusqu\'à cette date.',
      category: 'annulation',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXByNnZ2ZndjN2JscmpmamczaXp5enJwMWhtdHM3OGo3NnZqMHQxcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6EhGvKschtbrRjX2/giphy.gif'
    },
    {
      id: '6',
      question: 'Combien de temps prend la mise en place ?',
      answer: 'Vous pouvez être opérationnel en moins de 30 minutes ! L\'inscription prend 5 minutes, puis vous configurez vos services, votre planning et vos informations en 15-20 minutes. Votre site web personnalisé est créé automatiquement et vos clients peuvent réserver immédiatement.',
      category: 'installation',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGFzejFjdjl0eDl1YWd3anJodmhraDJwbnN5NDhpamdteWlscXd3byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btNhMBytxAM6YBa/giphy.gif'
    },
    {
      id: '7',
      question: 'Que se passe-t-il avec mes données si je résilie ?',
      answer: 'Vous conservez la propriété totale de vos données. Avant résiliation, vous pouvez exporter toutes vos données clients, rendez-vous et statistiques au format CSV. Après résiliation, vos données sont conservées 30 jours puis supprimées définitivement de nos serveurs si vous ne revenez pas.',
      category: 'donnees',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3E4cmN6c2VsM2E4bGFiNmdwcHg2aDk5OXBzNzFqM3BsZ2Q4bXQ5aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oz8xUK8V7suY7W9SE/giphy.gif'
    },
    {
      id: '8',
      question: 'LAIA Connect est-elle adaptée aux petits instituts ?',
      answer: 'Absolument ! Notre formule SOLO à 29€/mois est spécialement conçue pour les esthéticiennes indépendantes et petits instituts. Vous avez accès à toutes les fonctionnalités essentielles : réservation en ligne, gestion clients, planning, paiements sécurisés, sans limitation du nombre de clients.',
      category: 'taille',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXk2aWJ3OGlnN2d5d2NyajE0ZGEwbGRrMXczcHN3OTJvdHRoNDI4dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2K5jinAlChoCLS/giphy.gif'
    },
    {
      id: '9',
      question: 'Les paiements clients sont-ils sécurisés ?',
      answer: 'Oui, 100% sécurisés. Nous utilisons Stripe, le leader mondial du paiement en ligne (utilisé par Amazon, Google, etc.). Les transactions sont chiffrées et conformes PCI-DSS. Vos clients peuvent payer par carte bancaire en toute sécurité. Nous ne prenons aucune commission sur vos ventes.',
      category: 'paiement',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzEwbDFpdDg0ejY5ZGRyNWljdHMyaDk3ZTNqNzdrMDBrNWoxcW5yZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPf3C7HqqYBVcCk/giphy.gif'
    },
    {
      id: '10',
      question: 'Puis-je personnaliser mon site web ?',
      answer: 'Oui ! Votre site web est entièrement personnalisable : logo, couleurs, photos, textes, services, horaires. Vous pouvez utiliser votre propre nom de domaine (ex: www.votre-institut.fr) ou un sous-domaine LAIA gratuit (ex: votre-institut.laiaconnect.fr).',
      category: 'personnalisation',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWt6aHd1ODI3N3J2Z3BwYzJwcWlycGNwNDVhOW1uMmx0c3RlZ2FzYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMt1VVNkHV2PaE/giphy.gif'
    },
    {
      id: '11',
      question: 'Y a-t-il des frais cachés ou des commissions ?',
      answer: 'Non, aucun frais caché. Le prix de votre abonnement est tout compris : site web, réservation en ligne, SMS, emails, support, mises à jour. Nous ne prenons AUCUNE commission sur vos ventes et paiements clients. 0% de commission = 100% de vos revenus pour vous.',
      category: 'tarifs',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHloa2RrYTRtZHNlbWo3YTdkY3BjMjBoNzRpZDB6YnhqOGR6dWxobiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/67ThRZlYBvibtdF9JH/giphy.gif'
    },
    {
      id: '12',
      question: 'Puis-je changer de formule facilement ?',
      answer: 'Oui, très facilement. Vous pouvez passer à une formule supérieure à tout moment (effet immédiat avec proratisation). Pour passer à une formule inférieure, le changement s\'appliquera à votre prochaine échéance de paiement.',
      category: 'formules',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTBxdTExNnp5YWlwbDY3dWJiZ2Q3aXZ0cGZmNjlzOTdleTJiYTRpYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7qE1YN7aBOFPRw8E/giphy.gif'
    },
    {
      id: '13',
      question: 'Les mises à jour sont-elles incluses ?',
      answer: 'Oui, toutes les mises à jour et nouvelles fonctionnalités sont automatiquement incluses dans votre abonnement, sans surcoût. Vous profitez en permanence de la dernière version de LAIA Connect avec les améliorations de sécurité et les nouvelles fonctionnalités.',
      category: 'maj',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWd1NG8ydGN1MjlneTlicDhzMm55ZWJoc2RqeHVrYzI2cHNjZWh2eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3orifgB6x6qJLvB6so/giphy.gif'
    },
    {
      id: '14',
      question: 'Ai-je besoin de compétences techniques ?',
      answer: 'Non, aucune compétence technique requise ! LAIA Connect est conçu pour être ultra-simple et intuitif. Si vous savez utiliser Facebook ou WhatsApp, vous savez utiliser LAIA Connect. Des tutoriels vidéo sont disponibles pour chaque fonctionnalité.',
      category: 'technique',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnRrNW1wOGx5NWdhdmhkaHM1dHowbTAwOGdkYThscXFxdXBjNmh2YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6Ztbb7qQiKu4SDp6/giphy.gif'
    },
    {
      id: '15',
      question: 'Comment sont gérés les rappels clients ?',
      answer: 'Automatiquement ! Vos clients reçoivent des rappels de rendez-vous par email et SMS (24h avant). Vous pouvez aussi envoyer des campagnes de fidélisation, promotions et vœux d\'anniversaire en quelques clics. Tout est automatisé pour vous faire gagner du temps.',
      category: 'communication',
      gif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2FnN2U3ZG5qcWNsZWtkNzVjZ2Jlem9qeWVqcXJpYjFnN2hqNnJvMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKtnuHOHHUjR38Y/giphy.gif'
    }
  ];

  // Filtrage des FAQ en fonction de la recherche
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqItems;
    }

    const query = searchQuery.toLowerCase();
    return faqItems.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Témoignages clients
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sophie Martinez',
      institute: 'Belle Harmonie - Paris 15ème',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
      rating: 5,
      text: 'Depuis que j\'utilise LAIA Connect, j\'ai gagné 10h par semaine sur la gestion administrative. Mes clientes adorent pouvoir réserver en ligne à toute heure. Le ROI est incroyable : l\'abonnement est rentabilisé dès la première réservation !',
      date: 'Il y a 2 mois'
    },
    {
      id: '2',
      name: 'Marie Dubois',
      institute: 'Institut Zen Beauté - Lyon',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
      rating: 5,
      text: 'Interface ultra-intuitive, j\'ai été opérationnelle en 20 minutes chrono. Le support est réactif et bienveillant. Mes rendez-vous ont augmenté de 40% grâce aux rappels automatiques et aux promotions ciblées. Je recommande à 100% !',
      date: 'Il y a 1 mois'
    },
    {
      id: '3',
      name: 'Laura Chen',
      institute: 'Beauty Lab - Bordeaux',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      rating: 5,
      text: 'Avant LAIA, je passais mes soirées à confirmer les RDV par téléphone. Maintenant tout est automatisé : réservation, paiement, rappels. Mes clientes sont ravies et moi je peux enfin me concentrer sur mon métier. Un vrai game-changer !',
      date: 'Il y a 3 semaines'
    },
    {
      id: '4',
      name: 'Émilie Rousseau',
      institute: 'Institut Divine Beauté - Marseille',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emilie',
      rating: 5,
      text: 'J\'hésitais à investir dans un logiciel de gestion mais LAIA Connect a dépassé toutes mes attentes. L\'essai gratuit de 30 jours m\'a convaincue en une semaine. Rapport qualité/prix imbattable et zéro commission sur les paiements !',
      date: 'Il y a 2 semaines'
    }
  ];

  // Vidéos de démonstration
  const videos: Video[] = [
    {
      id: 'vid-1',
      title: 'Prise en main rapide de LAIA Connect',
      description: 'Découvrez l\'interface et les fonctionnalités principales en 5 minutes',
      duration: '5:32',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://placehold.co/640x360/7c3aed/white?text=Prise+en+main'
    },
    {
      id: 'vid-2',
      title: 'Ajouter et gérer vos clients',
      description: 'Créez des fiches clients complètes avec historique et préférences',
      duration: '4:15',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://placehold.co/640x360/7c3aed/white?text=Gestion+Clients'
    },
    {
      id: 'vid-3',
      title: 'Configurer vos services et tarifs',
      description: 'Ajoutez vos prestations, catégories et grille tarifaire en quelques clics',
      duration: '3:45',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://placehold.co/640x360/7c3aed/white?text=Services'
    },
    {
      id: 'vid-4',
      title: 'Gérer votre planning et vos rendez-vous',
      description: 'Planning intelligent avec réservation en ligne et rappels automatiques',
      duration: '6:20',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://placehold.co/640x360/7c3aed/white?text=Planning'
    },
    {
      id: 'vid-5',
      title: 'Configurer les paiements en ligne',
      description: 'Activez Stripe pour accepter les paiements sécurisés en 2 minutes',
      duration: '3:10',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://placehold.co/640x360/7c3aed/white?text=Paiements'
    },
    {
      id: 'vid-6',
      title: 'Analyser vos statistiques et performances',
      description: 'Dashboard complet : CA, clients, prestations populaires, tendances',
      duration: '5:00',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://placehold.co/640x360/7c3aed/white?text=Statistiques'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Des questions sur LAIA Connect ?
          </h1>
          <p className="text-2xl text-purple-100 mb-8">
            Toutes les réponses pour vous lancer en toute confiance
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-6 py-3">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">30 jours d'essai gratuit</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-6 py-3">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Sans engagement</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-6 py-3">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">0% de commission</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir avant de vous lancer
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une question... (ex: essai gratuit, sécurité, tarifs)"
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-600 mt-2 ml-1">
                {filteredFAQs.length} résultat{filteredFAQs.length > 1 ? 's' : ''} trouvé{filteredFAQs.length > 1 ? 's' : ''}
                {filteredFAQs.length > 0 && ` pour "${searchQuery}"`}
              </p>
            )}
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-2">Aucun résultat trouvé pour "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white border-2 border-purple-100 rounded-xl overflow-hidden hover:border-purple-300 transition-colors"
              >
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                  }
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-purple-50 transition-colors"
                >
                  <span className="font-semibold text-lg text-gray-900 pr-8">
                    {faq.question}
                  </span>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-6 py-5 bg-purple-50 border-t-2 border-purple-100">
                    {faq.gif && (
                      <div className="mb-4 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={faq.gif}
                          alt={faq.question}
                          className="w-full max-w-md mx-auto"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <p className="text-gray-700 leading-relaxed text-base">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
              ))
            )}
          </div>

          {/* CTA après FAQ */}
          <div className="mt-12 text-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Zap className="w-6 h-6" />
              Essayer gratuitement pendant 30 jours
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              Aucune carte bancaire demandée • Sans engagement
            </p>
          </div>
        </div>

        {/* Témoignages */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Elles nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez des centaines d'instituts qui ont transformé leur activité
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl shadow-lg p-8 border border-purple-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full border-2 border-purple-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-purple-600 font-medium">
                      {testimonial.institute}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        {testimonial.date}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Vidéos de démonstration */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Découvrez LAIA Connect en vidéo
            </h2>
            <p className="text-xl text-gray-600">
              Des tutoriels courts pour comprendre toutes les fonctionnalités
            </p>
          </div>

          {/* Vidéo sélectionnée */}
          {selectedVideo && (
            <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedVideo.title}
                </h3>
                <p className="text-gray-600 text-lg">
                  {selectedVideo.description}
                </p>
              </div>
            </div>
          )}

          {/* Grille des vidéos */}
          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <Play className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à transformer votre institut ?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines d'instituts qui ont choisi LAIA Connect pour simplifier leur gestion et booster leur activité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Zap className="w-6 h-6" />
              Commencer mon essai gratuit
            </Link>
            <Link
              href="/platform#tarifs"
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-4 rounded-full text-lg font-semibold transition-all"
            >
              Voir les tarifs
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>30 jours gratuits</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Installation en 30 min</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span>Support inclus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Une question ? Besoin d'aide ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Notre équipe est là pour vous accompagner
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link
              href="mailto:contact@laiaconnect.fr"
              className="bg-white text-purple-600 rounded-xl p-6 hover:bg-purple-50 transition-colors shadow-md hover:shadow-lg"
            >
              <Mail className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-sm">contact@laiaconnect.fr</p>
              <p className="text-xs text-gray-500 mt-2">Réponse sous 24h</p>
            </Link>

            <Link
              href="tel:+33683717050"
              className="bg-white text-purple-600 rounded-xl p-6 hover:bg-purple-50 transition-colors shadow-md hover:shadow-lg"
            >
              <Phone className="w-10 h-10 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Téléphone</h3>
              <p className="text-sm">06 83 71 70 50</p>
              <p className="text-xs text-gray-500 mt-2">Lun-Ven 9h-18h</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
