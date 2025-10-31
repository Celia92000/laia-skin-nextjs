# 🔗 Guide Stripe Connect - LAIA Platform

## 📋 Vue d'ensemble

Stripe Connect permet à chaque institut client d'accepter des paiements en ligne de ses clientes, directement sur son propre compte Stripe.

**Avantages :**
- ✅ L'argent va **directement** sur le compte de l'institut
- ✅ LAIA Platform prélève une **commission de 2%** sur chaque transaction
- ✅ L'institut gère ses propres remboursements et litiges
- ✅ Conformité PCI-DSS automatique
- ✅ Onboarding en 2 clics pour l'institut

---

## 🔧 Configuration initiale

### 1. Activer Stripe Connect dans votre dashboard Stripe

1. Va sur https://dashboard.stripe.com/connect/accounts/overview
2. Active **Connect** si ce n'est pas déjà fait
3. Configure le type de compte : **Standard** (recommandé)

### 2. Exécuter la migration SQL

Dans Supabase SQL Editor, exécute :

\`\`\`sql
-- add-stripe-connect.sql
ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "stripeConnectedAccountId" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Organization_stripeConnectedAccountId_idx" ON "Organization"("stripeConnectedAccountId");
\`\`\`

### 3. Configurer les webhooks Stripe Connect

Dans Stripe Dashboard → Webhooks, ajoute ces événements :

**Événements à écouter :**
- ✅ `account.updated` - Mise à jour du compte Connect de l'institut
- ✅ `checkout.session.completed` - Paiement réussi
- ✅ `payment_intent.succeeded` - Confirmation paiement
- ✅ `payment_intent.payment_failed` - Paiement échoué

**URL du webhook :**
\`https://ton-domaine.vercel.app/api/webhooks/stripe\`

---

## 💼 Comment ça marche pour l'institut ?

### Étape 1 : Connexion du compte Stripe

L'institut va dans **Admin → Paramètres → Paiements** et clique sur **"Connecter Stripe"**

```typescript
// API: /api/admin/stripe-connect/onboard
POST /api/admin/stripe-connect/onboard
```

→ Crée un compte Stripe Connect Standard
→ Génère un lien d'onboarding Stripe
→ Redirige l'institut vers Stripe pour compléter son inscription

### Étape 2 : Onboarding Stripe

Stripe demande à l'institut :
- Informations légales (SIRET, adresse)
- Coordonnées bancaires (IBAN)
- Vérification d'identité

### Étape 3 : Activation

Une fois validé par Stripe :
- `stripeOnboardingComplete` → `true`
- `stripeChargesEnabled` → `true`
- `stripePayoutsEnabled` → `true`

→ L'institut peut accepter des paiements ! 🎉

---

## 💳 Types de paiements gérés

### 1. Réservations de prestations

```typescript
// API: /api/reservations/[id]/pay
import { createConnectedCheckoutSession } from '@/lib/stripe-connect-helper'

const session = await createConnectedCheckoutSession({
  organizationId: 'org_123',
  amount: 75.00, // 75€
  description: 'Soin visage anti-âge',
  metadata: {
    reservationId: 'res_456',
    serviceId: 'svc_789'
  },
  successUrl: '/reservations/confirmation',
  cancelUrl: '/reservations/cancel',
  customerEmail: 'cliente@example.com'
})

// Commission LAIA = 75€ × 2% = 1.50€
// Institut reçoit = 73.50€
```

### 2. Cartes cadeaux

```typescript
const session = await createConnectedCheckoutSession({
  organizationId: 'org_123',
  amount: 100.00,
  description: 'Carte cadeau 100€',
  metadata: {
    giftCardId: 'gift_123'
  },
  successUrl: '/carte-cadeau/confirmation',
  cancelUrl: '/carte-cadeau'
})
```

### 3. Vente de produits

```typescript
const session = await createConnectedCheckoutSession({
  organizationId: 'org_123',
  amount: 45.00,
  description: 'Crème hydratante bio',
  metadata: {
    productId: 'prod_456',
    quantity: '2'
  },
  successUrl: '/boutique/confirmation',
  cancelUrl: '/boutique/panier'
})
```

---

## 💰 Commission LAIA Platform

**Taux actuel : 2%** (défini dans `stripe-connect-helper.ts`)

```typescript
const PLATFORM_COMMISSION_RATE = 0.02 // 2%
```

**Exemples :**
- Prestation 75€ → Commission 1.50€ → Institut reçoit 73.50€
- Carte cadeau 100€ → Commission 2.00€ → Institut reçoit 98.00€
- Produit 45€ → Commission 0.90€ → Institut reçoit 44.10€

**Pour modifier le taux :**
Édite `src/lib/stripe-connect-helper.ts` ligne 13

---

## 🔄 Webhooks et automatisation

### Webhook `account.updated`

Déclenché quand l'institut complète son onboarding ou modifie son compte.

**Action :** Met à jour automatiquement les champs dans la BDD :
- `stripeOnboardingComplete`
- `stripeChargesEnabled`
- `stripePayoutsEnabled`

### Webhook `checkout.session.completed`

Déclenché quand un paiement est réussi.

**Actions automatiques :**
- ✅ Marque la réservation comme `paid: true`
- ✅ Active la carte cadeau `status: 'ACTIVE'`
- ✅ Log dans `ActivityLog`
- ✅ Envoie confirmation email (si configuré)

---

## 📊 Dashboard Stripe de l'institut

L'institut peut accéder à son dashboard Stripe pour :
- Voir ses transactions
- Gérer les remboursements
- Exporter ses données comptables
- Configurer ses préférences de virement

**API :** `/api/admin/stripe-connect/dashboard`

```typescript
POST /api/admin/stripe-connect/dashboard
// Génère un lien de connexion temporaire au dashboard Stripe Express
```

---

## 🧪 Tests en développement

### 1. Utiliser les comptes de test Stripe

Stripe fournit des comptes de test pour Connect :
https://stripe.com/docs/connect/testing

### 2. Cartes de test

- **Succès :** `4242 4242 4242 4242`
- **Échec :** `4000 0000 0000 0002`
- **3D Secure :** `4000 0027 6000 3184`

**Date :** N'importe quelle date future
**CVC :** N'importe quel 3 chiffres

### 3. Simuler l'onboarding

En mode test, l'onboarding Stripe est simplifié - pas besoin de vraies infos légales.

---

## 🚨 Sécurité et conformité

### ✅ Ce que LAIA Platform NE voit PAS :
- Numéros de carte bancaire
- Coordonnées bancaires de l'institut
- Détails des transactions individuelles

### ✅ Ce que LAIA Platform PEUT faire :
- Voir le montant total des transactions
- Récupérer la commission
- Voir le statut des comptes Connect
- Générer des statistiques agrégées

### ✅ Conformité PCI-DSS :
Stripe gère 100% de la conformité PCI. Ni LAIA, ni l'institut n'ont besoin de certification.

---

## 📞 Support

**Pour LAIA Platform :**
- Documentation : https://docs.stripe.com/connect
- Support Stripe : https://support.stripe.com

**Pour les instituts :**
- Aide en ligne dans leur dashboard Stripe
- Support technique via LAIA Platform

---

## ✅ Checklist de déploiement

- [ ] Exécuter migration SQL `add-stripe-connect.sql`
- [ ] Activer Stripe Connect dans dashboard Stripe
- [ ] Configurer webhooks Connect
- [ ] Tester onboarding en mode test
- [ ] Tester un paiement de bout en bout
- [ ] Vérifier réception de la commission
- [ ] Documenter le processus pour les instituts
- [ ] Former l'équipe support

---

**Prêt pour la production ! 🚀**
