# 🚀 Guide de Configuration des API Réseaux Sociaux

Ce guide vous explique comment obtenir les tokens d'accès pour chaque plateforme sociale.

---

## 📸 Instagram (Meta Graph API)

### Prérequis
- Un compte Instagram Business ou Creator
- Une page Facebook liée au compte Instagram
- Un compte Meta for Developers

### Étapes

1. **Créer une App Facebook**
   - Allez sur https://developers.facebook.com/apps/
   - Cliquez sur "Créer une app"
   - Choisissez "Business" comme type d'app
   - Remplissez les informations (nom, email de contact)

2. **Configurer l'API Instagram**
   - Dans le tableau de bord de votre app
   - Ajoutez le produit "Instagram Basic Display" OU "Instagram Graph API"
   - Pour un compte Business, utilisez "Instagram Graph API"

3. **Obtenir l'Access Token**
   - Allez dans Outils → Explorateur d'API Graph
   - Sélectionnez votre app
   - Cliquez sur "Générer un jeton d'accès utilisateur"
   - Sélectionnez les permissions :
     - `instagram_basic`
     - `instagram_content_publish`
     - `pages_read_engagement`
     - `pages_manage_posts`
   - Copiez le token généré

4. **Obtenir l'Instagram Account ID**
   - Dans l'Explorateur d'API Graph
   - Requête GET : `me/accounts` (pour obtenir votre page Facebook)
   - Notez le `id` de votre page
   - Requête GET : `{PAGE_ID}?fields=instagram_business_account`
   - Notez l'`instagram_business_account.id`

5. **Rendre le token permanent**
   - Par défaut, le token expire après 1h
   - Requête GET : `oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}`
   - Vous obtiendrez un token longue durée (60 jours)

### Variables d'environnement
```env
INSTAGRAM_ACCESS_TOKEN=votre_token_longue_duree
INSTAGRAM_ACCOUNT_ID=votre_instagram_account_id
```

---

## 👥 Facebook Pages

### Étapes

1. **Utiliser la même App Facebook**
   - Réutilisez l'app créée pour Instagram

2. **Obtenir le Page Access Token**
   - Dans l'Explorateur d'API Graph
   - Requête GET : `me/accounts`
   - Copiez l'`access_token` de votre page (pas celui de l'utilisateur)

3. **Obtenir le Page ID**
   - Dans la même réponse, copiez l'`id` de votre page
   - Ou allez sur votre page Facebook → À propos → ID de la page

4. **Permissions requises**
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `publish_to_groups` (optionnel)

### Variables d'environnement
```env
FACEBOOK_PAGE_ACCESS_TOKEN=votre_page_token
FACEBOOK_PAGE_ID=votre_page_id
```

---

## 💼 LinkedIn

### Étapes

1. **Créer une App LinkedIn**
   - Allez sur https://www.linkedin.com/developers/apps
   - Cliquez sur "Create app"
   - Remplissez :
     - App name : "Laia Skin Institut"
     - LinkedIn Page : Sélectionnez votre page entreprise
     - App logo (optionnel)
   - Acceptez les conditions et créez

2. **Demander l'accès à l'API**
   - Dans l'onglet "Products"
   - Demandez l'accès à "Share on LinkedIn" et "Sign In with LinkedIn"
   - Attendez l'approbation (généralement instantané)

3. **Configurer OAuth 2.0**
   - Dans l'onglet "Auth"
   - Ajoutez une "Redirect URL" : `https://votre-site.com/api/linkedin/callback`
   - Notez le `Client ID` et `Client Secret`

4. **Obtenir l'Access Token**
   - URL d'autorisation :
   ```
   https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=w_member_social%20r_liteprofile
   ```
   - Autorisez l'accès
   - Récupérez le `code` dans l'URL de redirection
   - Échangez le code contre un token :
   ```bash
   curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
     -d grant_type=authorization_code \
     -d code={CODE} \
     -d client_id={CLIENT_ID} \
     -d client_secret={CLIENT_SECRET} \
     -d redirect_uri={REDIRECT_URI}
   ```

5. **Obtenir votre Person ID**
   - Requête GET avec le token :
   ```bash
   curl https://api.linkedin.com/v2/me \
     -H "Authorization: Bearer {ACCESS_TOKEN}"
   ```
   - Copiez l'`id` retourné

### Variables d'environnement
```env
LINKEDIN_ACCESS_TOKEN=votre_access_token
LINKEDIN_PERSON_ID=votre_person_id
```

---

## 👻 Snapchat (Snap Kit)

### Étapes

1. **Créer une App Snapchat**
   - Allez sur https://kit.snapchat.com/portal
   - Cliquez sur "Create App"
   - Remplissez les informations de votre app

2. **Activer Creative Kit**
   - Dans le dashboard de votre app
   - Activez "Creative Kit"
   - Configurez les permissions

3. **Obtenir les credentials**
   - Allez dans "OAuth2"
   - Notez le `Client ID` et `Client Secret`
   - Ajoutez une Redirect URI

4. **Obtenir l'Access Token**
   - URL d'autorisation :
   ```
   https://accounts.snapchat.com/accounts/oauth2/auth?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=snapchat-marketing-api
   ```
   - Autorisez l'accès
   - Échangez le code contre un token :
   ```bash
   curl -X POST https://accounts.snapchat.com/accounts/oauth2/token \
     -d grant_type=authorization_code \
     -d code={CODE} \
     -d client_id={CLIENT_ID} \
     -d client_secret={CLIENT_SECRET} \
     -d redirect_uri={REDIRECT_URI}
   ```

### Variables d'environnement
```env
SNAPCHAT_ACCESS_TOKEN=votre_access_token
```

---

## 🎵 TikTok (Business API)

### Étapes

1. **S'inscrire au TikTok for Business**
   - Allez sur https://business-api.tiktok.com/
   - Créez un compte TikTok for Business
   - Demandez l'accès à l'API

2. **Créer une App**
   - Dans le TikTok for Business Portal
   - Créez une nouvelle app
   - Remplissez les informations

3. **Obtenir les credentials**
   - Notez le `App ID` et `App Secret`

4. **Obtenir l'Access Token**
   - Suivez le flux OAuth 2.0 de TikTok
   - Documentation : https://business-api.tiktok.com/portal/docs?id=1738373164380162

### Variables d'environnement
```env
TIKTOK_ACCESS_TOKEN=votre_access_token
```

---

## 🐦 Twitter/X (API v2)

### Étapes

1. **Créer un compte Developer**
   - Allez sur https://developer.twitter.com/
   - Inscrivez-vous comme développeur
   - Créez un projet et une app

2. **Obtenir les credentials**
   - Dans le dashboard de votre app
   - Onglet "Keys and tokens"
   - Générez un "Bearer Token"

3. **Activer les permissions**
   - Dans "User authentication settings"
   - Activez OAuth 2.0
   - Permissions : `tweet.read` et `tweet.write`

### Variables d'environnement
```env
TWITTER_BEARER_TOKEN=votre_bearer_token
```

---

## 🔐 Configuration Vercel

Une fois tous les tokens obtenus, ajoutez-les dans Vercel :

1. Dashboard Vercel → Votre projet
2. Settings → Environment Variables
3. Ajoutez chaque variable avec sa valeur
4. Sélectionnez les environnements (Production, Preview, Development)
5. Redéployez votre application

---

## ⚠️ Notes Importantes

### Sécurité
- Ne partagez JAMAIS vos tokens
- Ne commitez JAMAIS vos tokens dans Git
- Renouvelez régulièrement vos tokens

### Limitations
- **Instagram** : Max 25 posts/jour
- **Facebook** : Limites selon le type de page
- **LinkedIn** : 150 requêtes/jour en mode gratuit
- **Twitter** : Varie selon le plan (Free, Basic, Pro)

### Renouvellement des tokens
- **Instagram/Facebook** : 60 jours (renouvellement automatique possible)
- **LinkedIn** : 60 jours
- **Snapchat** : Variable selon configuration
- **Twitter** : Pas d'expiration pour Bearer Token

---

## 🧪 Test de Configuration

Pour tester si vos API sont bien configurées :

1. Allez dans l'onglet "Réseaux Sociaux" de votre admin
2. Cliquez sur "Tester la configuration"
3. Vérifiez que toutes les plateformes configurées s'affichent en vert

Ou utilisez l'API directement :
```bash
curl https://votre-site.com/api/admin/social-media/publish \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

---

## 📚 Ressources

- [Meta for Developers](https://developers.facebook.com/)
- [LinkedIn Developers](https://www.linkedin.com/developers/)
- [Snapchat Developers](https://kit.snapchat.com/)
- [TikTok for Business API](https://business-api.tiktok.com/)
- [Twitter Developer Platform](https://developer.twitter.com/)

---

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez que tous les tokens sont correctement configurés
2. Consultez les logs d'erreur dans Vercel
3. Vérifiez les permissions accordées à chaque app
4. Assurez-vous que vos comptes sont bien de type Business/Professional
