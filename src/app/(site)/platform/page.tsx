import Link from 'next/link'

export default function PlatformHomePage() {
  const plans = [
    {
      id: 'SOLO',
      name: 'Solo',
      price: 49,
      description: 'Parfait pour débuter',
      features: [
        '1 emplacement',
        '10 utilisateurs',
        '100 services',
        '50 produits',
        'Réservations illimitées',
        'Support email',
        'Accès mobile'
      ],
      color: 'from-gray-500 to-gray-600',
      popular: false
    },
    {
      id: 'DUO',
      name: 'Duo',
      price: 99,
      description: 'Le plus populaire',
      features: [
        '2 emplacements',
        '25 utilisateurs',
        '250 services',
        '150 produits',
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
        '5 emplacements',
        '100 utilisateurs',
        '500 services',
        '500 produits',
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
        'Services illimités',
        'Produits illimités',
        'Réservations illimitées',
        'Support dédié 24/7',
        'API complète',
        'Développement sur mesure',
        'Manager dédié'
      ],
      color: 'from-indigo-500 to-indigo-600',
      popular: false
    }
  ]

  const features = [
    {
      icon: '📅',
      title: 'Réservations en ligne',
      description: 'Système de réservation complet avec calendrier, disponibilités et confirmations automatiques'
    },
    {
      icon: '👥',
      title: 'Gestion des clients',
      description: 'Fichier client détaillé, historique des rendez-vous, photos avant/après et notes personnalisées'
    },
    {
      icon: '💰',
      title: 'Paiements sécurisés',
      description: 'Encaissement en ligne via Stripe, gestion des acomptes et facturation automatique'
    },
    {
      icon: '📊',
      title: 'Statistiques & Analytics',
      description: 'Tableaux de bord en temps réel, suivi du CA, taux de remplissage et performances'
    },
    {
      icon: '🎁',
      title: 'Programme fidélité',
      description: 'Cartes de fidélité digitales, points de récompense et offres personnalisées'
    },
    {
      icon: '📱',
      title: 'Application mobile',
      description: 'Interface responsive accessible sur tous les appareils, iOS et Android'
    },
    {
      icon: '✉️',
      title: 'Marketing automation',
      description: 'Emails et SMS automatiques, newsletters et campagnes promotionnelles'
    },
    {
      icon: '📸',
      title: 'Galerie & Portfolio',
      description: 'Galerie photos avant/après, portfolio de vos réalisations et témoignages clients'
    },
    {
      icon: '🔒',
      title: 'Sécurité & Confidentialité',
      description: 'Conformité RGPD, sauvegarde automatique et hébergement sécurisé en Europe'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/platform" className="flex items-center gap-2">
              <div className="text-3xl">✨</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  LAIA
                </h1>
                <p className="text-xs text-gray-500">Logiciel pour instituts de beauté</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition">
                Tarifs
              </a>
              <a href="#faq" className="text-gray-600 hover:text-purple-600 transition">
                FAQ
              </a>
              <Link
                href="/super-admin"
                className="text-gray-600 hover:text-purple-600 transition"
              >
                Super Admin
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:shadow-lg transition"
              >
                Essai gratuit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Le logiciel tout-en-un pour
              <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                votre institut de beauté
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Gérez vos réservations, vos clients, vos paiements et développez votre activité avec une solution professionnelle conçue pour les instituts de beauté.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
              >
                🎁 Essai gratuit 14 jours
              </Link>
              <a
                href="#pricing"
                className="px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-semibold border-2 border-purple-600 hover:bg-purple-50 transition"
              >
                Voir les tarifs
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Aucune carte bancaire requise • Installation en 5 minutes • Support francophone
            </p>
          </div>

          {/* Screenshot/Demo */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🖥️</div>
                  <p className="text-gray-600 font-medium">Capture d'écran du dashboard</p>
                  <p className="text-sm text-gray-500">Interface intuitive et moderne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour gérer et développer votre institut de beauté
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 bg-gradient-to-br from-white to-purple-50 rounded-xl border border-gray-200 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Des tarifs transparents
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos besoins. Changez à tout moment.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <span className="text-2xl">🎁</span>
              <span className="font-semibold">14 jours d'essai gratuit sur tous les plans</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-purple-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                    ⭐ POPULAIRE
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${plan.color}`}></div>

                <div className="p-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}€</span>
                    <span className="text-gray-600">/mois</span>
                  </div>

                  <Link
                    href="/register"
                    className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Commencer l'essai
                  </Link>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600">
                        <span className="text-green-500 mr-2 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 mt-12">
            Tous les plans incluent : SSL gratuit, sauvegardes quotidiennes, mises à jour automatiques et support francophone
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h3>
            <p className="text-xl text-gray-600">
              Rejoignez des centaines d'instituts de beauté qui utilisent déjà Laia Skin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Un logiciel vraiment complet et facile à utiliser. Mes clientes adorent la prise de rendez-vous en ligne !"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👩</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Marie D.</div>
                    <div className="text-sm text-gray-600">Institut de beauté, Paris</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "L'essai gratuit est-il vraiment sans engagement ?",
                a: "Oui ! Vous bénéficiez de 14 jours d'essai gratuit sans carte bancaire requise. Vous pouvez annuler à tout moment."
              },
              {
                q: "Puis-je changer de plan en cours de route ?",
                a: "Absolument ! Vous pouvez upgrader ou downgrader votre plan à tout moment. Le prorata sera calculé automatiquement."
              },
              {
                q: "Mes données sont-elles sécurisées ?",
                a: "Oui, toutes vos données sont hébergées en Europe, chiffrées et sauvegardées quotidiennement. Nous sommes conformes RGPD."
              },
              {
                q: "Y a-t-il des frais cachés ?",
                a: "Non, le prix affiché est le prix final. Aucun frais de setup, aucun coût caché. Support inclus."
              },
              {
                q: "Puis-je avoir plusieurs emplacements/instituts ?",
                a: "Oui, selon votre plan vous pouvez gérer plusieurs emplacements avec un seul compte."
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-lg shadow-sm overflow-hidden">
                <summary className="cursor-pointer p-6 font-semibold text-gray-900 hover:bg-purple-50 transition">
                  {faq.q}
                </summary>
                <p className="px-6 pb-6 text-gray-600">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-4">
            Prêt à transformer votre institut ?
          </h3>
          <p className="text-xl mb-8 text-purple-100">
            Rejoignez des centaines d'instituts de beauté et commencez votre essai gratuit dès aujourd'hui
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full text-lg font-semibold hover:shadow-2xl transition transform hover:scale-105"
          >
            🎁 Commencer mon essai gratuit
          </Link>
          <p className="text-sm text-purple-200 mt-4">
            14 jours gratuits • Sans carte bancaire • Annulation à tout moment
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Laia Skin</h4>
              <p className="text-sm">
                Le logiciel tout-en-un pour les instituts de beauté
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white">Tarifs</a></li>
                <li><Link href="/register" className="hover:text-white">Essai gratuit</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><a href="mailto:support@laiaskin.com" className="hover:text-white">Contact</a></li>
                <li><Link href="/super-admin" className="hover:text-white">Super Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">CGV</a></li>
                <li><a href="#" className="hover:text-white">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white">RGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Laia Skin. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
