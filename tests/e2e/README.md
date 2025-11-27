# Tests E2E LAIA Connect

## Configuration

Les tests E2E sont configurés avec Playwright et testent les parcours principaux de LAIA Connect.

### Prérequis

1. **Installer les dépendances système Chromium** :
   ```bash
   npx playwright install-deps chromium
   ```

   Ou manuellement sur Ubuntu/Debian :
   ```bash
   sudo apt-get update
   sudo apt-get install -y \
     libnss3 \
     libnspr4 \
     libatk1.0-0 \
     libatk-bridge2.0-0 \
     libcups2 \
     libdrm2 \
     libxkbcommon0 \
     libxcomposite1 \
     libxdamage1 \
     libxfixes3 \
     libxrandr2 \
     libgbm1 \
     libasound2
   ```

2. **Installer Playwright et Chromium** :
   ```bash
   npx playwright install chromium
   ```

3. **Configurer les identifiants de test** :

   Les tests utilisent les identifiants définis dans `helpers.ts` :
   - Super Admin : `admin@laia-connect.fr`
   - Org Admin : `test-org@example.com`
   - Staff : `staff-test@example.com`

   **Important** : Assurez-vous que ces comptes existent dans votre base de données de test avec le mot de passe `TestPassword123!`

## Structure des tests

### 01-onboarding.spec.ts
Teste le parcours complet d'inscription et onboarding :
- Chargement de la page d'accueil
- Connexion avec compte ORG_ADMIN
- Vérification du wizard de configuration
- Navigation dans l'admin
- Vérification du site vitrine

### 02-user-roles.spec.ts
Teste les différents rôles utilisateurs :
- SUPER_ADMIN : Accès complet au super-admin
- ORG_ADMIN : Accès admin organisation (sans super-admin)
- STAFF : Accès employé limité
- Multi-tenant : Isolation des données entre organisations

### 03-stripe-payments.spec.ts
Teste les paiements Stripe :
- Abonnement SOLO
- Webhook Stripe
- Changement de plan (upgrade/downgrade)
- Annulation d'abonnement
- Historique des paiements

### 04-invoices.spec.ts
Teste la génération de factures :
- Génération de facture pour un service
- Téléchargement PDF
- Liste des factures
- Envoi par email
- Recherche et filtres
- Vérification des informations légales

## Commandes

### Lancer tous les tests
```bash
npm run test:e2e
```

### Lancer en mode UI (interface graphique)
```bash
npm run test:e2e:ui
```

### Lancer en mode headed (avec navigateur visible)
```bash
npm run test:e2e:headed
```

### Déboguer un test
```bash
npm run test:e2e:debug
```

### Lancer un fichier de test spécifique
```bash
npx playwright test tests/e2e/01-onboarding.spec.ts
```

### Voir le rapport HTML
```bash
npm run test:e2e:report
```

## Configuration Playwright

Le fichier `playwright.config.ts` contient la configuration :
- **baseURL** : `http://localhost:3001`
- **workers** : 1 (séquentiel pour éviter les conflits multi-tenant)
- **fullyParallel** : false
- **retries** : 0 en dev, 2 en CI
- **timeout** : 30s par défaut, modifiable par test avec `test.setTimeout()`

## Serveur de développement

Playwright démarre automatiquement le serveur Next.js sur le port 3001 avant de lancer les tests.

Si vous voulez démarrer le serveur manuellement :
```bash
npm run dev
```

Puis lancer les tests avec le serveur existant :
```bash
npx playwright test --headed
```

## Debugging

### Screenshots et vidéos

En cas d'échec, Playwright capture automatiquement :
- Screenshots : `test-results/*/test-failed-1.png`
- Vidéos : `test-results/*/video.webm`
- Traces : `test-results/*/trace.zip`

### Voir une trace
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Mode debug interactif
```bash
npx playwright test --debug
```

## Tests CI/CD

Pour GitHub Actions ou autre CI :
```bash
npm run test:e2e:ci
```

Cela génère un rapport HTML dans `playwright-report/`.

## Notes importantes

1. **Multi-tenant** : Les tests utilisent l'isolation par `organizationId`
2. **Base de données** : Utilisez une base de test séparée ou nettoyez entre les tests
3. **Stripe** : Les tests Stripe nécessitent des clés API de test
4. **WhatsApp** : Désactivez les envois WhatsApp en environnement de test

## Dépannage

### Erreur "libnspr4.so not found"
Installez les dépendances système Chromium (voir Prérequis ci-dessus)

### Tests timeout
Augmentez le timeout dans le test :
```typescript
test.setTimeout(120000); // 2 minutes
```

### Base de données non disponible
Vérifiez que PostgreSQL est accessible et que les variables d'environnement sont correctes dans `.env.local`

### Port 3001 déjà utilisé
Arrêtez le serveur existant ou changez le port dans `playwright.config.ts`
