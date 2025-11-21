# 📋 Copie Variables entre 2 Projets Vercel - Guide Complet

Ce document liste **EXACTEMENT** quelles variables copier pour créer les 2 projets.

---

## 🎯 **STRATÉGIE : 2 Projets Vercel**

### **Projet 1 : laia-skin-institut-as92** (SaaS - laiaconnect.fr)
- Domaine : `www.laiaconnect.fr` + `laiaconnect.fr`
- Type : SaaS LAIA Connect
- **ACTION** : Modifier variables existantes + en ajouter 5

### **Projet 2 : laia-skin-institut-demo** (Institut - laiaskininstitut.fr)
- Domaine : `laiaskininstitut.fr` + `www.laiaskininstitut.fr`
- Type : Template démo institut
- **ACTION** : Créer nouveau projet + copier toutes les variables + modifier 3

---

## 📊 **TABLEAU RÉCAPITULATIF**

| Variable | Projet 1 (SaaS) | Projet 2 (Institut) | Action |
|----------|-----------------|---------------------|--------|
| **NEXT_PUBLIC_SITE_TYPE** | `saas` | `institut` | ✏️ DIFFÉRENT |
| **NEXT_PUBLIC_APP_URL** | `https://www.laiaconnect.fr` | `https://laiaskininstitut.fr` | ✏️ DIFFÉRENT |
| **NEXT_PUBLIC_TENANT_DOMAIN** | `laiaconnect.fr` | `laiaskininstitut.fr` | ✏️ DIFFÉRENT |
| **DATABASE_URL** | [Même valeur] | [Même valeur] | ✅ IDENTIQUE |
| **DIRECT_URL** | [Même valeur] | [Même valeur] | ✅ IDENTIQUE |
| **JWT_SECRET** | [Même valeur] | [Même valeur] | ✅ IDENTIQUE |
| **ENCRYPTION_KEY** | [Même valeur] | [Même valeur] | ✅ IDENTIQUE |
| Toutes les autres... | [Même valeur] | [Même valeur] | ✅ IDENTIQUE |

---

## 📝 **PROJET 1 : laia-skin-institut-as92 (SaaS)**

### ✅ **Variables DÉJÀ configurées (à garder tel quel)**

Copie ces valeurs depuis **Vercel Dashboard** → Projet actuel → Settings → Environment Variables :

```bash
# ============================================
# BASE DE DONNÉES (GARDER)
# ============================================
DATABASE_URL=[Copier depuis Vercel]
DIRECT_URL=[Copier depuis Vercel]

# ============================================
# SÉCURITÉ (GARDER)
# ============================================
JWT_SECRET=[Copier depuis Vercel]

# ============================================
# SUPABASE (GARDER)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=[Copier depuis Vercel]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Copier depuis Vercel]

# ============================================
# EMAIL (GARDER)
# ============================================
RESEND_API_KEY=[Copier depuis Vercel]
EMAIL_FROM=[Copier depuis Vercel]
EMAIL_API_KEY=[Copier depuis Vercel]
BREVO_API_KEY=[Copier depuis Vercel]
BREVO_FROM_EMAIL=[Copier depuis Vercel]
BREVO_FROM_NAME=[Copier depuis Vercel]
VERIFIED_EMAIL_DOMAIN=[Copier depuis Vercel]

# ============================================
# WHATSAPP (GARDER)
# ============================================
NEXT_PUBLIC_WHATSAPP_NUMBER=[Copier depuis Vercel]
WHATSAPP_ACCESS_TOKEN=[Copier depuis Vercel]
WHATSAPP_PHONE_NUMBER_ID=[Copier depuis Vercel]
WHATSAPP_BUSINESS_ACCOUNT_ID=[Copier depuis Vercel]
WHATSAPP_WEBHOOK_VERIFY_TOKEN=[Copier depuis Vercel]
WHATSAPP_API_VERSION=[Copier depuis Vercel]

# ============================================
# STRIPE (GARDER)
# ============================================
STRIPE_SECRET_KEY=[Copier depuis Vercel]
STRIPE_PUBLISHABLE_KEY=[Copier depuis Vercel]
STRIPE_WEBHOOK_SECRET=[Copier depuis Vercel]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[Copier depuis Vercel]

# ============================================
# AUTRES (GARDER)
# ============================================
NEXT_PUBLIC_API_URL=[Copier depuis Vercel]
CRON_SECRET=[Copier depuis Vercel]
```

### 🆕 **Variables à AJOUTER (nouvelles)**

```bash
# ============================================
# CONFIGURATION SITE (AJOUTER)
# ============================================
NEXT_PUBLIC_SITE_TYPE=saas
NEXT_PUBLIC_APP_URL=https://www.laiaconnect.fr
NEXT_PUBLIC_TENANT_DOMAIN=laiaconnect.fr

# ============================================
# SÉCURITÉ (AJOUTER)
# ============================================
ENCRYPTION_KEY=84e41db163e8e0713c77ebccbdb7030c6dc5ef175fbe0e5ec78afc35c390df0d

# ============================================
# WHATSAPP (AJOUTER)
# ============================================
WHATSAPP_PROVIDER=meta
```

### ❌ **Domaines à RETIRER de ce projet**

Une fois le Projet 2 créé, retirer :
- `www.laiaskininstitut.fr`
- `laiaskininstitut.fr`

(Garder seulement `www.laiaconnect.fr` et `laiaconnect.fr`)

---

## 📝 **PROJET 2 : laia-skin-institut-demo (Institut)**

### **Comment obtenir les valeurs à copier ?**

**Méthode manuelle (recommandée)** :

1. Ouvre **2 onglets** dans ton navigateur :
   - Onglet 1 : Projet `laia-skin-institut-as92` → Settings → Environment Variables (SOURCE)
   - Onglet 2 : Nouveau projet `laia-skin-institut-demo` → Settings → Environment Variables (DESTINATION)

2. Pour **chaque variable** dans l'onglet 1 :
   - Clique sur `•••` → **Edit**
   - Copie la **Value**
   - Va dans l'onglet 2 → **Add** → Colle la **Value**

### ✅ **Variables à COPIER IDENTIQUES (24 variables)**

```bash
# ============================================
# BASE DE DONNÉES (IDENTIQUE)
# ============================================
DATABASE_URL=[COPIER EXACTEMENT depuis projet 1]
DIRECT_URL=[COPIER EXACTEMENT depuis projet 1]

# ============================================
# SÉCURITÉ (IDENTIQUE)
# ============================================
JWT_SECRET=[COPIER EXACTEMENT depuis projet 1]
ENCRYPTION_KEY=84e41db163e8e0713c77ebccbdb7030c6dc5ef175fbe0e5ec78afc35c390df0d

# ============================================
# SUPABASE (IDENTIQUE)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=[COPIER EXACTEMENT depuis projet 1]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[COPIER EXACTEMENT depuis projet 1]

# ============================================
# EMAIL (IDENTIQUE)
# ============================================
RESEND_API_KEY=[COPIER EXACTEMENT depuis projet 1]
EMAIL_FROM=[COPIER EXACTEMENT depuis projet 1]
EMAIL_API_KEY=[COPIER EXACTEMENT depuis projet 1]
BREVO_API_KEY=[COPIER EXACTEMENT depuis projet 1]
BREVO_FROM_EMAIL=[COPIER EXACTEMENT depuis projet 1]
BREVO_FROM_NAME=[COPIER EXACTEMENT depuis projet 1]
VERIFIED_EMAIL_DOMAIN=[COPIER EXACTEMENT depuis projet 1]

# ============================================
# WHATSAPP (IDENTIQUE)
# ============================================
WHATSAPP_PROVIDER=meta
NEXT_PUBLIC_WHATSAPP_NUMBER=[COPIER EXACTEMENT depuis projet 1]
WHATSAPP_ACCESS_TOKEN=[COPIER EXACTEMENT depuis projet 1]
WHATSAPP_PHONE_NUMBER_ID=[COPIER EXACTEMENT depuis projet 1]
WHATSAPP_BUSINESS_ACCOUNT_ID=[COPIER EXACTEMENT depuis projet 1]
WHATSAPP_WEBHOOK_VERIFY_TOKEN=[COPIER EXACTEMENT depuis projet 1]
WHATSAPP_API_VERSION=[COPIER EXACTEMENT depuis projet 1]

# ============================================
# STRIPE (IDENTIQUE)
# ============================================
STRIPE_SECRET_KEY=[COPIER EXACTEMENT depuis projet 1]
STRIPE_PUBLISHABLE_KEY=[COPIER EXACTEMENT depuis projet 1]
STRIPE_WEBHOOK_SECRET=[COPIER EXACTEMENT depuis projet 1]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[COPIER EXACTEMENT depuis projet 1]

# ============================================
# AUTRES (IDENTIQUE)
# ============================================
NEXT_PUBLIC_API_URL=[COPIER EXACTEMENT depuis projet 1]
CRON_SECRET=[COPIER EXACTEMENT depuis projet 1]
```

### ✏️ **Variables DIFFÉRENTES (3 variables)**

```bash
# ============================================
# CONFIGURATION SITE (DIFFÉRENT !)
# ============================================
NEXT_PUBLIC_SITE_TYPE=institut
NEXT_PUBLIC_APP_URL=https://laiaskininstitut.fr
NEXT_PUBLIC_TENANT_DOMAIN=laiaskininstitut.fr
```

---

## 🔧 **PROCÉDURE PAS À PAS**

### **ÉTAPE 1 : Modifier Projet 1 (5 min)**

1. Va sur https://vercel.com/celia92000s-projects/laia-skin-institut-as92/settings/environment-variables

2. **Clique sur "Add"** et ajoute ces 5 variables :

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SITE_TYPE` | `saas` | ✅ Prod ✅ Preview ✅ Dev |
| `NEXT_PUBLIC_APP_URL` | `https://www.laiaconnect.fr` | ✅ Prod ✅ Preview ✅ Dev |
| `NEXT_PUBLIC_TENANT_DOMAIN` | `laiaconnect.fr` | ✅ Prod ✅ Preview ✅ Dev |
| `ENCRYPTION_KEY` | `84e41db163e8e0713c77ebccbdb7030c6dc5ef175fbe0e5ec78afc35c390df0d` | ✅ Prod ✅ Preview ✅ Dev |
| `WHATSAPP_PROVIDER` | `meta` | ✅ Prod ✅ Preview ✅ Dev |

3. **Redéployer** : Deployments → `...` → Redeploy

---

### **ÉTAPE 2 : Créer Projet 2 (15 min)**

#### **2.1 Créer le projet**

1. Va sur https://vercel.com
2. **Add New** → **Project**
3. **Import Git Repository** : Sélectionne `Celia92000/laia-skin-nextjs`
4. **Configure Project** :
   - Project Name : `laia-skin-institut-demo`
   - Framework : Next.js
   - Root Directory : `./`
   - Build Command : `npm run build`
   - Output Directory : `.next`

#### **2.2 Copier TOUTES les variables (ouvre 2 onglets !)**

**Onglet 1 (SOURCE)** :
https://vercel.com/celia92000s-projects/laia-skin-institut-as92/settings/environment-variables

**Onglet 2 (DESTINATION)** :
https://vercel.com/celia92000s-projects/laia-skin-institut-demo/settings/environment-variables

**Pour chaque variable dans la liste ci-dessous** :

1. Dans **Onglet 1** : Trouve la variable → `•••` → **Edit** → Copie la **Value**
2. Dans **Onglet 2** : **Add** → Colle **Name** + **Value** → Sélectionne **Environments** → **Save**

**Liste des 27 variables à copier** (dans l'ordre) :

```
✅ DATABASE_URL
✅ DIRECT_URL
✅ JWT_SECRET
✅ ENCRYPTION_KEY (valeur: 84e41db163e8e0713c77ebccbdb7030c6dc5ef175fbe0e5ec78afc35c390df0d)
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ RESEND_API_KEY
✅ EMAIL_FROM
✅ EMAIL_API_KEY
✅ BREVO_API_KEY
✅ BREVO_FROM_EMAIL
✅ BREVO_FROM_NAME
✅ VERIFIED_EMAIL_DOMAIN
✅ WHATSAPP_PROVIDER (valeur: meta)
✅ NEXT_PUBLIC_WHATSAPP_NUMBER
✅ WHATSAPP_ACCESS_TOKEN
✅ WHATSAPP_PHONE_NUMBER_ID
✅ WHATSAPP_BUSINESS_ACCOUNT_ID
✅ WHATSAPP_WEBHOOK_VERIFY_TOKEN
✅ WHATSAPP_API_VERSION
✅ STRIPE_SECRET_KEY
✅ STRIPE_PUBLISHABLE_KEY
✅ STRIPE_WEBHOOK_SECRET
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
✅ NEXT_PUBLIC_API_URL
✅ CRON_SECRET
```

**Puis ajoute ces 3 variables DIFFÉRENTES** :

```
❗ NEXT_PUBLIC_SITE_TYPE = institut
❗ NEXT_PUBLIC_APP_URL = https://laiaskininstitut.fr
❗ NEXT_PUBLIC_TENANT_DOMAIN = laiaskininstitut.fr
```

#### **2.3 Configurer les domaines**

1. **Deployments** → Attends le premier déploiement
2. **Settings** → **Domains** → **Add Domain**
3. Ajoute :
   - `laiaskininstitut.fr`
   - `www.laiaskininstitut.fr`
4. Suis les instructions DNS

---

### **ÉTAPE 3 : Retirer domaines Projet 1 (2 min)**

1. Retourne sur Projet 1 : https://vercel.com/celia92000s-projects/laia-skin-institut-as92/settings/domains
2. **Supprime** :
   - `www.laiaskininstitut.fr`
   - `laiaskininstitut.fr`
3. **Garde** :
   - `www.laiaconnect.fr` ✅
   - `laiaconnect.fr` ✅

---

## ✅ **CHECKLIST FINALE**

### **Projet 1 : laia-skin-institut-as92**
- [ ] 29 variables configurées (24 anciennes + 5 nouvelles)
- [ ] `NEXT_PUBLIC_SITE_TYPE=saas` ✅
- [ ] Domaine `www.laiaconnect.fr` uniquement ✅
- [ ] Redéployé ✅
- [ ] https://www.laiaconnect.fr/sitemap.xml affiche pages SaaS ✅

### **Projet 2 : laia-skin-institut-demo**
- [ ] 27 variables configurées (24 copiées + 3 différentes)
- [ ] `NEXT_PUBLIC_SITE_TYPE=institut` ✅
- [ ] Domaine `laiaskininstitut.fr` configuré ✅
- [ ] Déployé ✅
- [ ] https://laiaskininstitut.fr/sitemap.xml affiche pages institut ✅

---

## 💡 **ASTUCES**

### **Pour copier rapidement les variables** :

1. Utilise **2 écrans** ou **écran splitté**
2. Copie-colle dans un **Notepad temporaire** si besoin
3. Vérifie que **tous les Environments sont cochés** (Prod + Preview + Dev)
4. **NE PARTAGE JAMAIS** ces valeurs publiquement

### **Estimation temps** :
- Modifier Projet 1 : **5 minutes**
- Créer Projet 2 : **15 minutes**
- Configurer DNS domaines : **5 minutes**
- **TOTAL : ~25 minutes**

---

**Tu es prêt ! Commence par l'Étape 1 et dis-moi quand c'est fait !** 🚀
