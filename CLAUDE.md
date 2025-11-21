# LAIA Connect - Version Ultra-Complète

**🏢 Entreprise** : LAIA
**💼 Produit** : LAIA Connect - Plateforme SaaS Multi-Tenant pour Instituts de Beauté
**🌐 Site de démo** : Laia Skin Institut (client utilisant le logiciel)

---

## 🚀 Démarrage rapide du site

Quand l'utilisateur demande de "retrouver son site" ou "démarrer le site", exécuter directement :

```bash
cd /home/celia/laia-github-temp/laia-skin-nextjs && npm run dev
```

Le site sera accessible à : **http://localhost:3001**

---

## 📁 Informations du projet

- **Dossier principal** : `/home/celia/laia-github-temp/laia-skin-nextjs/`
- **Nom du projet** : `laia-connect` (version ultra-complète)
- **Repository GitHub** : https://github.com/Celia92000/laia-skin-nextjs
- **Branche actuelle** : `vercel-main`
- **Branche de sauvegarde** : `backup-before-laia-connect`
- **Framework** : Next.js 15.5.1 avec TypeScript et Turbopack
- **Base de données** : PostgreSQL Supabase avec Prisma 6.16.1
- **Port** : 3001

---

## 🎯 Version complète - Ce qui est inclus

### 23 Onglets Admin Fonctionnels :

1. **Stats** - Tableau de bord avec analytics
2. **Planning** - Calendrier des réservations
3. **Validation** - Validation des réservations
4. **Pending** - Réservations en attente
5. **Paiements** - Gestion des paiements
6. **Soins-Paiements** - Paiements des soins
7. **Fidélité** - Programme de fidélité
8. **CRM** - Gestion de la relation client
9. **Services** - Gestion des services proposés
10. **Products** - Gestion des produits
11. **Stock** - Gestion des stocks
12. **Stock-Advanced** - Gestion avancée des stocks
13. **Emailing** - Campagnes email
14. **SMS** - Envoi de SMS
15. **WhatsApp** - WhatsApp Business (conversations, campagnes, automations)
16. **Social-Media** - Gestion des réseaux sociaux
17. **Reviews** - Gestion des avis clients avec photos
18. **Blog** - Gestion du blog
19. **Locations** - Gestion multi-emplacements
20. **Comptabilité** - Comptabilité intégrée
21. **Notifications** - Centre de notifications

### Fonctionnalités Techniques :

✅ **Architecture Multi-Tenant**
- Service `tenant-service` pour isolation des organisations
- Support domaines personnalisés et subdomains
- Gestion des locations multiples par organisation

✅ **Authentification Avancée**
- JWT avec `organizationId`, `rememberMe` (30j ou 90j)
- Fonction `verifyAuth` pour middleware
- Support cookies HTTP-only + header Authorization

✅ **Sécurité**
- Rate Limiting (Upstash Redis)
- Monitoring (Sentry)
- Encryption des données sensibles
- Protection CSRF

✅ **Paiements**
- Stripe Connect pour multi-tenant
- Paiements uniques et récurrents
- Gestion des factures

✅ **Communications**
- Emails : Brevo / Resend
- SMS : Twilio
- WhatsApp Business API
- Templates personnalisables

✅ **Onboarding LAIA Connect**
- Wizard de configuration complet
- Pages : `/onboarding`, `/onboarding-v2`, `/onboarding-shopify`
- Templates d'emails personnalisables
- API routes : `/api/super-admin/onboarding-*`

✅ **Fonctionnalités Avancées**
- Gestion de stock avec alertes
- Comptabilité intégrée
- Centre de notifications temps réel
- Analytics et rapports

---

## 🔑 Accès aux différents espaces

### URLs d'accès :

- **Super Admin LAIA** : http://localhost:3001/super-admin
- **Admin Institut** : http://localhost:3001/admin
- **Espace Client** : http://localhost:3001/espace-client
- **Employee** : http://localhost:3001/employee
- **Comptable** : http://localhost:3001/comptable

### Identifiants de développement :

**⚠️ SÉCURITÉ IMPORTANTE**

Pour des raisons de sécurité, les identifiants ne sont plus stockés ici.

**Pour récupérer les identifiants :**

1. **Consulter la base de données Supabase** :
   ```bash
   PGPASSWORD='#SBxrx8kVc857Ed' psql -h aws-1-eu-west-3.pooler.supabase.com -p 6543 -U postgres.zsxweurvtsrdgehtadwa -d postgres -c "SELECT email, role FROM \"User\" WHERE role IN ('SUPER_ADMIN', 'ORG_ADMIN') ORDER BY role DESC, email LIMIT 10;"
   ```

2. **Utiliser la fonction "Mot de passe oublié"** pour réinitialiser

3. **Exécuter les scripts de réinitialisation** :
   ```bash
   npx tsx scripts/reset-simple-passwords.ts
   ```

**Recommandations de sécurité** :
- Utilisez des mots de passe complexes (min. 12 caractères)
- Changez les mots de passe régulièrement (tous les 90 jours)
- Configurez JWT_SECRET et ENCRYPTION_KEY uniques dans .env.local
- Ne commitez JAMAIS le fichier .env.local dans Git
- Générez des secrets forts : `openssl rand -base64 64`

---

## 📝 Historique de cette version

**Date de création** : 21 novembre 2025
**Commit principal** : `71e329b` - "VERSION ULTRA-COMPLÈTE : Fusion totale de LAIA Connect"

**Origine** : Fusion complète de `/home/celia/laia-connect` dans `/home/celia/laia-github-temp/laia-skin-nextjs`

**Fichiers modifiés** : 1385 fichiers
**Lignes ajoutées** : 290 831 lignes
**Taille totale** : 27,5 MB

**Ce qui a été fusionné** :
- TOUT le code de laia-connect (la version la plus complète)
- Tous les 23 onglets admin
- Onboarding complet
- Toutes les intégrations (Stripe, Brevo, Twilio, WhatsApp, etc.)
- Tous les scripts et outils de développement
- Documentation complète

---

## 🔧 Commandes utiles

### Développement :
```bash
npm run dev              # Démarrer en mode dev (port 3001, Turbopack)
npm run dev:webpack      # Démarrer avec Webpack
npm run build            # Build production
npm start                # Démarrer en production
```

### Base de données :
```bash
npx prisma generate      # Générer le client Prisma
npx prisma migrate dev   # Créer/appliquer migrations
npx prisma studio        # Interface visuelle DB
npm run seed             # Seed la base de données
```

### Scripts utiles :
```bash
npx tsx scripts/list-all-users.ts                    # Lister tous les utilisateurs
npx tsx scripts/reset-simple-passwords.ts             # Réinitialiser mots de passe
npx tsx scripts/check-org.ts                          # Vérifier organisation
npx tsx scripts/test-admin-access.ts                 # Tester accès admin
npx tsx scripts/migrate-to-multi-tenant.ts           # Migration multi-tenant
```

---

## 📚 Documentation supplémentaire

Le projet contient une documentation exhaustive dans divers fichiers MD :

- `GUIDE_COMPLET_LAIA_SKIN.md` - Guide utilisateur complet
- `DEPLOYMENT-STATUS.md` - Statut des déploiements
- `SECURITY.md` - Guide de sécurité
- `STRIPE_SETUP.md` - Configuration Stripe
- `WHATSAPP_SETUP.md` - Configuration WhatsApp
- `BREVO_SETUP.md` - Configuration Brevo
- `RESEND_SETUP.md` - Configuration Resend
- `SENTRY_SETUP.md` - Configuration Sentry
- Et bien d'autres...

---

## ⚠️ Notes importantes

1. **C'est la version COMPLÈTE** : Toutes les fonctionnalités de LAIA Connect sont présentes
2. **Multi-tenant ready** : Support de plusieurs organisations avec isolation complète
3. **Production ready** : Sécurité, monitoring, et optimisations en place
4. **Sauvegarde disponible** : Branche `backup-before-laia-connect` si besoin de rollback
5. **Port 3001** : Différent du port 3002 de laia-connect original

---

## 🎯 Projet global

**LAIA Connect** = Plateforme SaaS pour commercialiser
**Laia Skin Institut** = Site modèle à vendre (inclus dans ce projet)

Les deux sont ensemble dans ce repository pour faciliter le développement et les démonstrations.

---

**🚀 Pour démarrer rapidement, exécutez simplement :**

```bash
cd /home/celia/laia-github-temp/laia-skin-nextjs && npm run dev
```
