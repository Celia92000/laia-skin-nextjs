# 🔒 Documentation Sécurité - LAIA Connect

## Architecture de Sécurité Multi-Tenant

### Isolation des Données

LAIA Connect utilise une **isolation au niveau application** avec le champ `organizationId` présent sur toutes les tables sensibles.

#### Tables avec isolation multi-tenant :
- `User` - Utilisateurs par organisation
- `Reservation` - Réservations par organisation
- `Service` - Services par organisation
- `Client` - Clients par organisation
- `Payment` - Paiements par organisation
- `EmailHistory` - Historique emails par organisation
- `NewsletterSubscriber` - Abonnés newsletter par organisation
- `LoyaltyProfile` - Profils fidélité par organisation
- `Discount` - Réductions par organisation
- `Notification` - Notifications par organisation

### Pourquoi pas RLS Supabase ?

Prisma se connecte directement à PostgreSQL via `DATABASE_URL`, contournant la couche d'authentification Supabase. Les politiques RLS ne s'appliqueraient pas car :
1. La connexion utilise le rôle `postgres` (superuser)
2. RLS est bypassé par les rôles avec privilèges élevés

### Protection Actuelle

#### 1. Filtrage Application
Chaque requête API filtre par `organizationId` :
```typescript
// Exemple dans src/app/api/*/route.ts
const organizationId = await getCurrentOrganizationId();
const data = await prisma.model.findMany({
  where: { organizationId }
});
```

#### 2. Validation des Entrées (Zod)
Toutes les API critiques utilisent la validation Zod :
- `/api/auth/login` - loginSchema
- `/api/auth/register` - registerSchema
- `/api/contact` - contactFormSchema
- `/api/newsletter/subscribe` - newsletterSubscribeSchema
- `/api/stripe/create-checkout-session` - checkoutSchema

#### 3. Rate Limiting
- Routes standard : 30 req/min
- Routes sensibles : 5 req/min (login, register, paiements)
- Implémenté via Upstash Redis

#### 4. Headers de Sécurité
- `X-Frame-Options: DENY` - Anti-clickjacking
- `X-Content-Type-Options: nosniff` - Anti-MIME sniffing
- `Strict-Transport-Security` - Force HTTPS (1 an + preload)
- `Content-Security-Policy` - Restrictive en production
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - Bloque camera, micro, geolocation

### Authentification

#### JWT Tokens
- Secret : Variable d'environnement `JWT_SECRET` (jamais de fallback)
- Durée : 7 jours (30 jours avec "Se souvenir de moi")
- Cookie HttpOnly, Secure, SameSite=Lax

#### Rôles
- `CLIENT` - Utilisateurs finaux
- `ADMIN` - Gestionnaires d'organisation
- `SUPER_ADMIN` - Accès plateforme complète

### Checklist Sécurité Production

#### Obligatoire ✅
- [x] `.env.local` dans `.gitignore`
- [x] `.env.example` avec placeholders
- [x] JWT_SECRET sans fallback hardcodé
- [x] Rate limiting sur API sensibles
- [x] Validation Zod sur entrées utilisateur
- [x] CSP stricte en production
- [x] HTTPS forcé (HSTS)

#### Recommandé 🔶
- [ ] Activer 2FA pour les admins
- [ ] Logs d'audit des actions admin
- [ ] Rotation des tokens API
- [ ] Monitoring des tentatives de connexion échouées

#### Optionnel pour V2 📋
- [ ] Migration vers RLS Supabase (avec service role key)
- [ ] Chiffrement at-rest des données sensibles
- [ ] Tests de pénétration
- [ ] Certification SOC2/ISO27001

### Variables d'Environnement Sensibles

| Variable | Description | Rotation |
|----------|-------------|----------|
| `JWT_SECRET` | Signature des tokens | Annuelle |
| `ENCRYPTION_KEY` | Chiffrement API keys | Annuelle |
| `DATABASE_URL` | Connexion PostgreSQL | À chaque breach |
| `STRIPE_SECRET_KEY` | Paiements Stripe | Jamais exposée |
| `CRON_SECRET` | Sécurité des crons | Annuelle |

### Contacts Sécurité

Pour signaler une vulnérabilité : contact@laiaconnect.fr

---

*Dernière mise à jour : Novembre 2025*
