# ✅ Checklist Configuration Vercel - LAIA

Utilise cette checklist pour vérifier que tout est bien configuré sur Vercel.

---

## 📦 **PROJET 1 : LAIA Connect (laiaconnect.fr)**

**Nom projet Vercel** : `laia-skin-institut-as92`
**Domaine principal** : `www.laiaconnect.fr`

### **1️⃣ Variables spécifiques SaaS**

- [ ] `NEXT_PUBLIC_SITE_TYPE` = `saas`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://www.laiaconnect.fr`
- [ ] `NEXT_PUBLIC_TENANT_DOMAIN` = `laiaconnect.fr`

### **2️⃣ Variables communes** (Obligatoires)

- [ ] `DATABASE_URL` = `postgresql://...` (Supabase pooler port 6543)
- [ ] `JWT_SECRET` = Secret 64 chars
- [ ] `ENCRYPTION_KEY` = Secret 64 chars
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJxxxxx`

### **3️⃣ Email** (Au moins 1 requis)

- [ ] `RESEND_API_KEY` = `re_xxxxx` ✅ Recommandé
- [ ] `BREVO_API_KEY` = `xkeysib-xxxxx`
- [ ] `EMAIL_FROM` = `noreply@laiaconnect.fr`
- [ ] `RESEND_WEBHOOK_SECRET` = `whsec_xxxxx` (Optionnel)

### **4️⃣ Paiements Stripe** (Obligatoire pour SaaS)

- [ ] `STRIPE_SECRET_KEY` = `sk_live_xxxxx` (ou sk_test_ pour dev)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_xxxxx`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxx`

### **5️⃣ WhatsApp** (Optionnel mais recommandé)

- [ ] `WHATSAPP_PROVIDER` = `meta`
- [ ] `WHATSAPP_ACCESS_TOKEN` = `EAAxxxxx`
- [ ] `WHATSAPP_PHONE_NUMBER_ID` = `123456789`
- [ ] `WHATSAPP_BUSINESS_ACCOUNT_ID` = `123456789`
- [ ] `WHATSAPP_API_VERSION` = `v21.0`
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` = `+33612345678`

### **6️⃣ Twilio (Backup WhatsApp - Optionnel)**

- [ ] `TWILIO_ACCOUNT_SID` = `ACxxxxx`
- [ ] `TWILIO_AUTH_TOKEN` = `xxxxx`
- [ ] `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886`

### **7️⃣ Réseaux sociaux** (Optionnel)

- [ ] `META_APP_ID` = `ton_app_id`
- [ ] `META_APP_SECRET` = `ton_app_secret`
- [ ] `FACEBOOK_PAGE_ACCESS_TOKEN` = `EAAxxxxx`
- [ ] `FACEBOOK_PAGE_ID` = `123456789`
- [ ] `INSTAGRAM_ACCESS_TOKEN` = `EAAxxxxx`
- [ ] `INSTAGRAM_ACCOUNT_ID` = `123456789`

### **8️⃣ Cloudinary** (Optionnel)

- [ ] `CLOUDINARY_CLOUD_NAME` = `ton_cloud_name`
- [ ] `CLOUDINARY_API_KEY` = `ton_api_key`
- [ ] `CLOUDINARY_API_SECRET` = `ton_api_secret`

### **9️⃣ Cron & Autres**

- [ ] `CRON_SECRET` = `ton_cron_secret`

### **🔟 Domaines configurés**

- [ ] `www.laiaconnect.fr` → Primary domain
- [ ] `laiaconnect.fr` → Redirect to www

### **1️⃣1️⃣ Déploiement**

- [ ] Projet build sans erreurs
- [ ] Site accessible à https://www.laiaconnect.fr
- [ ] Page `/platform` affiche le site vitrine SaaS
- [ ] Connexion `/connexion` fonctionne
- [ ] Dashboard super-admin accessible

---

## 📦 **PROJET 2 : LAIA Skin Institut (laiaskininstitut.fr)**

**Nom projet Vercel** : `laia-skin-institut-demo` (à créer)
**Domaine principal** : `laiaskininstitut.fr`

### **1️⃣ Variables spécifiques Institut**

- [ ] `NEXT_PUBLIC_SITE_TYPE` = `institut`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://laiaskininstitut.fr`
- [ ] `NEXT_PUBLIC_TENANT_DOMAIN` = `laiaskininstitut.fr`

### **2️⃣ Variables communes** (IDENTIQUES au projet 1)

- [ ] `DATABASE_URL` = **Même valeur que projet 1**
- [ ] `JWT_SECRET` = **Même valeur que projet 1**
- [ ] `ENCRYPTION_KEY` = **Même valeur que projet 1**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = **Même valeur que projet 1**
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = **Même valeur que projet 1**
- [ ] `RESEND_API_KEY` = **Même valeur que projet 1**
- [ ] `BREVO_API_KEY` = **Même valeur que projet 1**
- [ ] `EMAIL_FROM` = **Même valeur que projet 1**
- [ ] `STRIPE_SECRET_KEY` = **Même valeur que projet 1**
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = **Même valeur que projet 1**
- [ ] `STRIPE_WEBHOOK_SECRET` = **Même valeur que projet 1**
- [ ] `WHATSAPP_*` = **Toutes les variables WhatsApp identiques**
- [ ] `TWILIO_*` = **Toutes les variables Twilio identiques**

### **3️⃣ Domaines configurés**

- [ ] `laiaskininstitut.fr` → Primary domain
- [ ] `www.laiaskininstitut.fr` → Redirect to non-www (ou inverse)

### **4️⃣ Déploiement**

- [ ] Projet build sans erreurs
- [ ] Site accessible à https://laiaskininstitut.fr
- [ ] Page d'accueil affiche l'institut de beauté (pas le SaaS)
- [ ] Page `/prestations` fonctionne
- [ ] Réservation en ligne fonctionne

---

## 🔍 **Vérifications Post-Déploiement**

### **Tests LAIA Connect (laiaconnect.fr)**

- [ ] https://www.laiaconnect.fr → Affiche page SaaS
- [ ] https://www.laiaconnect.fr/platform → Page tarifs visible
- [ ] https://www.laiaconnect.fr/pour-qui → Page cible visible
- [ ] https://www.laiaconnect.fr/register → Inscription fonctionne
- [ ] https://www.laiaconnect.fr/connexion → Login fonctionne
- [ ] https://www.laiaconnect.fr/super-admin → Dashboard super-admin accessible
- [ ] https://www.laiaconnect.fr/sitemap.xml → Sitemap SaaS (pages platform, pour-qui, etc.)
- [ ] https://www.laiaconnect.fr/robots.txt → Robots.txt correct

### **Tests LAIA Skin Institut (laiaskininstitut.fr)**

- [ ] https://laiaskininstitut.fr → Affiche page institut
- [ ] https://laiaskininstitut.fr/prestations → Liste des soins
- [ ] https://laiaskininstitut.fr/reservation → Réservation en ligne
- [ ] https://laiaskininstitut.fr/a-propos → Page à propos
- [ ] https://laiaskininstitut.fr/contact → Formulaire contact
- [ ] https://laiaskininstitut.fr/admin → Dashboard admin accessible
- [ ] https://laiaskininstitut.fr/sitemap.xml → Sitemap institut (pages prestations, reservation, etc.)
- [ ] https://laiaskininstitut.fr/robots.txt → Robots.txt correct

### **Tests Fonctionnels Communs**

- [ ] Connexion base de données fonctionne (même BDD pour les 2)
- [ ] Login admin fonctionne sur les 2 sites (même JWT_SECRET)
- [ ] Envoi emails fonctionne (Resend ou Brevo)
- [ ] Paiements Stripe fonctionnent
- [ ] WhatsApp fonctionne (si configuré)
- [ ] Pas d'erreurs dans les logs Vercel

---

## 🔐 **Google Search Console**

- [ ] Propriété `laiaconnect.fr` créée
- [ ] Propriété `laiaskininstitut.fr` créée
- [ ] Sitemap `https://www.laiaconnect.fr/sitemap.xml` soumis
- [ ] Sitemap `https://laiaskininstitut.fr/sitemap.xml` soumis
- [ ] Vérification propriété domaines effectuée (DNS TXT)
- [ ] Couverture d'index vérifiée après 48h

### **Vérification indexation (après 3-7 jours)**

- [ ] `site:laiaconnect.fr` retourne des résultats
- [ ] `site:laiaskininstitut.fr` retourne des résultats
- [ ] Recherche "LAIA Connect logiciel institut beauté" trouve le site
- [ ] Recherche "LAIA Skin Institut" trouve le site démo

---

## ⚠️ **Problèmes Fréquents**

### **Site affiche mauvais contenu**
✅ Vérifier `NEXT_PUBLIC_SITE_TYPE` (saas vs institut)
✅ Redéployer après modification variable
✅ Vider cache navigateur (Ctrl+Shift+R)

### **Erreur 500 / Site ne charge pas**
✅ Vérifier logs Vercel (Deployments → View Function Logs)
✅ Vérifier `DATABASE_URL` est correct
✅ Vérifier `JWT_SECRET` est défini

### **Sitemap vide ou incorrect**
✅ Vérifier `NEXT_PUBLIC_SITE_TYPE` défini
✅ Redéployer le projet
✅ Tester `/sitemap.xml` en navigation privée

### **Login ne fonctionne pas**
✅ Vérifier `JWT_SECRET` identique sur les 2 projets
✅ Vérifier `DATABASE_URL` identique
✅ Tester connexion BDD depuis Prisma Studio

### **Emails ne partent pas**
✅ Vérifier `RESEND_API_KEY` ou `BREVO_API_KEY`
✅ Vérifier `EMAIL_FROM` est vérifié dans Resend/Brevo
✅ Checker logs Resend/Brevo dashboard

### **Paiements Stripe échouent**
✅ Vérifier clés Stripe (test vs live)
✅ Vérifier `STRIPE_WEBHOOK_SECRET` configuré
✅ Tester en mode test d'abord (sk_test_)

---

## 📊 **Métriques de Succès**

### **Semaine 1**
- [ ] Les 2 sites déployés et accessibles
- [ ] Sitemaps soumis à Google
- [ ] Au moins 1 page indexée par domaine

### **Semaine 2-4**
- [ ] 10+ pages indexées par Google (chaque domaine)
- [ ] Positionnement sur requêtes marque ("LAIA Connect")
- [ ] Temps de chargement < 3 secondes

### **Mois 2+**
- [ ] 50+ pages indexées
- [ ] Trafic organique > 0 visiteurs/jour
- [ ] Positionnement requêtes génériques ("logiciel institut beauté")

---

**Date dernière vérification** : ___________
**Statut global** : ⬜ Non configuré | ⬜ En cours | ⬜ Terminé
**Notes** :

