"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function PlatformHomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [activeTab, setActiveTab] = useState('reservations')

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const plans = [
    {
      id: 'SOLO',
      name: 'Solo',
      price: 49,
      description: 'Parfait pour débuter',
      features: [
        '1 emplacement',
        '1 utilisateur',
        '5 GB stockage',
        'Réservations illimitées',
        'Support email',
        'Accès mobile'
      ],
      color: 'from-gray-400 to-gray-600',
      popular: false
    },
    {
      id: 'DUO',
      name: 'Duo',
      price: 99,
      description: 'Le plus populaire',
      features: [
        '1 emplacement',
        '3 utilisateurs',
        '10 GB stockage',
        'Réservations illimitées',
        'Support prioritaire',
        'Export de données',
        'Accès mobile'
      ],
      color: 'from-blue-500 to-blue-600',
      popular: true
    },
    {
      id: 'TEAM',
      name: 'Team',
      price: 199,
      description: 'Pour les équipes',
      features: [
        '3 emplacements',
        '10 utilisateurs',
        '50 GB stockage',
        'Réservations illimitées',
        'Support 24/7',
        'Export de données',
        'API access',
        'Formation personnalisée'
      ],
      color: 'from-purple-500 to-purple-600',
      popular: false
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: 399,
      description: 'Solution complète',
      features: [
        'Emplacements illimités',
        'Utilisateurs illimités',
        '999 GB stockage',
        'Tout illimité',
        'Support dédié 24/7',
        'API complète',
        'Développement sur mesure',
        'Manager dédié'
      ],
      color: 'from-indigo-500 to-pink-600',
      popular: false
    }
  ]

  const features = [
    {
      icon: '📅',
      title: 'Réservations en ligne',
      description: 'Système de réservation complet avec calendrier intelligent et confirmations automatiques',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      icon: '👥',
      title: 'Gestion des clients',
      description: 'Fichier client détaillé avec historique, photos avant/après et notes personnalisées',
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      icon: '💰',
      title: 'Paiements sécurisés',
      description: 'Encaissement en ligne, gestion des acomptes et facturation automatique',
      gradient: 'from-green-400 to-green-600'
    },
    {
      icon: '📊',
      title: 'Analytics avancés',
      description: 'Tableaux de bord en temps réel, KPIs et prévisions de revenus',
      gradient: 'from-pink-400 to-pink-600'
    },
    {
      icon: '🎁',
      title: 'Programme fidélité',
      description: 'Cartes digitales, points de récompense et offres personnalisées',
      gradient: 'from-orange-400 to-orange-600'
    },
    {
      icon: '📱',
      title: 'Application mobile',
      description: 'Interface responsive accessible partout, iOS et Android',
      gradient: 'from-teal-400 to-teal-600'
    }
  ]

  const stats = [
    { value: '500+', label: 'Professionnels conquis', icon: '🏆' },
    { value: '50K+', label: 'RDV automatisés/mois', icon: '🚀' },
    { value: '98%', label: 'Taux de conversion', icon: '💰' },
    { value: '+20h', label: 'Gagnées/semaine', icon: '⏰' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {/* Header Navigation - Fixed with glass effect */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrollY > 50 ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(10px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid rgba(147, 51, 234, 0.1)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/platform" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-xl shadow-lg">
                <span className="text-xl">🌸</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  LAIA Beauty
                </h1>
                <p className="text-xs text-purple-600 font-medium">Logiciel de gestion</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/pour-qui" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Pour qui ?
              </Link>
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Tarifs
              </a>
              <Link
                href="/connexion"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Essayer gratuitement
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Modern & Professional */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Modern gradient background - Soft beauty colors */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-200 rounded-full text-purple-700 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-sm font-semibold">✨ Nouveau : IA pour optimiser vos rendez-vous</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              La solution complète
              <span className="block mt-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                beauté & bien-être
              </span>
            </h2>
            <p className="text-lg text-purple-600 mb-6 font-medium">
              🌸 Instituts de beauté • 💇 Salons de coiffure • 💆 Spas • ✂️ Barbiers • 🧘 Centres de massage
            </p>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto">
              Automatisez vos réservations, fidélisez vos clients et développez votre chiffre d'affaires.
              <span className="block mt-3 text-gray-600">Gagnez <span className="text-purple-600 font-semibold">20h par semaine</span> sur votre gestion administrative.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg text-lg font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center gap-2"
              >
                Essayer gratuitement 30 jours
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#demo"
                className="px-8 py-4 bg-white border-2 border-purple-200 text-purple-700 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-all"
              >
                Demander une démo
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-6 font-medium">
              ✅ 30 jours gratuits • 💳 Prélèvement SEPA après essai • ❌ Annulation à tout moment
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="relative group p-6 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl hover:bg-white hover:border-purple-300 hover:shadow-lg transition-all animate-fade-in-up"
                style={{ animationDelay: `${800 + idx * 100}ms` }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Interactive */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-widest">FONCTIONNALITÉS</span>
            <h3 className="text-5xl md:text-6xl font-black text-gray-900 mt-4 mb-6 leading-tight">
              Tout ce dont vous avez besoin
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                pour réussir
              </span>
            </h3>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto font-semibold">
              Les outils professionnels des leaders du secteur beauté & bien-être
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl hover:border-purple-300 hover:shadow-xl transition-all hover:transform hover:scale-105"
              >
                <div className={`relative inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl mb-4 transform group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Modern cards */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-widest">INVESTISSEZ MALIN</span>
            <h3 className="text-5xl md:text-6xl font-black text-gray-900 mt-4 mb-6 leading-tight">
              Rentabilisé dès le
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                premier mois
              </span>
            </h3>
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-500 rounded-full text-green-700 font-black text-lg shadow-lg">
              <span className="text-3xl">🎁</span>
              <span>30 JOURS OFFERTS - Testez SANS RISQUE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, idx) => (
              <div
                key={plan.id}
                className={`relative group bg-white border rounded-3xl overflow-hidden transition-all hover:transform hover:scale-105 shadow-lg ${
                  plan.popular
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/30 scale-105'
                    : 'border-purple-200 hover:border-purple-400'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center py-2 text-sm font-bold">
                    ⭐ LE PLUS POPULAIRE
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${plan.color}`}></div>

                <div className="p-8">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{plan.price}€</span>
                    <span className="text-gray-600">/mois</span>
                  </div>

                  <Link
                    href="/register"
                    className={`block w-full py-3 px-4 rounded-xl font-semibold text-center transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Commencer
                  </Link>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-700 mt-12 text-lg">
            💎 Tous les plans incluent : SSL gratuit, sauvegardes quotidiennes, mises à jour automatiques et support francophone
          </p>
        </div>
      </section>

      {/* CTA Final - Impactful */}
      <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-purple-600 to-pink-500">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Prêt à transformer
            <span className="block mt-2">
              votre activité ?
            </span>
          </h3>
          <p className="text-2xl text-white/90 mb-10 leading-relaxed font-medium">
            Rejoignez des centaines de professionnels qui ont choisi l'excellence
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-12 py-6 bg-white text-purple-600 rounded-full text-2xl font-bold hover:shadow-2xl hover:shadow-white/50 transition-all transform hover:scale-105"
          >
            <span>🚀 Commencer mon essai gratuit</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-lg text-white/90 font-semibold mt-6">
            ✅ 30 jours gratuits • 💳 Prélèvement SEPA après essai • ❌ Annulation à tout moment
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-200 bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <span className="text-xl">🌸</span>
                </div>
                <h4 className="text-gray-900 font-bold text-lg">LAIA Beauty</h4>
              </div>
              <p className="text-gray-600 text-sm font-medium">
                Logiciel de gestion pour professionnels
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-600 hover:text-purple-600 transition">Fonctionnalités</a></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-purple-600 transition">Tarifs</a></li>
                <li><Link href="/register" className="text-gray-600 hover:text-purple-600 transition">Essai gratuit</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-purple-600 transition">Centre d'aide</a></li>
                <li><a href="mailto:contact@laia.com" className="text-gray-600 hover:text-purple-600 transition">Contact</a></li>
                <li><Link href="/connexion" className="text-gray-600 hover:text-purple-600 transition">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-purple-600 transition">CGV</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 transition">Mentions légales</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 transition">RGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-200 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              &copy; 2025 LAIA Beauty. Tous droits réservés. Fait avec 💜 en France
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  )
}
