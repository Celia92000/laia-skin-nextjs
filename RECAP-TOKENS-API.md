# 🔐 Récapitulatif : Gestion sécurisée des Tokens API

**Date** : 22 octobre 2025
**Statut** : ✅ Système complet implémenté - Migration à effectuer

---

## 📊 Ce qui a été créé

### 1. Documentation ✅

- **GUIDE-STRIPE-PRODUCTION.md** - Guide complet passage Stripe en production
- **GUIDE-TOKENS-META.md** - Renouvellement WhatsApp, Instagram, Facebook
- **scripts/test-stripe-config.ts** - Script de vérification Stripe

### 2. Système de chiffrement ✅

#### Fichiers existants (déjà présents) :
- ✅ `src/lib/encryption-service.ts` - Chiffrement AES-256-GCM

#### Nouveaux fichiers :
- ✅ `src/lib/api-token-manager.ts` - Gestionnaire de tokens API
- ✅ `scripts/migrate-tokens-to-db.ts` - Migration tokens vers DB

### 3. Base de données ✅

#### Modifications Prisma Schema :
```prisma
enum ApiTokenService {
  WHATSAPP
  INSTAGRAM
  FACEBOOK
  STRIPE
  RESEND
  TWILIO
  CLOUDINARY
  OTHER
}

model ApiToken {
  id               String           @id @default(cuid())
  service          ApiTokenService
  name             String
  tokenEncrypted   String           @db.Text
  expiresAt        DateTime?
  organizationId   String?
  organization     Organization?
  metadata         Json?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}
```

---

## 🎯 Fonctionnalités implémentées

### Chiffrement sécurisé
- ✅ AES-256-GCM (standard militaire)
- ✅ Salt unique par token
- ✅ IV aléatoire
- ✅ Tag d'authentification
- ✅ ENCRYPTION_KEY de 64 caractères

### Gestion des tokens
- ✅ Stockage chiffré en base
- ✅ Récupération déchiffrée
- ✅ Multi-tenant (global ou par organisation)
- ✅ Détection d'expiration
- ✅ Métadonnées JSON
- ✅ Helpers pour chaque service (WhatsApp, Instagram, Facebook, Stripe)

### Sécurité
- ✅ Tokens jamais exposés en clair
- ✅ Chiffrement at-rest (base de données)
- ✅ Clé de chiffrement dans .env (pas en DB)
- ✅ Rotation automatique possible
- ✅ Alertes d'expiration

---

## 🚀 Utilisation

### Étape 1 : Migration Prisma

```bash
# Créer la migration
npx prisma migrate dev --name add_api_tokens

# Générer le client Prisma
npx prisma generate
```

### Étape 2 : Migrer les tokens existants

```bash
# Exécuter la migration (UNE SEULE FOIS)
npx tsx scripts/migrate-tokens-to-db.ts
```

Cela va :
1. Lire les tokens depuis `.env.local`
2. Les chiffrer avec `ENCRYPTION_KEY`
3. Les stocker dans la table `ApiToken`
4. Vérifier les dates d'expiration

### Étape 3 : Utiliser les tokens dans le code

**Avant** (non sécurisé) :
```typescript
const token = process.env.WHATSAPP_ACCESS_TOKEN;
```

**Après** (sécurisé) :
```typescript
import { getWhatsAppToken } from '@/lib/api-token-manager';

const token = await getWhatsAppToken();
// ou pour une organisation spécifique:
const token = await getWhatsAppToken(organizationId);
```

### Étape 4 : Mettre à jour un token

```typescript
import { storeApiToken } from '@/lib/api-token-manager';

await storeApiToken({
  service: 'WHATSAPP',
  name: 'access_token',
  token: 'NOUVEAU_TOKEN_ICI',
  expiresAt: new Date('2026-02-15'),
});
```

---

## 📝 Helpers disponibles

```typescript
// WhatsApp
const whatsappToken = await getWhatsAppToken(organizationId);

// Instagram
const instagramToken = await getInstagramToken(organizationId);

// Facebook
const facebookToken = await getFacebookToken(organizationId);

// Stripe
const stripeKey = await getStripeKey(organizationId);

// Générique
const token = await getApiToken({
  service: 'RESEND',
  name: 'api_key',
  organizationId: 'org_xxx',
});

// Stocker un token
await storeApiToken({
  service: 'WHATSAPP',
  name: 'access_token',
  token: 'EAFWQV0qP...',
  expiresAt: new Date('2026-02-15'),
  organizationId: 'org_xxx', // optionnel
  metadata: { scope: 'messages' }, // optionnel
});

// Lister les tokens
const tokens = await listApiTokens(); // tous
const tokens = await listApiTokens('org_xxx'); // pour une org

// Vérifier les expirations
const expiring = await checkExpiringTokens(7); // 7 jours

// Supprimer un token
await deleteApiToken('token_id');
```

---

## 🔄 Rotation automatique (À implémenter)

### Créer un cron job

```typescript
// src/app/api/cron/refresh-meta-tokens/route.ts
import { NextResponse } from 'next/server';
import { refreshInstagramToken } from '@/lib/meta-token-refresh';
import { storeApiToken } from '@/lib/api-token-manager';

export async function GET(request: Request) {
  // Vérifier le secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Renouveler Instagram
    const newToken = await refreshInstagramToken();

    // Stocker en base (chiffré)
    await storeApiToken({
      service: 'INSTAGRAM',
      name: 'access_token',
      token: newToken,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Configurer Vercel Cron

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

---

## ⚠️ Alertes d'expiration (À implémenter)

### Créer un cron job de vérification

```typescript
// src/app/api/cron/check-token-expiration/route.ts
import { NextResponse } from 'next/server';
import { checkExpiringTokens } from '@/lib/api-token-manager';
import { sendAdminAlert } from '@/lib/email-service';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vérifier tokens expirant dans les 7 jours
  const expiring = await checkExpiringTokens(7);

  if (expiring.length > 0) {
    // Envoyer email d'alerte au super admin
    await sendAdminAlert({
      subject: `⚠️ ${expiring.length} token(s) expirent bientôt`,
      message: expiring.map(t =>
        `- ${t.service}:${t.name} expire le ${t.expiresAt}`
      ).join('\n'),
    });
  }

  return NextResponse.json({
    checked: true,
    expiring: expiring.length,
  });
}
```

Dans `vercel.json` :
```json
{
  "crons": [
    {
      "path": "/api/cron/check-token-expiration",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 📋 Checklist de migration

- [ ] Table `ApiToken` créée (migration Prisma)
- [ ] `ENCRYPTION_KEY` configuré dans .env.local (64 caractères)
- [ ] Migration des tokens exécutée (`npx tsx scripts/migrate-tokens-to-db.ts`)
- [ ] Code mis à jour pour utiliser `getWhatsAppToken()` etc.
- [ ] Tests effectués (récupération tokens, envoi message WhatsApp, etc.)
- [ ] Cron job rotation automatique configuré
- [ ] Cron job alertes d'expiration configuré
- [ ] Documentation équipe mise à jour

---

## 🔒 Bonnes pratiques

### À FAIRE ✅
- Utiliser les helpers (`getWhatsAppToken()` etc.)
- Renouveler les tokens 7 jours avant expiration
- Monitorer les alertes d'expiration
- Tester la rotation automatique
- Garder un backup des tokens

### À NE PAS FAIRE ❌
- Stocker des tokens en clair en base
- Commit ENCRYPTION_KEY dans Git
- Exposer les tokens dans les logs
- Utiliser process.env directement (sauf fallback)
- Ignorer les alertes d'expiration

---

## 🆘 Problèmes courants

### "Erreur lors du déchiffrement"
→ ENCRYPTION_KEY modifié ou corrompu
→ Restaurer l'ancienne clé ou re-migrer les tokens

### "Token expiré"
→ Renouveler le token manuellement
→ Le stocker avec `storeApiToken()`
→ Configurer la rotation automatique

### "Token introuvable en base"
→ Exécuter la migration : `npx tsx scripts/migrate-tokens-to-db.ts`
→ Ou ajouter manuellement avec `storeApiToken()`

---

## 📈 Améliorations futures

- [ ] Interface admin pour gérer les tokens (super-admin)
- [ ] Historique des renouvellements
- [ ] Graphique de santé des tokens
- [ ] Auto-heal en cas d'expiration (rotation automatique)
- [ ] Backup chiffré des tokens dans S3/Supabase Storage
- [ ] Audit trail des accès aux tokens

---

**Prochaines étapes** :
1. Exécuter la migration Prisma
2. Migrer les tokens existants
3. Mettre à jour le code pour utiliser les helpers
4. Configurer les cron jobs
5. Tester le système complet

**Statut** : ✅ Prêt à être déployé après migration
