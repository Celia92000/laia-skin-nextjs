# 📋 Guide d'installation du Workflow GitHub Actions

## Étapes pour activer les tests automatiques

### 1. Créer le fichier workflow

1. Aller sur GitHub : https://github.com/Celia92000/laia-skin-nextjs
2. Cliquer sur **"Create new file"**
3. Nommer le fichier : `.github/workflows/e2e-tests.yml`
4. Copier le contenu du fichier `github-workflow-e2e.yml.example`

### 2. Configurer les secrets GitHub

1. Aller dans **Settings** → **Secrets and variables** → **Actions**
2. Ajouter ces secrets :

```
DATABASE_URL = [votre DATABASE_URL de .env.local]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = [votre clé Stripe publique]
```

### 3. Activer GitHub Actions

1. Aller dans l'onglet **Actions**
2. Cliquer sur **"I understand my workflows, go ahead and enable them"**

### 4. Vérifier que ça fonctionne

Les tests s'exécuteront automatiquement à chaque :
- Push sur `main` ou `develop`
- Pull Request vers `main`

## ✅ Résultat attendu

- Tests E2E automatiques sur chaque commit
- Rapport HTML généré
- Screenshots en cas d'échec
- Badge de statut sur README

## 🚨 Important

Le workflow utilise des valeurs de test pour JWT_SECRET et ENCRYPTION_KEY en CI.
Les vraies clés restent sécurisées dans votre .env.local.