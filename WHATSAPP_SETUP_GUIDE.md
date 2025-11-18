# 📱 Guide Configuration WhatsApp Business API Complète

## 🎯 Objectif
Connecter votre WhatsApp Business (0683717050) pour synchroniser toutes vos conversations dans l'interface.

## ✅ Prérequis
- Compte Facebook personnel
- WhatsApp Business sur votre téléphone
- Numéro : 0683717050
- Carte bancaire (gratuit les 1000 premiers messages/mois)

---

## 📋 Étape 1 : Créer un compte Meta Business

### 1.1 Accéder à Meta Business Suite
1. Aller sur : https://business.facebook.com/
2. Cliquer sur "Créer un compte"
3. Remplir :
   - Nom de l'entreprise : **LAIA SKIN Institut**
   - Votre nom : **Laïa**
   - Email professionnel : **contact@laiaskin.fr**

### 1.2 Configurer l'entreprise
1. Type d'entreprise : **Services de beauté et bien-être**
2. Site web : **https://laiaskin.fr**
3. Adresse : Votre adresse professionnelle

---

## 🔧 Étape 2 : Activer WhatsApp Business Platform

### 2.1 Ajouter WhatsApp
1. Dans Meta Business, aller dans **"Tous les outils"** (menu ≡)
2. Cliquer sur **"WhatsApp"**
3. Sélectionner **"Commencer"**

### 2.2 Choisir le type d'API
1. Sélectionner **"API Business"** (pas l'app gratuite)
2. Choisir **"Cloud API"** (hébergé par Meta)
3. Plan : **Gratuit** (1000 conversations/mois incluses)

### 2.3 Ajouter votre numéro
1. Cliquer **"Ajouter un numéro de téléphone"**
2. Entrer : **0683717050**
3. Choisir **"Ce numéro utilise déjà WhatsApp Business"**
4. Recevoir le code de vérification sur votre téléphone
5. Entrer le code

---

## 🔐 Étape 3 : Obtenir les clés d'accès

### 3.1 Créer une app Meta
1. Aller sur : https://developers.facebook.com/
2. Cliquer **"Mes apps"** → **"Créer une app"**
3. Type : **Business**
4. Nom : **LAIA SKIN WhatsApp**

### 3.2 Configurer WhatsApp
1. Dans l'app, ajouter le produit **"WhatsApp"**
2. Aller dans **"Configuration"**
3. Noter ces informations :
   - **Phone number ID** : (chiffres)
   - **WhatsApp Business Account ID** : (chiffres)

### 3.3 Générer un token permanent
1. Aller dans **"Accès aux tokens"**
2. Cliquer **"Générer un token système"**
3. Permissions à cocher :
   - ✅ whatsapp_business_messaging
   - ✅ whatsapp_business_management
4. Copier le token (très long, commence par EAA...)

---

## 🔄 Étape 4 : Configurer les Webhooks

### 4.1 URL du webhook
Votre URL de webhook sera :
```
https://laiaskin.fr/api/whatsapp/webhook
```

### 4.2 Configuration dans Meta
1. Dans votre app Meta, aller dans **"Webhooks"**
2. Choisir **"WhatsApp Business Account"**
3. URL de callback : `https://laiaskin.fr/api/whatsapp/webhook`
4. Token de vérification : `laia_skin_webhook_2025`
5. S'abonner aux champs :
   - ✅ messages
   - ✅ message_status
   - ✅ message_template_status

---

## 💾 Étape 5 : Mettre à jour la configuration

### 5.1 Modifier le fichier .env.local
Remplacer les valeurs actuelles par les nouvelles :

```env
# WhatsApp Business Configuration
NEXT_PUBLIC_WHATSAPP_NUMBER=+33683717050
WHATSAPP_ACCESS_TOKEN=VOTRE_NOUVEAU_TOKEN_ICI
WHATSAPP_PHONE_NUMBER_ID=VOTRE_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID=VOTRE_BUSINESS_ACCOUNT_ID
WHATSAPP_WEBHOOK_VERIFY_TOKEN=laia_skin_webhook_2025
WHATSAPP_API_VERSION=v18.0
```

### 5.2 Redémarrer l'application
```bash
# Arrêter avec Ctrl+C puis :
npm run dev
```

---

## ✨ Étape 6 : Migration des conversations

### 6.1 Exporter depuis WhatsApp Business
1. Sur votre téléphone, ouvrir **WhatsApp Business**
2. Paramètres → Discussions → Historique → **Exporter**
3. Choisir **"Sans médias"**
4. Envoyer par email à vous-même

### 6.2 Activer la synchronisation
Une fois configuré, les NOUVELLES conversations seront automatiquement synchronisées.

Pour les anciennes, nous pouvons créer un importateur.

---

## 🚨 Points importants

### ⚠️ Migration du numéro
- Votre numéro passera de l'app WhatsApp Business à l'API
- Vous ne pourrez plus utiliser l'app mobile normale
- Vous utiliserez l'interface web à la place

### 💰 Tarification
- **Gratuit** : 1000 conversations initiées par l'entreprise/mois
- **Illimité** : Réponses aux clients sous 24h
- Après 1000 : ~0,02€ par conversation

### 📱 Avantages
- ✅ Toutes les conversations dans votre interface
- ✅ Envoi automatique (rappels, confirmations)
- ✅ Historique complet dans le CRM
- ✅ Statistiques détaillées
- ✅ Réponses rapides prédéfinies
- ✅ Gestion multi-utilisateurs

---

## 🆘 Support

### Problèmes courants :

**"Token expiré"**
→ Régénérer un token système dans Meta Developer

**"Numéro non vérifié"**
→ Vérifier le numéro dans Meta Business Manager

**"Webhooks non reçus"**
→ Vérifier que l'URL est en HTTPS et accessible

### Besoin d'aide ?
- Documentation Meta : https://developers.facebook.com/docs/whatsapp
- Support Meta Business : https://business.facebook.com/business/help

---

## 🎉 Une fois configuré

Vous pourrez :
1. Voir toutes vos conversations WhatsApp dans l'interface
2. Répondre depuis l'ordinateur
3. Envoyer des messages automatiques
4. Avoir l'historique complet dans le CRM
5. Gérer plusieurs conversations en même temps

**Note** : La configuration prend environ 30 minutes. Une fois fait, c'est permanent !