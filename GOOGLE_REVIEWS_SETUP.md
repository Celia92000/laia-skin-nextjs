# 🌟 Configuration Google My Business API - Avis Google

Ce guide explique comment configurer l'authentification OAuth2 pour synchroniser automatiquement les avis Google My Business dans LAIA Connect.

---

## 📋 **Prérequis**

- Un compte Google My Business avec au moins un établissement
- Accès à la Google Cloud Console
- Rôle `SUPER_ADMIN` ou `ORG_ADMIN` dans LAIA Connect

---

## 🔧 **Étape 1 : Créer un projet Google Cloud**

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Noter le **Project ID**

---

## 🔑 **Étape 2 : Activer les APIs nécessaires**

Dans votre projet Google Cloud, activer les APIs suivantes :

1. **Google My Business API**
   - Aller dans "APIs & Services" > "Library"
   - Rechercher "Google My Business API"
   - Cliquer sur "Enable"

2. **Google Business Profile API**
   - Rechercher "Google Business Profile API"
   - Cliquer sur "Enable"

3. **My Business Account Management API**
   - Rechercher "My Business Account Management API"
   - Cliquer sur "Enable"

4. **My Business Business Information API**
   - Rechercher "My Business Business Information API"
   - Cliquer sur "Enable"

---

## 🔐 **Étape 3 : Créer les credentials OAuth 2.0**

### 1. Configurer l'écran de consentement OAuth

1. Aller dans "APIs & Services" > "OAuth consent screen"
2. Sélectionner **"External"** (pour utiliser avec n'importe quel compte Google)
3. Remplir les informations :
   - **App name** : LAIA Connect
   - **User support email** : votre email
   - **Developer contact email** : votre email
4. Cliquer sur "Save and Continue"
5. **Scopes** : Ajouter les scopes suivants :
   - `https://www.googleapis.com/auth/business.manage`
   - `https://www.googleapis.com/auth/plus.business.manage`
6. Cliquer sur "Save and Continue"
7. **Test users** : Ajouter votre email Google
8. Cliquer sur "Save and Continue"

### 2. Créer les credentials

1. Aller dans "APIs & Services" > "Credentials"
2. Cliquer sur "Create Credentials" > "OAuth client ID"
3. Type d'application : **"Web application"**
4. Nom : `LAIA Connect - Google Reviews`
5. **Authorized redirect URIs** : Ajouter les URLs suivantes :
   ```
   http://localhost:3001/api/auth/google-business/callback
   https://votre-domaine.com/api/auth/google-business/callback
   ```
6. Cliquer sur "Create"
7. **Noter le Client ID et Client Secret** - VOUS EN AUREZ BESOIN !

---

## ⚙️ **Étape 4 : Configurer les variables d'environnement**

Ajouter les credentials dans votre fichier `.env.local` :

```bash
# Google My Business OAuth2
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google-business/callback

# En production, utiliser votre domaine :
# GOOGLE_REDIRECT_URI=https://laiaconnect.fr/api/auth/google-business/callback
```

---

## 📦 **Étape 5 : Installer le package googleapis**

```bash
npm install googleapis
```

---

## 🔗 **Étape 6 : Connecter votre compte Google My Business**

### Depuis l'interface admin LAIA Connect :

1. Se connecter en tant qu`ORG_ADMIN` ou `SUPER_ADMIN`
2. Aller dans l'onglet **"Avis"**
3. Cliquer sur le bouton **"Connecter Google My Business"**
4. Autoriser l'accès à votre compte Google
5. Sélectionner votre établissement Google My Business
6. La synchronisation se fera automatiquement

### Manuellement via API :

```bash
# 1. Obtenir l'URL d'autorisation
curl -X GET http://localhost:3001/api/auth/google-business/authorize \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Visiter l'URL retournée dans le navigateur
# 3. Autoriser l'accès
# 4. Vous serez redirigé vers /api/auth/google-business/callback
```

---

## 🔄 **Étape 7 : Synchronisation automatique**

### Activer la synchronisation automatique :

Dans l'interface admin, activer l'option **"Synchronisation automatique des avis Google"**.

Les avis seront synchronisés automatiquement tous les jours à 6h du matin via le cron job `/api/cron/sync-google-reviews`.

### Configuration Vercel Cron :

Ajouter dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-google-reviews?secret=YOUR_CRON_SECRET",
      "schedule": "0 6 * * *"
    }
  ]
}
```

### Synchronisation manuelle :

Depuis l'interface admin, cliquer sur **"Synchroniser maintenant"** dans l'onglet Avis.

---

## 🧪 **Tester la configuration**

### 1. Vérifier la connexion

```bash
curl -X POST http://localhost:3001/api/admin/google-reviews/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Vérifier les avis synchronisés

```bash
curl -X GET http://localhost:3001/api/admin/reviews \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Filtrer par source "Google" dans l'interface admin.

---

## 🛠️ **Troubleshooting**

### Erreur "Organisation non connectée"

**Cause** : L'organisation n'a pas encore autorisé l'accès Google.

**Solution** : Suivre l'étape 6 pour connecter le compte Google.

### Erreur "Token expiré"

**Cause** : Le refresh token n'a pas pu être utilisé.

**Solution** : Reconnecter le compte Google (déconnecter puis reconnecter).

### Erreur "API not enabled"

**Cause** : Les APIs Google My Business ne sont pas activées.

**Solution** : Vérifier l'étape 2 et activer toutes les APIs nécessaires.

### Erreur "Invalid redirect_uri"

**Cause** : L'URL de redirection n'est pas configurée dans Google Cloud Console.

**Solution** : Ajouter l'URL exacte dans "Authorized redirect URIs" (étape 3).

---

## 📊 **Fonctionnalités disponibles**

✅ **Synchronisation automatique** des avis Google
✅ **Affichage des avis** dans l'onglet Avis (filtre "Google")
✅ **Statistiques** : Moyenne, nombre d'avis, distribution
✅ **Fusion** avec les avis internes dans les rapports
✅ **Multi-tenant** : Chaque organisation a sa propre connexion Google
✅ **Refresh token automatique** : Pas besoin de reconnecter tous les jours

---

## 🔒 **Sécurité**

- ✅ Tokens OAuth2 chiffrés dans la base de données
- ✅ Vérification des rôles (SUPER_ADMIN, ORG_ADMIN)
- ✅ Isolation multi-tenant (chaque org a ses propres credentials)
- ✅ Refresh token automatique avant expiration
- ✅ HTTPS requis en production

---

## 📝 **Notes importantes**

1. **Google My Business API** est gratuite mais limitée en nombre de requêtes
2. **Délai de synchronisation** : Les avis peuvent prendre jusqu'à 24h pour apparaître dans Google
3. **Permissions** : Le compte Google doit être **propriétaire ou manager** de l'établissement
4. **Multi-établissements** : Si vous avez plusieurs établissements, le premier sera utilisé par défaut

---

## 🆘 **Support**

En cas de problème, vérifier les logs dans `/var/log/laia-connect.log` ou contacter le support technique.

**Logs utiles** :
```bash
# Logs synchronisation
grep "Google Reviews Sync" /var/log/laia-connect.log

# Logs OAuth2
grep "Google OAuth" /var/log/laia-connect.log
```

---

**✅ Votre intégration Google My Business est maintenant configurée !**
