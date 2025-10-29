# Configuration WhatsApp Business pour LAIA Connect

## 📱 Prérequis

- ✅ Nouvelle carte SIM dédiée (commandée)
- ✅ Compte Meta Business Manager
- ✅ Application Facebook Developers (pour l'API)

---

## 🎯 Architecture WhatsApp

### Pour LAIA Connect (plateforme)
- **Numéro** : Nouvelle carte SIM dédiée
- **Usage** : Support clients, démos, onboarding nouveaux instituts
- **Compte** : WhatsApp Business API (Meta)

### Pour chaque client (multi-tenant)
- **Numéro** : Le numéro de l'institut client
- **Usage** : Communication avec les clients de l'institut
- **Configuration** : Chaque institut configure son propre WhatsApp

---

## 📋 Étape 1 : Activer la carte SIM

### Dès réception de la carte SIM

1. **Insérer la carte SIM** dans un téléphone
2. **Activer** la carte en suivant les instructions de l'opérateur
3. **Noter le numéro** : +33 X XX XX XX XX
4. **Tester** : Envoyer/recevoir un SMS pour vérifier que ça fonctionne

⚠️ **IMPORTANT** : Ne pas installer WhatsApp sur ce téléphone pour l'instant !

---

## 📋 Étape 2 : Créer un compte Meta Business

### Si vous n'avez pas encore de compte Meta Business

1. Allez sur [business.facebook.com](https://business.facebook.com)
2. Cliquez sur **Créer un compte**
3. Remplissez les informations :
   - **Nom de l'entreprise** : LAIA Connect
   - **Votre nom** : Celia
   - **Email professionnel** : contact@laiaconnect.fr
   - **Adresse** : Votre adresse d'entreprise

4. **Vérifier votre entreprise** :
   - Option 1 : Document officiel (Kbis, facture)
   - Option 2 : Numéro de téléphone
   - Option 3 : Email de domaine vérifié

---

## 📋 Étape 3 : Créer l'application WhatsApp Business

### Sur Facebook Developers

1. Allez sur [developers.facebook.com](https://developers.facebook.com)
2. **Mes applications** → **Créer une application**
3. Type : **Business**
4. Nom de l'app : **LAIA Connect WhatsApp**
5. Email de contact : `contact@laiaconnect.fr`
6. Compte Meta Business : Sélectionnez votre compte LAIA Connect

### Ajouter le produit WhatsApp

1. Dans votre application → **Ajouter des produits**
2. Cherchez **WhatsApp** → **Configurer**
3. Associer à votre compte Meta Business

---

## 📋 Étape 4 : Configurer le numéro WhatsApp

### Ajouter le numéro de téléphone

1. Dans **WhatsApp** → **Démarrage rapide**
2. **Ajouter un numéro de téléphone**
3. Sélectionnez **Nouveau numéro**
4. Entrez votre numéro : `+33 X XX XX XX XX`
5. **Méthode de vérification** :
   - SMS (recommandé)
   - Appel vocal

6. Entrez le code de vérification reçu par SMS

⚠️ **Le numéro sera bloqué sur WhatsApp standard** - Normal, c'est pour l'API !

### Créer le profil de l'entreprise

- **Nom** : LAIA Connect
- **Description** : Logiciel de gestion pour instituts de beauté
- **Catégorie** : Logiciel / SaaS
- **Photo de profil** : Logo LAIA Connect
- **Adresse** : Votre adresse (optionnel)
- **Site web** : https://laiaconnect.fr

---

## 📋 Étape 5 : Obtenir les tokens d'accès

### Générer le token d'accès temporaire (60 jours)

1. Dans **WhatsApp** → **API Setup**
2. Section **Temporary access token**
3. Cliquez sur **Generate token**
4. **Copier le token** (il commence par `EAA...`)
5. Noter aussi :
   - **Phone Number ID** (commence par `1234...`)
   - **WhatsApp Business Account ID** (commence par `1234...`)

### Créer un token permanent (optionnel - recommandé en production)

1. **Paramètres** → **Paramètres de base**
2. **Utilisateurs système**
3. **Créer un actif** → Type : **Utilisateur système**
4. Nom : `LAIA Connect API User`
5. Rôle : **Admin**
6. **Générer un nouveau token** :
   - Permissions : `whatsapp_business_messaging`, `whatsapp_business_management`
   - Durée : **60 jours** ou **Jamais** (permanent)
7. **Copier et sauvegarder** le token (on ne peut pas le revoir)

---

## 📋 Étape 6 : Configurer le webhook

### Créer l'endpoint webhook dans votre app

Le webhook permet de recevoir les messages WhatsApp entrants.

**URL du webhook** (déjà configurée dans votre code) :
```
https://laiaconnect.fr/api/whatsapp/webhook
```

### Sur Meta Developers

1. Dans **WhatsApp** → **Configuration**
2. Section **Webhooks**
3. **Modifier** → **URL de rappel** :
   ```
   https://laiaconnect.fr/api/whatsapp/webhook
   ```
4. **Token de vérification** :
   ```
   laia-connect-webhook-2025
   ```
   _(Ou générez un secret fort : `openssl rand -base64 32`)_

5. **Vérifier et enregistrer**
6. **S'abonner aux événements** :
   - `messages` (messages entrants)
   - `message_status` (statut des messages envoyés)

---

## 📋 Étape 7 : Configuration dans le code

### Mettre à jour .env.local

```bash
# WhatsApp Business API - LAIA Connect
WHATSAPP_ACCESS_TOKEN="EAAxxxxx..." # Token généré à l'étape 5
WHATSAPP_PHONE_NUMBER_ID="123456789" # Phone Number ID
WHATSAPP_BUSINESS_ACCOUNT_ID="123456789" # Business Account ID
WHATSAPP_WEBHOOK_VERIFY_TOKEN="laia-connect-webhook-2025"
WHATSAPP_PROVIDER="meta"
```

### Déployer sur Vercel

1. **Ajouter les variables d'environnement** dans Vercel :
   ```bash
   vercel env add WHATSAPP_ACCESS_TOKEN production
   vercel env add WHATSAPP_PHONE_NUMBER_ID production
   vercel env add WHATSAPP_BUSINESS_ACCOUNT_ID production
   vercel env add WHATSAPP_WEBHOOK_VERIFY_TOKEN production
   ```

2. **Redéployer** :
   ```bash
   vercel --prod
   ```

---

## 📋 Étape 8 : Tester l'intégration

### Test 1 : Envoyer un message

```bash
# Via l'API de test Meta
curl -X POST "https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "33612345678",
    "type": "text",
    "text": {
      "body": "Bienvenue sur LAIA Connect ! 🌸"
    }
  }'
```

### Test 2 : Recevoir un message

1. Envoyez un message WhatsApp depuis votre téléphone au numéro configuré
2. Vérifiez les logs Vercel :
   ```bash
   vercel logs
   ```
3. Le webhook devrait recevoir le message

### Test 3 : Via l'interface admin

1. Allez sur `https://app.laiaconnect.fr/super-admin`
2. **Communications** → **WhatsApp**
3. Envoyez un message test

---

## 📋 Étape 9 : Passer en production

### Soumettre l'application pour vérification Meta

Pour envoyer des messages à des numéros non enregistrés (en production) :

1. **WhatsApp** → **API Setup**
2. **Mettre à niveau vers l'API officielle** (gratuit jusqu'à 1000 conversations/mois)
3. Remplir le formulaire :
   - **Nom de l'entreprise** : LAIA
   - **Site web** : https://laiaconnect.fr
   - **Description** : Logiciel de gestion pour instituts de beauté
   - **Cas d'usage** : Notifications de réservation, rappels, support client

4. **Vérification Meta** (1-3 jours ouvrés)
5. Une fois approuvé → Mode production activé

### Créer des templates de messages

Les messages marketing/promotionnels doivent utiliser des **templates approuvés** :

1. **WhatsApp** → **Modèles de messages**
2. **Créer un modèle** :
   - Nom : `reservation_confirmation`
   - Catégorie : **Utilitaire**
   - Langues : **Français**
   - Contenu :
     ```
     Bonjour {{1}},

     Votre réservation pour {{2}} est confirmée le {{3}} à {{4}}.

     Merci de votre confiance ! 🌸
     LAIA Connect
     ```

3. **Soumettre pour approbation** (délai : quelques heures)
4. Une fois approuvé → Utilisable via l'API

---

## 🔄 Renouvellement du token (tous les 60 jours)

### Méthode automatique (recommandée)

Utilisez un **token système permanent** (voir Étape 5).

### Méthode manuelle

1. Connectez-vous à [developers.facebook.com](https://developers.facebook.com)
2. **Votre app** → **WhatsApp** → **API Setup**
3. **Générer un nouveau token**
4. **Mettre à jour** dans Vercel :
   ```bash
   vercel env rm WHATSAPP_ACCESS_TOKEN production
   vercel env add WHATSAPP_ACCESS_TOKEN production
   # Entrer le nouveau token
   vercel --prod
   ```

### Notifications d'expiration

Meta envoie un email 7 jours avant l'expiration.

---

## 📊 Architecture Multi-Tenant

### Pour LAIA Connect (plateforme)
- **Numéro** : +33 X XX XX XX XX (nouvelle carte SIM)
- **Usage** : Support, onboarding, démos
- **Stockage** : Table `WhatsAppHistory` avec `organizationId = NULL`

### Pour chaque institut client
- **Numéro** : Le numéro de l'institut (configuré par le client)
- **Usage** : Communication avec ses propres clients
- **Stockage** : Table `WhatsAppHistory` avec `organizationId = "xxx"`
- **Configuration** : Dans l'admin de l'institut → Intégrations → WhatsApp

Chaque organisation peut configurer son propre compte WhatsApp Business API ou utiliser WhatsApp Business App (gratuit mais limité).

---

## 💡 Bonnes pratiques

### Sécurité
- ✅ Ne jamais exposer le `WHATSAPP_ACCESS_TOKEN` en clair
- ✅ Stocker les tokens chiffrés en BDD (avec `ENCRYPTION_KEY`)
- ✅ Utiliser des tokens système permanents
- ✅ Configurer le webhook avec HTTPS uniquement

### Conformité RGPD
- ✅ Demander le consentement avant d'envoyer des messages marketing
- ✅ Permettre aux utilisateurs de se désabonner (opt-out)
- ✅ Ne pas stocker les messages plus de 30 jours (sauf obligation légale)
- ✅ Chiffrer les données sensibles

### Limites Meta WhatsApp API
- **Gratuit** : 1000 conversations/mois
- **Payant** : 0,005€ - 0,10€ par conversation (selon le pays)
- **Conversation** : Fenêtre de 24h après le dernier message du client
- **Templates** : Illimités (mais doivent être approuvés)

---

## 🆘 Troubleshooting

### "Number already registered"
→ Le numéro est déjà utilisé sur WhatsApp standard
→ Supprimer WhatsApp de votre téléphone et réessayer

### "Webhook verification failed"
→ Vérifier que l'URL est accessible publiquement
→ Vérifier que le `WHATSAPP_WEBHOOK_VERIFY_TOKEN` correspond

### "Message not sent - account not verified"
→ Votre compte Meta Business n'est pas vérifié
→ Compléter la vérification dans Meta Business Manager

### "Template rejected"
→ Les templates doivent respecter les règles Meta
→ Pas de contenu promotionnel dans les templates utilitaires
→ Utiliser des variables {{1}}, {{2}} pour la personnalisation

---

## 📞 Support

- **Documentation Meta** : [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **Support Meta** : [business.facebook.com/help](https://business.facebook.com/help)
- **Pricing** : [developers.facebook.com/docs/whatsapp/pricing](https://developers.facebook.com/docs/whatsapp/pricing)

---

**Dernière mise à jour** : 29 octobre 2025
**Carte SIM commandée** : En attente de réception
**Opérateur** : [À compléter]
