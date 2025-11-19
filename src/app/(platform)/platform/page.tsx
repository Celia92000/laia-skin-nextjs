"use client"

import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Lazy load heavy components
const ContactForm = dynamic(() => import('@/components/platform/ContactForm'), {
  loading: () => <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 animate-pulse rounded-2xl" />
})
const DemoBooking = dynamic(() => import('@/components/platform/DemoBooking'), {
  loading: () => <div className="h-96 bg-white animate-pulse rounded-2xl" />
})
const VideoDemo = dynamic(() => import('@/components/platform/VideoDemo'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 animate-pulse" />
})

export default function PlatformHomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [activeTab, setActiveTab] = useState('reservations')
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      description: 'Pour démarrer son activité',
      features: [
        '🌐 Site web professionnel multi-templates',
        '📅 Réservations en ligne 24/7 automatiques',
        '📊 Dashboard avec statistiques temps réel',
        '👥 Gestion clients complète avec historique',
        '💼 Catalogue prestations & tarifs',
        '🎁 Programme fidélité VIP (points + paliers + parrainage)',
        '💳 Cartes cadeaux digitales',
        '⭐ Avis clients (collecte + photos avant/après)',
        '🔗 Synchronisation Google Reviews automatique',
        '💰 Comptabilité complète (factures + exports + rapports)',
        '💳 Paiement en ligne sécurisé (Stripe)',
        '🔐 Espace client sécurisé avec connexion',
        '🎨 Design & Apparence (couleurs + logo + personnalisation)',
        '📚 Guide de Formation complet inclus',
        '🔌 API & Intégrations incluses',
        '📧 Rappels automatiques par email',
        '🔒 SSL gratuit + Sauvegardes quotidiennes',
        '👤 1 utilisateur • 📍 1 emplacement'
      ],
      color: 'from-gray-400 to-gray-600',
      popular: false,
      roi: '+500€/mois de CA supplémentaire avec les réservations 24/7'
    },
    {
      id: 'DUO',
      name: 'Duo',
      price: 69,
      description: 'Pour développer son CA',
      features: [
        '✨ Tout Solo +',
        '🎯 CRM Commercial complet (prospects + opportunités)',
        '📧 Email Marketing professionnel (campagnes illimitées)',
        '🤖 Automations marketing intelligentes',
        '📊 Pipeline de vente & tunnel commercial',
        '🎯 Segmentation clients avancée',
        '📈 Reporting commercial détaillé',
        '🔔 Notifications leads & opportunités',
        '💼 Gestion des devis & propositions',
        '📞 Historique communications clients',
        '🚀 Campagnes de fidélisation automatiques',
        '👥 Jusqu\'à 3 utilisateurs • 📍 1 emplacement'
      ],
      color: 'from-blue-500 to-blue-600',
      popular: false,
      roi: '+1200€/mois grâce au CRM et aux campagnes email'
    },
    {
      id: 'TEAM',
      name: 'Team',
      price: 119,
      description: '⭐ Le plus rentable',
      features: [
        '✨ Tout Duo +',
        '📝 Blog professionnel (SEO optimisé)',
        '🛍️ Boutique en ligne (produits + formations + packages)',
        '💳 Paiement produits & abonnements',
        '📦 Gestion commandes & expéditions',
        '📱 WhatsApp Business (messages + campagnes)',
        '📲 SMS Marketing (campagnes illimitées)',
        '📱 Réseaux sociaux (Instagram + Facebook sync)',
        '📸 Publications automatiques réseaux sociaux',
        '🎨 Templates boutique professionnels',
        '📊 Analytics e-commerce complet',
        '🌍 Multi-emplacements (jusqu\'à 3 sites)',
        '👥 Jusqu\'à 10 utilisateurs • 📍 3 emplacements'
      ],
      color: 'from-purple-500 to-purple-600',
      popular: true,
      roi: '+3500€/mois avec la boutique en ligne + multi-canaux'
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: 179,
      description: 'L\'expérience complète',
      features: [
        '✨ Tout Team +',
        '📦 Gestion stock avancée multi-sites',
        '🔔 Alertes stock automatiques & réapprovisionnement',
        '📊 Inventaire en temps réel',
        '🚚 Gestion fournisseurs & bons de commande',
        '📈 Prévisions stock intelligentes',
        '💼 Gestion achats & marges',
        '🔌 API complète pour intégrations',
        '📊 Export comptable automatique (Sage, Cegid, etc.)',
        '🔗 Connexion logiciels tiers',
        '🌍 Multi-emplacements illimités',
        '👥 Utilisateurs illimités',
        '🎯 Accompagnement personnalisé',
        '⚡ Support prioritaire 24/7',
        '♾️ Utilisateurs illimités • 📍 Emplacements illimités'
      ],
      color: 'from-indigo-500 to-pink-600',
      popular: false,
      roi: '+8000€/mois avec l\'optimisation stock + multi-sites'
    }
  ]

  const features = [
    {
      icon: '📧',
      title: 'Marketing Automation',
      description: 'Campagnes email, WhatsApp et scénarios automatisés pour fidéliser vos clients',
      gradient: 'from-pink-400 to-pink-600',
      badge: 'Nouveau'
    },
    {
      icon: '📊',
      title: 'CRM Commercial',
      description: 'Pipeline commercial, suivi des prospects et opportunités pour développer votre activité',
      gradient: 'from-blue-400 to-indigo-600',
      badge: 'Business'
    },
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
      icon: '⚡',
      title: 'Automation complète',
      description: 'SMS, emails, WhatsApp : automatisez toute votre communication client',
      gradient: 'from-purple-400 to-pink-600',
      badge: 'Premium'
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
            <Link href="/platform" className="flex items-center gap-4 group">
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                <Image
                  src="/logo-laia-connect.png?v=3"
                  alt="LAIA Connect Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  LAIA Connect
                </h1>
                <p className="text-base md:text-lg text-purple-600 font-medium">Logiciel de gestion</p>
              </div>
            </Link>
            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-5 flex-nowrap">
              <a href="#pour-qui" className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-base whitespace-nowrap">
                Pour qui ?
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-base whitespace-nowrap">
                Tarifs
              </a>
              <Link href="/platform/nouveautes" className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-base whitespace-nowrap">
                Nouveautés
              </Link>
              <Link
                href="/connexion"
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-base whitespace-nowrap"
              >
                Connexion
              </Link>
              <button
                onClick={() => setShowDemoModal(true)}
                className="px-5 py-2.5 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all text-base whitespace-nowrap"
              >
                🎯 Réserver une démo
              </button>
              <Link
                href="/onboarding-v2?plan=DUO"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all text-base whitespace-nowrap"
              >
                Essayer gratuitement
              </Link>
            </nav>

            {/* Bouton Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile - Full Screen Overlay */}
        {mobileMenuOpen && (
          <>
            {/* Overlay sombre */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div className="fixed top-0 right-0 bottom-0 w-80 bg-gradient-to-br from-purple-50 via-white to-pink-50 shadow-2xl z-50 md:hidden overflow-y-auto">
              {/* Header du menu */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="relative w-20 h-20 bg-white p-1 rounded-lg">
                      <Image
                        src="/logo-laia-connect.png?v=3"
                        alt="LAIA Connect Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">LAIA Connect</h3>
                      <p className="text-white/80 text-xs">Menu</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-all"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenu du menu */}
              <div className="p-6 space-y-3">
                <a
                  href="#pour-qui"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-purple-50 transition-all shadow-sm border border-purple-100 group"
                >
                  <span className="text-2xl">👥</span>
                  <span className="text-gray-800 font-medium group-hover:text-purple-600">Pour qui ?</span>
                </a>

                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-purple-50 transition-all shadow-sm border border-purple-100 group"
                >
                  <span className="text-2xl">💎</span>
                  <span className="text-gray-800 font-medium group-hover:text-purple-600">Tarifs</span>
                </a>

                <Link
                  href="/platform/nouveautes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-purple-50 transition-all shadow-sm border border-purple-100 group"
                >
                  <span className="text-2xl">🎉</span>
                  <span className="text-gray-800 font-medium group-hover:text-purple-600">Nouveautés</span>
                </Link>

                <Link
                  href="/connexion"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-purple-50 transition-all shadow-sm border border-purple-100 group"
                >
                  <span className="text-2xl">🔐</span>
                  <span className="text-gray-800 font-medium group-hover:text-purple-600">Connexion</span>
                </Link>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent my-4"></div>

                {/* CTA Buttons */}
                <button
                  onClick={() => {
                    setShowDemoModal(true)
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-md"
                >
                  <span className="text-xl">🎯</span>
                  <span>Réserver une démo</span>
                </button>

                <Link
                  href="/onboarding-v2?plan=DUO"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/50 transition-all"
                >
                  <span className="text-xl">🚀</span>
                  <span>Essayer gratuitement</span>
                </Link>

                {/* Info */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <p className="text-center text-green-700 text-sm font-semibold">
                    ✅ 30 jours gratuits
                  </p>
                  <p className="text-center text-green-600 text-xs mt-1">
                    Sans carte bancaire
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
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
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full mb-6 shadow-lg animate-pulse">
              <span className="text-sm font-bold">🎁 Offre de lancement : 1er mois offert</span>
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
                href="/onboarding-v2?plan=DUO"
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
              ✅ 1er mois offert • 💳 CB requise, 1er prélèvement après 30 jours • 📌 Sans engagement
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

      {/* Video Demo Section */}
      <VideoDemo />

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

      {/* Pour Qui Section - Who is it for */}
      <section id="pour-qui" className="py-20 px-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-widest">POUR QUI ?</span>
            <h3 className="text-5xl md:text-6xl font-black text-gray-900 mt-4 mb-6 leading-tight">
              Fait pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">votre métier</span>
            </h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Chaque secteur de la beauté et du bien-être a ses spécificités. Découvrez comment LAIA Connect s'adapte parfaitement à vous.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Instituts de beauté */}
            <div className="group relative bg-white border-2 border-pink-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl mb-4">🌸</div>
                <h4 className="text-2xl font-bold text-white">Instituts de beauté</h4>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">✓</span>
                    <span className="text-gray-700">Agenda 24/7 avec réservation automatique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">✓</span>
                    <span className="text-gray-700">Photos avant/après par cliente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">✓</span>
                    <span className="text-gray-700">Fiches allergies & contre-indications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">✓</span>
                    <span className="text-gray-700">Programme fidélité & cartes cadeaux</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Salons de coiffure */}
            <div className="group relative bg-white border-2 border-purple-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
              <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-8 text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl mb-4">💇</div>
                <h4 className="text-2xl font-bold text-white">Salons de coiffure</h4>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">✓</span>
                    <span className="text-gray-700">Planning multi-coiffeurs optimisé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">✓</span>
                    <span className="text-gray-700">Historique colorations & formules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">✓</span>
                    <span className="text-gray-700">Vente produits capillaires en ligne</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">✓</span>
                    <span className="text-gray-700">Stats par praticien en temps réel</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Spas */}
            <div className="group relative bg-white border-2 border-blue-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-8 text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl mb-4">💆</div>
                <h4 className="text-2xl font-bold text-white">Spas & Bien-être</h4>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span className="text-gray-700">Réservation parcours & packages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span className="text-gray-700">Attribution automatique des cabines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span className="text-gray-700">Programme fidélité VIP multi-niveaux</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span className="text-gray-700">Campagnes email & WhatsApp ciblées</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Barbiers */}
            <div className="group relative bg-white border-2 border-slate-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
              <div className="bg-gradient-to-r from-slate-600 to-gray-700 p-8 text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl mb-4">✂️</div>
                <h4 className="text-2xl font-bold text-white">Barbiers</h4>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-bold">✓</span>
                    <span className="text-gray-700">Créneaux courts rotation optimisée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-bold">✓</span>
                    <span className="text-gray-700">Historique coupes avec photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-bold">✓</span>
                    <span className="text-gray-700">Abonnements mensuels prépayés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-bold">✓</span>
                    <span className="text-gray-700">Paiement express sans contact</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Massage */}
            <div className="group relative bg-white border-2 border-green-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl mb-4">🧘</div>
                <h4 className="text-2xl font-bold text-white">Centres de massage</h4>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span className="text-gray-700">Durées flexibles (30min à 3h)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span className="text-gray-700">Fiche séance avec schéma corporel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span className="text-gray-700">Dossier santé avec alertes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span className="text-gray-700">Cures & abonnements personnalisés</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Esthéticienne */}
            <div className="group relative bg-white border-2 border-orange-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl mb-4">💅</div>
                <h4 className="text-2xl font-bold text-white">Esthéticiennes</h4>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span className="text-gray-700">Gestion multi-services beauté</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span className="text-gray-700">Photos avant/après prestations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span className="text-gray-700">Boutique produits cosmétiques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">✓</span>
                    <span className="text-gray-700">Marketing automation complet</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/onboarding-v2"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all"
            >
              Essayer gratuitement 30 jours →
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Section with Celia */}
      <section id="demo" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Vidéo de Celia */}
              <div className="relative h-[500px] lg:h-auto overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <video
                  src="/team/celia-page.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  loading="lazy"
                  className="w-full h-full object-cover scale-75"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-purple-900/90 to-transparent">
                  <p className="text-lg text-purple-200">Fondatrice & CEO LAIA Connect</p>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-200 rounded-full text-purple-700 mb-6 w-fit">
                  <span className="text-2xl">👋</span>
                  <span className="text-sm font-semibold">Une question ? Je vous réponds !</span>
                </div>

                <h3 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  Découvrez LAIA en
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                    30 minutes chrono
                  </span>
                </h3>

                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Je vous montre personnellement comment LAIA peut transformer votre quotidien et faire gagner
                  <span className="font-bold text-purple-600"> 20h par semaine</span> à votre institut.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600">✓</span>
                    </div>
                    <span className="text-gray-700">Démo personnalisée selon vos besoins</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600">✓</span>
                    </div>
                    <span className="text-gray-700">Sans engagement, 100% gratuit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600">✓</span>
                    </div>
                    <span className="text-gray-700">En visio ou sur place dans votre institut</span>
                  </li>
                </ul>

                <button
                  onClick={() => setShowDemoModal(true)}
                  className="w-full px-8 py-5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl text-lg font-bold hover:shadow-xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">📅</span>
                  Réserver ma démo gratuite
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <p className="text-sm text-gray-500 text-center mt-4">
                  ⏱️ Créneaux disponibles cette semaine
                </p>
              </div>
            </div>
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
                  {/* Badge 1er mois offert */}
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-sm font-bold shadow-lg animate-pulse">
                      🎁 1er mois offert
                    </div>
                  </div>

                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{plan.price}€</span>
                      <span className="text-gray-600 text-lg">/mois</span>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      30 jours gratuits • Puis {plan.price}€/mois
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                      Engagement 1 an • Prélèvement SEPA
                    </p>
                  </div>

                  {/* ROI Badge - Commercial */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl">
                    <p className="text-center text-green-800 text-xs font-bold mb-1">💰 RETOUR SUR INVESTISSEMENT</p>
                    <p className="text-center text-green-700 text-sm font-extrabold">{plan.roi}</p>
                  </div>

                  <Link
                    href={`/onboarding?plan=${plan.id}&skip=true`}
                    className={`block w-full py-4 px-6 rounded-xl font-bold text-center transition-all transform hover:scale-105 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                        : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200'
                    }`}
                  >
                    🚀 Choisir {plan.name}
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

      {/* Section Réassurance - Trust & Garanties */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold text-sm uppercase tracking-widest">100% SÉCURISÉ</span>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-6">
              Commencez en toute
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                sérénité
              </span>
            </h3>
          </div>

          {/* Badges de confiance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="font-bold text-gray-900 mb-2">SSL Gratuit</h4>
              <p className="text-sm text-gray-600">Vos données sont chiffrées</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🇪🇺</div>
              <h4 className="font-bold text-gray-900 mb-2">RGPD</h4>
              <p className="text-sm text-gray-600">100% conforme</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">💳</div>
              <h4 className="font-bold text-gray-900 mb-2">Paiement Stripe</h4>
              <p className="text-sm text-gray-600">Sécurisé et certifié</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🇫🇷</div>
              <h4 className="font-bold text-gray-900 mb-2">Hébergé en France</h4>
              <p className="text-sm text-gray-600">Données en Europe</p>
            </div>
          </div>

          {/* Garanties */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-l-4 border-green-500 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full p-3 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">30 jours gratuits</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Testez toutes les fonctionnalités sans engagement. Coordonnées bancaires requises, 1er prélèvement après 30 jours.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border-l-4 border-blue-500 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white rounded-full p-3 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Support réactif</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Notre équipe vous répond en moins de 24h par email, chat ou téléphone.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-100 border-l-4 border-purple-500 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-500 text-white rounded-full p-3 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Vos données protégées</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Sauvegardes quotidiennes automatiques. Vous gardez le contrôle de vos données.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Témoignages */}
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl p-8 md:p-12">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Ils nous font confiance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "LAIA Connect a transformé mon institut. Je gagne 20h par semaine et mes clientes adorent pouvoir réserver en ligne 24/7 !"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    SM
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Sophie Martin</p>
                    <p className="text-sm text-gray-600">Institut Belle & Zen, Paris</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "La boutique en ligne m'a permis de doubler mon CA. Les clients commandent même après les horaires d'ouverture !"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                    CL
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Camille Lefèvre</p>
                    <p className="text-sm text-gray-600">Spa Harmonie, Lyon</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Configuration en 10 minutes, site en ligne le jour même. Le support est ultra-réactif. Je recommande à 100% !"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Julien Dubois</p>
                    <p className="text-sm text-gray-600">Barber Shop Premium, Marseille</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logos partenaires */}
            <div className="mt-16 pt-12 border-t border-purple-200">
              <p className="text-center text-gray-600 font-semibold mb-8">Nos partenaires de confiance</p>
              <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
                <div className="text-4xl font-bold text-gray-700">Stripe</div>
                <div className="text-4xl font-bold text-gray-700">Brevo</div>
                <div className="text-4xl font-bold text-gray-700">OVH</div>
                <div className="text-4xl font-bold text-gray-700">Supabase</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Contactez-nous
            </h2>
            <p className="text-xl text-gray-600">
              Une question ? Notre équipe vous répond sous 24h
            </p>
          </div>

          <ContactForm />
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
            href="/onboarding-v2?plan=DUO"
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
                <div className="relative w-20 h-20">
                  <Image
                    src="/logo-laia-connect.png?v=3"
                    alt="LAIA Connect Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="text-gray-900 font-bold text-lg">LAIA Connect</h4>
              </div>
              <p className="text-gray-600 text-sm font-medium">
                Logiciel de gestion pour professionnels
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#pricing" className="text-gray-600 hover:text-purple-600 transition">Tarifs</a></li>
                <li><Link href="/onboarding-v2?plan=DUO" className="text-gray-600 hover:text-purple-600 transition">Essai gratuit</Link></li>
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
                <li><Link href="/cgv-laia-connect" className="text-gray-600 hover:text-purple-600 transition">CGV</Link></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 transition">Mentions légales</a></li>
                <li><a href="#" className="text-gray-600 hover:text-purple-600 transition">RGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-200 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              &copy; 2025 LAIA Connect. Tous droits réservés. Fait avec 💜 en France
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

      {/* Modal de réservation de démo */}
      {showDemoModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setShowDemoModal(false)}
        >
          <div
            className="relative max-w-4xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition z-10"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <DemoBooking />
          </div>
        </div>
      )}
    </div>
  )
}
