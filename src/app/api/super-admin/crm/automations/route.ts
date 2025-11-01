import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type AutomationTrigger =
  | 'ORGANIZATION_CREATED'
  | 'TRIAL_STARTED'
  | 'TRIAL_ENDING_SOON'
  | 'TRIAL_EXPIRED'
  | 'SUBSCRIPTION_UPGRADED'
  | 'SUBSCRIPTION_DOWNGRADED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'NO_ACTIVITY_7_DAYS'
  | 'NO_ACTIVITY_30_DAYS'
  | 'NO_ACTIVITY_90_DAYS'
  | 'FIRST_RESERVATION'
  | 'PAYMENT_FAILED'
  | 'HIGH_CHURN_RISK'
  | 'LOW_RFM_SCORE'
  | 'BECAME_CHAMPION'

export interface EmailAutomation {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  enabled: boolean
  emailSubject: string
  emailTemplate: string
  delayMinutes?: number
  conditions?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /api/super-admin/crm/automations
 * Liste toutes les automatisations email CRM
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Pour l'instant, on retourne des automations prédéfinies
    // Dans une vraie implémentation, on les stockerait en base
    const automations: EmailAutomation[] = [
      {
        id: '1',
        name: 'Bienvenue nouvelle organisation',
        description: 'Email envoyé automatiquement quand une nouvelle organisation s\'inscrit',
        trigger: 'ORGANIZATION_CREATED',
        enabled: true,
        emailSubject: 'Bienvenue sur LAIA ! 🎉',
        emailTemplate: `
          <h1>Bienvenue {{organizationName}} !</h1>
          <p>Nous sommes ravis de vous compter parmi nos clients.</p>
          <p>Voici quelques ressources pour bien démarrer :</p>
          <ul>
            <li>Guide de démarrage rapide</li>
            <li>Tutoriels vidéo</li>
            <li>Contact du support</li>
          </ul>
        `,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Fin d\'essai approchante',
        description: 'Rappel 3 jours avant la fin de la période d\'essai',
        trigger: 'TRIAL_ENDING_SOON',
        enabled: true,
        emailSubject: 'Votre essai LAIA se termine dans 3 jours',
        emailTemplate: `
          <h1>Votre période d'essai se termine bientôt</h1>
          <p>Bonjour {{contactName}},</p>
          <p>Votre essai gratuit de LAIA se termine dans 3 jours.</p>
          <p>Pour continuer à profiter de tous nos services, choisissez un abonnement :</p>
          <a href="{{billingUrl}}">Choisir mon abonnement</a>
        `,
        delayMinutes: 0,
        conditions: { daysBeforeExpiration: 3 },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Essai expiré',
        description: 'Email envoyé le jour de l\'expiration de l\'essai',
        trigger: 'TRIAL_EXPIRED',
        enabled: true,
        emailSubject: 'Votre essai LAIA a expiré - Continuez l\'aventure',
        emailTemplate: `
          <h1>Votre essai est terminé</h1>
          <p>Bonjour {{contactName}},</p>
          <p>Votre période d'essai gratuite vient de se terminer.</p>
          <p>Nous espérons que vous avez apprécié LAIA ! Pour continuer :</p>
          <a href="{{billingUrl}}">Souscrire maintenant</a>
          <p><strong>Offre spéciale : -20% sur votre premier mois</strong></p>
        `,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Inactivité 7 jours',
        description: 'Relance après 7 jours sans activité',
        trigger: 'NO_ACTIVITY_7_DAYS',
        enabled: true,
        emailSubject: 'On ne vous oublie pas ! 💜',
        emailTemplate: `
          <h1>Ça fait longtemps...</h1>
          <p>Bonjour {{contactName}},</p>
          <p>Nous avons remarqué que vous n'avez pas utilisé LAIA depuis 7 jours.</p>
          <p>Besoin d'aide ? Notre équipe est là pour vous :</p>
          <a href="{{supportUrl}}">Contacter le support</a>
        `,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Inactivité 30 jours',
        description: 'Relance après 30 jours sans activité',
        trigger: 'NO_ACTIVITY_30_DAYS',
        enabled: true,
        emailSubject: 'Vous nous manquez 😢',
        emailTemplate: `
          <h1>Vous nous manquez !</h1>
          <p>Bonjour {{contactName}},</p>
          <p>Cela fait 30 jours que nous ne vous avons pas vu sur LAIA.</p>
          <p>Avez-vous rencontré un problème ? Parlons-en :</p>
          <a href="{{calendlyUrl}}">Réserver un appel gratuit</a>
        `,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Risque de churn élevé',
        description: 'Email quand le scoring détecte un risque de churn élevé',
        trigger: 'HIGH_CHURN_RISK',
        enabled: true,
        emailSubject: 'Comment pouvons-nous vous aider ?',
        emailTemplate: `
          <h1>Comment va votre expérience LAIA ?</h1>
          <p>Bonjour {{contactName}},</p>
          <p>Nous avons remarqué une baisse d'activité récente.</p>
          <p>Notre objectif est votre réussite. Discutons ensemble :</p>
          <a href="{{calendlyUrl}}">Réserver un appel avec notre équipe</a>
          <p>PS: Nous avons des nouvelles fonctionnalités qui pourraient vous intéresser !</p>
        `,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '7',
        name: 'Score RFM faible',
        description: 'Relance automatique quand le score RFM tombe en dessous de 40',
        trigger: 'LOW_RFM_SCORE',
        enabled: true,
        emailSubject: 'Offre spéciale pour vous 🎁',
        emailTemplate: `
          <h1>Une offre rien que pour vous</h1>
          <p>Bonjour {{contactName}},</p>
          <p>Pour vous remercier de votre fidélité, nous vous offrons :</p>
          <ul>
            <li>1 mois gratuit d'abonnement</li>
            <li>Formation personnalisée offerte</li>
            <li>Support prioritaire pendant 3 mois</li>
          </ul>
          <a href="{{offerUrl}}">Profiter de l'offre</a>
        `,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '8',
        name: 'Félicitations Champion !',
        description: 'Email de félicitations quand une organisation devient "Champion" (RFM élevé)',
        trigger: 'BECAME_CHAMPION',
        enabled: true,
        emailSubject: 'Vous êtes un client Champion ! 🏆',
        emailTemplate: `
          <h1>Félicitations ! 🎉</h1>
          <p>Bonjour {{contactName}},</p>
          <p>Vous faites partie de nos clients Champions !</p>
          <p>Votre engagement et votre fidélité sont exceptionnels.</p>
          <p>En remerciement, vous bénéficiez maintenant de :</p>
          <ul>
            <li>Support prioritaire VIP</li>
            <li>Accès anticipé aux nouvelles fonctionnalités</li>
            <li>Invitation aux événements exclusifs</li>
            <li>Remise de 15% sur vos futurs upgrades</li>
          </ul>
          <p>Merci pour votre confiance ! 💜</p>
        `,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '9',
        name: 'Upgrade d\'abonnement',
        description: 'Email de félicitations lors d\'un upgrade',
        trigger: 'SUBSCRIPTION_UPGRADED',
        enabled: true,
        emailSubject: 'Merci pour votre upgrade ! 🚀',
        emailTemplate: `
          <h1>Bienvenue dans votre nouveau plan !</h1>
          <p>Bonjour {{contactName}},</p>
          <p>Félicitations pour votre upgrade vers le plan {{newPlan}} !</p>
          <p>Vous débloquez maintenant :</p>
          <ul>
            {{#features}}
            <li>{{.}}</li>
            {{/features}}
          </ul>
          <a href="{{dashboardUrl}}">Découvrir mes nouvelles fonctionnalités</a>
        `,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '10',
        name: 'Paiement échoué',
        description: 'Relance automatique en cas d\'échec de paiement',
        trigger: 'PAYMENT_FAILED',
        enabled: true,
        emailSubject: '❌ Problème de paiement - Action requise',
        emailTemplate: `
          <h1>Problème de paiement détecté</h1>
          <p>Bonjour {{contactName}},</p>
          <p>Le paiement de votre abonnement LAIA a échoué.</p>
          <p>Pour éviter toute interruption de service, merci de mettre à jour vos informations de paiement :</p>
          <a href="{{billingUrl}}">Mettre à jour mon moyen de paiement</a>
          <p>Si vous avez des questions, contactez-nous.</p>
        `,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Statistiques
    const stats = {
      total: automations.length,
      enabled: automations.filter(a => a.enabled).length,
      disabled: automations.filter(a => !a.enabled).length
    }

    return NextResponse.json({
      automations,
      stats
    })

  } catch (error) {
    console.error('Error fetching automations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des automatisations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/super-admin/crm/automations
 * Crée une nouvelle automatisation email
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()

    // Validation
    if (!body.name || !body.trigger || !body.emailSubject || !body.emailTemplate) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Dans une vraie implémentation, on sauvegarderait en base
    const newAutomation: EmailAutomation = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description || '',
      trigger: body.trigger,
      enabled: body.enabled !== undefined ? body.enabled : true,
      emailSubject: body.emailSubject,
      emailTemplate: body.emailTemplate,
      delayMinutes: body.delayMinutes,
      conditions: body.conditions,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      automation: newAutomation
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating automation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'automatisation' },
      { status: 500 }
    )
  }
}
