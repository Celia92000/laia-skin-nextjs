# 📧 Migration Email Templates - Guide d'installation

Ce document explique comment appliquer manuellement les migrations pour le système de gestion des templates d'emails d'onboarding.

## 📋 Prérequis

- Accès à votre base de données Supabase
- Connexion au projet LAIA Connect sur Supabase

## 🚀 Étapes d'installation

### Étape 1 : Se connecter à Supabase

1. Aller sur [https://supabase.com](https://supabase.com)
2. Se connecter à votre compte
3. Sélectionner le projet **LAIA Connect**
4. Aller dans **SQL Editor** (menu de gauche)

### Étape 2 : Exécuter la migration de la structure

1. Cliquer sur **New query** dans SQL Editor
2. Copier-coller le contenu du fichier : `prisma/migrations/manual_enhance_email_templates.sql`
3. Cliquer sur **Run** (ou `Ctrl+Enter`)
4. Vérifier qu'aucune erreur n'apparaît
5. Vous devriez voir un message de confirmation avec le nombre de templates

**Ce script fait :**
- ✅ Ajoute les nouvelles colonnes à la table `email_templates`
- ✅ Crée les index pour optimiser les requêtes
- ✅ Ajoute la contrainte unique sur `(slug, organizationId)`

### Étape 3 : Insérer les templates par défaut

1. Cliquer sur **New query** dans SQL Editor
2. Copier-coller le contenu du fichier : `prisma/migrations/manual_seed_email_templates.sql`
3. Cliquer sur **Run** (ou `Ctrl+Enter`)
4. Vérifier que 3 templates ont été créés

**Ce script crée :**
- ✅ **Template "onboarding-welcome"** (ACTIF) - Email de bienvenue complet
- ✅ **Template "onboarding-pending"** (INACTIF) - Confirmation de paiement
- ✅ **Template "onboarding-activation"** (INACTIF) - Activation différée

### Étape 4 : Vérifier l'installation

Dans SQL Editor, exécuter cette requête pour vérifier :

```sql
SELECT
  slug,
  name,
  isActive,
  isSystem,
  category,
  createdAt
FROM email_templates
WHERE organizationId IS NULL
  AND category = 'onboarding'
ORDER BY isActive DESC, slug ASC;
```

Vous devriez voir 3 lignes avec les templates d'onboarding.

## 🎯 Utilisation après l'installation

### Accéder à la gestion des templates

1. Se connecter en tant que **Super Admin** : http://localhost:3001/super-admin
2. Aller dans **📧 Automatisations & Templates Email**
3. Onglet **🎉 Templates d'Onboarding**

### Fonctionnalités disponibles

- ✅ **Voir tous les templates** d'onboarding
- ✅ **Modifier un template** (sujet, contenu HTML, variables)
- ✅ **Prévisualiser** un template
- ✅ **Activer/Désactiver** un template
- ✅ **Créer de nouveaux templates** personnalisés
- ⚠️ **Templates système** (marqués avec badge "SYSTÈME") ne peuvent pas être supprimés

### API disponibles

Une fois la migration appliquée, vous pouvez utiliser ces endpoints :

```bash
# Lister tous les templates d'onboarding
GET /api/super-admin/onboarding-templates

# Récupérer un template spécifique
GET /api/super-admin/onboarding-templates/:id

# Créer un nouveau template
POST /api/super-admin/onboarding-templates
{
  "slug": "onboarding-custom",
  "name": "Mon template personnalisé",
  "subject": "Sujet de l'email",
  "content": "<html>...</html>",
  "category": "onboarding"
}

# Modifier un template
PATCH /api/super-admin/onboarding-templates/:id
{
  "subject": "Nouveau sujet",
  "content": "<html>Nouveau contenu...</html>"
}

# Supprimer un template (sauf templates système)
DELETE /api/super-admin/onboarding-templates/:id
```

## 🔧 En cas de problème

### Erreur "Column already exists"

Si vous obtenez une erreur disant que les colonnes existent déjà, c'est que la migration a déjà été appliquée. Passez directement à l'étape 3.

### Erreur "Unique constraint violation"

Si vous obtenez une erreur de contrainte unique lors de l'insertion des templates, c'est qu'ils existent déjà. Vous pouvez les mettre à jour manuellement ou les supprimer puis relancer le script de seed.

### Vérifier les colonnes existantes

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'email_templates'
ORDER BY ordinal_position;
```

### Supprimer les templates de test

```sql
DELETE FROM email_templates
WHERE organizationId IS NULL
  AND category = 'onboarding'
  AND slug LIKE 'onboarding-%';
```

## 📝 Notes importantes

1. **Template actif** : Seul le template avec `isActive = true` et `slug = 'onboarding-welcome'` est utilisé actuellement
2. **Templates système** : Les templates avec `isSystem = true` ne peuvent pas être supprimés (protection)
3. **Variables disponibles** : Chaque template définit ses propres variables dans le champ `availableVariables`
4. **Multi-tenant** : Les templates avec `organizationId = NULL` sont des templates globaux LAIA Connect

## 🎉 Prochaines étapes

Une fois la migration appliquée :

1. ✅ Adapter `src/lib/onboarding-emails.ts` pour utiliser les templates de la BDD
2. ✅ Créer l'interface d'édition des templates
3. ✅ Ajouter un système de prévisualisation en temps réel
4. ✅ Permettre la création de templates personnalisés par organisation

---

**Questions ou problèmes ?** Vérifiez les logs dans Supabase ou contactez l'équipe technique.
