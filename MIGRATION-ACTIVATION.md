# 🚀 Activation du Système de Formules - Étapes Simples

## ❌ Problème Actuel

Le serveur affiche l'erreur :
```
The column Organization.sepaIban does not exist in the current database.
```

**Cause** : La base de données n'est pas synchronisée avec le code. Il manque des colonnes et des tables.

---

## ✅ Solution : Exécuter la Migration SQL

### **ÉTAPE 1️⃣ : Ouvrir Supabase SQL Editor**

1. Aller sur : https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Vous connecter à votre compte Supabase
3. Sélectionner votre projet LAIA

---

### **ÉTAPE 2️⃣ : Exécuter la Migration Complète**

1. **Ouvrir le fichier** `prisma/migration-complete.sql` dans votre éditeur de code

2. **Copier TOUT le contenu** du fichier (Ctrl+A puis Ctrl+C)

3. **Coller** dans le SQL Editor de Supabase

4. **Cliquer sur le bouton "Run"** (ou Ctrl+Entrée)

5. **Vérifier** que vous voyez ces messages de succès :
   ```
   Migration terminée avec succès !
   Table SubscriptionPlan : OK ✓
   Colonnes customFeatures : OK ✓
   Colonnes bancaires retirées : OK ✓
   ```

---

### **ÉTAPE 3️⃣ : Insérer les 4 Formules**

1. **Ouvrir le fichier** `prisma/seed-plans-sql.sql` dans votre éditeur de code

2. **Copier TOUT le contenu** du fichier

3. **Coller** dans le SQL Editor de Supabase

4. **Cliquer sur le bouton "Run"**

5. **Vérifier** que vous voyez :
   ```
   planKey  | name    | priceMonthly | isActive
   ---------|---------|--------------|----------
   SOLO     | Solo    | 49           | true
   DUO      | Duo     | 69           | true
   TEAM     | Team    | 119          | true
   PREMIUM  | Premium | 179          | true
   ```

---

### **ÉTAPE 4️⃣ : Redémarrer le Serveur**

1. **Arrêter** le serveur Next.js (Ctrl+C dans le terminal)

2. **Redémarrer** le serveur :
   ```bash
   cd /home/celia/laia-github-temp/laia-skin-nextjs
   npm run dev
   ```

3. **Attendre** que le serveur démarre complètement (environ 30 secondes)

4. **Vérifier** qu'il n'y a plus d'erreur `sepaIban`

---

### **ÉTAPE 5️⃣ : Tester le Système**

1. **Ouvrir** http://localhost:3001/pricing
   - Vous devriez voir les 4 formules : SOLO, DUO, TEAM, PREMIUM
   - Avec les bons prix : 49€, 69€, 119€, 179€

2. **Ouvrir** http://localhost:3001/super-admin/plans (après connexion super-admin)
   - Vous devriez voir l'interface de gestion des formules
   - Pouvoir modifier les prix, limites, highlights

3. **Ouvrir** une organisation dans http://localhost:3001/super-admin/organizations
   - Cliquer sur "Fonctionnalités"
   - Vous devriez pouvoir activer/désactiver des fonctionnalités par client

---

## 🎉 C'est Terminé !

Une fois ces 5 étapes faites, le système de gestion des formules sera complètement activé.

Vous pourrez :
- ✅ Modifier les prix depuis le super-admin
- ✅ Ajouter/retirer des fonctionnalités par client
- ✅ Voir tout se synchroniser automatiquement sur /pricing, /onboarding, etc.

---

## 🆘 En Cas de Problème

### **Erreur lors de l'exécution du SQL**

Si vous obtenez une erreur lors de l'exécution du SQL :
1. Vérifiez que vous êtes connecté au bon projet Supabase
2. Vérifiez que vous avez les droits admin sur la base de données
3. Copiez l'erreur complète et envoyez-la moi

### **Le serveur affiche toujours "sepaIban does not exist"**

1. Vérifiez que la migration a bien été exécutée dans Supabase
2. Redémarrez le serveur (Ctrl+C puis npm run dev)
3. Videz le cache : `rm -rf .next` puis `npm run dev`

### **Aucune formule n'apparaît sur /pricing**

1. Vérifiez que le seed a bien été exécuté
2. Testez l'API directement : http://localhost:3001/api/plans
3. Regardez la console navigateur pour voir les erreurs éventuelles

---

**Créé le 2025-11-06 par Claude Code** 🤖
