# 💳 Flux de Paiement - Institut Multi-Tenant

## 📋 Vue d'ensemble

Quand un institut prend votre logiciel, voici le parcours complet du paiement :

---

## 1️⃣ **Inscription Initiale**

### Actions automatiques :
```javascript
1. Institut remplit le formulaire d'inscription
2. Système crée :
   - Organization (statut: TRIAL)
   - Location par défaut
   - User propriétaire (role: ORG_OWNER)
   - trialEndsAt: Date actuelle + 14 jours
   - plan: SOLO (par défaut)
```

### Email automatique :
- ✉️ Template: `WELCOME`
- Variables: `{{org_name}}`, `{{owner_name}}`, `{{trial_end_date}}`, `{{login_url}}`

---

## 2️⃣ **Période d'Essai (14 jours)**

### Accès complet :
- Toutes les fonctionnalités du plan SOLO
- Limites : 1 emplacement, 10 users, 100 services, etc.
- **Aucun paiement requis**

### Rappels automatiques (via Cron Jobs) :

**J-7 :**
```javascript
// Script: /scripts/check-trials.ts
// Exécution: Tous les jours à 9h00

Chercher toutes les organisations où :
- status = TRIAL
- trialEndsAt entre maintenant et dans 7 jours

Pour chacune :
1. Créer notification (type: TRIAL_ENDING_7D)
2. Envoyer email (template: TRIAL_ENDING_7D)
3. Variables: {{days_left}}, {{upgrade_url}}
```

**J-3 :**
```javascript
// Même logique avec TRIAL_ENDING_3D
```

**J-0 (Expiration) :**
```javascript
// Si pas de paiement effectué :
1. Changer status: TRIAL → CANCELLED
2. Bloquer l'accès (sauf lecture)
3. Email: TRIAL_EXPIRED
4. Notification super admin: TRIAL_EXPIRED
```

---

## 3️⃣ **Choix du Plan & Paiement**

### Page de sélection du plan :
**Route à créer** : `/[slug]/admin/subscription`

```typescript
Plans disponibles :
┌─────────────────────────────────────────────────────────┐
│ SOLO: 49€/mois   - 1 emplacement, 10 users       │
│ DUO       - 99€/mois   - 2 emplacements, 25 users      │
│ TEAM      - 199€/mois  - 5 emplacements, 100 users     │
│ PREMIUM   - 399€/mois  - Illimité                      │
└─────────────────────────────────────────────────────────┘
```

### Bouton "Souscrire" :

```typescript
async function handleSubscribe(plan: 'SOLO' | 'DUO' | 'TEAM' | 'PREMIUM') {
  // 1. Créer Stripe Checkout Session
  const response = await fetch('/api/[slug]/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ plan })
  })

  const { url } = await response.json()

  // 2. Rediriger vers Stripe
  window.location.href = url
}
```

---

## 4️⃣ **Intégration Stripe**

### Configuration Stripe :

```bash
# .env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Prix Stripe (à créer sur dashboard Stripe)
PRICE_SOLO: 49€/mois
PRICE_DUO=price_xxx          # 99€/mois
PRICE_TEAM=price_xxx         # 199€/mois
PRICE_PREMIUM=price_xxx      # 399€/mois
```

### API Route : Créer Checkout Session

**Fichier** : `/src/app/api/[slug]/create-checkout-session/route.ts`

```typescript
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: Request) {
  const { plan } = await request.json()
  const { slug } = params

  // Récupérer l'organisation
  const org = await prisma.organization.findUnique({
    where: { slug }
  })

  // Prix selon le plan
  const prices = {
    SOLO: process.env.PRICE_SOLO,
    DUO: process.env.PRICE_DUO,
    TEAM: process.env.PRICE_TEAM,
    PREMIUM: process.env.PRICE_PREMIUM
  }

  // Créer Stripe Customer (si pas déjà fait)
  let customerId = org.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: org.ownerEmail,
      metadata: {
        organizationId: org.id,
        organizationName: org.name
      }
    })

    customerId = customer.id

    // Sauvegarder dans DB
    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeCustomerId: customerId }
    })
  }

  // Créer Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: prices[plan],
        quantity: 1
      }
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/${slug}/admin/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/${slug}/admin/subscription?canceled=true`,
    metadata: {
      organizationId: org.id,
      plan
    }
  })

  return NextResponse.json({ url: session.url })
}
```

---

## 5️⃣ **Webhooks Stripe**

### Endpoint Webhook :

**Fichier** : `/src/app/api/webhooks/stripe/route.ts`

```typescript
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Gérer les événements
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object)
      break

    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object)
      break

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object)
      break
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { organizationId, plan } = session.metadata!

  // Mettre à jour l'organisation
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      status: 'ACTIVE',
      plan: plan as any,
      stripeSubscriptionId: session.subscription as string,
      // Mettre à jour les limites selon le plan
      maxLocations: plan === 'SOLO' ? 1 : plan === 'DUO' ? 2 : plan === 'TEAM' ? 5 : 999,
      maxUsers: plan === 'SOLO' ? 10 : plan === 'DUO' ? 25 : plan === 'TEAM' ? 100 : 999,
      maxServices: plan === 'SOLO' ? 100 : plan === 'DUO' ? 250 : plan === 'TEAM' ? 500 : 999
    }
  })

  // Créer notification
  await prisma.superAdminNotification.create({
    data: {
      type: 'NEW_ORGANIZATION',
      title: 'Nouvelle souscription',
      message: `L'organisation ${org.name} a souscrit au plan ${plan}`,
      organizationId,
      actionUrl: `/super-admin/organizations/${organizationId}`
    }
  })

  // Envoyer email de confirmation
  // TODO: Utiliser template PAYMENT_SUCCESS
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Récupérer l'organisation
  const org = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!org) return

  // Créer facture dans la DB
  await prisma.invoice.create({
    data: {
      organizationId: org.id,
      amount: invoice.amount_paid / 100, // Stripe utilise centimes
      currency: invoice.currency,
      status: 'PAID',
      stripeInvoiceId: invoice.id,
      paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
      dueDate: new Date(invoice.due_date! * 1000),
      description: `Abonnement ${org.plan} - ${new Date().toLocaleDateString('fr-FR')}`
    }
  })

  // Envoyer email de confirmation
  // TODO: Template PAYMENT_SUCCESS avec {{amount}}, {{invoice_number}}
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const org = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!org) return

  // Créer notification
  await prisma.superAdminNotification.create({
    data: {
      type: 'PAYMENT_FAILED',
      title: 'Paiement échoué',
      message: `Le paiement de ${org.name} a échoué`,
      organizationId: org.id,
      actionUrl: `/super-admin/organizations/${org.id}`
    }
  })

  // Envoyer email à l'institut
  // TODO: Template PAYMENT_FAILED

  // Si 3 échecs consécutifs, suspendre
  const failedPayments = await prisma.invoice.count({
    where: {
      organizationId: org.id,
      status: 'FAILED',
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  })

  if (failedPayments >= 3) {
    await prisma.organization.update({
      where: { id: org.id },
      data: { status: 'SUSPENDED' }
    })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const org = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!org) return

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      status: 'CANCELLED',
      stripeSubscriptionId: null
    }
  })

  // Notification
  await prisma.superAdminNotification.create({
    data: {
      type: 'CANCELLED_SUBSCRIPTION',
      title: 'Abonnement annulé',
      message: `${org.name} a annulé son abonnement`,
      organizationId: org.id,
      actionUrl: `/super-admin/organizations/${org.id}`
    }
  })
}
```

---

## 6️⃣ **Gestion des Abonnements**

### Page de gestion pour l'institut :

**Route** : `/[slug]/admin/subscription`

**Fonctionnalités** :
- Voir plan actuel
- Voir prochaine date de paiement
- Historique des factures
- Changer de plan (upgrade/downgrade)
- Annuler l'abonnement
- Mettre à jour moyen de paiement

```typescript
// Exemple : Changer de plan
async function changePlan(newPlan: string) {
  const response = await fetch('/api/[slug]/change-subscription', {
    method: 'POST',
    body: JSON.stringify({ newPlan })
  })

  // Stripe gérera le prorata automatiquement
}

// Annuler abonnement
async function cancelSubscription() {
  if (!confirm('Êtes-vous sûr ? Vous perdrez l\'accès à la fin de la période.')) return

  const response = await fetch('/api/[slug]/cancel-subscription', {
    method: 'POST'
  })
}
```

---

## 7️⃣ **Accès & Restrictions**

### Middleware de vérification :

```typescript
// Vérifier avant chaque requête
export async function checkSubscriptionStatus(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId }
  })

  // Si CANCELLED ou SUSPENDED
  if (org.status !== 'ACTIVE' && org.status !== 'TRIAL') {
    return {
      allowed: false,
      reason: 'Abonnement inactif',
      redirectTo: '/[slug]/admin/subscription'
    }
  }

  // Si TRIAL expiré
  if (org.status === 'TRIAL' && org.trialEndsAt < new Date()) {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { status: 'CANCELLED' }
    })

    return {
      allowed: false,
      reason: 'Période d\'essai expirée',
      redirectTo: '/[slug]/admin/subscription'
    }
  }

  return { allowed: true }
}
```

---

## 8️⃣ **Configuration Stripe Dashboard**

### Étapes :

1. **Créer les produits** :
   - Produit : "Laia Skin - SOLO"
   - Prix : 49€/mois récurrent
   - Répéter pour DUO, TEAM, PREMIUM

2. **Configurer Webhooks** :
   - URL : `https://votredomaine.com/api/webhooks/stripe`
   - Événements à écouter :
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

3. **Récupérer les clés** :
   - Clé secrète : `sk_live_xxx`
   - Clé publique : `pk_live_xxx`
   - Webhook secret : `whsec_xxx`

---

## 9️⃣ **Facturation Super Admin**

Le super admin peut :
- Voir toutes les factures dans `/super-admin/billing`
- Créer factures manuelles
- Marquer comme payée
- Prolonger essais
- Voir revenus (MRR/ARR)

---

## 🔟 **Schéma Prisma à Ajouter**

```prisma
model Organization {
  // ... champs existants ...

  stripeCustomerId      String?  @unique
  stripeSubscriptionId  String?  @unique
  currentPeriodEnd      DateTime?

  invoices              Invoice[]
}
```

---

## 📊 **Résumé du Flux**

```
Institut s'inscrit
    ↓
14 jours TRIAL gratuit
    ↓
Rappels J-7, J-3
    ↓
Choix du plan → Paiement Stripe
    ↓
Webhook → Status ACTIVE
    ↓
Facturation mensuelle automatique
    ↓
Si échec → Suspendre après 3 tentatives
```

---

## 📝 **Fichiers à Créer**

```
/src/app/api/[slug]/
  ├── create-checkout-session/route.ts
  ├── change-subscription/route.ts
  ├── cancel-subscription/route.ts
  └── customer-portal/route.ts

/src/app/api/webhooks/
  └── stripe/route.ts

/src/app/(site)/[slug]/admin/
  └── subscription/page.tsx

/scripts/
  ├── check-trials.ts
  ├── send-trial-reminders.ts
  └── sync-stripe-subscriptions.ts

/lib/
  ├── stripe.ts
  └── subscription-checker.ts
```

---

## 💰 **Tarifs Suggérés**

| Plan     | Prix/mois | Emplacements | Users | Services | Produits |
|----------|-----------|--------------|-------|----------|----------|
| SOLO: 49€       | 1            | 10    | 100      | 50       |
| DUO      | 99€       | 2            | 25    | 250      | 150      |
| TEAM     | 199€      | 5            | 100   | 500      | 500      |
| PREMIUM  | 399€      | Illimité     | 999   | 999      | 999      |

---

## 🚀 **Prochaines Étapes**

1. ✅ **Créer compte Stripe** et configurer produits
2. ✅ **Implémenter page subscription** pour les instituts
3. ✅ **Créer API routes** (checkout, webhooks)
4. ✅ **Ajouter champs Stripe** au modèle Organization
5. ✅ **Créer scripts cron** pour vérifier trials
6. ✅ **Tester en mode test** Stripe
7. ✅ **Passer en production**

---

**Date de création** : 2025-01-19
