# 🔄 Guide : Renouvellement des Tokens Meta

Guide complet pour renouveler les tokens **WhatsApp Business**, **Instagram** et **Facebook**.

---

## 📅 Calendrier de renouvellement

| Service | Token actuel expire le | Fréquence | Priorité |
|---------|------------------------|-----------|----------|
| **WhatsApp** | ⚠️ EXPIRÉ | 60 jours | 🔴 CRITIQUE |
| **Instagram** | 16 décembre 2025 | 60 jours | 🟠 HAUTE |
| **Facebook** | 11 décembre 2025 | 60 jours | 🟠 HAUTE |

⚠️ **Renouveler AU MOINS 7 jours avant expiration !**

---

## 🔑 1. WhatsApp Business API Token

### Contexte
Vous utilisez **Meta WhatsApp Business API** (pas Twilio).

### Étapes de renouvellement

#### 1.1. Accéder au Meta Business Suite

1. Aller sur https://business.facebook.com
2. Se connecter avec votre compte Facebook
3. Sélectionner votre **Business Manager**

#### 1.2. Accéder à l'application WhatsApp

1. Menu gauche > **Comptes WhatsApp**
2. Sélectionner votre numéro WhatsApp Business
3. Ou aller directement sur : https://developers.facebook.com/apps

#### 1.3. Générer un nouveau token

1. Dans l'application Meta :
   - **WhatsApp** > **API Setup**
   - Ou **WhatsApp** > **Getting Started**

2. Section **Temporary access token** :
   - Cliquer sur **Generate Token**
   - Sélectionner les permissions :
     - ✅ `whatsapp_business_management`
     - ✅ `whatsapp_business_messaging`

3. Copier le token généré (commence par `EAFWQV...`)

4. **IMPORTANT** : Ce token expire dans **60 jours**

#### 1.4. Token permanentou longue durée (recommandé)

Pour un token qui ne expire pas tous les 60 jours :

1. Utiliser l'outil de token Meta :
   https://developers.facebook.com/tools/accesstoken

2. Cliquer sur **Extend Access Token**

3. Ou utiliser l'API Graph :
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?\
   grant_type=fb_exchange_token&\
   client_id=VOTRE_APP_ID&\
   client_secret=VOTRE_APP_SECRET&\
   fb_exchange_token=VOTRE_TOKEN_COURT"
   ```

#### 1.5. Mettre à jour dans l'application

```bash
# Dans .env.local
WHATSAPP_ACCESS_TOKEN="EAFWQV0qPjVQBP..." # Nouveau token
WHATSAPP_PHONE_NUMBER_ID="672520675954185" # Inchangé
WHATSAPP_BUSINESS_ACCOUNT_ID="1741901383229296" # Inchangé
```

#### 1.6. Vérifier que ça fonctionne

```bash
# Tester l'API WhatsApp
curl -X GET "https://graph.facebook.com/v18.0/me?access_token=VOTRE_TOKEN"
```

Devrait retourner vos informations de compte.

---

## 📸 2. Instagram Access Token

### Étapes de renouvellement

#### 2.1. Accéder à Meta Developers

1. Aller sur https://developers.facebook.com
2. Se connecter
3. Sélectionner votre application

#### 2.2. Obtenir un token Instagram

##### Option A : Via l'outil Graph API Explorer

1. Aller sur https://developers.facebook.com/tools/explorer
2. Sélectionner votre application
3. Cliquer sur **Get User Access Token**
4. Sélectionner les permissions :
   - ✅ `instagram_basic`
   - ✅ `instagram_content_publish`
   - ✅ `pages_read_engagement`
   - ✅ `pages_show_list`

5. Copier le token
6. **IMPORTANT** : C'est un token court (1 heure)

##### Option B : Token longue durée (60 jours)

Échanger le token court contre un token longue durée :

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=24084077607882068&\
client_secret=f80c4d05470e70397d8295f7187765e1&\
fb_exchange_token=VOTRE_TOKEN_COURT"
```

Vous recevrez un token valable 60 jours.

#### 2.3. Renouvellement automatique (recommandé)

Mettre en place un système qui renouvelle automatiquement le token tous les 50 jours :

```typescript
// src/lib/meta-token-refresh.ts
import fetch from 'node-fetch';

export async function refreshInstagramToken() {
  const currentToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${appId}&` +
    `client_secret=${appSecret}&` +
    `fb_exchange_token=${currentToken}`
  );

  const data = await response.json();

  if (data.access_token) {
    console.log('✅ Token Instagram renouvelé');
    console.log(`Nouveau token: ${data.access_token.substring(0, 20)}...`);
    console.log(`Expire dans: ${data.expires_in / 86400} jours`);

    // TODO: Mettre à jour automatiquement dans .env ou base de données
    return data.access_token;
  } else {
    console.error('❌ Erreur renouvellement token:', data);
    throw new Error('Impossible de renouveler le token');
  }
}
```

#### 2.4. Mettre à jour

```bash
# Dans .env.local
INSTAGRAM_ACCESS_TOKEN="IGAALKjpMIVwlBZA..." # Nouveau token
INSTAGRAM_ACCOUNT_ID="785663654385417" # Inchangé
```

---

## 👍 3. Facebook Page Access Token

### Étapes de renouvellement

#### 3.1. Via Graph API Explorer

1. https://developers.facebook.com/tools/explorer
2. Sélectionner votre application
3. **Get User Access Token**
4. Permissions :
   - ✅ `pages_show_list`
   - ✅ `pages_read_engagement`
   - ✅ `pages_manage_posts`
   - ✅ `pages_read_user_content`

#### 3.2. Obtenir le Page Access Token

Avec votre User Access Token, récupérer le Page Access Token :

```bash
# 1. Lister vos pages
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token=VOTRE_USER_TOKEN"

# Vous obtiendrez:
# {
#   "data": [
#     {
#       "access_token": "EAAWQV0qP...",  ← C'est celui-ci !
#       "id": "752355921291358",
#       "name": "LAIA SKIN Institut"
#     }
#   ]
# }
```

#### 3.3. Token longue durée (ne expire jamais)

Pour un token permanent :

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=24084077607882068&\
client_secret=f80c4d05470e70397d8295f7187765e1&\
fb_exchange_token=VOTRE_PAGE_ACCESS_TOKEN"
```

⚠️ **Page Access Tokens** peuvent être configurés pour ne jamais expirer si :
- Le User Access Token est longue durée
- Les permissions restent inchangées

#### 3.4. Mettre à jour

```bash
# Dans .env.local
FACEBOOK_PAGE_ACCESS_TOKEN="EAFWQV0qPjVQBP..." # Nouveau token
FACEBOOK_PAGE_ID="752355921291358" # Inchangé
```

---

## 🤖 4. Automatisation du renouvellement

### 4.1. Créer un cron job

```typescript
// src/app/api/cron/refresh-meta-tokens/route.ts
import { NextResponse } from 'next/server';
import { refreshInstagramToken } from '@/lib/meta-token-refresh';

export async function GET(request: Request) {
  // Vérifier le secret du cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Renouveler Instagram
    const newInstagramToken = await refreshInstagramToken();

    // Renouveler Facebook (similaire)
    // const newFacebookToken = await refreshFacebookToken();

    // Stocker les nouveaux tokens (à implémenter)
    // await updateTokensInDatabase({ instagram: newInstagramToken });

    return NextResponse.json({
      success: true,
      message: 'Tokens renouvelés avec succès'
    });
  } catch (error) {
    console.error('Erreur renouvellement tokens:', error);
    return NextResponse.json(
      { error: 'Erreur lors du renouvellement' },
      { status: 500 }
    );
  }
}
```

### 4.2. Configurer Vercel Cron

Dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-meta-tokens",
      "schedule": "0 0 */50 * *"
    }
  ]
}
```

Exécutera tous les 50 jours.

---

## ⚠️ 5. Alertes d'expiration

### 5.1. Script de vérification

```typescript
// scripts/check-token-expiration.ts
const tokens = {
  whatsapp: {
    name: 'WhatsApp',
    token: process.env.WHATSAPP_ACCESS_TOKEN,
    expiresAt: new Date('2025-12-15'), // À calculer dynamiquement
  },
  instagram: {
    name: 'Instagram',
    token: process.env.INSTAGRAM_ACCESS_TOKEN,
    expiresAt: new Date('2025-12-16'),
  },
  facebook: {
    name: 'Facebook',
    token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
    expiresAt: new Date('2025-12-11'),
  },
};

const now = new Date();
const sevenDays = 7 * 24 * 60 * 60 * 1000;

Object.entries(tokens).forEach(([key, token]) => {
  const daysRemaining = Math.floor(
    (token.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
  );

  if (daysRemaining < 0) {
    console.error(`🔴 ${token.name}: EXPIRÉ depuis ${Math.abs(daysRemaining)} jours !`);
  } else if (daysRemaining < 7) {
    console.warn(`⚠️  ${token.name}: Expire dans ${daysRemaining} jours`);
  } else {
    console.log(`✅ ${token.name}: ${daysRemaining} jours restants`);
  }
});
```

---

## 📝 Checklist de renouvellement

- [ ] WhatsApp Business Token renouvelé
- [ ] Instagram Token renouvelé
- [ ] Facebook Page Token renouvelé
- [ ] Tokens mis à jour dans .env.local
- [ ] Tokens mis à jour dans Vercel (production)
- [ ] Application redéployée
- [ ] Tests effectués (envoi message WhatsApp, post Instagram, etc.)
- [ ] Calendrier de prochain renouvellement noté (dans 50 jours)
- [ ] Alertes configurées pour 7 jours avant expiration

---

## 🆘 Problèmes courants

### "Invalid OAuth access token"
→ Token expiré ou invalide, générer un nouveau

### "Permissions insuffisantes"
→ Vérifier les permissions lors de la génération du token

### "App not approved for this permission"
→ Soumettre l'app pour review Meta si besoin de permissions avancées

### Token renouvelé mais ne fonctionne toujours pas
→ Attendre 5-10 minutes de propagation
→ Vider le cache de l'application
→ Redémarrer le serveur

---

**Date de création** : 22 octobre 2025
**Prochaine révision** : 11 décembre 2025 (avant expiration Facebook)
**Version** : 1.0.0
