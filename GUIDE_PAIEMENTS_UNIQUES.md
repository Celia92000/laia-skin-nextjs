# Guide - Paiements Uniques (Migrations, Services Ponctuels)

## 🎯 Objectif

Permettre à LAIA Connect de facturer des **services ponctuels** en dehors des abonnements mensuels :
- Migrations de données (depuis Planity, Resabook, etc.)
- Formations personnalisées
- Développements sur mesure
- Audits SEO
- Tout autre service one-shot

---

## 💳 Deux Méthodes de Paiement

### 1️⃣ Abonnements Mensuels
- **Méthodes acceptées** : SEPA + Carte bancaire
- **Type** : Prélèvement récurrent automatique
- **Essai gratuit** : 30 jours
- **3D Secure** : Automatique pour les cartes

### 2️⃣ Paiements Uniques (Nouveau !)
- **Méthode** : Carte bancaire uniquement
- **Type** : Paiement ponctuel
- **3D Secure** : Automatique (DSP2/SCA)
- **Utilisation** : Liens de paiement générés par super-admin

---

## 🚀 Comment Créer un Lien de Paiement

### Étape 1 : Accéder à l'interface

1. Se connecter en tant que **Super-Admin**
2. Aller sur : **http://localhost:3001/super-admin/create-payment-link**

### Étape 2 : Remplir le formulaire

**Champs requis :**
- **Email du client** : `client@exemple.fr`
- **Montant (€)** : `199.00`
- **Description du service** : `Migration des données depuis Planity - 500 clients`

**Exemple concret :**
```
Email : marie.dupont@beaute-zen.fr
Montant : 299€
Description : Formation personnalisée 2h - Utilisation avancée LAIA Connect
```

### Étape 3 : Générer le lien

1. Cliquer sur **"Créer le lien de paiement"**
2. Un lien Stripe Checkout est généré
3. **Copier le lien** dans le presse-papier

### Étape 4 : Envoyer au client

**Email type à envoyer au client :**

```
Bonjour Marie,

Comme convenu, voici le lien de paiement pour votre formation personnalisée :

🔗 [Lien de paiement sécurisé]

Montant : 299€ TTC
Description : Formation personnalisée 2h - Utilisation avancée LAIA Connect

Le paiement est sécurisé par Stripe (carte bancaire avec 3D Secure).
Vous recevrez une facture par email après le paiement.

À très bientôt !
L'équipe LAIA Connect
```

---

## 🎨 Interface Super-Admin

L'interface `/super-admin/create-payment-link` contient :

1. **Formulaire de création**
   - Email client (requis)
   - Montant en euros (requis)
   - Description du service (requis)

2. **Validation instantanée**
   - Vérification des champs
   - Messages d'erreur clairs

3. **Résultat**
   - ✅ Lien généré avec succès
   - 📋 Bouton "Copier le lien"
   - 💡 Instructions pour l'envoi

4. **Exemples pré-remplis**
   - Migration de données : 199€
   - Formation personnalisée : 299€
   - Personnalisation avancée : 499€
   - Audit SEO : 149€

---

## 🔒 Sécurité

### Stripe Checkout
- **Hébergement** : Stripe (certifié PCI-DSS Level 1)
- **3D Secure** : Activé automatiquement (DSP2/SCA)
- **Chiffrement** : HTTPS/TLS obligatoire
- **Fraude** : Détection automatique Stripe Radar

### Données stockées
- **Aucune carte bancaire** stockée chez LAIA
- **Tokenisation** : Stripe gère les données sensibles
- **Metadata** : email, montant, description (logs)

### Accès
- **Super-Admin uniquement** : Vérification du rôle côté serveur
- **JWT** : Token d'authentification requis
- **Logs** : Toutes les créations de liens sont enregistrées

---

## 📊 Workflow Complet

```
1. Client demande une migration de données
   ↓
2. Super-Admin crée un lien de paiement (299€)
   ↓
3. Super-Admin envoie le lien par email au client
   ↓
4. Client clique sur le lien → Stripe Checkout
   ↓
5. Client entre ses coordonnées bancaires
   ↓
6. 3D Secure automatique (SMS/notification bancaire)
   ↓
7. Paiement validé → Stripe webhook
   ↓
8. LAIA Connect reçoit la confirmation de paiement
   ↓
9. Facture envoyée automatiquement au client
   ↓
10. Super-Admin exécute le service (migration)
```

---

## 🧪 Tests

### Test en local

1. **Créer un lien de paiement de test** :
   ```
   Email : test@test.fr
   Montant : 1€
   Description : Test paiement unique
   ```

2. **Utiliser une carte de test Stripe** :
   ```
   Numéro : 4242 4242 4242 4242
   Date : 12/34
   CVC : 123
   ```

3. **Tester le 3D Secure** :
   ```
   Numéro : 4000 0027 6000 3184 (authentification requise)
   ```

4. **Tester un échec** :
   ```
   Numéro : 4000 0000 0000 0002 (carte déclinée)
   ```

### Stripe Dashboard (Mode Test)

1. Aller sur https://dashboard.stripe.com/test/payments
2. Voir tous les paiements de test
3. Vérifier les métadonnées (email, description)

---

## 📧 Email après Paiement

Après un paiement réussi, le client reçoit :

1. **Email Stripe** : Confirmation de paiement
2. **Facture** : Générée automatiquement par Stripe
3. **Email LAIA** (optionnel) : Confirmation du service

---

## 💰 Tarifs Recommandés

### Migrations de données
- **< 100 clients** : 99€
- **100-500 clients** : 199€
- **500-1000 clients** : 299€
- **> 1000 clients** : 499€ (ou devis personnalisé)

### Formations
- **Formation 1h** : 149€
- **Formation 2h** : 299€
- **Formation équipe (3-5 personnes)** : 499€

### Développements
- **Personnalisation simple** : 199€
- **Module sur mesure** : 499€-999€
- **Intégration API tierce** : 299€-799€

### Services marketing
- **Audit SEO** : 149€
- **Optimisation site web** : 299€
- **Campagne email personnalisée** : 199€

---

## 🆘 Dépannage

### Le lien ne fonctionne pas
1. Vérifier que Stripe est en mode **Live** (pas Test)
2. Vérifier la variable `STRIPE_SECRET_KEY` dans `.env`
3. Vérifier que le client a bien reçu le lien complet

### Le paiement échoue
1. Vérifier que la carte est valide
2. Vérifier que le 3D Secure s'est bien exécuté
3. Voir les logs dans Stripe Dashboard

### Pas de webhook reçu
1. Vérifier la configuration webhook dans Stripe
2. Vérifier l'URL du webhook : `https://app.laiaconnect.fr/api/webhooks/stripe`
3. Vérifier le `STRIPE_WEBHOOK_SECRET`

---

## 📞 Support

**Email** : support@laiaconnect.fr
**Dashboard Stripe** : https://dashboard.stripe.com
**Docs Stripe** : https://stripe.com/docs

---

## ✅ Checklist Avant Production

- [ ] Variables d'environnement configurées (`.env`)
- [ ] Stripe en mode **Live** (pas Test)
- [ ] Webhook configuré dans Stripe Dashboard
- [ ] Page super-admin accessible et fonctionnelle
- [ ] Test de bout en bout avec une vraie carte
- [ ] Email type préparé pour envoi aux clients
- [ ] Tarifs définis pour chaque type de service

---

*Guide créé le 2025-01-12*
*LAIA Connect - Paiements Uniques*
