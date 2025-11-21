# 🔐 Système de Contrôle d'Accès - LAIA Connect

## Vue d'ensemble

Ce système gère les restrictions d'accès basées sur :
1. **La formule d'abonnement** (SOLO, DUO, TEAM, PREMIUM)
2. **Le rôle de l'utilisateur** (SUPER_ADMIN, ORG_OWNER, ACCOUNTANT, LOCATION_MANAGER, STAFF, RECEPTIONIST, CLIENT)

**Note importante** : Le rôle `ORG_ADMIN` a été supprimé. Il existe désormais **un seul rôle admin par organisation : ORG_OWNER**.

---

## 📊 Limites d'utilisateurs par formule

| Formule | Nombre d'utilisateurs max | Limite dans le code |
|---------|--------------------------|---------------------|
| **SOLO** | 1 utilisateur | `USER_LIMITS.SOLO = 1` |
| **DUO** | 3 utilisateurs | `USER_LIMITS.DUO = 3` |
| **TEAM** | 10 utilisateurs | `USER_LIMITS.TEAM = 10` |
| **PREMIUM** | Illimité | `USER_LIMITS.PREMIUM = null` |

**Note** : Les clients (rôle `CLIENT`) ne comptent PAS dans cette limite.

---

## 🛠️ APIs créées

### 1. `/api/admin/users/check-limit` (GET)

Vérifie si l'organisation peut ajouter un nouvel utilisateur.

**Réponse** :
```json
{
  "canAddUser": true,
  "currentUsersCount": 2,
  "limit": 3,
  "remainingSlots": 1,
  "plan": "DUO",
  "planName": "Duo",
  "message": "Vous pouvez ajouter 1 utilisateur(s) supplémentaire(s)."
}
```

**Utilisation** :
```typescript
const response = await fetch('/api/admin/users/check-limit', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

if (!data.canAddUser) {
  alert(data.message); // "Limite atteinte ! Votre formule Duo permet 3 utilisateurs maximum..."
}
```

---

### 2. `/api/admin/features/check-access` (GET)

Vérifie l'accès à une feature spécifique pour l'utilisateur actuel.

**Paramètres** :
- `feature` (query param, optionnel) : Ex. `"featureCRM"`, `"featureBlog"`

**Exemples** :

**Vérifier une feature spécifique** :
```typescript
const response = await fetch('/api/admin/features/check-access?feature=featureCRM', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
// { feature: "featureCRM", hasAccess: true, plan: "DUO", role: "ORG_ADMIN" }
```

**Récupérer toutes les features accessibles** :
```typescript
const response = await fetch('/api/admin/features/check-access', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
/*
{
  plan: "TEAM",
  role: "ACCOUNTANT",
  accessibleFeatures: {
    featureCRM: true,
    featureEmailing: false,
    featureBlog: false,
    featureShop: true,
    ...
  }
}
*/
```

---

### 3. `/api/admin/users/route.ts` (POST) - Modifié

Création d'utilisateur **avec vérification automatique des limites**.

**Comportement** :
- Compte les utilisateurs actuels (excluant les `CLIENT`)
- Vérifie la limite selon la formule
- Bloque la création si limite atteinte

**Erreur si limite atteinte** :
```json
{
  "error": "Limite d'utilisateurs atteinte pour votre formule Duo (3 utilisateurs max). Vous avez actuellement 3 utilisateurs. Passez à une formule supérieure pour ajouter plus d'utilisateurs."
}
```

---

## 📚 Helper : `/src/lib/feature-access.ts`

Fonctions utilitaires pour vérifier l'accès aux features.

### Fonctions principales :

#### `canAccessFeature(feature, plan, role)`

Vérifie si un utilisateur peut accéder à une feature.

```typescript
import { canAccessFeature } from '@/lib/feature-access';

const hasAccess = canAccessFeature('featureCRM', 'DUO', 'ACCOUNTANT');
// true (DUO inclut CRM, et ACCOUNTANT peut y accéder)

const hasAccess2 = canAccessFeature('featureEmailing', 'DUO', 'ACCOUNTANT');
// false (DUO inclut Emailing, mais ACCOUNTANT n'a pas accès)

const hasAccess3 = canAccessFeature('featureBlog', 'SOLO', 'ORG_OWNER');
// false (SOLO n'inclut pas le Blog)
```

#### `getAccessibleFeatures(plan, role)`

Retourne toutes les features accessibles pour un utilisateur.

```typescript
import { getAccessibleFeatures } from '@/lib/feature-access';

const features = getAccessibleFeatures('TEAM', 'STAFF');
/*
{
  featureCRM: true,          // ✅ Peut voir les clients
  featureEmailing: false,    // ❌ Pas d'email marketing
  featureBlog: false,        // ❌ Pas de blog
  featureShop: true,         // ✅ Peut vendre
  featureWhatsApp: false,    // ❌ Pas de WhatsApp
  featureSMS: false,         // ❌ Pas de SMS
  featureSocialMedia: false, // ❌ Pas de réseaux sociaux
  featureStock: false,       // ❌ Pas de stock
}
*/
```

#### `canAccessRoute(route, plan, role)`

Vérifie si un utilisateur peut accéder à une route.

```typescript
import { canAccessRoute } from '@/lib/feature-access';

const canAccess = canAccessRoute('/admin/crm', 'DUO', 'ORG_ADMIN');
// true

const canAccess2 = canAccessRoute('/admin/blog', 'SOLO', 'ORG_OWNER');
// false (SOLO n'inclut pas le blog)
```

---

## 🎯 Matrice d'accès aux features par rôle

| Feature | SUPER_ADMIN | ORG_OWNER | ORG_ADMIN | ACCOUNTANT | LOCATION_MANAGER | STAFF | RECEPTIONIST | CLIENT |
|---------|------------|-----------|-----------|-----------|-----------------|-------|-------------|--------|
| **featureCRM** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **featureEmailing** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **featureBlog** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **featureShop** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **featureWhatsApp** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **featureSMS** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **featureSocialMedia** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **featureStock** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

**Important** : Même si le rôle a accès, la feature doit AUSSI être incluse dans la formule.

---

## 🔒 Restrictions dans Paramètres (`/admin/settings`)

### Onglets visibles :

| Rôle | Paramètres du compte | Configuration du site | Abonnement |
|------|---------------------|---------------------|-----------|
| **SUPER_ADMIN, ORG_OWNER** | ✅ Modification complète | ✅ Modification complète | ✅ Modification complète |
| **ACCOUNTANT** | 👁️ Lecture seule | ❌ Masqué | 👁️ Lecture seule |
| **STAFF, RECEPTIONIST, LOCATION_MANAGER** | 👁️ Infos perso uniquement | ❌ Masqué | ❌ Masqué |
| **CLIENT** | ❌ Pas d'accès admin | ❌ Pas d'accès admin | ❌ Pas d'accès admin |

---

## 👥 Gestion des utilisateurs et permissions

**❗ IMPORTANT** : Seuls **SUPER_ADMIN** et **ORG_OWNER** peuvent :
- ✅ Voir la liste des utilisateurs
- ✅ Créer de nouveaux utilisateurs
- ✅ Modifier les rôles des utilisateurs
- ✅ Supprimer des utilisateurs
- ✅ Gérer les permissions

**Les autres rôles (ACCOUNTANT, STAFF, RECEPTIONIST, LOCATION_MANAGER, CLIENT) ne peuvent PAS gérer les utilisateurs.**

### API de gestion des utilisateurs

Toutes les méthodes de `/api/admin/users/route.ts` sont restreintes :

```typescript
// GET - Lister les utilisateurs
// POST - Créer un utilisateur
// PATCH - Modifier un utilisateur
// DELETE - Supprimer un utilisateur

// ❌ ACCOUNTANT, STAFF, RECEPTIONIST, etc. → Erreur 403
// ✅ SUPER_ADMIN, ORG_OWNER → Autorisé
```

### Sections dans "Paramètres du compte" :

| Section | SUPER_ADMIN/ORG_OWNER | ACCOUNTANT | STAFF/RECEPTIONIST |
|---------|----------------------|-----------|-------------------|
| Informations du compte | ✅ Modification | ✅ Lecture seule | ✅ Modification |
| Informations de l'organisation | ✅ Modification | 👁️ Lecture seule | ❌ Masqué |
| Propriétaire de l'organisation | ✅ Modification | 👁️ Lecture seule | ❌ Masqué |
| Facturation | ✅ Modification | 👁️ Lecture seule | ❌ Masqué |
| Sécurité (mot de passe) | ✅ Modification | ✅ Modification | ✅ Modification |

---

## 🧪 Tester le système

### Test 1 : Limite d'utilisateurs

1. Connectez-vous avec un compte **SOLO**
2. Essayez d'ajouter un 2ème utilisateur
3. ❌ **Erreur attendue** : "Limite atteinte ! Votre formule Solo permet 1 utilisateur maximum..."

### Test 2 : Accès aux features

1. Connectez-vous avec un compte **ACCOUNTANT** sur formule **TEAM**
2. Accédez à `/admin/crm` → ✅ **Autorisé**
3. Accédez à `/admin/emailing` → ❌ **Bloqué** (rôle n'a pas accès)

### Test 3 : Accès aux features selon formule

1. Connectez-vous avec un compte **ORG_OWNER** sur formule **SOLO**
2. Accédez à `/admin/blog` → ❌ **Bloqué** (feature pas dans SOLO)
3. Passez à la formule **TEAM**
4. Accédez à `/admin/blog` → ✅ **Autorisé**

---

## 📦 Fichiers créés/modifiés

### Nouveaux fichiers :
- `/src/app/api/admin/users/check-limit/route.ts` - API vérification limites utilisateurs
- `/src/app/api/admin/features/check-access/route.ts` - API vérification accès features
- `/src/lib/feature-access.ts` - Helper contrôle d'accès
- `/src/app/api/admin/organization/info/route.ts` - Sécurité backend ajoutée
- `/src/app/api/admin/subscription/change-plan/route.ts` - Sécurité backend ajoutée

### Fichiers modifiés :
- `/src/app/admin/settings/page.tsx` - Restrictions UI par rôle
- `/src/app/api/admin/users/route.ts` - Vérification limites basée sur formule

---

## 🚀 Prochaines étapes

Pour utiliser ce système dans vos composants :

```typescript
// 1. Vérifier l'accès côté frontend
import { useEffect, useState } from 'react';

const [canAccessCRM, setCanAccessCRM] = useState(false);

useEffect(() => {
  const checkAccess = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/features/check-access?feature=featureCRM', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setCanAccessCRM(data.hasAccess);
  };
  checkAccess();
}, []);

// 2. Conditionner l'affichage
{canAccessCRM && (
  <Link href="/admin/crm">CRM</Link>
)}

// 3. Vérifier avant d'ajouter un utilisateur
const handleAddUser = async () => {
  const token = localStorage.getItem('token');
  const limitCheck = await fetch('/api/admin/users/check-limit', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const limitData = await limitCheck.json();

  if (!limitData.canAddUser) {
    alert(limitData.message);
    return;
  }

  // Créer l'utilisateur...
};
```

---

## ✅ Résumé

Le système est maintenant **complet et sécurisé** :

1. ✅ **Limites d'utilisateurs** basées sur la formule (SOLO=1, DUO=3, TEAM=10, PREMIUM=illimité)
2. ✅ **Contrôle d'accès aux features** selon formule + rôle
3. ✅ **Restrictions UI** dans Paramètres par rôle
4. ✅ **Sécurité backend** sur toutes les APIs sensibles
5. ✅ **Helper réutilisable** pour vérifier l'accès partout dans le code
6. ✅ **Un seul rôle admin par organisation** : ORG_OWNER (simplification de ORG_ADMIN + ORG_OWNER)

**L'ORG_OWNER peut toujours modifier les droits des utilisateurs dans l'onglet "Utilisateurs & Permissions"**, les restrictions s'appliquent automatiquement selon le rôle assigné.

**Note de migration** : Les utilisateurs avec le rôle `ORG_ADMIN` en base de données peuvent toujours se connecter (compatibilité), mais doivent être migrés vers `ORG_OWNER` ou un autre rôle approprié.
