# 🔒 Rate Limiting - LAIA Connect

**Configuration du rate limiting pour toutes les API routes**

---

## 📊 Vue d'ensemble

LAIA Connect utilise un système de rate limiting complet pour protéger toutes les API routes contre :
- Les attaques DDoS
- Le spam
- Les abus de l'API
- Les tentatives de brute-force

**Technologie** : Upstash Redis avec algorithme sliding window

---

## ✅ Configuration Actuelle

### Rate Limiting Global

**Toutes les routes `/api/*`** sont protégées automatiquement via le middleware Next.js.

| Type | Limite | Fenêtre | Routes concernées |
|------|--------|---------|-------------------|
| **Standard** | 10 requêtes | 10 secondes | Toutes les API routes |
| **Strict** | 5 requêtes | 60 secondes | Routes sensibles |

### Routes avec Rate Limiting Strict (5 req/min)

- `/api/auth/login` - Connexion
- `/api/auth/register` - Inscription
- `/api/auth/forgot-password` - Réinitialisation mot de passe
- `/api/stripe/*` - Paiements
- `/api/payment/*` - Paiements
- `/api/admin/api-tokens` - Gestion tokens API

### Routes avec Rate Limiting Standard (10 req/10s)

Toutes les autres routes API :
- `/api/admin/*` - Administration
- `/api/client/*` - Espace client
- `/api/reviews/*` - Avis
- `/api/newsletter/*` - Newsletter
- etc. (378 routes au total)

---

## 🔧 Architecture

### 1. Middleware Global (`middleware.ts`)

Le rate limiting est appliqué automatiquement à **toutes** les routes API via le middleware Next.js :

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // 🔒 RATE LIMITING sur toutes les routes API
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = getClientIp(request);

    // Déterminer si c'est une route sensible
    const isStrictRoute = strictRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );

    // Appliquer le bon type de rate limiting
    const result = isStrictRoute
      ? await checkStrictRateLimit(ip)
      : await checkRateLimit(ip);

    if (!result.success) {
      return new NextResponse(JSON.stringify({
        error: 'Trop de requêtes...',
        retryAfter: ...
      }), { status: 429 });
    }
  }

  return NextResponse.next();
}
```

### 2. Librairie Rate Limit (`/src/lib/rateLimit.ts`)

Fonctions utilitaires pour le rate limiting :

- `checkRateLimit(ip)` - Rate limiting standard
- `checkStrictRateLimit(ip)` - Rate limiting strict
- `getClientIp(request)` - Extraction de l'IP client
- `isRateLimitEnabled()` - Vérifier si Upstash est configuré

### 3. Configuration Upstash

Variables d'environnement requises :

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxxxxxxxxxxxxxxx
```

---

## 📋 Réponses HTTP

### Requête Autorisée (< limite)

**Status** : `200 OK`

**Headers** :
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2025-11-18T10:30:45.000Z
```

### Requête Bloquée (> limite)

**Status** : `429 Too Many Requests`

**Headers** :
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-11-18T10:30:55.000Z
Retry-After: 10
```

**Body** :
```json
{
  "error": "Trop de requêtes. Veuillez réessayer dans quelques instants.",
  "retryAfter": 10
}
```

---

## 🧪 Tester le Rate Limiting

### Script de test automatique

```bash
# Lancer les tests
npx ts-node scripts/test-rate-limiting.ts
```

Le script teste :
1. Les routes générales (10 req/10s)
2. Les routes sensibles (5 req/60s)
3. Les headers de rate limiting
4. La réponse 429

### Test manuel avec cURL

```bash
# Tester une route standard
for i in {1..15}; do
  echo "Request #$i"
  curl -i http://localhost:3002/api/test-connection
  sleep 0.5
done

# Vous devriez voir des 429 après 10 requêtes

# Tester une route sensible
for i in {1..8}; do
  echo "Request #$i"
  curl -i http://localhost:3002/api/auth/login \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
  sleep 1
done

# Vous devriez voir des 429 après 5 requêtes
```

---

## 🎯 Ajouter une Nouvelle Route Sensible

Pour appliquer un rate limiting strict à une nouvelle route :

### Option 1 : Modifier le middleware

Ajoutez la route dans `middleware.ts` :

```typescript
const strictRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  // ... autres routes ...
  '/api/votre-nouvelle-route', // ⬅️ Ajoutez ici
];
```

### Option 2 : Rate limiting personnalisé dans la route

```typescript
// Dans votre route API
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // Rate limiting personnalisé : 3 requêtes / 30 secondes
  const result = await checkRateLimit(ip, 3, '30 s');

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Trop de requêtes' }),
      { status: 429 }
    );
  }

  // ... votre logique métier ...
}
```

---

## 📈 Monitoring

### Dashboard Upstash

Consultez les statistiques en temps réel :
- Nombre de requêtes
- IPs bloquées
- Patterns d'attaque
- Utilisation de la bande passante

**URL** : https://console.upstash.com/

### Logs Vercel

Les requêtes bloquées (429) sont loggées dans Vercel :

```bash
# Via CLI
vercel logs --filter="status:429"

# Via Dashboard
https://vercel.com/dashboard → Logs → Filter by 429
```

---

## ⚙️ Configuration Avancée

### Modifier les Limites

Dans `/src/lib/rateLimit.ts` :

```typescript
// Rate limiting standard
ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // ⬅️ Modifier ici
  analytics: true,
});

// Rate limiting strict
const strictLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'), // ⬅️ Modifier ici
  analytics: true,
});
```

### Algorithmes Disponibles

Upstash supporte plusieurs algorithmes :

```typescript
// Sliding Window (recommandé)
Ratelimit.slidingWindow(10, '10 s')

// Fixed Window
Ratelimit.fixedWindow(10, '10 s')

// Token Bucket
Ratelimit.tokenBucket(10, '1 d', 5)
```

### Exclure des Routes

Pour exclure certaines routes du rate limiting :

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Routes exclues du rate limiting
  const excludedRoutes = [
    '/api/health',
    '/api/webhook',
  ];

  const isExcluded = excludedRoutes.some(route =>
    request.nextUrl.pathname === route
  );

  if (isExcluded) {
    return NextResponse.next();
  }

  // ... rate limiting normal ...
}
```

---

## 🚨 Gestion des Erreurs

### En Développement (sans Upstash)

Si Upstash n'est pas configuré :
- Le rate limiting est **désactivé**
- Toutes les requêtes sont autorisées
- Un warning apparaît dans les logs :
  ```
  ⚠️ Rate limiting désactivé - Upstash non configuré
  ```

### En Production (avec Upstash)

Si Upstash est indisponible :
- Les requêtes sont autorisées (fail-open)
- Une erreur est loggée
- Le système reste fonctionnel

---

## 🔐 Bonnes Pratiques

### 1. IPs Whitelistées

Pour whitelister certaines IPs (ex: monitoring) :

```typescript
// middleware.ts
const whitelistedIPs = [
  '1.2.3.4', // Monitoring externe
  '5.6.7.8', // Partenaire API
];

if (whitelistedIPs.includes(ip)) {
  return NextResponse.next();
}
```

### 2. Rate Limiting par Utilisateur

Au lieu de par IP, rate limiting par user ID :

```typescript
// Dans votre API route
const userId = await getUserIdFromToken(request);
const result = await checkRateLimit(`user:${userId}`);
```

### 3. Messages d'Erreur Clairs

```typescript
if (!result.success) {
  return new Response(
    JSON.stringify({
      error: 'Trop de requêtes',
      message: 'Vous avez dépassé la limite de 10 requêtes par 10 secondes.',
      retryAfter: result.retryAfter,
      retryAt: result.reset.toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Retry-After': result.retryAfter.toString(),
      }
    }
  );
}
```

---

## 📊 Statistiques

### Couverture

- **378 routes API** protégées automatiquement
- **6 routes sensibles** avec rate limiting strict
- **0 route non protégée** ✅

### Performance

- **Latence ajoutée** : ~5-10ms par requête
- **Utilisation mémoire** : Négligeable (Redis externe)
- **Scalabilité** : Illimitée (Upstash)

---

## 🆘 Dépannage

### Le rate limiting ne fonctionne pas

**1. Vérifier Upstash est configuré**
```bash
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN
```

**2. Vérifier le middleware est actif**
```bash
# Regarder les logs Next.js
# Vous devriez voir "Rate limiting activé"
```

**3. Tester avec cURL**
```bash
for i in {1..15}; do curl -i http://localhost:3002/api/test; done
```

### Trop de requêtes bloquées légitimes

**1. Augmenter les limites**
```typescript
// rateLimit.ts
limiter: Ratelimit.slidingWindow(20, '10 s') // Au lieu de 10
```

**2. Utiliser un algorithme plus permissif**
```typescript
// Token bucket au lieu de sliding window
limiter: Ratelimit.tokenBucket(10, '1 m', 5)
```

---

## 📞 Support

**En cas de problème** :
- Consulter les logs Vercel
- Vérifier le dashboard Upstash
- Contacter : tech@laiaconnect.fr

---

**Dernière mise à jour** : 18 novembre 2025
**Version** : 1.0
**Auteur** : LAIA Connect - Équipe Sécurité
