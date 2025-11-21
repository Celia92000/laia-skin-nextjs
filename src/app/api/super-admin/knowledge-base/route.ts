import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export type ArticleCategory =
  | 'GETTING_STARTED'
  | 'RESERVATIONS'
  | 'PAYMENTS'
  | 'SETTINGS'
  | 'INTEGRATIONS'
  | 'TROUBLESHOOTING'
  | 'BILLING'
  | 'API'
  | 'SECURITY'
  | 'BEST_PRACTICES'

export interface KnowledgeBaseArticle {
  id: string
  title: string
  slug: string
  category: ArticleCategory
  summary: string
  content: string
  tags: string[]
  published: boolean
  featured: boolean
  viewCount: number
  helpfulCount: number
  notHelpfulCount: number
  relatedArticles?: string[]
  createdBy?: {
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /api/super-admin/knowledge-base
 * Liste tous les articles de la base de connaissance
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

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const published = searchParams.get('published')

    // Base de connaissance prédéfinie (dans une vraie app, ce serait en BDD)
    let articles: KnowledgeBaseArticle[] = [
      {
        id: '1',
        title: 'Comment créer ma première organisation ?',
        slug: 'creer-premiere-organisation',
        category: 'GETTING_STARTED',
        summary: 'Guide complet pour créer votre première organisation sur LAIA en 5 minutes.',
        content: `
# Comment créer ma première organisation ?

Bienvenue sur LAIA ! Voici comment créer votre première organisation en 5 étapes simples.

## Étape 1 : Inscription
1. Rendez-vous sur [laia.fr](https://laia.fr)
2. Cliquez sur "Créer mon compte"
3. Remplissez vos informations

## Étape 2 : Choix du plan
Choisissez le plan adapté à votre institut :
- **SOLO** (49€/mois) : Parfait pour démarrer
- **DUO** (89€/mois) : Pour les petites équipes
- **TEAM** (149€/mois) : Multi-emplacements
- **PREMIUM** (249€/mois) : Illimité

## Étape 3 : Configuration
Configurez votre organisation :
- Nom de l'institut
- Logo et couleurs
- Horaires d'ouverture
- Adresse

## Étape 4 : Ajoutez vos services
Créez votre catalogue de soins.

## Étape 5 : Invitez votre équipe
Invitez vos collaborateurs depuis les paramètres.

🎉 Félicitations ! Votre organisation est prête.
        `,
        tags: ['démarrage', 'organisation', 'inscription'],
        published: true,
        featured: true,
        viewCount: 1245,
        helpfulCount: 98,
        notHelpfulCount: 2,
        relatedArticles: ['2', '3'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'Configurer les paiements Stripe',
        slug: 'configurer-stripe',
        category: 'PAYMENTS',
        summary: 'Activez les paiements en ligne avec Stripe Connect en quelques clics.',
        content: `
# Configurer les paiements Stripe

LAIA utilise Stripe Connect pour gérer vos paiements en toute sécurité.

## Prérequis
- Avoir un compte Stripe (ou en créer un gratuitement)
- Avoir accès à vos informations bancaires

## Configuration
1. Allez dans **Admin → Paramètres → Paiements**
2. Cliquez sur "Connecter Stripe"
3. Autorisez LAIA à accéder à votre compte Stripe
4. Configurez vos tarifs

## Frais
LAIA prélève une commission de 2% sur chaque transaction pour couvrir les frais de la plateforme.

## Test
Effectuez un paiement test pour vérifier que tout fonctionne.

⚠️ **Important** : Activez l'authentification 3D Secure pour la conformité européenne.
        `,
        tags: ['paiement', 'stripe', 'configuration'],
        published: true,
        featured: true,
        viewCount: 856,
        helpfulCount: 72,
        notHelpfulCount: 8,
        relatedArticles: ['7'],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: '3',
        title: 'Gérer les réservations',
        slug: 'gerer-reservations',
        category: 'RESERVATIONS',
        summary: 'Tout savoir sur la gestion des réservations : création, modification, annulation.',
        content: `
# Gérer les réservations

Le planning est au cœur de LAIA. Voici comment l'utiliser efficacement.

## Créer une réservation
1. Cliquez sur un créneau vide du planning
2. Sélectionnez le client (ou créez-en un nouveau)
3. Choisissez le(s) service(s)
4. Validez

## Modifier une réservation
- Glissez-déposez pour changer l'horaire
- Cliquez pour modifier les détails

## Annuler une réservation
1. Cliquez sur la réservation
2. Cliquez sur "Annuler"
3. Choisissez le motif
4. Décidez du remboursement éventuel

## Statuts
- **PENDING** : En attente de confirmation
- **CONFIRMED** : Confirmée
- **COMPLETED** : Terminée
- **CANCELLED** : Annulée
- **NO_SHOW** : Client absent

## Notifications
Les clients reçoivent automatiquement :
- Confirmation par email
- Rappel 24h avant (optionnel)
- Rappel 2h avant par WhatsApp (si activé)
        `,
        tags: ['réservation', 'planning', 'gestion'],
        published: true,
        featured: false,
        viewCount: 1124,
        helpfulCount: 89,
        notHelpfulCount: 5,
        relatedArticles: ['4', '5'],
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-02-05')
      },
      {
        id: '4',
        title: 'Intégrer WhatsApp Business',
        slug: 'integrer-whatsapp',
        category: 'INTEGRATIONS',
        summary: 'Connectez votre compte WhatsApp Business pour envoyer des rappels automatiques.',
        content: `
# Intégrer WhatsApp Business

Envoyez des rappels de RDV automatiques via WhatsApp.

## Prérequis
- Un compte WhatsApp Business
- Un numéro de téléphone dédié
- Un compte Meta Business

## Configuration
1. **Admin → Intégrations → WhatsApp**
2. Cliquez sur "Connecter WhatsApp"
3. Autorisez LAIA à accéder à votre compte Meta Business
4. Sélectionnez votre numéro WhatsApp

## Modèles de messages
Créez vos templates de messages dans Meta Business Manager.

### Exemple de template de rappel :
\`\`\`
Bonjour {{1}} 👋

Rappel : Vous avez rendez-vous demain à {{2}} pour {{3}}.

📍 {{4}}

À bientôt !
\`\`\`

## Envoi automatique
Les rappels sont envoyés automatiquement 24h avant le RDV.

## Tarifs
WhatsApp facture environ 0,05€ par message (selon le pays).
        `,
        tags: ['whatsapp', 'intégration', 'notifications'],
        published: true,
        featured: false,
        viewCount: 634,
        helpfulCount: 54,
        notHelpfulCount: 12,
        relatedArticles: ['3'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15')
      },
      {
        id: '5',
        title: 'Programme de fidélité : Guide complet',
        slug: 'programme-fidelite',
        category: 'BEST_PRACTICES',
        summary: 'Configurez et optimisez votre programme de fidélité pour fidéliser vos clients.',
        content: `
# Programme de fidélité : Guide complet

Le programme de fidélité LAIA vous permet de récompenser vos clients fidèles.

## Configuration
**Admin → Fidélité**

### Paliers VIP
- **Nouveau** : 0-499 points
- **Fidèle** : 500-1499 points
- **Premium** : 1500-2999 points
- **VIP** : 3000+ points

### Avantages par palier
Configurez les avantages pour chaque palier :
- Réductions exclusives
- Priorité sur les RDV
- Cadeaux d'anniversaire
- Accès anticipé aux nouveautés

## Règles de points
- 1€ dépensé = 1 point (par défaut)
- Points d'anniversaire : 100 points offerts
- Parrainage : 50 points pour le parrain, 50 pour le filleul

## Gamification
Activez les badges et défis pour engager vos clients.

## Statistiques
Suivez l'impact de votre programme :
- Taux de rétention
- Panier moyen par palier
- Taux de parrainage

💡 **Astuce** : Envoyez des emails automatiques quand un client change de palier.
        `,
        tags: ['fidélité', 'marketing', 'rétention'],
        published: true,
        featured: true,
        viewCount: 892,
        helpfulCount: 76,
        notHelpfulCount: 3,
        relatedArticles: ['6'],
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-20')
      },
      {
        id: '6',
        title: 'Résoudre les problèmes de paiement',
        slug: 'problemes-paiement',
        category: 'TROUBLESHOOTING',
        summary: 'Solutions aux problèmes courants de paiement et de facturation.',
        content: `
# Résoudre les problèmes de paiement

Voici les solutions aux problèmes les plus fréquents.

## Paiement refusé
**Causes possibles :**
- Carte expirée
- Fonds insuffisants
- Blocage anti-fraude de la banque
- 3D Secure non activé

**Solutions :**
1. Vérifier la validité de la carte
2. Contacter la banque du client
3. Utiliser une autre carte
4. Activer 3D Secure dans les paramètres Stripe

## Remboursement
**Comment rembourser un client :**
1. **Admin → Comptabilité**
2. Recherchez le paiement
3. Cliquez sur "Rembourser"
4. Choisissez : remboursement total ou partiel
5. Validez

⚠️ Le remboursement prend 5-10 jours ouvrés.

## Facturation
**Je ne reçois pas mes factures Stripe :**
1. Vérifiez vos spams
2. **Paramètres → Paiements → Email de facturation**
3. Mettez à jour votre adresse email

## Commission LAIA
La commission de 2% est prélevée automatiquement sur chaque transaction.

## Support
En cas de problème persistant :
- 📧 support@laia.fr
- 💬 Chat en direct (en bas à droite)
        `,
        tags: ['paiement', 'problème', 'support'],
        published: true,
        featured: false,
        viewCount: 567,
        helpfulCount: 48,
        notHelpfulCount: 15,
        relatedArticles: ['2', '7'],
        createdAt: new Date('2024-02-12'),
        updatedAt: new Date('2024-02-25')
      },
      {
        id: '7',
        title: 'API LAIA : Documentation développeur',
        slug: 'api-documentation',
        category: 'API',
        summary: 'Documentation technique de l\'API LAIA pour les intégrations avancées.',
        content: `
# API LAIA : Documentation développeur

Accédez aux données de votre organisation via notre API REST.

## Authentification
Générez votre clé API dans **Paramètres → Développeurs**

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.laia.fr/v1/reservations
\`\`\`

## Endpoints principaux

### Réservations
- \`GET /v1/reservations\` : Liste des réservations
- \`POST /v1/reservations\` : Créer une réservation
- \`PATCH /v1/reservations/:id\` : Modifier
- \`DELETE /v1/reservations/:id\` : Annuler

### Clients
- \`GET /v1/clients\` : Liste des clients
- \`POST /v1/clients\` : Créer un client

### Services
- \`GET /v1/services\` : Catalogue de services

## Webhooks
Recevez des événements en temps réel :
- \`reservation.created\`
- \`reservation.completed\`
- \`payment.succeeded\`
- \`client.created\`

## Rate limiting
- 100 requêtes / minute
- 10 000 requêtes / jour

## Support
Documentation complète : [docs.laia.fr/api](https://docs.laia.fr/api)
        `,
        tags: ['api', 'développeur', 'intégration'],
        published: true,
        featured: false,
        viewCount: 234,
        helpfulCount: 21,
        notHelpfulCount: 4,
        relatedArticles: ['4'],
        createdAt: new Date('2024-02-18'),
        updatedAt: new Date('2024-02-18')
      },
      {
        id: '8',
        title: 'Sécurité et conformité RGPD',
        slug: 'securite-rgpd',
        category: 'SECURITY',
        summary: 'Comment LAIA protège vos données et respecte le RGPD.',
        content: `
# Sécurité et conformité RGPD

LAIA prend la sécurité de vos données très au sérieux.

## Chiffrement
- **En transit** : TLS 1.3
- **Au repos** : AES-256
- **Mots de passe** : Bcrypt avec salt

## Hébergement
Données hébergées chez **Supabase** (infrastructure AWS Europe) :
- Certifié ISO 27001
- Conforme RGPD
- Sauvegardes quotidiennes
- Haute disponibilité 99.9%

## Droits RGPD
Vos clients peuvent :
- **Accéder** à leurs données
- **Rectifier** leurs informations
- **Supprimer** leur compte
- **Exporter** leurs données

Ces actions sont disponibles dans l'espace client.

## Sous-traitants
Liste des sous-traitants LAIA :
- Stripe (paiements)
- Resend (emails)
- Meta (WhatsApp)
- Cloudinary (images)

Tous conformes RGPD avec DPA signés.

## Audits
- Tests de pénétration trimestriels
- Monitoring 24/7 avec Sentry
- Logs d'accès conservés 90 jours

## Support DPO
Questions RGPD : dpo@laia.fr
        `,
        tags: ['sécurité', 'rgpd', 'conformité'],
        published: true,
        featured: true,
        viewCount: 445,
        helpfulCount: 39,
        notHelpfulCount: 1,
        createdAt: new Date('2024-02-22'),
        updatedAt: new Date('2024-02-22')
      }
    ]

    // Filtrer par catégorie
    if (category) {
      articles = articles.filter(a => a.category === category)
    }

    // Filtrer par recherche
    if (search) {
      const searchLower = search.toLowerCase()
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(searchLower) ||
        a.summary.toLowerCase().includes(searchLower) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Filtrer par statut de publication
    if (published === 'true') {
      articles = articles.filter(a => a.published)
    } else if (published === 'false') {
      articles = articles.filter(a => !a.published)
    }

    // Statistiques
    const stats = {
      total: articles.length,
      published: articles.filter(a => a.published).length,
      featured: articles.filter(a => a.featured).length,
      totalViews: articles.reduce((sum, a) => sum + a.viewCount, 0),
      totalHelpful: articles.reduce((sum, a) => sum + a.helpfulCount, 0),
      byCategory: Object.keys({
        GETTING_STARTED: 0,
        RESERVATIONS: 0,
        PAYMENTS: 0,
        SETTINGS: 0,
        INTEGRATIONS: 0,
        TROUBLESHOOTING: 0,
        BILLING: 0,
        API: 0,
        SECURITY: 0,
        BEST_PRACTICES: 0
      }).map(cat => ({
        category: cat,
        count: articles.filter(a => a.category === cat).length
      }))
    }

    return NextResponse.json({
      articles,
      stats
    })

  } catch (error) {
    log.error('Error fetching knowledge base:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la base de connaissance' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/super-admin/knowledge-base
 * Crée un nouvel article
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
    if (!body.title || !body.category || !body.content) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Générer le slug
    const slug = body.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const newArticle: KnowledgeBaseArticle = {
      id: Date.now().toString(),
      title: body.title,
      slug,
      category: body.category,
      summary: body.summary || '',
      content: body.content,
      tags: body.tags || [],
      published: body.published !== undefined ? body.published : false,
      featured: body.featured || false,
      viewCount: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      relatedArticles: body.relatedArticles || [],
      createdBy: {
        name: user.name || 'Admin',
        email: user.email
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      article: newArticle
    }, { status: 201 })

  } catch (error) {
    log.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    )
  }
}
