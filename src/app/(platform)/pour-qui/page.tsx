"use client"

import Link from 'next/link'
import { useState } from 'react'

export default function PourQuiPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = [
    {
      id: 'instituts',
      icon: '🌸',
      title: 'Instituts de beauté',
      color: 'from-pink-500 to-rose-500',
      borderColor: 'border-pink-300',
      bgColor: 'bg-pink-50',
      besoins: [
        { besoin: 'Gérer les réservations 24/7', solution: '📅 Agenda en ligne avec réservation automatique jour et nuit' },
        { besoin: 'Suivre l\'évolution des clientes', solution: '📸 Photos avant/après avec galerie sécurisée par cliente' },
        { besoin: 'Éviter les allergies et erreurs', solution: '⚠️ Fiches clients détaillées (allergies, contre-indications, notes)' },
        { besoin: 'Vendre des produits cosmétiques', solution: '🛒 Boutique intégrée avec gestion des stocks automatique' },
        { besoin: 'Fidéliser la clientèle', solution: '🎁 Programme de points, récompenses et cartes cadeaux' },
        { besoin: 'Encaisser rapidement', solution: '💳 Paiement en ligne et sur place avec facturation auto' },
        { besoin: 'Suivre mon chiffre d\'affaires', solution: '📊 Statistiques en temps réel et prévisions' },
        { besoin: 'Réduire les no-show', solution: '📱 Rappels automatiques SMS, Email & WhatsApp' }
      ]
    },
    {
      id: 'coiffure',
      icon: '💇',
      title: 'Salons de coiffure',
      color: 'from-purple-500 to-violet-500',
      borderColor: 'border-purple-300',
      bgColor: 'bg-purple-50',
      besoins: [
        { besoin: 'Optimiser le planning de mes coiffeurs', solution: '📅 Planning multi-praticiens avec gestion des créneaux' },
        { besoin: 'Me souvenir des colorations de chaque client', solution: '🎨 Historique complet des colorations et formules' },
        { besoin: 'Vendre mes produits capillaires', solution: '🛒 Boutique en ligne + gestion des stocks' },
        { besoin: 'Proposer des abonnements', solution: '🎁 Cartes cadeaux, forfaits et abonnements illimités' },
        { besoin: 'Encaisser rapidement entre deux clients', solution: '💳 Paiement ultra-rapide en ligne et TPE' },
        { besoin: 'Éviter les rendez-vous oubliés', solution: '📱 Rappels automatiques SMS, Email, WhatsApp' },
        { besoin: 'Savoir quel coiffeur performe le mieux', solution: '📊 Stats par praticien et service en temps réel' },
        { besoin: 'Obtenir plus d\'avis Google', solution: '⭐ Demande d\'avis automatique après chaque RDV' }
      ]
    },
    {
      id: 'spas',
      icon: '💆',
      title: 'Spas & Centres de bien-être',
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
      besoins: [
        { besoin: 'Réserver plusieurs soins d\'affilée', solution: '📅 Réservation de parcours et packages complets' },
        { besoin: 'Gérer mes cabines et espaces', solution: '🎯 Attribution automatique des cabines disponibles' },
        { besoin: 'Mémoriser les préférences de mes clients', solution: '👥 Fiches détaillées (allergies, huiles préférées, température)' },
        { besoin: 'Vendre des forfaits bien-être', solution: '📦 Création de packages personnalisés illimités' },
        { besoin: 'Fidéliser avec un programme VIP', solution: '🎁 Fidélité multi-niveaux avec récompenses exclusives' },
        { besoin: 'Relancer mes clients inactifs', solution: '📱 Campagnes email & WhatsApp automatiques ciblées' },
        { besoin: 'Vendre mes produits spa', solution: '🛒 Boutique en ligne avec stock synchronisé' },
        { besoin: 'Piloter mon activité', solution: '📊 Dashboard avec CA, taux de remplissage, KPIs' }
      ]
    },
    {
      id: 'barbiers',
      icon: '✂️',
      title: 'Barbiers & Salons homme',
      color: 'from-slate-600 to-gray-700',
      borderColor: 'border-slate-300',
      bgColor: 'bg-slate-50',
      besoins: [
        { besoin: 'Remplir mon planning rapidement', solution: '📅 Réservation en ligne ultra-simple et rapide' },
        { besoin: 'Enchaîner les clients sans perdre de temps', solution: '⚡ Créneaux courts (15-45min) avec rotation optimisée' },
        { besoin: 'Retrouver le style habituel du client', solution: '👥 Historique des coupes avec photos de référence' },
        { besoin: 'Vendre mes produits barbe', solution: '🛒 Boutique intégrée avec produits barbe et cheveux' },
        { besoin: 'Proposer des abonnements mensuels', solution: '🎁 Système d\'abonnements et cartes prépayées' },
        { besoin: 'Encaisser en 2 secondes', solution: '💳 Paiement express en ligne et TPE sans contact' },
        { besoin: 'Limiter les absences', solution: '📱 Rappels SMS & WhatsApp avant chaque RDV' },
        { besoin: 'Suivre mes perfs', solution: '📊 Statistiques par barbier et chiffre d\'affaires' }
      ]
    },
    {
      id: 'massage',
      icon: '🧘',
      title: 'Centres de massage',
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-300',
      bgColor: 'bg-green-50',
      besoins: [
        { besoin: 'Adapter les durées de séance', solution: '📅 Planning flexible avec durées variables (30min à 3h)' },
        { besoin: 'Noter les zones de tension', solution: '📝 Fiche de séance avec schéma corporel et notes' },
        { besoin: 'Éviter les contre-indications', solution: '⚠️ Dossier santé client avec alertes automatiques' },
        { besoin: 'Proposer des cures et abonnements', solution: '📦 Packages personnalisés et abonnements récurrents' },
        { besoin: 'Fidéliser sur le long terme', solution: '🎁 Programme de fidélité avec parrainage et récompenses' },
        { besoin: 'Relancer les anciens clients', solution: '📱 Campagnes automatiques email & WhatsApp ciblées' },
        { besoin: 'Encaisser facilement', solution: '💳 Paiement sécurisé en ligne et sur place' },
        { besoin: 'Analyser mon activité', solution: '📊 Statistiques détaillées (CA, taux retour, services)' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
      {/* Header Navigation - Same as homepage */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/platform" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-xl shadow-lg">
                <span className="text-xl">🌸</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  LAIA Connect
                </h1>
                <p className="text-xs text-purple-600 font-medium">Logiciel de gestion</p>
              </div>
            </Link>
            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-5 flex-nowrap">
              <Link href="/pour-qui" className="text-purple-600 font-semibold transition-colors text-base whitespace-nowrap">
                Pour qui ?
              </Link>
              <a href="/platform#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-base whitespace-nowrap">
                Fonctionnalités
              </a>
              <a href="/platform#pricing" className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-base whitespace-nowrap">
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
              <Link
                href="/onboarding"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all whitespace-nowrap"
              >
                Essayer gratuitement 30 jours
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
            LAIA Connect est fait
            <span className="block mt-2 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
              pour vous
            </span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-12">
            Chaque secteur de la beauté et du bien-être a ses spécificités.
            Découvrez comment LAIA Connect s'adapte parfaitement à votre métier.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`relative group bg-white border-2 ${category.borderColor} rounded-3xl overflow-hidden transition-all hover:shadow-2xl hover:scale-105 cursor-pointer ${
                  activeCategory === category.id ? 'ring-4 ring-purple-300' : ''
                }`}
                onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${category.color} p-8 text-center`}>
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">
                    Besoin → Solution
                  </h4>

                  <div className="space-y-3">
                    {category.besoins.map((item, idx) => (
                      <div key={idx} className={`${category.bgColor} p-4 rounded-xl border-l-4 ${category.borderColor}`}>
                        <div className="text-sm font-semibold text-gray-800 mb-2">
                          ❓ {item.besoin}
                        </div>
                        <div className="text-sm text-gray-700">
                          ✅ {item.solution}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Link
                      href="/register"
                      className={`inline-block px-6 py-3 bg-gradient-to-r ${category.color} text-white rounded-lg font-semibold hover:shadow-lg transition`}
                    >
                      Essayer gratuitement
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-purple-500">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
            Votre métier mérite un logiciel qui vous comprend
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Testez LAIA Connect gratuitement pendant 30 jours et découvrez comment nous facilitons votre quotidien
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-10 py-4 bg-white text-purple-600 rounded-lg text-lg font-bold hover:shadow-2xl transition"
            >
              Démarrer mon essai gratuit
            </Link>
            <Link
              href="/connexion"
              className="px-10 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-lg text-lg font-bold hover:bg-white/30 transition"
            >
              J'ai déjà un compte
            </Link>
          </div>
          <p className="text-sm text-white/80 mt-6">
            ✅ 30 jours gratuits • 💳 Sans engagement • ❌ Annulation à tout moment
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-200 bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <span className="text-xl">🌸</span>
            </div>
            <h4 className="text-gray-900 font-bold text-lg">LAIA Connect</h4>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Logiciel de gestion pour professionnels de la beauté et du bien-être
          </p>
          <p className="text-gray-600 text-sm">
            © 2025 LAIA Connect. Tous droits réservés. Fait avec 💜 en France
          </p>
        </div>
      </footer>
    </div>
  )
}
