# Configuration Email pour LAIA Connect

## 📧 Objectif

Configurer **contact@laiaconnect.fr** pour :
- ✅ Envoyer des emails transactionnels (via Resend)
- ✅ Recevoir des emails entrants (via IMAP Gandi)
- ✅ Support multi-tenant (chaque organisation peut avoir son propre email)

---

## 🎯 Architecture Email

### Pour LAIA Connect (plateforme)
- **Email** : contact@laiaconnect.fr
- **Usage** : Support, démos, communications plateforme
- **Provider** : Resend (envoi) + Gandi (réception)

### Pour chaque client (multi-tenant)
- **Email** : contact@{domaine-client}.fr (configuré par le client)
- **Usage** : Communication avec les clients de l'institut
- **Provider** : Au choix du client (Resend, SendGrid, Gmail, etc.)

---

## 📋 Étape 1 : Créer la boîte email chez Gandi

### Connexion à Gandi

1. Allez sur [admin.gandi.net](https://admin.gandi.net)
2. Connectez-vous avec vos identifiants
3. Sélectionnez le domaine **laiaconnect.fr**

### Créer la boîte email

1. Menu **Email** → **Boîtes email**
2. Cliquez sur **Créer une boîte email**
3. Remplissez :
   - **Adresse** : `contact`
   - **Domaine** : `@laiaconnect.fr`
   - **Mot de passe** : Générez un mot de passe fort
     ```bash
     # Générer un mot de passe sécurisé
     openssl rand -base64 16
     ```
   - **Taille** : 3 GB (suffisant pour commencer)
   - **Alias** :
     - `info@laiaconnect.fr`
     - `support@laiaconnect.fr`
     - `hello@laiaconnect.fr`

4. Cliquez sur **Créer**

### Noter les informations de connexion

- **Email** : contact@laiaconnect.fr
- **Mot de passe** : [le mot de passe généré]
- **Serveur IMAP** : mail.gandi.net
- **Port IMAP** : 993 (SSL)
- **Serveur SMTP** : mail.gandi.net
- **Port SMTP** : 465 (SSL) ou 587 (TLS)

---

## 📋 Étape 2 : Configurer Resend (envoi d'emails)

### Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. **Sign up** avec votre email
3. Vérifiez votre email
4. Connectez-vous au dashboard

### Ajouter le domaine

1. **Domains** → **Add Domain**
2. Entrez : `laiaconnect.fr`
3. Resend vous donne 3 enregistrements DNS à ajouter

### Ajouter les enregistrements DNS chez Gandi

Retournez sur Gandi → **laiaconnect.fr** → **DNS Records**

Ajoutez les 3 enregistrements fournis par Resend :

```
# SPF - Autorise Resend à envoyer des emails pour votre domaine
Type    Nom    TTL    Valeur
TXT     @      300    "v=spf1 include:_spf.resend.com ~all"

# DKIM - Signature des emails pour éviter le spam
TXT     resend._domainkey    300    [clé fournie par Resend]

# DMARC - Politique de sécurité email
TXT     _dmarc    300    "v=DMARC1; p=none; rua=mailto:contact@laiaconnect.fr"
```

**Exemple réel** (la clé DKIM sera différente pour vous) :
```
TXT  resend._domainkey  300  "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."
```

### Vérifier le domaine dans Resend

1. Retournez sur Resend
2. Attendez 5-10 minutes (propagation DNS)
3. Cliquez sur **Verify** à côté de votre domaine
4. Status devrait passer à **Verified** ✅

### Générer une API Key

1. **API Keys** → **Create API Key**
2. Nom : `LAIA Connect Production`
3. Permission : **Full Access** (ou **Sending Access** uniquement)
4. **Create**
5. **Copier la clé** (commence par `re_...`)

⚠️ **Sauvegardez cette clé** - Vous ne pourrez plus la voir !

---

## 📋 Étape 3 : Configuration dans le code

### Mettre à jour .env.local

```bash
# Email - LAIA Connect
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="LAIA Connect <contact@laiaconnect.fr>"

# IMAP Gandi - Pour recevoir les emails
EMAIL_USER="contact@laiaconnect.fr"
EMAIL_PASSWORD="votre-mot-de-passe-gandi"
EMAIL_HOST="mail.gandi.net"
EMAIL_PORT="993"
EMAIL_SECURE="true"

# Webhook Resend (optionnel - pour tracker les opens/clicks)
# RESEND_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

### Ajouter dans Vercel (Production)

```bash
vercel env add RESEND_API_KEY production
# Entrer : re_xxxxxxxxxxxxxxxxxxxxx

vercel env add RESEND_FROM_EMAIL production
# Entrer : LAIA Connect <contact@laiaconnect.fr>

vercel env add EMAIL_USER production
# Entrer : contact@laiaconnect.fr

vercel env add EMAIL_PASSWORD production
# Entrer : [votre mot de passe]
```

---

## 📋 Étape 4 : Tester l'envoi d'email

### Test via l'API Resend

```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_xxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "LAIA Connect <contact@laiaconnect.fr>",
    "to": ["votre-email-perso@gmail.com"],
    "subject": "Test LAIA Connect",
    "html": "<p>Ceci est un email de test depuis LAIA Connect 🚀</p>"
  }'
```

### Test via votre application

1. Allez sur `http://localhost:3001/platform#contact`
2. Remplissez le formulaire de contact
3. Envoyez
4. Vérifiez votre boîte email (check spam)

---

## 📋 Étape 5 : Configurer la réception d'emails (IMAP)

### Créer le script de synchronisation IMAP

Le code existe déjà dans votre projet :
- **Route API** : `/api/cron/sync-emails`
- **Fonction** : Récupère les emails reçus via IMAP Gandi
- **Fréquence** : Toutes les heures (configurable)

### Vérifier la configuration

Fichier : `src/lib/email-sync.ts` (déjà configuré)

```typescript
const config = {
  user: process.env.EMAIL_USER, // contact@laiaconnect.fr
  password: process.env.EMAIL_PASSWORD,
  host: 'mail.gandi.net',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
}
```

### Tester la synchronisation

```bash
# En local
curl http://localhost:3001/api/cron/sync-emails?secret=$CRON_SECRET

# En production
curl https://laiaconnect.fr/api/cron/sync-emails?secret=votre-cron-secret
```

Les emails reçus seront stockés dans la table `EmailHistory` :
- `direction: 'incoming'`
- `from: 'expediteur@example.com'`
- `to: 'contact@laiaconnect.fr'`

---

## 📋 Étape 6 : Configurer les webhooks Resend (optionnel)

### Créer le webhook

1. Sur Resend → **Webhooks** → **Add Webhook**
2. **Endpoint URL** : `https://laiaconnect.fr/api/webhooks/resend`
3. **Events** :
   - ✅ `email.sent`
   - ✅ `email.delivered`
   - ✅ `email.opened`
   - ✅ `email.clicked`
   - ✅ `email.bounced`
   - ✅ `email.complained`

4. **Create**
5. **Copier le Signing Secret** (commence par `whsec_...`)

### Ajouter le secret dans .env

```bash
RESEND_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

Cela permet de tracker :
- ✅ Si l'email a été envoyé
- ✅ Si l'email a été ouvert
- ✅ Si un lien a été cliqué
- ❌ Si l'email a rebondi (adresse invalide)

---

## 📋 Étape 7 : Templates d'emails

### Structure des templates

Vos templates sont dans : `src/lib/email-templates.ts`

Exemples déjà configurés :
- ✅ `sendWelcomeEmail()` - Email de bienvenue
- ✅ `sendReservationConfirmation()` - Confirmation de réservation
- ✅ `sendReservationReminder()` - Rappel de RDV
- ✅ `sendPaymentConfirmation()` - Confirmation de paiement
- ✅ `sendInvoice()` - Envoi de facture

### Créer un nouveau template

```typescript
// src/lib/email-templates.ts

export async function sendDemoConfirmation(
  to: string,
  data: {
    firstName: string
    demoDate: string
    demoTime: string
  }
) {
  const { firstName, demoDate, demoTime } = data

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'LAIA Connect <contact@laiaconnect.fr>',
    to,
    subject: `Votre démo LAIA Connect est confirmée 🎉`,
    html: `
      <h1>Bonjour ${firstName},</h1>
      <p>Votre démo personnalisée est confirmée pour le <strong>${demoDate}</strong> à <strong>${demoTime}</strong>.</p>
      <p>Un lien de visioconférence vous sera envoyé 15 minutes avant le début.</p>
      <p>À très bientôt !<br>L'équipe LAIA Connect 🌸</p>
    `
  })
}
```

---

## 📊 Multi-Tenant : Configuration par organisation

### Système actuel (Laia Skin Institut)

Chaque organisation peut configurer son propre email :
- **Table** : `SiteConfig`
- **Champs** :
  - `email` : Email de contact de l'institut
  - `emailSignature` : Signature personnalisée

### Pour LAIA Connect (plateforme)

Créer une configuration globale séparée :

```typescript
// Pour les emails de la plateforme
const PLATFORM_EMAIL = 'contact@laiaconnect.fr'

// Pour les emails d'un client spécifique
const getOrganizationEmail = async (orgId: string) => {
  const config = await prisma.siteConfig.findFirst({
    where: { organizationId: orgId },
    select: { email: true }
  })
  return config?.email || PLATFORM_EMAIL
}
```

---

## 🔒 Sécurité & RGPD

### Bonnes pratiques

- ✅ **SPF/DKIM/DMARC** : Configurés pour éviter le spam
- ✅ **HTTPS uniquement** : Webhooks sécurisés
- ✅ **Pas de PII** : Ne pas logger les emails complets (RGPD)
- ✅ **Opt-out** : Lien de désinscription dans chaque email marketing
- ✅ **Consentement** : Demander l'accord avant d'envoyer des newsletters

### Stockage des emails

```typescript
// Bon : Stocker seulement les métadonnées
{
  from: 'contact@example.com',
  to: 'contact@laiaconnect.fr',
  subject: 'Question sur LAIA Connect',
  status: 'delivered',
  sentAt: '2025-10-29T10:00:00Z'
}

// Mauvais : Stocker le contenu complet
{
  content: '<html>...'  // ❌ Contient des données sensibles
}
```

---

## 📊 Monitoring & Analytics

### Dashboard Resend

1. **Emails** → Voir tous les emails envoyés
2. **Analytics** → Stats (taux d'ouverture, clics, etc.)
3. **Logs** → Logs détaillés par email

### Métriques importantes

- **Deliverability** : >95% (bon)
- **Open Rate** : 20-30% (moyen pour transactionnel)
- **Bounce Rate** : <5% (bon)
- **Spam Rate** : <0.1% (excellent)

### Alerts Resend

Configurez des alertes pour :
- ⚠️ Taux de bounce >10%
- ⚠️ Spam complaints >1%
- ⚠️ API errors >5%

---

## 🆘 Troubleshooting

### "Domain not verified"
→ Vérifier que les 3 enregistrements DNS sont ajoutés chez Gandi
→ Attendre 10-30 minutes pour propagation
→ Utiliser [dnschecker.org](https://dnschecker.org) pour vérifier

### "Email bounced"
→ Vérifier que l'adresse email du destinataire est valide
→ Vérifier le SPF/DKIM

### "Email goes to spam"
→ Vérifier SPF/DKIM/DMARC
→ Éviter les mots "spam" dans le sujet
→ Avoir un bon ratio texte/image
→ Ajouter un lien de désinscription

### "IMAP sync failed"
→ Vérifier EMAIL_USER et EMAIL_PASSWORD
→ Vérifier que la boîte Gandi est active
→ Tester la connexion manuellement avec Thunderbird/Mail

### "Rate limit exceeded"
→ Plan gratuit Resend : 100 emails/jour
→ Plan payant Resend : 50 000 emails/mois à partir de $20/mois

---

## 💰 Pricing

### Resend

- **Gratuit** : 100 emails/jour (3000/mois)
- **Pro** : $20/mois - 50 000 emails/mois
- **Enterprise** : Sur devis - illimité

### Gandi Email

- **Starter** : Gratuit (3 GB, 2 alias)
- **Standard** : 3€/mois (10 GB, 10 alias)
- **Pro** : 6€/mois (25 GB, 50 alias)

**Recommandation** : Starter pour commencer, puis Standard quand vous avez >10 clients.

---

## 📞 Support

- **Resend** : [resend.com/docs](https://resend.com/docs)
- **Gandi** : [docs.gandi.net/fr/gestion_emails](https://docs.gandi.net/fr/gestion_emails)
- **Support Gandi** : support@gandi.net (réponse <24h)

---

**Dernière mise à jour** : 29 octobre 2025
**Domaine** : laiaconnect.fr (Gandi)
**Provider** : Resend (envoi) + Gandi (réception)
