# 🚀 Configuration WhatsApp Business API - Guide Étape par Étape

## 📱 Votre numéro : 0683717050

---

# ÉTAPE 1️⃣ : Créer votre compte Meta Business (5 minutes)

## A. Aller sur Meta Business
1. Ouvrez : **https://business.facebook.com/**
2. Cliquez sur **"Créer un compte"** (bouton bleu)

## B. Remplir les informations
- **Nom de l'entreprise** : LAIA SKIN Institut
- **Votre nom** : Célia
- **Email professionnel** : contact@laiaskin.fr
- Cliquez **Suivant**

## C. Détails de l'entreprise
- **Adresse** : Votre adresse professionnelle
- **Numéro de téléphone** : 0683717050
- **Site web** : https://laiaskin.fr
- **Catégorie** : Beauté, cosmétique et soins personnels
- Cliquez **Soumettre**

✅ **Compte créé !** Notez votre ID Business (en haut de la page)

---

# ÉTAPE 2️⃣ : Créer une App Meta (5 minutes)

## A. Aller sur Meta for Developers
1. Ouvrez : **https://developers.facebook.com/**
2. Connectez-vous avec le même compte Facebook
3. Cliquez **"Mes apps"** → **"Créer une app"**

## B. Type d'application
1. Sélectionnez **"Business"** (icône valise)
2. Cliquez **Suivant**

## C. Détails de l'app
- **Nom de l'app** : LAIA SKIN WhatsApp
- **Email de contact** : contact@laiaskin.fr
- **Compte Business** : Sélectionnez "LAIA SKIN Institut"
- Cliquez **Créer l'app**

## D. Ajouter WhatsApp
1. Dans le tableau de bord, cherchez **"WhatsApp"**
2. Cliquez **"Configurer"**
3. Acceptez les conditions

---

# ÉTAPE 3️⃣ : Configurer WhatsApp Business API (10 minutes)

## A. Démarrage rapide
1. Dans WhatsApp, cliquez **"Démarrage rapide"**
2. Sélectionnez **"Utiliser un numéro existant"**

## B. Ajouter votre numéro 0683717050
1. **Nom affiché** : LAIA SKIN Institut
2. **Catégorie** : Beauté
3. **Description** : Institut de beauté spécialisé en soins du visage
4. **Numéro** : +33683717050
5. Cliquez **Suivant**

## C. Vérification du numéro
1. Choisissez **"SMS"**
2. Vous recevrez un code sur votre téléphone
3. Entrez le code à 6 chiffres
4. Cliquez **Vérifier**

⚠️ **IMPORTANT** : Après vérification, WhatsApp sur votre téléphone sera déconnecté !

---

# ÉTAPE 4️⃣ : Obtenir vos clés d'accès

## A. Phone Number ID
1. Dans le menu gauche, cliquez **"API Setup"**
2. Copiez le **"Phone number ID"** (ressemble à : 123456789012345)

📋 **Votre Phone Number ID** : _____________________

## B. WhatsApp Business Account ID  
1. Toujours dans "API Setup"
2. Copiez le **"WhatsApp Business Account ID"**

📋 **Votre Business Account ID** : _____________________

## C. Token d'accès permanent
1. Allez dans **"Accès aux tokens"** (menu gauche)
2. Cliquez **"Générer un nouveau token"**
3. Permissions à cocher :
   - ✅ whatsapp_business_messaging
   - ✅ whatsapp_business_management
4. Durée : **"Jamais"** (token permanent)
5. Cliquez **"Générer le token"**
6. **COPIEZ ET SAUVEGARDEZ** le token (très long, commence par EAA...)

📋 **Votre Token** : _____________________

---

# ÉTAPE 5️⃣ : Configurer les Webhooks (5 minutes)

## A. Configuration du Webhook
1. Dans le menu, allez dans **"Configuration" → "Webhooks"**
2. Cliquez **"Modifier l'abonnement"**

## B. URL et Token
- **URL de callback** : https://laiaskin.fr/api/whatsapp/webhook
- **Token de vérification** : laia_skin_webhook_2025
- Cliquez **"Vérifier et enregistrer"**

## C. S'abonner aux événements
Cochez :
- ✅ messages
- ✅ message_status
- ✅ message_template_status
- Cliquez **"S'abonner"**

---

# ÉTAPE 6️⃣ : Mettre à jour votre configuration

## A. Ouvrir le fichier .env.local

Remplacez les anciennes valeurs par les vôtres :

```env
# WhatsApp Business Configuration
NEXT_PUBLIC_WHATSAPP_NUMBER=+33683717050
WHATSAPP_ACCESS_TOKEN=VOTRE_TOKEN_ICI
WHATSAPP_PHONE_NUMBER_ID=VOTRE_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID=VOTRE_BUSINESS_ACCOUNT_ID
WHATSAPP_WEBHOOK_VERIFY_TOKEN=laia_skin_webhook_2025
WHATSAPP_API_VERSION=v18.0
```

## B. Redémarrer l'application
1. Arrêtez avec `Ctrl + C`
2. Relancez : `npm run dev`

---

# ÉTAPE 7️⃣ : Tester l'envoi

## Test depuis l'interface
1. Allez dans l'onglet **WhatsApp**
2. Sélectionnez **"Célia (Test)"**
3. Envoyez : "Test configuration réussie !"
4. Vérifiez sur votre téléphone

## ✅ Si le message arrive
**Félicitations !** Tout fonctionne.

## ❌ Si le message n'arrive pas
Vérifiez :
1. Le token est bien copié (pas d'espaces)
2. Le Phone Number ID est correct
3. Le numéro est au format +33683717050

---

# 📱 IMPORTANT : Changement sur votre téléphone

Après cette configuration :
- ❌ WhatsApp Business sur votre téléphone sera **déconnecté**
- ✅ Vous utiliserez l'interface web pour tous les messages
- ✅ Les clients continueront à vous écrire normalement
- ✅ Vous verrez tout dans l'interface

---

# 🆘 Besoin d'aide ?

## Points de blocage fréquents :

### "Le numéro est déjà utilisé"
→ Désinstallez WhatsApp Business de votre téléphone d'abord

### "Token invalide"
→ Régénérez le token et copiez-le entièrement

### "Webhook non vérifié"
→ Vérifiez que le site est en HTTPS

---

# 📊 Après configuration

Vous pourrez :
- ✅ Envoyer/recevoir tous les messages dans l'interface
- ✅ Historique complet dans le CRM
- ✅ Réponses automatiques
- ✅ Messages programmés
- ✅ 1000 messages gratuits/mois

**Temps total : environ 25-30 minutes**

---

## 🎯 Checklist finale

- [ ] Compte Meta Business créé
- [ ] App Meta créée
- [ ] Numéro 0683717050 vérifié
- [ ] Phone Number ID copié
- [ ] Business Account ID copié
- [ ] Token permanent généré et copié
- [ ] Webhooks configurés
- [ ] .env.local mis à jour
- [ ] Application redémarrée
- [ ] Test d'envoi réussi

**Une fois tout coché, votre WhatsApp Business API est opérationnel !**