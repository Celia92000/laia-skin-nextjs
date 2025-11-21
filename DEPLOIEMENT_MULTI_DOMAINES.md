# 🚀 Déploiement Multi-Domaines LAIA

Ce projet Next.js gère **2 sites différents** avec **2 domaines séparés** :

## 📋 Les 2 Domaines

### 1. **laiaskininstitut.fr** (Template démo institut)
- Site vitrine d'un institut de beauté
- Sert de DÉMO du template que tu vends
- Pages : `/`, `/prestations`, `/reservation`, `/contact`, etc.

### 2. **laiaconnect.fr** (SaaS plateforme)
- Site vitrine de ton logiciel SaaS
- Pour vendre ton SaaS aux instituts
- Pages : `/platform`, `/pour-qui`, `/register`, `/connexion`, etc.

---

## 🎯 Configuration Vercel

### **Option 1 : 2 projets Vercel (Recommandé)**

Crée **2 projets Vercel séparés** à partir du même repository GitHub :

#### **Projet 1 : LAIA Skin Institut**
```bash
Nom du projet : laia-skin-institut
Domaine : laiaskininstitut.fr
```

**Variables d'environnement** :
```env
NEXT_PUBLIC_SITE_TYPE=institut
NEXT_PUBLIC_APP_URL=https://laiaskininstitut.fr
# + toutes les autres variables de .env.local
```

#### **Projet 2 : LAIA Connect**
```bash
Nom du projet : laia-connect
Domaine : laiaconnect.fr
```

**Variables d'environnement** :
```env
NEXT_PUBLIC_SITE_TYPE=saas
NEXT_PUBLIC_APP_URL=https://laiaconnect.fr
# + toutes les autres variables de .env.local
```

---

### **Option 2 : 1 projet avec 2 domaines (Alternative)**

Si tu veux un seul projet Vercel :

1. Ajoute les 2 domaines dans **Settings → Domains** :
   - `laiaskininstitut.fr`
   - `laiaconnect.fr`

2. Utilise un middleware pour router selon le domaine :

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // Si domaine = laiaconnect.fr → forcer SITE_TYPE=saas
  if (hostname.includes('laiaconnect')) {
    const response = NextResponse.next()
    response.headers.set('x-site-type', 'saas')
    return response
  }

  // Sinon → SITE_TYPE=institut
  return NextResponse.next()
}
```

---

## 📦 Fonctionnement du Sitemap

Le fichier `src/app/sitemap.ts` génère **automatiquement** le bon sitemap selon la variable `NEXT_PUBLIC_SITE_TYPE` :

- Si `NEXT_PUBLIC_SITE_TYPE=saas` → sitemap avec pages `/platform`, `/pour-qui`, etc.
- Si `NEXT_PUBLIC_SITE_TYPE=institut` → sitemap avec pages `/prestations`, `/reservation`, etc.

---

## 🔍 SEO & Indexation Google

### **Après déploiement, pour chaque domaine** :

1. **Google Search Console**
   - Ajouter les 2 propriétés :
     - `https://laiaskininstitut.fr`
     - `https://laiaconnect.fr`
   - Soumettre le sitemap :
     - `https://laiaskininstitut.fr/sitemap.xml`
     - `https://laiaconnect.fr/sitemap.xml`

2. **Vérifier robots.txt**
   - `https://laiaskininstitut.fr/robots.txt`
   - `https://laiaconnect.fr/robots.txt`

3. **Vérifier indexation**
   ```
   site:laiaskininstitut.fr
   site:laiaconnect.fr
   ```

---

## ⚙️ Variables d'environnement requises

```env
# Type de site (détermine le sitemap et le SEO)
NEXT_PUBLIC_SITE_TYPE=saas  # ou "institut"

# URL principale
NEXT_PUBLIC_APP_URL=https://laiaconnect.fr  # ou https://laiaskininstitut.fr

# Base de données
DATABASE_URL=...
JWT_SECRET=...
ENCRYPTION_KEY=...

# Email
RESEND_API_KEY=...
BREVO_API_KEY=...
EMAIL_FROM=...

# Stripe
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# WhatsApp
WHATSAPP_PROVIDER=meta
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

# Twilio (backup)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 🎨 Délai d'indexation Google

**Après soumission du sitemap** :
- **24-72h** : Première indexation
- **1-2 semaines** : Indexation complète
- **1 mois** : Positionnement SEO

**Pour accélérer** :
1. Créer des backlinks (annuaires, réseaux sociaux)
2. Publier du contenu régulièrement
3. Soumettre manuellement les pages importantes dans Search Console

---

## 📝 Notes importantes

- Les **2 domaines partagent la même base de données** Supabase
- Le système **multi-tenant** permet à chaque client d'avoir son propre sous-domaine
- Le **super-admin** est accessible uniquement sur laiaconnect.fr (ou URL Vercel si non configuré)
- Les **crons sont désactivés** pour le plan gratuit (réactiver après upgrade Vercel Pro)

---

## 🆘 Troubleshooting

**Problème : Google ne trouve pas mon site**
- ✅ Vérifier que le sitemap est accessible
- ✅ Vérifier robots.txt n'est pas en `Disallow: /`
- ✅ Soumettre le sitemap dans Search Console
- ✅ Attendre 24-72h minimum

**Problème : Mauvais sitemap affiché**
- ✅ Vérifier la variable `NEXT_PUBLIC_SITE_TYPE` dans Vercel
- ✅ Redéployer le projet après modification
- ✅ Vider le cache Vercel

**Problème : Les 2 sites affichent le même contenu**
- ✅ Utiliser Option 1 (2 projets Vercel séparés)
- ✅ Vérifier que `NEXT_PUBLIC_SITE_TYPE` est différent
- ✅ Implémenter middleware de routage si Option 2
