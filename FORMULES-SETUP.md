# 📦 Système de Gestion des Formules LAIA Connect

## ✅ Installation Complète (étape par étape)

### 🔧 Option 1 : Via Prisma (recommandé)

Si la connexion DB est stable :

```bash
# 1. Appliquer la migration
npx prisma db push

# 2. Seed les formules
npx tsx prisma/seed-plans.ts
```

### 🔧 Option 2 : Via SQL manuel (si timeout)

Si `prisma db push` timeout à cause de la connexion lente :

1. **Ouvrir Supabase SQL Editor** : https://supabase.com/dashboard/project/YOUR_PROJECT/sql

2. **Exécuter le script de migration** :
   - Copier le contenu de `prisma/migration-manual.sql`
   - Coller dans SQL Editor
   - Cliquer "Run"

3. **Exécuter le script de seed** :
   - Copier le contenu de `prisma/seed-plans-sql.sql`
   - Coller dans SQL Editor
   - Cliquer "Run"

4. **Vérifier** que les 4 formules sont créées :
   ```sql
   SELECT "planKey", "name", "priceMonthly" FROM "SubscriptionPlan";
   ```

---

## 🎯 Structure du Système

```
┌─────────────────────────────────────────┐
│  SUPER-ADMIN (/super-admin/plans)       │
│  ✏️ Modifier prix, limites, highlights  │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  BASE DE DONNÉES                        │
│  📊 SubscriptionPlan (4 formules)       │
│  - SOLO : 49€/mois                      │
│  - DUO : 69€/mois                       │
│  - TEAM : 119€/mois                     │
│  - PREMIUM : 179€/mois                  │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  API PUBLIQUE                           │
│  🔌 GET /api/plans                      │
│  Retourne toutes les formules actives   │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│  INTERFACES UTILISATEURS                        │
│  📱 /pricing : Page tarifs                      │
│  📝 /onboarding : Sélection plan                │
│  🎛️ /super-admin/plans : Gestion formules       │
│  🎯 /super-admin/organizations/[id]             │
│     └─ Onglet "Fonctionnalités"                │
│        (custom features par client)             │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Utilisation

### **1. Gérer les formules (Super-Admin)**

URL : `/super-admin/plans`

**Actions possibles** :
- ✏️ Modifier le prix mensuel/annuel
- 📊 Modifier les limites (emplacements, utilisateurs, stockage)
- ⭐ Ajouter/retirer des points forts (highlights)
- 🏷️ Activer les badges "POPULAIRE" ou "RECOMMANDÉ"
- ❌ Désactiver une formule temporairement

**Exemple** :
```
1. Ouvrir /super-admin/plans
2. Cliquer "Modifier" sur la formule TEAM
3. Changer priceMonthly de 119 à 129
4. Ajouter un highlight "Nouveau : API Zapier"
5. Cliquer "Sauvegarder"
→ Le prix se met à jour automatiquement sur /pricing et /onboarding
```

---

### **2. Personnaliser un client (Super-Admin)**

URL : `/super-admin/organizations/[id]` → Onglet "Fonctionnalités"

**Cas d'usage** :
- 🎁 Offrir une feature premium à un client Solo
- ❌ Retirer une feature inutilisée d'un client Premium
- 🧪 Tester une nouvelle feature sur un client pilote
- 💼 Accord commercial spécifique

**Exemple** :
```
Scénario : Un client Solo veut la boutique en ligne

1. Aller dans /super-admin/organizations/[id]
2. Cliquer sur l'onglet "Fonctionnalités"
3. Trouver "🛍️ E-commerce > Boutique Produits"
4. Cliquer "Activer"
→ Le client Solo aura maintenant la boutique dans son admin
```

---

### **3. Page tarifs publique**

URL : `/pricing`

**Caractéristiques** :
- ✅ Chargement automatique depuis `/api/plans`
- ⚡ Fallback vers prix hardcodés si API échoue
- 🎨 Design moderne et responsive
- ⭐ Badges automatiques pour plans populaires
- 🔗 Lien direct vers onboarding avec plan pré-sélectionné

**Personnalisation** :
Le design est dans `src/app/(platform)/pricing/page.tsx`

---

## 📂 Fichiers Importants

### **Base de données**
- `prisma/schema.prisma` : Modèle SubscriptionPlan
- `prisma/seed-plans.ts` : Seed TypeScript
- `prisma/migration-manual.sql` : Migration SQL manuelle
- `prisma/seed-plans-sql.sql` : Seed SQL manuel

### **APIs**
- `src/app/api/plans/route.ts` : API publique (GET)
- `src/app/api/super-admin/plans/route.ts` : Liste formules (GET)
- `src/app/api/super-admin/plans/[id]/route.ts` : Modifier formule (PATCH)
- `src/app/api/super-admin/organizations/[id]/features/route.ts` : Custom features (PATCH)

### **Interfaces**
- `src/app/(super-admin)/super-admin/plans/page.tsx` : Gestion formules
- `src/app/(super-admin)/super-admin/organizations/[id]/page.tsx` : Détail orga + onglet Features
- `src/app/(platform)/pricing/page.tsx` : Page tarifs
- `src/hooks/usePlans.ts` : Hook React pour charger formules

### **Helpers**
- `src/lib/features-manager.ts` : Calcul features effectives
- `src/lib/features.ts` : Définition complète des features

---

## 🔄 Synchronisation Automatique

Une fois le système activé, **toutes les modifications se synchronisent automatiquement** :

| Action | Impact |
|--------|--------|
| Modifier prix dans `/super-admin/plans` | Prix mis à jour sur `/pricing`, `/onboarding`, contrats PDF, CGV |
| Modifier highlights | Points forts mis à jour sur `/pricing` |
| Ajouter feature custom à un client | Client voit la nouvelle fonctionnalité dans son admin |
| Désactiver une formule | Formule cachée de `/pricing` et `/onboarding` |

---

## 🧪 Tester le Système

### **Test 1 : Vérifier les formules**

```bash
# Requête API
curl http://localhost:3001/api/plans

# Résultat attendu : 4 formules (SOLO, DUO, TEAM, PREMIUM)
```

### **Test 2 : Page tarifs**

1. Ouvrir `http://localhost:3001/pricing`
2. Vérifier que les 4 formules s'affichent
3. Vérifier les prix : 49€, 69€, 119€, 179€
4. Vérifier les badges "POPULAIRE" (DUO) et "RECOMMANDÉ" (TEAM)

### **Test 3 : Modifier une formule**

1. Ouvrir `/super-admin/plans`
2. Modifier le prix de SOLO : 49€ → 59€
3. Rafraîchir `/pricing`
4. Vérifier que le prix est bien 59€

### **Test 4 : Features custom**

1. Créer une organisation test (ou utiliser existante)
2. Aller dans `/super-admin/organizations/[id]`
3. Cliquer sur "Fonctionnalités"
4. Activer une feature hors plan
5. Vérifier dans l'admin du client que la feature apparaît

---

## 📊 Données des Formules

### **SOLO - 49€/mois**
- 1 emplacement, 1 utilisateur, 5 GB
- Features de base uniquement
- Support email standard

### **DUO - 69€/mois** ⭐ POPULAIRE
- 1 emplacement, 3 utilisateurs, 10 GB
- + CRM complet
- + Email automation
- + Onboarding guidé

### **TEAM - 119€/mois** ✨ RECOMMANDÉ
- 3 emplacements, 10 utilisateurs, 25 GB
- + Boutique produits
- + WhatsApp & SMS automation
- + Publications réseaux sociaux
- + Sync Google Reviews
- + Support prioritaire

### **PREMIUM - 179€/mois**
- Illimité, illimité, 100 GB
- + Vente de formations
- + Gestion de stock
- + TikTok
- + Account manager dédié

---

## ❓ FAQ

### **Q: Comment ajouter une 5ème formule ?**

**Option 1 : Via interface super-admin** (à venir)
Actuellement, l'interface permet uniquement de modifier les formules existantes.

**Option 2 : Via SQL**
```sql
INSERT INTO "SubscriptionPlan" (...) VALUES (...);
```

### **Q: Puis-je changer les prix sans affecter les clients existants ?**

Oui. Les modifications de prix affectent uniquement :
- Les **nouvelles** souscriptions
- La page `/pricing`
- L'onboarding

Les organisations existantes conservent leur prix actuel (stocké dans `Organization.plan`).

### **Q: Comment désactiver temporairement une formule ?**

1. Aller dans `/super-admin/plans`
2. Modifier la formule
3. Décocher "Formule active"
4. Sauvegarder
→ La formule disparaît de `/pricing` et `/onboarding`

### **Q: Les features custom remplacent-elles le plan ?**

Non, elles **s'ajoutent ou se retirent** du plan de base :
- `customFeaturesEnabled` : features **ajoutées** au plan
- `customFeaturesDisabled` : features **retirées** du plan
- Features effectives = plan + enabled - disabled

### **Q: Comment savoir quelles features un client a réellement ?**

Utiliser le helper :
```typescript
import { getOrganizationFeatures } from '@/lib/features-manager'

const features = getOrganizationFeatures(
  organization.plan,
  organization.customFeaturesEnabled,
  organization.customFeaturesDisabled
)
```

---

## 🚨 Dépannage

### **Problème : "La table SubscriptionPlan n'existe pas"**

**Solution** : Exécuter la migration manuelle
```sql
-- Copier le contenu de prisma/migration-manual.sql
-- Coller dans Supabase SQL Editor
-- Run
```

### **Problème : "Aucune formule affichée sur /pricing"**

**Causes possibles** :
1. Formules pas encore seedées → Exécuter `prisma/seed-plans-sql.sql`
2. Toutes les formules désactivées → Vérifier `isActive = true`
3. Erreur API → Vérifier la console navigateur

**Debug** :
```bash
# Tester l'API directement
curl http://localhost:3001/api/plans
```

### **Problème : "prisma db push timeout"**

**Solution** : Utiliser les scripts SQL manuels
1. `prisma/migration-manual.sql`
2. `prisma/seed-plans-sql.sql`

---

## 📝 Notes Importantes

1. **Ne pas supprimer les anciennes formules** (STARTER, ESSENTIAL, etc.) du schema Prisma
   → Compatibilité avec anciennes organisations

2. **Les prix sont en euros (centimes pour Stripe)**
   → Dans SubscriptionPlan : prix en euros entiers
   → Pour Stripe : multiplier par 100

3. **Le champ `features` est en JSON**
   → Parser avec `JSON.parse()` lors de la lecture

4. **Les highlights sont limités à ~10 points**
   → Pour ne pas surcharger l'interface /pricing

5. **Le hook `usePlans()` a un fallback**
   → Si l'API échoue, utilise des prix hardcodés

---

## ✅ Checklist de Mise en Production

- [ ] Migration appliquée (`prisma db push` ou SQL manuel)
- [ ] Formules seedées (4 formules dans la base)
- [ ] Page `/pricing` accessible et fonctionnelle
- [ ] Interface `/super-admin/plans` testée
- [ ] Modification d'un prix testé (changement visible partout)
- [ ] Features custom testées sur une organisation
- [ ] API `/api/plans` retourne bien les 4 formules
- [ ] Onboarding utilise les prix de l'API
- [ ] Contrats PDF utilisent les prix DB (à vérifier)
- [ ] CGV utilisent les prix DB (à vérifier)

---

## 🎉 Prochaines Améliorations

- [ ] Interface pour créer une nouvelle formule (pas juste modifier)
- [ ] Historique des changements de prix
- [ ] Prévisualisation avant modification
- [ ] Export des formules en CSV
- [ ] Duplication d'une formule
- [ ] A/B testing de prix
- [ ] Analyse impact changement de prix

---

**Système créé et documenté par Claude Code** 🤖
*Date : 2025-11-06*
