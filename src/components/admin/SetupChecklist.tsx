'use client'

import { useState, useEffect } from 'react'
import SetupTask, { Task } from './SetupTask'

type OrgPlan = 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM'

interface SetupChecklistProps {
  organizationId: string
  plan: OrgPlan
  // Features activées selon le plan
  features: {
    featureCRM: boolean
    featureEmailing: boolean
    featureBlog: boolean
    featureShop: boolean
    featureWhatsApp: boolean
    featureSocialMedia: boolean
    featureSMS: boolean
  }
  // Stats pour calculer la progression
  stats: {
    hasTemplate: boolean
    hasCustomColors: boolean
    hasLogo: boolean
    hasServices: boolean
    hasMultipleServices: boolean
    hasBusinessHours: boolean
    hasTeamMembers: boolean
    hasBookings: boolean
    hasPhotos: boolean
    hasDescription: boolean
    hasSocialMedia: boolean
    hasPackages: boolean
    hasStripeConfigured: boolean
    hasLoyaltyProgram: boolean
    hasEmailConfigured: boolean
    hasCRMConfigured: boolean
    hasBlogPost: boolean
    hasShopProducts: boolean
    hasWhatsAppConfigured: boolean
    hasSocialMediaConfigured: boolean
    hasMultipleLocations: boolean
    hasNotificationsConfigured: boolean
    hasSMSCredits: boolean
  }
}

export default function SetupChecklist({ organizationId, plan, features, stats }: SetupChecklistProps) {
  const [showChecklist, setShowChecklist] = useState(true)
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1)

  // ⚡ PHASE 1 : LANCEMENT EXPRESS (Toutes formules)
  const phase1Tasks: Task[] = [
    {
      id: 'template',
      title: 'Choisir votre template de site',
      description: 'Sélectionnez un design professionnel pour votre site web',
      completed: stats.hasTemplate,
      time: '2 min',
      link: '/admin?tab=config&section=template',
      priority: 1,
      category: 'setup',
      phase: 1
    },
    {
      id: 'colors',
      title: 'Personnaliser vos couleurs',
      description: 'Ajoutez votre identité visuelle avec vos couleurs',
      completed: stats.hasCustomColors,
      time: '1 min',
      link: '/admin?tab=config&section=appearance',
      priority: 1,
      category: 'setup',
      phase: 1
    },
    {
      id: 'logo',
      title: 'Ajouter votre logo',
      description: 'Uploadez le logo de votre institut pour le branding',
      completed: stats.hasLogo,
      time: '1 min',
      link: '/admin?tab=config&section=general',
      priority: 1,
      category: 'setup',
      phase: 1
    },
    {
      id: 'service',
      title: 'Créer votre premier service',
      description: 'Ajoutez une prestation que vous proposez à vos clients',
      completed: stats.hasServices,
      time: '2 min',
      link: '/admin?tab=services',
      priority: 1,
      category: 'content',
      phase: 1
    },
    {
      id: 'hours',
      title: 'Définir vos horaires d\'ouverture',
      description: 'Configurez vos jours et heures d\'ouverture',
      completed: stats.hasBusinessHours,
      time: '2 min',
      link: '/admin?tab=config&section=hours',
      priority: 1,
      category: 'setup',
      phase: 1
    }
  ]

  // 🎨 PHASE 2 : PERSONNALISATION (Selon formule)
  const phase2Tasks: Task[] = [
    {
      id: 'photos',
      title: 'Ajouter des photos de votre institut',
      description: 'Uploadez des photos de qualité pour votre galerie',
      completed: stats.hasPhotos,
      time: '5 min',
      link: '/admin?tab=config&section=content',
      priority: 1,
      category: 'content',
      phase: 2
    },
    {
      id: 'description',
      title: 'Rédiger votre description',
      description: 'Présentez votre institut et vos valeurs',
      completed: stats.hasDescription,
      time: '5 min',
      link: '/admin?tab=config&section=about',
      priority: 1,
      category: 'content',
      phase: 2
    },
    {
      id: 'social',
      title: 'Ajouter vos réseaux sociaux',
      description: 'Liez vos profils Instagram, Facebook, etc.',
      completed: stats.hasSocialMedia,
      time: '2 min',
      link: '/admin?tab=config&section=social',
      priority: 1,
      category: 'setup',
      phase: 2
    },
    {
      id: 'services',
      title: 'Ajouter d\'autres services (min 3)',
      description: 'Complétez votre catalogue de prestations',
      completed: stats.hasMultipleServices,
      time: '10 min',
      link: '/admin?tab=services',
      priority: 1,
      category: 'content',
      phase: 2
    },
    {
      id: 'packages',
      title: 'Créer des packages/formules',
      description: 'Proposez des offres combinées attractives',
      completed: stats.hasPackages,
      time: '5 min',
      link: '/admin?tab=services',
      priority: 2,
      category: 'content',
      phase: 2
    },
    {
      id: 'payment',
      title: 'Configurer les paiements',
      description: 'Activez Stripe pour recevoir des paiements en ligne',
      completed: stats.hasStripeConfigured,
      time: '5 min',
      link: '/admin?tab=config&section=finances',
      priority: 1,
      category: 'setup',
      phase: 2
    },
    {
      id: 'loyalty',
      title: 'Activer le programme de fidélité',
      description: 'Récompensez vos clients fidèles avec des points',
      completed: stats.hasLoyaltyProgram,
      time: '3 min',
      link: '/admin?tab=fidelite',
      priority: 2,
      category: 'advanced',
      phase: 2
    }
  ]

  // 🚀 PHASE 3 : FONCTIONNALITÉS AVANCÉES (Selon plan)
  const phase3BaseTasks: Task[] = [
    {
      id: 'test-booking',
      title: 'Faire une réservation test',
      description: 'Testez votre système de réservation comme un client',
      completed: stats.hasBookings,
      time: '3 min',
      link: '/admin?tab=planning',
      priority: 1,
      category: 'advanced',
      phase: 3
    }
  ]

  // Tâches DUO+
  const phase3DuoTasks: Task[] = [
    {
      id: 'team',
      title: 'Inviter votre équipe',
      description: 'Ajoutez vos employés à la plateforme',
      completed: stats.hasTeamMembers,
      time: '2 min',
      link: '/admin/users',
      priority: 2,
      category: 'team',
      phase: 3,
      requiredPlan: 'DUO'
    },
    {
      id: 'crm',
      title: 'Configurer le CRM',
      description: 'Gérez vos clients et leur historique',
      completed: stats.hasCRMConfigured,
      time: '5 min',
      link: '/admin?tab=crm',
      priority: 2,
      category: 'advanced',
      phase: 3,
      requiredPlan: 'DUO',
      requiredFeature: 'featureCRM'
    },
    {
      id: 'email',
      title: 'Configurer l\'emailing',
      description: 'Envoyez des campagnes email à vos clients',
      completed: stats.hasEmailConfigured,
      time: '5 min',
      link: '/admin?tab=emailing',
      priority: 2,
      category: 'advanced',
      phase: 3,
      requiredPlan: 'DUO',
      requiredFeature: 'featureEmailing'
    },
    {
      id: 'blog',
      title: 'Créer votre premier article de blog',
      description: 'Partagez vos conseils beauté et actualités',
      completed: stats.hasBlogPost,
      time: '15 min',
      link: '/admin?tab=blog',
      priority: 3,
      category: 'advanced',
      phase: 3,
      requiredPlan: 'DUO',
      requiredFeature: 'featureBlog'
    }
  ]

  // Tâches TEAM+
  const phase3TeamTasks: Task[] = [
    {
      id: 'shop',
      title: 'Ouvrir votre boutique en ligne',
      description: 'Ajoutez vos produits et commencez à vendre',
      completed: stats.hasShopProducts,
      time: '20 min',
      link: '/admin?tab=stock',
      priority: 2,
      category: 'advanced',
      phase: 3,
      requiredPlan: 'TEAM',
      requiredFeature: 'featureShop'
    },
    {
      id: 'whatsapp',
      title: 'Configurer WhatsApp Business',
      description: 'Communiquez avec vos clients par WhatsApp',
      completed: stats.hasWhatsAppConfigured,
      time: '10 min',
      link: '/admin/whatsapp',
      priority: 2,
      category: 'advanced',
      phase: 3,
      requiredPlan: 'TEAM',
      requiredFeature: 'featureWhatsApp'
    },
    {
      id: 'sms',
      title: 'Configurer les campagnes SMS',
      description: 'Envoyez des SMS marketing à vos clients',
      completed: stats.hasSMSCredits,
      time: '5 min',
      link: '/admin?tab=sms',
      priority: 2,
      category: 'advanced',
      phase: 3,
      requiredPlan: 'TEAM',
      requiredFeature: 'featureSMS'
    },
    {
      id: 'social-media',
      title: 'Activer la publication automatique',
      description: 'Programmez vos posts Instagram, Facebook, TikTok',
      completed: stats.hasSocialMediaConfigured,
      time: '10 min',
      link: '/admin/social-media',
      priority: 3,
      category: 'advanced',
      phase: 3,
      requiredPlan: 'TEAM',
      requiredFeature: 'featureSocialMedia'
    },
    {
      id: 'locations',
      title: 'Gérer vos points de vente',
      description: 'Ajoutez vos différents emplacements',
      completed: stats.hasMultipleLocations,
      time: '5 min',
      link: '/admin/locations',
      priority: 3,
      category: 'advanced',
      phase: 3,
      requiredPlan: 'TEAM'
    },
    {
      id: 'notifications',
      title: 'Activer les notifications push',
      description: 'Envoyez des notifications web à vos clients',
      completed: stats.hasNotificationsConfigured,
      time: '5 min',
      link: '/admin?tab=notifications',
      priority: 3,
      category: 'advanced',
      phase: 3,
      requiredPlan: 'TEAM'
    }
  ]

  // Filtrer les tâches selon le plan
  const filterTasksByPlan = (tasks: Task[]): Task[] => {
    return tasks.filter(task => {
      // Pas de restriction de plan
      if (!task.requiredPlan) return true

      // Vérifier si le plan actuel est suffisant
      const planHierarchy: OrgPlan[] = ['SOLO', 'DUO', 'TEAM', 'PREMIUM']
      const currentPlanIndex = planHierarchy.indexOf(plan)
      const requiredPlanIndex = planHierarchy.indexOf(task.requiredPlan)

      if (currentPlanIndex < requiredPlanIndex) return false

      // Vérifier si la feature est activée
      if (task.requiredFeature) {
        return features[task.requiredFeature as keyof typeof features] === true
      }

      return true
    })
  }

  // Combiner toutes les tâches filtrées par phase
  const phase3Tasks = [
    ...phase3BaseTasks,
    ...filterTasksByPlan(phase3DuoTasks),
    ...filterTasksByPlan(phase3TeamTasks)
  ]

  const allPhases = [
    { number: 1, name: 'Lancement Express', tasks: phase1Tasks, emoji: '⚡' },
    { number: 2, name: 'Personnalisation', tasks: phase2Tasks, emoji: '🎨' },
    { number: 3, name: 'Fonctionnalités Avancées', tasks: phase3Tasks, emoji: '🚀' }
  ]

  // Calculer la progression de la phase actuelle
  const currentPhaseTasks = allPhases[currentPhase - 1].tasks
  const completedTasksInPhase = currentPhaseTasks.filter(t => t.completed).length
  const totalTasksInPhase = currentPhaseTasks.length
  const phaseProgress = totalTasksInPhase > 0 ? Math.round((completedTasksInPhase / totalTasksInPhase) * 100) : 0

  // Progression globale
  const setupTasks = [...phase1Tasks, ...phase2Tasks, ...phase3Tasks]

  const completedTasks = setupTasks.filter(t => t.completed).length
  const totalTasks = setupTasks.length
  const progress = Math.round((completedTasks / totalTasks) * 100)

  // Auto-avancer de phase quand une phase est complétée
  useEffect(() => {
    if (phaseProgress === 100 && currentPhase < 3) {
      const timer = setTimeout(() => {
        setCurrentPhase((currentPhase + 1) as 1 | 2 | 3)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [phaseProgress, currentPhase])

  // Masquer automatiquement si 100% ou si l'utilisateur a cliqué "Masquer"
  useEffect(() => {
    const hidden = localStorage.getItem(`setup_checklist_hidden_${organizationId}`)
    if (hidden === 'true' || progress === 100) {
      setShowChecklist(false)
    }
  }, [organizationId, progress])

  const handleHide = () => {
    localStorage.setItem(`setup_checklist_hidden_${organizationId}`, 'true')
    setShowChecklist(false)
  }

  if (!showChecklist) {
    return null
  }

  // Afficher un bouton pour réafficher la checklist si masquée
  if (progress < 100 && !showChecklist) {
    return (
      <button
        onClick={() => setShowChecklist(true)}
        className="mb-8 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-sm font-medium"
      >
        📋 Afficher la checklist de configuration ({progress}% complété)
      </button>
    )
  }

  // Badge de formule
  const getPlanBadge = () => {
    const badges = {
      SOLO: { label: 'SOLO', color: 'bg-gray-100 text-gray-700' },
      DUO: { label: 'DUO', color: 'bg-blue-100 text-blue-700' },
      TEAM: { label: 'TEAM', color: 'bg-purple-100 text-purple-700' },
      PREMIUM: { label: 'PREMIUM', color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' }
    }
    const badge = badges[plan]
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              🚀 Configurez votre institut
            </h2>
            {getPlanBadge()}
          </div>
          <p className="text-gray-600">
            Configuration personnalisée pour votre formule {plan}
          </p>
        </div>
        <button
          onClick={handleHide}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Masquer la checklist"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Sélecteur de phases */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {allPhases.map((phase) => {
          const phaseCompletedTasks = phase.tasks.filter(t => t.completed).length
          const phaseTotalTasks = phase.tasks.length
          const isCompleted = phaseCompletedTasks === phaseTotalTasks
          const isCurrent = currentPhase === phase.number

          return (
            <button
              key={phase.number}
              onClick={() => setCurrentPhase(phase.number as 1 | 2 | 3)}
              className={`flex-1 min-w-[160px] px-4 py-3 rounded-lg border-2 transition-all ${
                isCurrent
                  ? 'border-purple-500 bg-purple-50'
                  : isCompleted
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-semibold mb-1 flex items-center justify-center gap-2">
                <span>{phase.emoji}</span>
                <span className={isCurrent ? 'text-purple-700' : isCompleted ? 'text-green-700' : 'text-gray-700'}>
                  Phase {phase.number}
                </span>
                {isCompleted && <span className="text-green-500">✓</span>}
              </div>
              <div className={`text-xs ${isCurrent ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                {phase.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {phaseCompletedTasks}/{phaseTotalTasks}
              </div>
            </button>
          )
        })}
      </div>

      {/* Progress bar de la phase actuelle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Phase {currentPhase}: {completedTasksInPhase} sur {totalTasksInPhase} complété{completedTasksInPhase > 1 ? 's' : ''}
          </span>
          <span className="text-sm font-bold text-purple-600">{phaseProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${phaseProgress}%` }}
          />
        </div>
        {/* Progression globale */}
        <div className="mt-2 text-xs text-gray-500 text-right">
          Progression totale: {completedTasks}/{totalTasks} ({progress}%)
        </div>
      </div>

      {/* Motivation message */}
      {phaseProgress > 0 && phaseProgress < 100 && (
        <div className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800">
            {phaseProgress < 30 && '🎯 Excellent début ! Continuez sur votre lancée.'}
            {phaseProgress >= 30 && phaseProgress < 60 && '💪 Vous êtes sur la bonne voie ! Plus que quelques étapes.'}
            {phaseProgress >= 60 && phaseProgress < 90 && '🔥 Presque terminé ! Vous y êtes presque.'}
            {phaseProgress >= 90 && '🏆 Dernière ligne droite ! La phase suivante va se débloquer.'}
          </p>
        </div>
      )}

      {/* Phase complétée */}
      {phaseProgress === 100 && currentPhase < 3 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-semibold text-green-900">Phase {currentPhase} terminée !</p>
              <p className="text-sm text-green-700">Passage automatique à la phase suivante...</p>
            </div>
          </div>
        </div>
      )}

      {/* Tasks list de la phase actuelle */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          {allPhases[currentPhase - 1].emoji}
          {allPhases[currentPhase - 1].name}
        </h3>
        {currentPhaseTasks.map((task) => (
          <SetupTask key={task.id} task={task} />
        ))}
      </div>

      {/* Rewards teaser (si proche de 100%) */}
      {progress >= 75 && progress < 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Débloquez vos récompenses !
              </p>
              <p className="text-sm text-gray-700">
                Complétez toutes les tâches pour recevoir :
              </p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>✨ Badge "Institut configuré"</li>
                <li>🎁 +50 crédits SMS offerts</li>
                <li>🏆 Accès anticipé aux nouvelles fonctionnalités</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Celebration when 100% */}
      {progress === 100 && (
        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Félicitations !
          </h3>
          <p className="text-gray-700 mb-4">
            Vous avez complété la configuration de votre institut !
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`/${organizationId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              🌐 Voir mon site
            </a>
            <button
              onClick={handleHide}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Masquer cette checklist
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {progress < 100 && (
        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleHide}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Masquer cette checklist
          </button>
          <p className="text-xs text-gray-500">
            Vous pourrez la réafficher plus tard
          </p>
        </div>
      )}
    </div>
  )
}
