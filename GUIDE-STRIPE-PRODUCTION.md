# 🔐 Guide : Passer Stripe en Production

## ⚠️ IMPORTANT : À faire AVANT tout déploiement commercial

---

## 📋 Checklist préalable

Avant de passer en production, assurez-vous d'avoir :

- [ ] Compte Stripe entièrement vérifié (KYC/KYB)
- [ ] Coordonnées bancaires configurées
- [ ] Conditions générales de vente (CGV) validées
- [ ] Politique de remboursement définie
- [ ] Tests exhaustifs en mode TEST réussis
- [ ] Backup de la configuration actuelle

---

## 🔄 Étape 1 : Obtenir les clés de production

### 1.1. Se connecter à Stripe

1. Aller sur https://dashboard.stripe.com
2. Se connecter avec votre compte
3. **IMPORTANT** : Vérifier que vous êtes en mode "Production" (switch en haut à droite)

### 1.2. Récupérer les clés

1. Aller dans **Developers** > **API keys**
2. Vous verrez deux types de clés :

**Clé secrète (Secret key)** :
```
sk_live_51...
```
⚠️ Ne JAMAIS exposer cette clé publiquement !

**Clé publique (Publishable key)** :
```
pk_live_51...
```
✅ Peut être exposée côté client

### 1.3. Créer un webhook

1. Aller dans **Developers** > **Webhooks**
2. Cliquer sur **Add endpoint**
3. URL du endpoint :
   ```
   https://votre-domaine.com/api/webhooks/stripe
   ```
4. Sélectionner les événements :
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

5. Copier le **Webhook signing secret** :
   ```
   whsec_...
   ```

---

## 🔧 Étape 2 : Configurer les variables d'environnement

### 2.1. Local (.env.local)

⚠️ **Pour les tests en local uniquement** :

```bash
# Stripe PRODUCTION (local testing)
STRIPE_SECRET_KEY="sk_live_51PhkvACLbdoORHbd..."
STRIPE_PUBLISHABLE_KEY="pk_live_51PhkvACLbdoORHbd..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51PhkvACLbdoORHbd..."
```

### 2.2. Production (Vercel/Hosting)

1. **Vercel Dashboard**
   - Aller dans votre projet
   - **Settings** > **Environment Variables**
   - Ajouter les variables pour l'environnement **Production** :

```
STRIPE_SECRET_KEY = sk_live_51PhkvACLbdoORHbd...
STRIPE_PUBLISHABLE_KEY = pk_live_51PhkvACLbdoORHbd...
STRIPE_WEBHOOK_SECRET = whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_51PhkvACLbdoORHbd...
```

2. **Redéployer** l'application pour appliquer les changements

---

## ✅ Étape 3 : Vérification

### 3.1. Vérifier la configuration

Créer un script de test :

```typescript
// scripts/test-stripe-config.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

async function testStripeConfig() {
  console.log('🔍 Vérification configuration Stripe...\n');

  // Vérifier la clé
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('❌ STRIPE_SECRET_KEY manquante !');
    return;
  }

  if (key.startsWith('sk_test_')) {
    console.warn('⚠️  Mode TEST détecté !');
    console.log('   → Passez en mode PRODUCTION (sk_live_)');
  } else if (key.startsWith('sk_live_')) {
    console.log('✅ Mode PRODUCTION confirmé');
  }

  // Test de connexion
  try {
    const account = await stripe.accounts.retrieve();
    console.log('\n✅ Connexion Stripe réussie');
    console.log(`   Compte: ${account.email}`);
    console.log(`   Pays: ${account.country}`);
    console.log(`   Devise: ${account.default_currency?.toUpperCase()}`);

    // Vérifier webhooks
    const webhooks = await stripe.webhookEndpoints.list();
    console.log(`\n📡 Webhooks configurés: ${webhooks.data.length}`);
    webhooks.data.forEach((wh, i) => {
      console.log(`   ${i + 1}. ${wh.url}`);
      console.log(`      Événements: ${wh.enabled_events.length}`);
    });

  } catch (error: any) {
    console.error('\n❌ Erreur de connexion Stripe:');
    console.error(`   ${error.message}`);
  }
}

testStripeConfig();
```

Exécuter :
```bash
npx tsx scripts/test-stripe-config.ts
```

### 3.2. Test de paiement

⚠️ **En production, utilisez une VRAIE carte bancaire** :

1. Créer une session de paiement de test (montant minimal : 0.50€)
2. Effectuer le paiement
3. Vérifier dans le Dashboard Stripe que le paiement apparaît
4. Vérifier que le webhook a été reçu
5. Annuler/Rembourser le paiement de test

---

## 🚨 Étape 4 : Sécurité

### 4.1. Vérifier que les clés TEST ne sont plus utilisées

```bash
# Chercher les clés de test dans le code
grep -r "sk_test_" .
grep -r "pk_test_" .

# Ne devrait retourner AUCUN résultat (sauf dans .env.example)
```

### 4.2. Configurer les notifications Stripe

Dans le Dashboard Stripe :
1. **Settings** > **Notifications**
2. Activer les notifications email pour :
   - Paiements réussis
   - Paiements échoués
   - Litiges/Chargebacks
   - Activités suspectes

### 4.3. Configurer les règles anti-fraude

1. **Payments** > **Radar**
2. Activer **Radar for Fraud Teams** (gratuit jusqu'à un certain volume)
3. Configurer les règles :
   - Bloquer les cartes à haut risque
   - Demander 3D Secure pour montants > 50€
   - Limiter les tentatives par IP

---

## 📊 Étape 5 : Monitoring

### 5.1. Dashboard Stripe

Surveiller quotidiennement :
- Paiements réussis/échoués
- Litiges
- Remboursements
- Activités suspectes

### 5.2. Logs applicatifs

Vérifier que les logs Stripe sont bien enregistrés :

```typescript
// Dans votre code
console.log('💳 Paiement Stripe:', {
  paymentIntentId: paymentIntent.id,
  amount: paymentIntent.amount,
  status: paymentIntent.status,
  customer: paymentIntent.customer,
});
```

---

## 🔄 Étape 6 : Plan de rollback

En cas de problème :

### 6.1. Retour en mode TEST

```bash
# Dans Vercel ou votre hébergeur
STRIPE_SECRET_KEY = sk_test_51...
STRIPE_PUBLISHABLE_KEY = pk_test_51...

# Redéployer immédiatement
```

### 6.2. Communication

- Informer les clients d'un problème technique temporaire
- Suspendre les nouveaux paiements
- Rembourser les transactions en échec

---

## 📋 Checklist finale

Avant de déclarer "Production Ready" :

- [ ] Clés live configurées (sk_live_ et pk_live_)
- [ ] Webhook configuré et testé
- [ ] Test de paiement réel réussi
- [ ] Webhook reçu et traité correctement
- [ ] Remboursement testé
- [ ] Aucune clé test dans le code
- [ ] Notifications Stripe activées
- [ ] Radar anti-fraude activé
- [ ] Monitoring en place
- [ ] Plan de rollback préparé
- [ ] Équipe formée sur les procédures

---

## 🆘 Problèmes courants

### "Invalid API key"
→ Vérifier que la clé commence par `sk_live_` et qu'elle est complète

### "Webhook signature verification failed"
→ Vérifier que `STRIPE_WEBHOOK_SECRET` correspond au webhook configuré

### "Payment requires authentication"
→ Normal pour 3D Secure, implémenter la confirmation côté client

### "Insufficient funds"
→ La carte du client n'a pas assez de fonds

### "Card declined"
→ La banque a refusé la transaction (carte bloquée, limite dépassée, etc.)

---

## 📞 Support

**Stripe Support** :
- Dashboard : https://dashboard.stripe.com/support
- Docs : https://stripe.com/docs
- Status : https://status.stripe.com

**Urgence** :
1. Vérifier https://status.stripe.com
2. Contacter le support Stripe
3. Activer le plan de rollback si nécessaire

---

## 💰 Tarification Stripe

**Frais par transaction** :
- Cartes européennes : 1.5% + 0.25€
- Cartes internationales : 2.9% + 0.25€
- SEPA : 0.8% (plafonné à 5€)

**Remboursements** :
- Les frais Stripe ne sont PAS remboursés
- Prévoir 2-3% de budget pour les remboursements

---

**Date de création** : 22 octobre 2025
**Dernière mise à jour** : 22 octobre 2025
**Version** : 1.0.0
**Statut** : ⚠️ À FAIRE AVANT PRODUCTION
