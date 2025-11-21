# 🔍 Sentry - Monitoring des Erreurs et Performance

**Configuration et activation de Sentry pour LAIA Connect**

---

## 📋 Vue d'ensemble

Sentry est **déjà entièrement configuré** dans le code de LAIA Connect. Il ne reste plus qu'à l'activer en production en ajoutant la clé DSN.

**Fichiers de configuration existants** :
- ✅ `sentry.client.config.ts` - Monitoring côté navigateur
- ✅ `sentry.server.config.ts` - Monitoring côté serveur
- ✅ `sentry.edge.config.ts` - Monitoring edge functions

**Ce qui est surveillé** :
- ❌ Erreurs JavaScript/TypeScript (client + serveur)
- 📊 Performance des pages et API routes
- 🎥 Replay de sessions (10% normal, 100% sur erreur)
- 👤 Contexte utilisateur (email, rôle, tenant)
- 🌐 Environnement (production uniquement)

---

## 🚀 Activation en 3 Étapes

### Étape 1 : Créer un compte Sentry

1. Aller sur **https://sentry.io/signup/**
2. Créer un compte gratuit (quota : 5 000 erreurs/mois)
3. Créer un nouveau projet :
   - **Platform** : Next.js
   - **Project name** : laia-connect
   - **Alert frequency** : Every event

### Étape 2 : Récupérer le DSN

Une fois le projet créé, Sentry affiche votre **DSN** (Data Source Name).

**Format du DSN** :
```
https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o0000000.ingest.us.sentry.io/0000000
```

**Où le trouver** :
- Settings → Projects → laia-connect → Client Keys (DSN)

### Étape 3 : Ajouter le DSN à Vercel

#### Via le Dashboard Vercel

1. Aller sur **https://vercel.com/dashboard**
2. Sélectionner le projet **laia-skin-institut-as92**
3. Aller dans **Settings → Environment Variables**
4. Ajouter une nouvelle variable :
   - **Name** : `NEXT_PUBLIC_SENTRY_DSN`
   - **Value** : `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
   - **Environment** : Production, Preview, Development
5. Cliquer sur **Save**
6. **Redéployer** l'application

#### Via la CLI Vercel

```bash
# Se placer dans le projet
cd /home/celia/laia-connect

# Ajouter la variable d'environnement
vercel env add NEXT_PUBLIC_SENTRY_DSN

# Sélectionner tous les environnements (production, preview, development)
# Coller votre DSN

# Redéployer
vercel --prod
```

---

## 🧪 Tester l'Intégration

### 1. Vérifier que Sentry est actif

Après le déploiement, vérifier dans les logs Vercel :

```bash
vercel logs --filter="Sentry"
```

Vous devriez voir :
```
✓ Sentry initialized (client)
✓ Sentry initialized (server)
✓ Sentry initialized (edge)
```

### 2. Déclencher une erreur de test

Créer une route API de test :

```typescript
// src/app/api/test-sentry/route.ts
export async function GET() {
  throw new Error('🧪 Test Sentry - Cette erreur devrait apparaître dans Sentry');
}
```

Puis appeler :
```bash
curl https://laia-skin-institut-as92.vercel.app/api/test-sentry
```

### 3. Vérifier dans Sentry Dashboard

1. Aller sur **https://sentry.io/organizations/[votre-org]/issues/**
2. L'erreur devrait apparaître en quelques secondes
3. Cliquer dessus pour voir :
   - Stack trace complète
   - Contexte utilisateur (si connecté)
   - Breadcrumbs (actions avant l'erreur)
   - Session replay (si disponible)

---

## 📊 Dashboard Sentry

### Sections Importantes

**Issues** (Problèmes)
- Liste de toutes les erreurs détectées
- Groupées par similarité
- Tri par fréquence ou gravité

**Performance**
- Temps de chargement des pages
- Durée des API routes
- Web Vitals (LCP, FID, CLS)

**Replays**
- Enregistrements vidéo des sessions
- Replay automatique sur erreur
- 10% des sessions normales

**Releases**
- Suivi des versions déployées
- Comparaison avant/après déploiement
- Détection de régressions

### Alertes Recommandées

1. **Nouvelle erreur critique**
   - Type : Issue Alert
   - Condition : `level:error` AND `is:unresolved` AND `is:new`
   - Action : Email immédiat

2. **Performance dégradée**
   - Type : Metric Alert
   - Condition : `avg(transaction.duration) > 3000ms`
   - Action : Email quotidien

3. **Taux d'erreur élevé**
   - Type : Metric Alert
   - Condition : `percentage(users_experiencing_errors) > 5%`
   - Action : Email immédiat

---

## ⚙️ Configuration Actuelle

### Performance Sampling (10%)

```typescript
// sentry.server.config.ts
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
```

**Pourquoi 10% ?**
- Économise le quota Sentry (gratuit = 5k événements/mois)
- 10% suffit pour détecter les problèmes
- En dev : 100% pour debug complet

### Session Replay

```typescript
// sentry.client.config.ts
replaysSessionSampleRate: 0.1,  // 10% des sessions normales
replaysOnErrorSampleRate: 1.0,  // 100% des sessions avec erreur
```

**Comment ça marche ?**
- 1 session sur 10 est enregistrée automatiquement
- Toutes les sessions avec erreur sont enregistrées
- Vidéo de 60 secondes avant + après l'erreur

### Filtrage Intelligent

```typescript
// sentry.server.config.ts
beforeSend(event, hint) {
  // Ignorer les erreurs 404
  if (event.request?.url?.includes('/api/') && hint.originalException?.statusCode === 404) {
    return null;
  }

  // Ignorer les redirections
  if (hint.originalException?.digest?.startsWith('NEXT_REDIRECT')) {
    return null;
  }

  // Ignorer les bots
  const userAgent = event.request?.headers?.['user-agent'];
  if (userAgent && /bot|crawler|spider/i.test(userAgent)) {
    return null;
  }

  return event;
}
```

**Erreurs ignorées** :
- ❌ 404 Not Found (normale)
- ❌ Redirections Next.js (normale)
- ❌ Requêtes de bots/crawlers

### Enrichissement du Contexte

```typescript
// sentry.server.config.ts
beforeSend(event) {
  // Ajouter des tags personnalisés
  event.tags = {
    ...event.tags,
    environment: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION,
  };

  return event;
}
```

---

## 💰 Gestion du Quota

### Plan Gratuit Sentry

- **5 000 erreurs** / mois
- **50 replays** / mois
- **10 000 transactions** / mois
- **1 projet**
- **Rétention** : 30 jours

### Optimiser le Quota

**1. Augmenter le sampling si nécessaire**

Si vous ne dépassez pas le quota :
```typescript
// Passer de 10% à 50%
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,
```

**2. Grouper les erreurs similaires**

Sentry groupe automatiquement, mais vous pouvez améliorer :
```typescript
beforeSend(event) {
  // Grouper par type d'erreur, pas par message
  if (event.exception?.values?.[0]) {
    event.fingerprint = [
      event.exception.values[0].type,
      event.exception.values[0].value?.split(':')[0],
    ];
  }
  return event;
}
```

**3. Limiter les replays**

Si trop de replays :
```typescript
// Réduire à 5% au lieu de 10%
replaysSessionSampleRate: 0.05,
```

**4. Filtrer plus strictement**

Ignorer les erreurs non-critiques :
```typescript
beforeSend(event, hint) {
  // Ignorer les erreurs réseau temporaires
  if (hint.originalException?.message?.includes('NetworkError')) {
    return null;
  }
  return event;
}
```

---

## 🔐 RGPD et Confidentialité

### Données Collectées

Sentry collecte automatiquement :
- ✅ Erreurs et stack traces
- ✅ URL et headers HTTP
- ✅ User agent
- ✅ IP (anonymisée par défaut)
- ⚠️ Données utilisateur (si configuré)

### Protection des Données Sensibles

**Suppression automatique des données sensibles** :

```typescript
// sentry.client.config.ts
beforeSend(event) {
  // Supprimer les mots de passe des breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
      if (breadcrumb.data) {
        delete breadcrumb.data.password;
        delete breadcrumb.data.token;
        delete breadcrumb.data.apiKey;
      }
      return breadcrumb;
    });
  }

  // Anonymiser les emails
  if (event.user?.email) {
    event.user.email = event.user.email.replace(/^(.{2}).*@/, '$1***@');
  }

  return event;
}
```

**Localisation des données** :
- **Serveurs Sentry** : US ou EU (configurable)
- **RGPD** : Sentry est conforme RGPD
- **DPA** : Accord de traitement de données disponible

**Configurer l'hébergement EU** :

Dans le DSN, remplacer `ingest.us.sentry.io` par `ingest.eu.sentry.io` :
```
https://xxxxx@xxxxx.ingest.eu.sentry.io/xxxxx
```

### Informer les Utilisateurs

Ajouter à la **Politique de Confidentialité** :

> Nous utilisons Sentry (sentry.io) pour surveiller les erreurs techniques et améliorer la stabilité de notre plateforme. Sentry collecte des informations techniques (type d'erreur, navigateur, URL) mais aucune donnée personnelle identifiable n'est transmise. Les données sont hébergées dans l'Union Européenne et conservées 30 jours.

---

## 🚨 Alertes et Notifications

### Configuration des Alertes

1. **Aller dans Settings → Alerts**
2. **Create Alert Rule**
3. Choisir le type :

**Alerte Immédiate (Critical Errors)**
```yaml
When: An event is captured
If: level equals error OR fatal
Then: Send a notification to #tech-alerts (Slack)
```

**Alerte Quotidienne (New Issues)**
```yaml
When: An event is captured
If: is new AND level not equals info
Then: Send email digest once per day
```

**Alerte Performance (Slow APIs)**
```yaml
When: avg(transaction.duration) for /api/*
If: is greater than 3000ms over 5 minutes
Then: Send notification to admin@laiaconnect.fr
```

### Intégrations Disponibles

- **Email** (inclus)
- **Slack** (recommandé)
- **Discord**
- **PagerDuty** (payant)
- **Webhooks** (personnalisé)

---

## 📈 Métriques Importantes

### Erreurs à Surveiller

1. **Taux d'erreur global**
   - Objectif : < 0.1%
   - Alerte si > 1%

2. **Erreurs critiques**
   - Objectif : 0
   - Alerte immédiate

3. **Temps de résolution**
   - Objectif : < 24h
   - Mesure : Temps entre détection et résolution

### Performance à Surveiller

1. **LCP (Largest Contentful Paint)**
   - Objectif : < 2.5s
   - Mesure : Temps de chargement du contenu principal

2. **FID (First Input Delay)**
   - Objectif : < 100ms
   - Mesure : Temps de réponse à la première interaction

3. **CLS (Cumulative Layout Shift)**
   - Objectif : < 0.1
   - Mesure : Stabilité visuelle de la page

---

## 🔧 Dépannage

### Sentry ne détecte pas les erreurs

**1. Vérifier que le DSN est bien configuré**
```bash
# Dans Vercel
vercel env ls

# Le DSN doit apparaître
```

**2. Vérifier que l'environnement est "production"**
```typescript
// Sentry n'est actif qu'en production
if (process.env.NODE_ENV === 'production') {
  Sentry.init({ ... });
}
```

**3. Vérifier les logs de build**
```bash
vercel logs --filter="sentry"
```

### Trop d'erreurs remontées

**1. Augmenter le filtrage**
```typescript
beforeSend(event, hint) {
  // Ignorer les erreurs mineures
  if (event.level === 'warning' || event.level === 'info') {
    return null;
  }
  return event;
}
```

**2. Grouper les erreurs similaires**

Dans Sentry Dashboard :
- **Merge Issues** → Grouper les doublons
- **Ignore** → Ignorer les erreurs connues/normales

### Replays ne fonctionnent pas

**1. Vérifier que le package est installé**
```bash
npm list @sentry/nextjs
```

**2. Vérifier la configuration client**
```typescript
// sentry.client.config.ts
integrations: [
  Sentry.replayIntegration({
    maskAllText: true,
    blockAllMedia: true,
  }),
],
```

---

## 📚 Ressources

**Documentation** :
- Sentry Docs : https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Next.js Integration : https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

**Dashboard** :
- Sentry Dashboard : https://sentry.io/
- Issues : https://sentry.io/organizations/[org]/issues/
- Performance : https://sentry.io/organizations/[org]/performance/

**Support** :
- Sentry Support : https://sentry.io/support/
- Community Forum : https://forum.sentry.io/

---

## ✅ Checklist de Déploiement

Avant de déployer en production :

- [ ] Compte Sentry créé
- [ ] Projet "laia-connect" créé dans Sentry
- [ ] DSN récupéré
- [ ] Variable `NEXT_PUBLIC_SENTRY_DSN` ajoutée à Vercel
- [ ] Application redéployée
- [ ] Erreur de test déclenchée
- [ ] Erreur visible dans Sentry Dashboard
- [ ] Alertes email configurées
- [ ] Politique de confidentialité mise à jour (mention Sentry)
- [ ] Équipe informée du nouveau monitoring

---

## 🎯 Prochaines Étapes

Après activation de Sentry :

1. **Configurer les alertes Slack** (si applicable)
2. **Créer un tableau de bord personnalisé**
3. **Définir des SLOs (Service Level Objectives)** :
   - 99.9% uptime
   - < 0.1% taux d'erreur
   - < 2.5s temps de chargement
4. **Mettre en place une routine de revue hebdomadaire** des erreurs

---

**Dernière mise à jour** : 18 novembre 2025
**Version** : 1.0
**Auteur** : LAIA Connect - Équipe DevOps
