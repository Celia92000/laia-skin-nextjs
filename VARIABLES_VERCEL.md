# 🔐 Variables d'Environnement Vercel - LAIA

Ce document liste **toutes les variables** à configurer pour les 2 projets Vercel.

---

## 📋 **Liste des Variables à Configurer**

### ✅ **Variables COMMUNES aux 2 projets** (identiques)

Ces variables sont **les mêmes** pour `laiaconnect.fr` et `laiaskininstitut.fr` :

```env
# ============================================
# BASE DE DONNÉES (IDENTIQUE)
# ============================================
DATABASE_URL=postgresql://postgres.XXX:XXX@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5&pool_timeout=15&connect_timeout=10
DIRECT_URL=postgresql://postgres.XXX:XXX@aws-1-eu-west-3.pooler.supabase.com:5432/postgres

# ============================================
# SÉCURITÉ (IDENTIQUE)
# ============================================
JWT_SECRET=ton_secret_jwt_64_chars
ENCRYPTION_KEY=ton_encryption_key_64_chars

# ============================================
# EMAIL (IDENTIQUE)
# ============================================
RESEND_API_KEY=re_xxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxx
BREVO_API_KEY=xkeysib-xxxxx
EMAIL_FROM=noreply@laiaconnect.fr
EMAIL_PROVIDER=brevo

# ============================================
# WHATSAPP META (IDENTIQUE)
# ============================================
WHATSAPP_PROVIDER=meta
WHATSAPP_ACCESS_TOKEN=EAAxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789
WHATSAPP_API_VERSION=v21.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=ton_webhook_token
NEXT_PUBLIC_WHATSAPP_NUMBER=+33612345678

# ============================================
# TWILIO WHATSAPP BACKUP (IDENTIQUE)
# ============================================
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# ============================================
# STRIPE (IDENTIQUE)
# ============================================
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ============================================
# SUPABASE (IDENTIQUE)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# ============================================
# META SOCIAL MEDIA (IDENTIQUE - Optionnel)
# ============================================
META_APP_ID=ton_app_id
META_APP_SECRET=ton_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=EAAxxxxx
FACEBOOK_PAGE_ID=123456789
INSTAGRAM_ACCESS_TOKEN=EAAxxxxx
INSTAGRAM_ACCOUNT_ID=123456789

# ============================================
# CLOUDINARY (IDENTIQUE - Optionnel)
# ============================================
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ton_api_key
CLOUDINARY_API_SECRET=ton_api_secret

# ============================================
# CRON (IDENTIQUE)
# ============================================
CRON_SECRET=ton_cron_secret
```

---

### 🔀 **Variables DIFFÉRENTES par projet**

Ces variables **changent** selon le domaine :

#### **Projet 1 : LAIA Connect (laiaconnect.fr)** - Projet Vercel actuel `laia-skin-institut-as92`

```env
# Type de site = SaaS
NEXT_PUBLIC_SITE_TYPE=saas

# URLs du SaaS
NEXT_PUBLIC_APP_URL=https://www.laiaconnect.fr
NEXT_PUBLIC_SUPER_ADMIN_URL=https://www.laiaconnect.fr
NEXT_PUBLIC_TENANT_DOMAIN=laiaconnect.fr
```

#### **Projet 2 : LAIA Skin Institut (laiaskininstitut.fr)** - Nouveau projet à créer

```env
# Type de site = Institut démo
NEXT_PUBLIC_SITE_TYPE=institut

# URLs de l'institut démo
NEXT_PUBLIC_APP_URL=https://laiaskininstitut.fr
NEXT_PUBLIC_SUPER_ADMIN_URL=https://www.laiaconnect.fr
NEXT_PUBLIC_TENANT_DOMAIN=laiaskininstitut.fr
```

---

## 🚀 **Comment Configurer sur Vercel**

### **Étape 1 : Projet actuel (laiaconnect.fr)**

1. Va sur **Vercel Dashboard** → Projet `laia-skin-institut-as92`
2. **Settings** → **Environment Variables**
3. **Ajoute ces 3 variables** (si absentes) :
   ```
   NEXT_PUBLIC_SITE_TYPE = saas
   NEXT_PUBLIC_APP_URL = https://www.laiaconnect.fr
   NEXT_PUBLIC_TENANT_DOMAIN = laiaconnect.fr
   ```
4. **Vérifie que toutes les autres variables sont présentes** (liste ci-dessus)
5. **Deployments** → Cliquer sur les `...` du dernier déploiement → **Redeploy**

---

### **Étape 2 : Nouveau projet (laiaskininstitut.fr)**

1. **Vercel Dashboard** → **Add New** → **Project**
2. **Import Git Repository** : `Celia92000/laia-skin-nextjs`
3. **Configure Project** :
   - Project Name : `laia-skin-institut-demo`
   - Framework Preset : Next.js
   - Root Directory : `./` (laisser par défaut)
   - Build Command : `npm run build`
   - Output Directory : `.next`

4. **Environment Variables** → Cliquer sur **Add Variables**

5. **Copier-coller TOUTES les variables** (une par une) :

```env
# Spécifiques institut
NEXT_PUBLIC_SITE_TYPE=institut
NEXT_PUBLIC_APP_URL=https://laiaskininstitut.fr
NEXT_PUBLIC_SUPER_ADMIN_URL=https://www.laiaconnect.fr
NEXT_PUBLIC_TENANT_DOMAIN=laiaskininstitut.fr

# Copier ensuite TOUTES les variables communes du projet laiaconnect.fr
# (Va sur laia-skin-institut-as92 → Settings → Environment Variables)
# Et copie toutes les variables une par une :

DATABASE_URL=...
JWT_SECRET=...
ENCRYPTION_KEY=...
RESEND_API_KEY=...
BREVO_API_KEY=...
EMAIL_FROM=...
WHATSAPP_PROVIDER=...
# ... etc (toutes les variables de la section "COMMUNES" ci-dessus)
```

6. **Deploy**

---

### **Étape 3 : Configurer les domaines**

#### **Projet 1 (laia-skin-institut-as92)** :
- Settings → Domains
- Vérifier que ces domaines sont configurés :
  - ✅ `www.laiaconnect.fr` (Primary)
  - ✅ `laiaconnect.fr` (Redirect to www)

#### **Projet 2 (laia-skin-institut-demo)** :
- Settings → Domains → **Add Domain**
- Ajouter :
  - `laiaskininstitut.fr`
  - `www.laiaskininstitut.fr`
- Suivre les instructions pour configurer les DNS

---

## ✅ **Checklist de Vérification**

### **Avant déploiement** :

- [ ] Toutes les variables communes sont identiques dans les 2 projets
- [ ] `NEXT_PUBLIC_SITE_TYPE` est différent (saas vs institut)
- [ ] `NEXT_PUBLIC_APP_URL` correspond au bon domaine
- [ ] `DATABASE_URL` est identique (même base de données pour les 2)
- [ ] `JWT_SECRET` est identique (même auth pour les 2)
- [ ] Stripe, WhatsApp, Email API keys sont identiques

### **Après déploiement** :

- [ ] Tester https://www.laiaconnect.fr → doit afficher page SaaS
- [ ] Tester https://laiaskininstitut.fr → doit afficher page institut
- [ ] Vérifier https://www.laiaconnect.fr/sitemap.xml → pages SaaS
- [ ] Vérifier https://laiaskininstitut.fr/sitemap.xml → pages institut
- [ ] Vérifier robots.txt des 2 domaines
- [ ] Tester connexion base de données (même BDD pour les 2)
- [ ] Tester login admin sur les 2 sites

---

## 🔍 **Variables OBLIGATOIRES minimum**

Si tu veux démarrer rapidement, voici le **strict minimum** :

```env
# OBLIGATOIRES (sans ça le site ne fonctionne pas)
DATABASE_URL=...
JWT_SECRET=...
ENCRYPTION_KEY=...
NEXT_PUBLIC_APP_URL=https://ton-domaine.fr
NEXT_PUBLIC_SITE_TYPE=saas  # ou institut
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# RECOMMANDÉES (pour fonctionnalités complètes)
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
RESEND_API_KEY=...
EMAIL_FROM=...
WHATSAPP_PROVIDER=meta
WHATSAPP_ACCESS_TOKEN=...
```

---

## 🆘 **Troubleshooting**

**Erreur : Site affiche mauvais contenu**
- ✅ Vérifier `NEXT_PUBLIC_SITE_TYPE` (saas ou institut)
- ✅ Redéployer après modification variable
- ✅ Vider cache navigateur

**Erreur : Database connection failed**
- ✅ Vérifier `DATABASE_URL` est identique aux 2 projets
- ✅ Vérifier connexion poolée (port 6543)
- ✅ Tester connexion depuis Prisma Studio

**Erreur : Stripe ne fonctionne pas**
- ✅ Vérifier clés Stripe (test vs live)
- ✅ Vérifier `STRIPE_WEBHOOK_SECRET`
- ✅ Configurer webhook dans dashboard Stripe

**Erreur : Emails ne partent pas**
- ✅ Vérifier `RESEND_API_KEY` ou `BREVO_API_KEY`
- ✅ Vérifier `EMAIL_FROM` est un email vérifié
- ✅ Vérifier logs Resend/Brevo

---

## 📝 **Notes importantes**

1. **Même base de données** : Les 2 sites partagent la MÊME base Supabase (multi-tenant)
2. **Même authentification** : JWT_SECRET identique = même système de login
3. **Même Stripe** : Les 2 sites utilisent le même compte Stripe
4. **Sécurité** : Ne JAMAIS commiter ces variables dans Git !
5. **Production vs Test** : Utiliser clés `sk_live_` et `pk_live_` en production

---

**Besoin d'aide ?** Contacte le support ou consulte la doc Vercel : https://vercel.com/docs/environment-variables
