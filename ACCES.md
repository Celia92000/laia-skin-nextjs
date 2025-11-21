# 🔑 Accès LAIA Connect - Version Ultra-Complète

## 🌐 URL du site
**http://localhost:3001**

---

## 👤 Comptes disponibles

### 1. Super Admin - LAIA Platform

**Email** : `celia.ivorra95@hotmail.fr`
**Rôle** : SUPER_ADMIN
**Organisation** : Laia Skin Institut
**URL** : http://localhost:3001/super-admin
**Mot de passe** : `SuperAdmin2024!` ✅

**Accès** :
- ✅ Toutes les organisations
- ✅ Gestion des forfaits
- ✅ Analytics plateforme
- ✅ Facturation globale
- ✅ Templates emails
- ✅ Configuration système

---

### 2. Admin Institut - Laia Skin

**Email** : `celia@laiaskin.com`
**Rôle** : ORG_ADMIN
**Organisation** : Laia Skin Institut
**URL** : http://localhost:3001/admin
**Mot de passe** : `Admin2024!` ✅

**Accès** : 23 onglets admin complets
- Stats, Planning, Validation, Pending
- Paiements, Soins-Paiements
- Fidélité, CRM, Services, Products
- Stock, Stock-Advanced
- Emailing, SMS, WhatsApp, Social-Media
- Reviews, Blog, Locations
- Comptabilité, Notifications

---

### 3. Admin Institut - Laia Skin (Test)

**Email** : `celia@laiaskin.fr`
**Rôle** : ORG_ADMIN
**Organisation** : Laia Skin Institut
**URL** : http://localhost:3001/admin
**Mot de passe** : `Admin2024!` ✅

---

### 4. Admin Institut - Belle Peau

**Email** : `celia.ivorra95@hotmail.fr` (Sophie Martin)
**Rôle** : ORG_ADMIN
**Organisation** : Belle Peau Institut
**URL** : http://localhost:3001/admin
**Mot de passe** : `Admin2024!` ✅

---

### 5. Super Admin - Test 1

**Email** : `celia.ivorra95@hotmail.fr`
**Rôle** : SUPER_ADMIN
**Organisation** : Célia test
**Mot de passe** : `SuperAdmin2024!` ✅

---

### 6. Super Admin - Test 2

**Email** : `celia.ivorra95@hotmail.fr`
**Rôle** : SUPER_ADMIN
**Organisation** : Célia IVORRA TEST
**Mot de passe** : `SuperAdmin2024!` ✅

---

## 🔐 Réinitialiser les mots de passe

### Option 1 : Script automatique (recommandé)

```bash
cd /home/celia/laia-github-temp/laia-skin-nextjs
npx tsx scripts/reset-simple-passwords.ts
```

Cela va définir des mots de passe simples pour tous les comptes :
- Super Admin : `SuperAdmin2024!`
- Org Admin : `Admin2024!`

### Option 2 : Via l'interface

1. Aller sur http://localhost:3001/login
2. Cliquer sur "Mot de passe oublié"
3. Entrer ton email
4. Suivre le lien de réinitialisation

### Option 3 : Script personnalisé

Créer un mot de passe spécifique :

```bash
npx tsx scripts/reset-password.ts celia@laiaskin.com MonNouveauMotDePasse123!
```

---

## 📋 Récapitulatif rapide

| Email | Rôle | Organisation | URL |
|-------|------|--------------|-----|
| celia.ivorra95@hotmail.fr | SUPER_ADMIN | Laia Skin Institut | /super-admin |
| celia@laiaskin.com | ORG_ADMIN | Laia Skin Institut | /admin |
| celia@laiaskin.fr | ORG_ADMIN | Laia Skin Institut | /admin |

---

## 🚀 Démarrer le site

```bash
cd /home/celia/laia-github-temp/laia-skin-nextjs && npm run dev
```

Le site sera accessible sur **http://localhost:3001**

---

## ⚠️ Important

**Ne commitez JAMAIS ce fichier avec des mots de passe en clair !**

Ce fichier est destiné à un usage local uniquement pour faciliter le développement.

---

Dernière mise à jour : 21 novembre 2025
