# ✅ Variables Actuelles Projet Vercel `laia-skin-institut-as92`

**Projet** : `laia-skin-institut-as92`
**Domaines** : `www.laiaconnect.fr`, `laiaconnect.fr`, `www.laiaskininstitut.fr`, `laiaskininstitut.fr`

---

## 📋 **Variables actuellement configurées** (24 variables)

### ✅ **Base de données**
1. `DATABASE_URL` ✅
2. `DIRECT_URL` ✅

### ✅ **Sécurité**
3. `JWT_SECRET` ✅

### ✅ **Supabase**
4. `NEXT_PUBLIC_SUPABASE_URL` ✅
5. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

### ✅ **Email**
6. `RESEND_API_KEY` ✅
7. `EMAIL_FROM` ✅
8. `EMAIL_API_KEY` ✅
9. `BREVO_API_KEY` ✅
10. `BREVO_FROM_EMAIL` ✅
11. `BREVO_FROM_NAME` ✅
12. `VERIFIED_EMAIL_DOMAIN` ✅

### ✅ **WhatsApp**
13. `NEXT_PUBLIC_WHATSAPP_NUMBER` ✅
14. `WHATSAPP_ACCESS_TOKEN` ✅
15. `WHATSAPP_PHONE_NUMBER_ID` ✅
16. `WHATSAPP_BUSINESS_ACCOUNT_ID` ✅
17. `WHATSAPP_WEBHOOK_VERIFY_TOKEN` ✅
18. `WHATSAPP_API_VERSION` ✅

### ✅ **Stripe**
19. `STRIPE_SECRET_KEY` ✅
20. `STRIPE_PUBLISHABLE_KEY` ✅
21. `STRIPE_WEBHOOK_SECRET` ✅
22. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅

### ✅ **Autres**
23. `NEXT_PUBLIC_API_URL` ✅
24. `CRON_SECRET` ✅

---

## ❌ **Variables MANQUANTES pour le multi-domaines**

Pour que le sitemap dynamique fonctionne, il manque **3 variables essentielles** :

### **🔴 OBLIGATOIRES (à ajouter MAINTENANT)**
```
NEXT_PUBLIC_SITE_TYPE=saas
NEXT_PUBLIC_APP_URL=https://www.laiaconnect.fr
NEXT_PUBLIC_TENANT_DOMAIN=laiaconnect.fr
```

### **🟡 RECOMMANDÉES (manquantes)**
```
ENCRYPTION_KEY=ton_encryption_key_64_chars
WHATSAPP_PROVIDER=meta
TWILIO_ACCOUNT_SID=ton_account_sid
TWILIO_AUTH_TOKEN=ton_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
RESEND_WEBHOOK_SECRET=ton_webhook_secret
```

### **⚪ OPTIONNELLES (si tu veux utiliser)**
```
META_APP_ID=ton_app_id
META_APP_SECRET=ton_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=ton_token
FACEBOOK_PAGE_ID=ton_id
INSTAGRAM_ACCESS_TOKEN=ton_token
INSTAGRAM_ACCOUNT_ID=ton_id
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ton_api_key
CLOUDINARY_API_SECRET=ton_secret
```

---

## 🎯 **Actions à faire sur Vercel**

### **1. Ajouter les 3 variables OBLIGATOIRES**

Va sur : https://vercel.com → Projet `laia-skin-institut-as92` → Settings → Environment Variables

Clique sur **"Add"** et ajoute :

#### **Variable 1**
```
Name: NEXT_PUBLIC_SITE_TYPE
Value: saas
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variable 2**
```
Name: NEXT_PUBLIC_APP_URL
Value: https://www.laiaconnect.fr
Environments: ✅ Production ✅ Preview ✅ Development
```

#### **Variable 3**
```
Name: NEXT_PUBLIC_TENANT_DOMAIN
Value: laiaconnect.fr
Environments: ✅ Production ✅ Preview ✅ Development
```

### **2. Ajouter ENCRYPTION_KEY (IMPORTANT pour sécurité)**

Génère une clé avec :
```bash
openssl rand -hex 32
```

Puis ajoute :
```
Name: ENCRYPTION_KEY
Value: [résultat de la commande ci-dessus]
Environments: ✅ Production ✅ Preview ✅ Development
```

### **3. Ajouter WHATSAPP_PROVIDER**
```
Name: WHATSAPP_PROVIDER
Value: meta
Environments: ✅ Production ✅ Preview ✅ Development
```

### **4. Redéployer**

Une fois les variables ajoutées :
- Va dans **Deployments**
- Clique sur les `...` du dernier déploiement
- Clique sur **Redeploy**

---

## 📊 **Résumé**

| Catégorie | Configurées | Manquantes | Total |
|-----------|-------------|------------|-------|
| **Obligatoires** | 24 | 3 | 27 |
| **Recommandées** | 0 | 6 | 6 |
| **Optionnelles** | 0 | 9 | 9 |
| **TOTAL** | 24 | 18 | 42 |

---

## ✅ **Checklist Configuration**

- [ ] Ajouter `NEXT_PUBLIC_SITE_TYPE=saas`
- [ ] Ajouter `NEXT_PUBLIC_APP_URL=https://www.laiaconnect.fr`
- [ ] Ajouter `NEXT_PUBLIC_TENANT_DOMAIN=laiaconnect.fr`
- [ ] Ajouter `ENCRYPTION_KEY` (générer avec openssl)
- [ ] Ajouter `WHATSAPP_PROVIDER=meta`
- [ ] Redéployer le projet
- [ ] Vérifier https://www.laiaconnect.fr/sitemap.xml (doit afficher pages SaaS)
- [ ] Tester connexion au site

---

## 📝 **Notes**

- **Domaines actuels** : Ton projet est DÉJÀ configuré avec les 2 domaines !
  - ✅ `www.laiaconnect.fr` (principal)
  - ✅ `laiaconnect.fr` (redirection)
  - ✅ `www.laiaskininstitut.fr` (alias)
  - ✅ `laiaskininstitut.fr` (alias)

- **Problème actuel** : Sans `NEXT_PUBLIC_SITE_TYPE`, le sitemap affiche les mêmes pages pour les 2 domaines

- **Solution** : Ajouter les 3 variables manquantes pour activer le routage dynamique

---

**Prochaine étape** : Ajoute les 3 variables obligatoires sur Vercel, puis redéploie ! 🚀
