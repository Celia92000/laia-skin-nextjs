# 🔐 Configuration Stripe pour LAIA

## 📋 Prérequis

1. Créer un compte Stripe sur https://stripe.com
2. Activer les prélèvements SEPA dans les paramètres

## 🔑 Récupérer les clés API

### 1. Clés de test (développement)

Aller sur : https://dashboard.stripe.com/test/apikeys

- `STRIPE_SECRET_KEY` : `sk_test_...`
- `STRIPE_PUBLISHABLE_KEY` : `pk_test_...`

### 2. Clés de production

⚠️ **À faire avant la mise en production !**

Aller sur : https://dashboard.stripe.com/apikeys

- `STRIPE_SECRET_KEY` : `sk_live_...`
- `STRIPE_PUBLISHABLE_KEY` : `pk_live_...`

## 🔔 Configuration du Webhook

### 1. Créer le webhook

Aller sur : https://dashboard.stripe.com/webhooks

- Cliquer sur "Ajouter un endpoint"
- URL : `https://votre-domaine.com/api/webhooks/stripe`
- Description : "LAIA - Webhooks de paiement"

### 2. Événements à écouter

Sélectionner les événements suivants :

- ✅ `payment_intent.succeeded` - Paiement réussi
- ✅ `payment_intent.payment_failed` - Paiement échoué
- ✅ `customer.subscription.updated` - Abonnement mis à jour
- ✅ `customer.subscription.deleted` - Abonnement annulé

### 3. Récupérer le secret du webhook

Après création, copier le secret du webhook :

- `STRIPE_WEBHOOK_SECRET` : `whsec_...`

## ⚙️ Variables d'environnement

Ajouter dans `.env.local` :

```env
# Stripe (Paiements SEPA et abonnements)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## 🚀 Déploiement

### 1. Vercel

Le cronjob est déjà configuré dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/process-payments",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Cela exécutera automatiquement les prélèvements tous les jours à 2h du matin.

### 2. Variables d'environnement Vercel

Ajouter les variables suivantes dans Vercel :

```bash
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

## 📝 Mode de fonctionnement

### 1. Création d'une organisation

Quand une nouvelle organisation est créée avec un IBAN :

```typescript
import { createStripeCustomer } from '@/lib/stripe-service'

await createStripeCustomer({
  organizationId: org.id,
  email: org.ownerEmail,
  name: org.name,
  iban: org.sepaIban,
  bic: org.sepaBic,
})
```

Cela crée automatiquement :
- Un client Stripe
- Un mandat SEPA
- Un lien vers l'organisation dans la base de données

### 2. Prélèvements automatiques

Chaque jour à 2h du matin, le cronjob `/api/cron/process-payments` :

1. Récupère toutes les organisations dont `nextBillingDate` est aujourd'hui ou passée
2. Effectue un prélèvement SEPA via Stripe
3. Met à jour le statut :
   - ✅ `ACTIVE` si succès
   - ❌ `SUSPENDED` si échec
4. Calcule la prochaine date de facturation (+1 mois)

### 3. Webhooks

Les webhooks Stripe sont reçus sur `/api/webhooks/stripe` et gèrent :

- ✅ **payment_intent.succeeded** : Passe l'organisation en ACTIVE
- ❌ **payment_intent.payment_failed** : Passe l'organisation en SUSPENDED
- 🔄 **customer.subscription.updated** : Synchronise les changements d'abonnement
- 🗑️ **customer.subscription.deleted** : Passe l'organisation en CANCELLED

## 🧪 Test en local

Pour tester les webhooks en local, installer Stripe CLI :

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Stripe CLI affichera le webhook secret à utiliser localement.

## 📊 Tarifs des plans

Les montants sont définis dans `stripe-service.ts` :

```typescript
const planPrices = {
  SOLO: 49,      // 49€/mois
  DUO: 99,       // 99€/mois
  TEAM: 199,     // 199€/mois
  PREMIUM: 399,  // 399€/mois
}
```

## 🔐 Sécurité

- ✅ Les webhooks sont signés et vérifiés
- ✅ Le cronjob nécessite une authentification via `CRON_SECRET`
- ✅ Les clés Stripe ne sont jamais exposées côté client (sauf la clé publique)
- ⚠️ **À FAIRE** : Chiffrer les IBAN dans la base de données

## 📧 TODO après intégration

- [ ] Envoyer email de confirmation après prélèvement réussi
- [ ] Envoyer email d'échec après prélèvement échoué
- [ ] Générer et envoyer facture PDF
- [ ] Créer notification super admin pour les échecs
- [ ] Mettre en place les relances automatiques pour impayés

## 🆘 Support

En cas de problème :

1. Vérifier les logs dans le dashboard Stripe
2. Vérifier les logs Vercel
3. Tester le webhook avec Stripe CLI
4. Contacter le support Stripe : https://support.stripe.com

---

**Documentation créée le** : $(date)
**Dernière mise à jour** : $(date)
