# 🔒 Configuration Rate Limiting (Upstash Redis)

## ⚠️ IMPORTANT - Protection Anti-Spam Activée

Le rate limiting est **ESSENTIEL** pour la commercialisation de LAIA Connect et LAIA Skin Institut.

### 🎯 Routes Protégées

| Route | Limite | Fenêtre | Protection |
|-------|--------|---------|------------|
| `/api/auth/login` | 5 requêtes | 1 minute | ✅ Brute force |
| `/api/auth/register` | 5 requêtes | 1 minute | ✅ Spam inscriptions |
| `/api/contact` | 10 requêtes | 1 heure | ✅ Spam emails |

---

## 📦 Installation

### 1. Créer un compte Upstash (GRATUIT)

1. Aller sur **https://upstash.com**
2. S'inscrire (GitHub/Google/Email)
3. Créer une nouvelle base **Redis**

**Offre gratuite** : 10 000 requêtes/jour (suffisant pour démarrer)

### 2. Récupérer les clés API

Dans votre dashboard Upstash :
1. Cliquer sur votre base Redis
2. Aller dans l'onglet **"REST API"**
3. Copier :
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 3. Configurer les variables d'environnement

Ajouter dans `.env.local` :

```bash
# 🔒 Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 4. Redémarrer le serveur

```bash
npm run dev
```

---

## ✅ Vérification

### Test en développement

```bash
# Vérifier que le rate limiting est actif
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' \
  -i
```

**Résultat attendu** après 5 tentatives :
```json
{
  "error": "Trop de tentatives. Veuillez réessayer dans 1 minute. (0/5 restantes)"
}
```
**Status**: `429 Too Many Requests`

---

## 🔧 Configuration Avancée

### Personnaliser les limites

Éditer `src/lib/rateLimit.ts` :

```typescript
// Login : 10 tentatives au lieu de 5
export async function checkLoginRateLimit(identifier: string) {
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'), // ← Modifier ici
  });
  return await limiter.limit(identifier);
}
```

### Ajouter sur d'autres routes

```typescript
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  // Protection anti-spam
  const ip = getClientIp(request);
  const { success } = await checkRateLimit(`myroute:${ip}`, 20, '60 s');

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes' },
      { status: 429 }
    );
  }

  // ... votre code
}
```

---

## 💰 Coûts Upstash

### Plan Gratuit (Recommandé pour démarrer)
- ✅ **10 000 commandes/jour** (suffisant pour 100-500 utilisateurs)
- ✅ **1 base Redis**
- ✅ Pas de carte bancaire requise

### Plan Pay-as-you-go (Si besoin)
- 💰 **0,20$ / 100 000 commandes**
- Exemple : 1 million de requêtes/mois = ~2$/mois

### Calcul pour LAIA Connect
**Estimation** : 50 organisations × 20 utilisateurs × 10 requêtes/jour
= **10 000 requêtes/jour** → **Plan gratuit suffisant** ✅

---

## 🚨 Que se passe-t-il sans Upstash ?

### Mode Développement (sans clés)
⚠️ **Rate limiting DÉSACTIVÉ** - Warning dans les logs :
```
⚠️ Rate limiting désactivé - Upstash non configuré
```

### Production (sans clés)
🔴 **DANGEREUX** - Site vulnérable aux :
- Attaques par force brute (login)
- Spam d'inscriptions (register)
- Flood de messages (contact)
- Déni de service (DDoS)

➡️ **Obligatoire avant commercialisation !**

---

## 📊 Monitoring

### Dashboard Upstash
- Voir le nombre de requêtes en temps réel
- Analytics par endpoint
- Alertes si dépassement

### Logs Next.js
```bash
# Voir les IPs bloquées
tail -f .next/trace | grep "429"
```

---

## 🔐 Sécurité des Clés

### ✅ Bonnes Pratiques
- ✅ Stocker dans `.env.local` (jamais dans le code)
- ✅ Ajouter `.env.local` dans `.gitignore`
- ✅ Utiliser des clés différentes pour dev/staging/prod
- ✅ Rotation tous les 90 jours

### ❌ À NE JAMAIS FAIRE
- ❌ Commit des clés dans Git
- ❌ Partager les clés par email/Slack
- ❌ Utiliser les mêmes clés en dev et prod
- ❌ Hard-coder les clés dans le code

---

## 🆘 Dépannage

### Problème : "Rate limiting désactivé"
**Solution** : Vérifier que les variables d'environnement sont bien configurées
```bash
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN
```

### Problème : "Redis connection failed"
**Solutions** :
1. Vérifier que l'URL/Token sont corrects
2. Tester la connexion : https://console.upstash.com
3. Vérifier le firewall (autoriser upstash.io)

### Problème : "429 Too Many Requests" légitime
**Solution** : Augmenter les limites dans `src/lib/rateLimit.ts`

---

## 📞 Support

- **Documentation Upstash** : https://docs.upstash.com/redis
- **Status Upstash** : https://status.upstash.com
- **Discord Upstash** : https://upstash.com/discord

---

## ✅ Checklist Avant Production

- [ ] Compte Upstash créé
- [ ] Base Redis créée
- [ ] Variables d'environnement configurées
- [ ] Tests de rate limiting effectués
- [ ] Monitoring activé
- [ ] Clés sécurisées (pas dans Git)
- [ ] Plan tarifaire adapté au trafic

---

**Date de création** : 2025-01-19
**Validité** : Permanent
**Obligatoire pour commercialisation** : OUI ✅
