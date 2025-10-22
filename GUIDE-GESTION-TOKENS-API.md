# 🔐 Guide de Gestion Sécurisée des Tokens API

## Vue d'ensemble

Ce système permet de stocker et gérer tous les tokens API (WhatsApp, Instagram, Facebook, Stripe, etc.) de manière **chiffrée** en base de données, avec gestion automatique des expirations et renouvellements.

## ✨ Fonctionnalités

- ✅ **Chiffrement automatique** de tous les tokens stockés
- ✅ **Gestion des expirations** avec alertes proactives
- ✅ **Interface admin** intuitive pour visualiser et renouveler les tokens
- ✅ **Multi-provider** : WhatsApp, Instagram, Facebook, Stripe, Resend...
- ✅ **Rotation automatique** avec guides étape par étape
- ✅ **Migration depuis .env** pour sécuriser les tokens existants

## 📍 Accès dans l'admin

**Paramètres → Sécurité API**

URL directe : `http://localhost:3001/admin/settings` (onglet "Sécurité API")

## 🚀 Migration initiale des tokens

### Étape 1 : Exécuter le script de migration

```bash
npx tsx scripts/migrate-all-tokens.ts
```

Ce script va :
1. Lire les tokens depuis votre fichier `.env`
2. Les chiffrer avec AES-256-GCM
3. Les stocker en base de données Prisma
4. Vérifier les dates d'expiration
5. Afficher un rapport

### Étape 2 : Vérifier dans l'admin

Connectez-vous à l'admin et allez dans **Paramètres → Sécurité API** pour voir vos tokens migrés.

### Étape 3 : Nettoyer le .env (optionnel mais recommandé)

Une fois les tokens migrés, vous pouvez supprimer les lignes suivantes du `.env` :

```env
# Ces tokens sont maintenant stockés de manière chiffrée en base de données
# WHATSAPP_ACCESS_TOKEN=...
# INSTAGRAM_ACCESS_TOKEN=...
# FACEBOOK_PAGE_ACCESS_TOKEN=...
```

⚠️ **Important** : Gardez une sauvegarde sécurisée de ces tokens avant de les supprimer du `.env` !

## 📊 Statuts des tokens

| Statut | Couleur | Description |
|--------|---------|-------------|
| **Permanent** | Vert | Pas d'expiration (ex: clés Stripe) |
| **Actif** | Vert | Plus de 30 jours avant expiration |
| **Attention** | Jaune | Entre 8 et 30 jours avant expiration |
| **Expirant** | Orange | Moins de 7 jours avant expiration |
| **Expiré** | Rouge | Token expiré, doit être renouvelé |

## 🔄 Renouvellement des tokens

### WhatsApp Business (expire tous les 60 jours)

1. Connectez-vous à [Meta Business Manager](https://business.facebook.com/)
2. Sélectionnez votre compte WhatsApp Business
3. Allez dans **Configuration → Tokens d'accès**
4. Cliquez sur **"Générer un nouveau token"**
5. Copiez le nouveau token
6. Dans l'admin LAIA : **Sécurité API → Renouveler WhatsApp**
7. Collez le nouveau token et sauvegardez

### Instagram (expire tous les 60 jours)

1. Connectez-vous à [Facebook Developers](https://developers.facebook.com/)
2. Sélectionnez votre application
3. Allez dans **Outils → Outils de token**
4. Cliquez sur **"Prolonger le token d'accès"** ou **"Obtenir un nouveau token"**
5. Copiez le nouveau token
6. Dans l'admin LAIA : **Sécurité API → Renouveler Instagram**
7. Collez le nouveau token et sauvegardez

### Facebook Page (expire tous les 60 jours)

1. Connectez-vous à [Facebook Developers](https://developers.facebook.com/tools/explorer/)
2. Dans l'**Explorateur de l'API Graph** :
   - Sélectionnez votre application
   - Sélectionnez votre page dans le menu déroulant
   - Cliquez sur **"Obtenir le token d'accès de la page"**
3. Copiez le nouveau token
4. Dans l'admin LAIA : **Sécurité API → Renouveler Facebook**
5. Collez le nouveau token et sauvegardez

### Stripe (pas d'expiration)

Les clés Stripe n'expirent pas automatiquement. Renouvelez-les uniquement si :
- Vous soupçonnez une compromission
- Vous passez du mode test au mode production (ou vice-versa)

1. Connectez-vous au [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Allez dans **Développeurs → Clés API**
3. Si nécessaire, révoquez l'ancienne clé et créez-en une nouvelle
4. Copiez la nouvelle clé
5. Dans l'admin LAIA : **Sécurité API → Renouveler Stripe**
6. Collez la nouvelle clé et sauvegardez

## 🔔 Notifications d'expiration

Le système vérifie automatiquement les tokens qui vont expirer et affiche des alertes dans l'interface admin :

- **🟠 Alert orange** : Au moins un token expire dans les 7 prochains jours
- **🔴 Badge rouge "Expiré"** : Token expiré, nécessite un renouvellement immédiat

Vous pouvez également vérifier manuellement en cliquant sur **"Vérifier l'expiration"** dans l'interface.

## 🔒 Sécurité

### Chiffrement

Tous les tokens sont chiffrés avec **AES-256-GCM** avant d'être stockés en base de données.

Le service de chiffrement se trouve dans : `src/lib/encryption-service.ts`

### Variables d'environnement requises

```env
# Clé de chiffrement (générez-la avec: openssl rand -hex 32)
ENCRYPTION_KEY=votre_cle_de_chiffrement_aleatoire_de_64_caracteres
```

⚠️ **CRITIQUE** : Cette clé doit être :
- Unique par environnement (dev, staging, prod)
- Stockée en tant que variable d'environnement (jamais committée)
- Sauvegardée dans un gestionnaire de secrets (AWS Secrets Manager, Vault, etc.)

### Accès restreint

Seuls les utilisateurs avec le rôle `ADMIN` peuvent :
- Voir la liste des tokens (sans les déchiffrer)
- Ajouter/modifier/supprimer des tokens
- Accéder à l'interface de gestion

Les tokens déchiffrés ne sont **jamais** renvoyés au client.

## 📁 Architecture

```
src/
├── lib/
│   ├── api-token-manager.ts        # Gestionnaire principal des tokens
│   └── encryption-service.ts       # Service de chiffrement/déchiffrement
├── components/
│   └── ApiTokensManager.tsx        # Interface React de gestion
└── app/api/admin/api-tokens/
    ├── route.ts                    # GET & POST tokens
    ├── check-expiring/route.ts     # Vérification expirations
    └── [id]/renew/route.ts         # Renouvellement token

scripts/
└── migrate-all-tokens.ts           # Script de migration .env → DB

prisma/
└── schema.prisma
    └── model ApiToken              # Modèle de données
```

## 🛠 API Reference

### GET /api/admin/api-tokens

Liste tous les tokens (sans les déchiffrer).

**Headers** :
```
Authorization: Bearer <admin_token>
```

**Response** :
```json
[
  {
    "id": "clxxx",
    "service": "WHATSAPP",
    "name": "access_token",
    "expiresAt": "2025-12-15T00:00:00.000Z",
    "createdAt": "2024-10-01T00:00:00.000Z",
    "updatedAt": "2024-10-01T00:00:00.000Z"
  }
]
```

### POST /api/admin/api-tokens

Crée ou met à jour un token.

**Headers** :
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body** :
```json
{
  "service": "WHATSAPP",
  "name": "access_token",
  "token": "EAAxxxxxxxxxxxx",
  "expiresAt": "2025-12-15T00:00:00.000Z"
}
```

### GET /api/admin/api-tokens/check-expiring

Vérifie les tokens qui vont expirer.

**Query params** :
- `days` : Nombre de jours avant expiration (défaut: 7)

**Response** :
```json
{
  "count": 2,
  "message": "2 token(s) expirent dans les 7 prochains jours",
  "tokens": [
    {
      "id": "clxxx",
      "service": "WHATSAPP",
      "name": "access_token",
      "expiresAt": "2025-10-25T00:00:00.000Z",
      "daysLeft": 3
    }
  ]
}
```

### POST /api/admin/api-tokens/[id]/renew

Obtient les instructions de renouvellement pour un token.

**Response** :
```json
{
  "success": true,
  "tokenId": "clxxx",
  "instructions": {
    "service": "WhatsApp",
    "message": "Pour renouveler votre token WhatsApp Business",
    "steps": [
      "1. Connectez-vous à Meta Business Manager...",
      "2. Sélectionnez votre compte WhatsApp Business...",
      "..."
    ],
    "url": "https://business.facebook.com/"
  }
}
```

## 🔧 Maintenance

### Vérification quotidienne automatique (recommandé)

Ajoutez un cron job pour vérifier les tokens quotidiennement :

```typescript
// Dans un fichier de tâches planifiées
import { checkExpiringTokens } from '@/lib/api-token-manager';

async function dailyTokenCheck() {
  const expiringTokens = await checkExpiringTokens(7);

  if (expiringTokens.length > 0) {
    // Envoyer une notification par email
    await sendAdminNotification({
      subject: `⚠️ ${expiringTokens.length} token(s) expirent bientôt`,
      message: `Connectez-vous à l'admin pour renouveler les tokens.`
    });
  }
}
```

### Rotation régulière

Même si un token n'expire pas, il est recommandé de le renouveler régulièrement (tous les 3-6 mois) pour des raisons de sécurité.

## ❓ FAQ

**Q : Que se passe-t-il si un token expire ?**
R : Le système détectera automatiquement l'expiration. Les fonctionnalités utilisant ce token (publication Instagram, envoi WhatsApp, etc.) cesseront de fonctionner jusqu'au renouvellement.

**Q : Puis-je avoir plusieurs tokens pour le même service ?**
R : Oui, vous pouvez stocker plusieurs tokens (ex: test et production) en utilisant des noms différents.

**Q : Comment sauvegarder les tokens ?**
R : Les tokens sont dans la base de données PostgreSQL. Sauvegardez régulièrement votre base de données avec `pg_dump` ou via votre hébergeur.

**Q : Puis-je migrer vers un autre serveur ?**
R : Oui, mais vous devrez migrer :
1. La base de données PostgreSQL (avec les tokens chiffrés)
2. La variable d'environnement `ENCRYPTION_KEY` (même valeur !)

**Q : Comment révoquer un token compromis ?**
R :
1. Supprimez-le de la plateforme d'origine (Meta, Stripe, etc.)
2. Générez un nouveau token
3. Mettez-le à jour dans l'admin LAIA (Sécurité API)

## 📞 Support

Pour toute question ou problème avec le système de gestion des tokens :
1. Vérifiez que la variable `ENCRYPTION_KEY` est bien définie
2. Consultez les logs de l'application
3. Vérifiez les permissions de rôle (`ADMIN` requis)
4. Contactez le support technique

---

**🔒 Sécurité avant tout** : Ne partagez jamais vos tokens API. Utilisez toujours ce système de gestion sécurisée pour les stocker.
