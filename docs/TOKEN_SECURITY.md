# 🔐 Sécurité et Rotation des Tokens API

## ✅ Ce qui est déjà en place

### 1. Chiffrement AES-256-CBC
Tous les tokens API sont chiffrés en base de données avec l'algorithme AES-256-CBC.

**Fichiers concernés :**
- `/src/lib/encryption-service.ts` : Service de chiffrement/déchiffrement
- `/src/lib/api-token-manager.ts` : Gestion des tokens avec chiffrement automatique

**Services protégés :**
- Instagram Access Token
- Facebook Page Access Token
- WhatsApp Access Token
- Stripe Secret Key
- Stripe Webhook Secret
- Resend API Key
- Snapchat Access Token
- TikTok Access Token

### 2. Support Multi-tenant
Chaque organisation a ses propres tokens chiffrés, isolés des autres.

### 3. Détection automatique des tokens expirants
- **Cron job quotidien** : Tous les jours à 8h00 UTC
- **Alertes** : Notifications 7 jours avant expiration
- **Endpoint** : `/api/cron/check-tokens`

## 📋 Configuration requise

### Variables d'environnement obligatoires

```bash
# Clé de chiffrement (32 bytes en hex = 64 caractères)
# Générer avec : openssl rand -hex 32
ENCRYPTION_KEY=votre_cle_de_chiffrement_64_caracteres

# Secret pour sécuriser les cron jobs
CRON_SECRET=votre_secret_cron
```

### Vercel Cron Jobs

Le fichier `vercel.json` configure automatiquement le cron job :

```json
{
  "crons": [
    {
      "path": "/api/cron/check-tokens",
      "schedule": "0 8 * * *"  // Tous les jours à 8h UTC
    }
  ]
}
```

## 🔄 Rotation manuelle des tokens

### Via l'interface admin

1. Aller dans **Admin → Paramètres → Intégrations**
2. Sélectionner le service (Instagram, Facebook, etc.)
3. Cliquer sur **"Renouveler le token"**
4. Suivre les instructions spécifiques au service

### Via l'API

```bash
curl -X POST https://your-domain.com/api/admin/settings/api-tokens \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "INSTAGRAM",
    "name": "access_token",
    "token": "NOUVEAU_TOKEN",
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

## 📊 Surveillance des tokens

### Vérifier les tokens expirants

```bash
# En développement
npm run check-tokens

# En production (via cron)
curl https://your-domain.com/api/cron/check-tokens \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Consulter les logs

Les logs incluent :
- ✅ Tokens migrés avec succès
- ⚠️  Tokens qui expirent bientôt (7 jours)
- ❌ Tokens expirés
- 🔄 Tentatives de rotation

## 🚨 Gestion des alertes

### Notifications créées automatiquement

Quand un token expire dans 7 jours :
1. **Notification dans l'app** pour tous les admins de l'organisation
2. **Priority** : `high` si < 3 jours, `medium` sinon
3. **Lien direct** vers les paramètres pour renouveler

### Types de notifications

```typescript
{
  type: 'token_expiring',
  title: 'Token INSTAGRAM expire bientôt',
  message: 'Votre token INSTAGRAM/access_token expire dans 5 jour(s). Pensez à le renouveler.',
  link: '/admin/settings',
  priority: 'high' | 'medium'
}
```

## 🔒 Bonnes pratiques

### ✅ À FAIRE

1. **Rotation préventive** : Renouveler les tokens Meta (Instagram/Facebook) tous les 50 jours (ils expirent à 60j)
2. **Clé de chiffrement unique** : Utiliser une clé différente par environnement (dev/prod)
3. **Backup des tokens** : Sauvegarder `ENCRYPTION_KEY` dans un gestionnaire de secrets (1Password, Bitwarden)
4. **Monitoring** : Vérifier les logs du cron job quotidiennement

### ❌ À NE PAS FAIRE

1. **Ne jamais commit** la clé `ENCRYPTION_KEY` dans git
2. **Ne jamais partager** les tokens via email/Slack
3. **Ne pas réutiliser** la même clé de chiffrement sur plusieurs projets
4. **Ne pas désactiver** les cron jobs de vérification

## 📖 Guides de renouvellement par service

### Instagram / Facebook (Meta)

**Durée de vie** : 60 jours

**Renouvellement** :
1. Aller sur https://developers.facebook.com
2. Sélectionner votre app Meta
3. Aller dans **Outils → Token d'accès**
4. Générer un nouveau token longue durée
5. Le copier dans l'interface admin LAIA

**Permissions requises** :
- `instagram_basic`
- `instagram_manage_insights`
- `pages_read_engagement`
- `pages_manage_posts`

### WhatsApp Business API

**Durée de vie** : Permanent (mais peut être révoqué)

**Renouvellement** : Seulement si révoqué manuellement

### Stripe

**Durée de vie** : Permanent

**Renouvellement** : Seulement en cas de compromission

## 🧪 Tests

### Tester le cron job localement

```bash
# Avec le bon secret
curl http://localhost:3001/api/cron/check-tokens \
  -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)"

# Devrait retourner la liste des tokens expirants
```

### Tester le chiffrement

```typescript
import { encrypt, decrypt } from '@/lib/encryption-service';

const token = 'mon_token_secret';
const encrypted = encrypt(token);
console.log('Chiffré:', encrypted);

const decrypted = decrypt(encrypted);
console.log('Déchiffré:', decrypted);
console.log('Match:', token === decrypted); // true
```

## 📞 En cas de problème

### Token compromis

1. **Révoquer immédiatement** le token depuis la plateforme (Meta, Stripe, etc.)
2. **Générer un nouveau token**
3. **Le mettre à jour** dans l'interface admin
4. **Vérifier les logs** d'accès pour détecter toute activité suspecte

### Token expiré

1. Le cron job crée automatiquement une notification
2. Suivre le lien dans la notification
3. Renouveler le token selon le guide du service
4. Le système détectera automatiquement le nouveau token

### Erreur de déchiffrement

Si vous voyez `Erreur lors du déchiffrement`, cela signifie :
- La clé `ENCRYPTION_KEY` a changé
- Les données en base ont été corrompues

**Solution** : Utiliser le fallback automatique vers les variables d'environnement (déjà implémenté)

## 📈 Métriques de sécurité

| Métrique | Valeur cible | Actuel |
|----------|--------------|--------|
| Tokens chiffrés | 100% | ✅ 100% |
| Rotation < 7j avant expiration | 100% | ✅ Auto |
| Détection expiration | Quotidienne | ✅ 8h00 UTC |
| Notifications admins | 100% | ✅ 100% |
| Multi-tenant isolation | 100% | ✅ 100% |

## 🔄 Historique des versions

- **v1.0** (Oct 2025) : Implémentation initiale du chiffrement AES-256
- **v1.1** (Oct 2025) : Ajout du support multi-tenant
- **v1.2** (Oct 2025) : Détection automatique des tokens expirants
- **v1.3** (Oct 2025) : Cron job quotidien de vérification
