# Configuration Brevo (ex-SendinBlue) pour LAIA Connect

## 🎯 Objectif

Utiliser **Brevo** comme alternative gratuite à Resend pour envoyer des emails depuis **laiaconnect.fr**.

**Pourquoi Brevo ?**
- ✅ **300 emails/jour GRATUIT**
- ✅ **Domaines illimités** (contrairement à Resend)
- ✅ API simple et moderne
- ✅ Templates visuels + tracking (ouvertures, clics)
- ✅ Support SMS inclus (bonus)

---

## 📋 Étape 1 : Créer un compte Brevo

### Inscription

1. Allez sur [brevo.com](https://www.brevo.com)
2. Cliquez sur **S'inscrire gratuitement**
3. Remplissez le formulaire :
   - **Email** : votre email (ex: contact@laiaconnect.fr ou votre email perso)
   - **Mot de passe** : Créez un mot de passe fort
   - **Prénom / Nom** : Celia
   - **Nom de l'entreprise** : LAIA
   - **Site web** : https://laiaconnect.fr (ou URL Vercel temporaire)
   - **Combien de contacts** : 500
   - **Vendez-vous en ligne ?** : Oui

4. **Vérifiez votre email** (code de confirmation envoyé)
5. **Complétez votre profil** :
   - Pays : France
   - Téléphone : Votre numéro
   - Secteur d'activité : **SaaS / Logiciel**

---

## 📋 Étape 2 : Ajouter et vérifier le domaine

### Ajouter laiaconnect.fr

1. Dans le dashboard Brevo → **Senders, Domains & Dedicated IPs**
2. Onglet **Domains**
3. Cliquez sur **Add a domain**
4. Entrez : `laiaconnect.fr`
5. Cliquez sur **Add**

### Configuration DNS

Brevo vous donne **3 enregistrements** à ajouter chez Gandi.

#### 📝 Allez sur Gandi

1. [admin.gandi.net](https://admin.gandi.net) → **laiaconnect.fr** → **DNS Records**
2. Ajoutez les 3 enregistrements fournis par Brevo :

```
# 1. SPF - Autorisation d'envoi
Type    Nom    TTL    Valeur
TXT     @      300    "v=spf1 include:spf.brevo.com ~all"

# 2. DKIM - Signature des emails (clé unique fournie par Brevo)
Type    Nom                          TTL    Valeur
TXT     mail._domainkey              300    "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN..."
                                            ⬆️ Copiez la clé exacte depuis Brevo

# 3. DMARC - Politique anti-spam
Type    Nom       TTL    Valeur
TXT     _dmarc    300    "v=DMARC1; p=none; rua=mailto:contact@laiaconnect.fr"
```

**⚠️ IMPORTANT** :
- La clé DKIM sera **différente** pour vous - copiez-la exactement depuis Brevo
- Respectez bien les **noms** des enregistrements (surtout `mail._domainkey`)

### Vérifier le domaine

1. Retournez sur Brevo
2. Attendez **5-15 minutes** (propagation DNS)
3. Cliquez sur **Verify** à côté de `laiaconnect.fr`
4. Status devrait passer à **Verified** ✅

**Si échec** :
- Vérifiez avec [dnschecker.org](https://dnschecker.org)
- Vérifiez que vous avez bien copié la clé DKIM complète
- Attendez 30 min de plus

---

## 📋 Étape 3 : Créer un expéditeur

### Ajouter contact@laiaconnect.fr

1. **Senders, Domains & Dedicated IPs** → Onglet **Senders**
2. Cliquez sur **Add a new sender**
3. Remplissez :
   - **From name** : LAIA Connect
   - **From email** : contact@laiaconnect.fr
   - **Reply-to email** : contact@laiaconnect.fr (même adresse)

4. **Enregistrer**

**Vous pouvez créer plusieurs expéditeurs** :
- `support@laiaconnect.fr` - Pour le support
- `demo@laiaconnect.fr` - Pour les démos
- `no-reply@laiaconnect.fr` - Pour les notifications

---

## 📋 Étape 4 : Obtenir l'API Key

### Générer la clé API

1. En haut à droite → **Votre nom** → **SMTP & API**
2. Section **API Keys**
3. Cliquez sur **Create a new API key**
4. Remplissez :
   - **Key name** : `LAIA Connect Production`
   - **Version** : **v3** (recommandé)

5. **Generate**
6. **Copiez la clé** (commence par `xkeysib-...`)

⚠️ **Sauvegardez cette clé** - Vous ne pourrez plus la voir !

---

## 📋 Étape 5 : Installation dans le projet

### Installer le package Brevo

```bash
cd /home/celia/laia-github-temp/laia-skin-nextjs
npm install @getbrevo/brevo
```

### Créer le wrapper Brevo

Créez le fichier : `src/lib/brevo.ts`

```typescript
import * as brevo from '@getbrevo/brevo'

// Initialiser l'API Brevo
const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ''
)

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: {
    name: string
    email: string
  }
  replyTo?: {
    email: string
    name?: string
  }
  attachments?: Array<{
    content: string // base64
    name: string
  }>
}

/**
 * Envoie un email via Brevo
 */
export async function sendEmail(params: SendEmailParams) {
  const {
    to,
    subject,
    html,
    text,
    from = {
      name: 'LAIA Connect',
      email: 'contact@laiaconnect.fr'
    },
    replyTo,
    attachments
  } = params

  // Convertir to en tableau
  const toArray = Array.isArray(to) ? to : [to]

  const sendSmtpEmail = new brevo.SendSmtpEmail()

  sendSmtpEmail.sender = from
  sendSmtpEmail.to = toArray.map(email => ({ email }))
  sendSmtpEmail.subject = subject
  sendSmtpEmail.htmlContent = html

  if (text) sendSmtpEmail.textContent = text
  if (replyTo) sendSmtpEmail.replyTo = replyTo
  if (attachments) sendSmtpEmail.attachment = attachments

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Email envoyé via Brevo:', response.messageId)
    return response
  } catch (error: any) {
    console.error('❌ Erreur envoi email Brevo:', error.response?.body || error.message)
    throw error
  }
}

/**
 * Envoie un email avec template Brevo
 */
export async function sendTemplateEmail(params: {
  to: string | string[]
  templateId: number
  params?: Record<string, any>
  from?: { name: string; email: string }
}) {
  const {
    to,
    templateId,
    params: templateParams = {},
    from = {
      name: 'LAIA Connect',
      email: 'contact@laiaconnect.fr'
    }
  } = params

  const toArray = Array.isArray(to) ? to : [to]

  const sendSmtpEmail = new brevo.SendSmtpEmail()
  sendSmtpEmail.sender = from
  sendSmtpEmail.to = toArray.map(email => ({ email }))
  sendSmtpEmail.templateId = templateId
  sendSmtpEmail.params = templateParams

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Email template envoyé via Brevo:', response.messageId)
    return response
  } catch (error: any) {
    console.error('❌ Erreur envoi template Brevo:', error.response?.body || error.message)
    throw error
  }
}

export default { sendEmail, sendTemplateEmail }
```

---

## 📋 Étape 6 : Configuration des variables d'environnement

### Mettre à jour .env.local

```bash
# Brevo API - LAIA Connect
BREVO_API_KEY="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
BREVO_FROM_EMAIL="LAIA Connect <contact@laiaconnect.fr>"

# Garder Resend pour laiaskininstitut.fr
RESEND_API_KEY="re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR"
RESEND_FROM_EMAIL="LAIA SKIN Institut <contact@laiaskininstitut.fr>"
```

### Ajouter dans Vercel (Production)

```bash
vercel env add BREVO_API_KEY production
# Entrer : xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

vercel env add BREVO_FROM_EMAIL production
# Entrer : LAIA Connect <contact@laiaconnect.fr>
```

---

## 📋 Étape 7 : Adapter le code existant

### Option A : Créer un service email unifié

Créez `src/lib/email-service.ts` :

```typescript
import { sendEmail as sendViaResend } from './resend'
import { sendEmail as sendViaBrevo } from './brevo'

interface EmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string
  organization?: 'platform' | 'laiaskin'
}

/**
 * Service email intelligent :
 * - Brevo pour laiaconnect.fr (plateforme)
 * - Resend pour laiaskininstitut.fr (client)
 */
export async function sendEmail(params: EmailParams) {
  const { organization = 'platform', ...emailParams } = params

  if (organization === 'platform') {
    // LAIA Connect → Brevo
    return sendViaBrevo({
      ...emailParams,
      from: {
        name: 'LAIA Connect',
        email: 'contact@laiaconnect.fr'
      }
    })
  } else {
    // Laia Skin Institut → Resend
    return sendViaResend({
      ...emailParams,
      from: process.env.RESEND_FROM_EMAIL || 'contact@laiaskininstitut.fr'
    })
  }
}
```

### Option B : Remplacer Resend par Brevo partout

Modifiez `src/lib/email-templates.ts` :

```typescript
// Avant
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

// Après
import { sendEmail } from './brevo'

// Dans chaque fonction, remplacez :
await resend.emails.send({
  from: '...',
  to: '...',
  subject: '...',
  html: '...'
})

// Par :
await sendEmail({
  to: '...',
  subject: '...',
  html: '...'
})
```

---

## 📋 Étape 8 : Tester l'envoi

### Test simple via la console Node

```bash
cd /home/celia/laia-github-temp/laia-skin-nextjs

# Créer un fichier de test
cat > test-brevo.ts << 'EOF'
import { sendEmail } from './src/lib/brevo'

async function test() {
  try {
    const result = await sendEmail({
      to: 'votre-email-perso@gmail.com',
      subject: 'Test LAIA Connect via Brevo 🚀',
      html: '<h1>Ça marche !</h1><p>Email envoyé depuis LAIA Connect via Brevo.</p>'
    })
    console.log('✅ Email envoyé :', result)
  } catch (error) {
    console.error('❌ Erreur :', error)
  }
}

test()
EOF

# Lancer le test
npx tsx test-brevo.ts
```

### Test via l'interface admin

1. Allez sur `http://localhost:3001/super-admin`
2. **Communications** → **Email**
3. Envoyez un email test à votre adresse

---

## 📋 Étape 9 : Créer des templates visuels (optionnel)

### Via l'éditeur Brevo

1. **Campaigns** → **Email templates**
2. **Create a template**
3. Éditeur drag & drop :
   - Ajoutez du texte, images, boutons
   - Utilisez des variables : `{{ params.firstName }}`
   - Sauvegardez

4. **Récupérez l'ID du template** (ex: 5)

### Utiliser le template dans le code

```typescript
import { sendTemplateEmail } from './src/lib/brevo'

await sendTemplateEmail({
  to: 'client@example.com',
  templateId: 5,
  params: {
    firstName: 'Marie',
    institutName: 'Beauté Paris',
    demoDate: '15 novembre 2025'
  }
})
```

---

## 📊 Différences Resend vs Brevo

| Fonctionnalité | Resend (actuel) | Brevo (nouveau) |
|----------------|-----------------|-----------------|
| **Plan gratuit** | 100 emails/jour | 300 emails/jour |
| **Domaines** | 1 seul | Illimités ✅ |
| **API** | Moderne, simple | Complète |
| **Templates** | Code uniquement | Éditeur visuel ✅ |
| **Tracking** | Oui | Oui + SMS |
| **Prix** | $20/mois (Pro) | $25/mois (Starter) |

---

## 📊 Monitoring & Analytics

### Dashboard Brevo

1. **Statistics** → **Email**
   - Emails envoyés
   - Taux d'ouverture
   - Taux de clics
   - Bounces

2. **Transactional** → **Emails**
   - Liste de tous les emails envoyés
   - Statut (delivered, opened, clicked, bounced)
   - Logs détaillés

### Webhooks (optionnel)

Pour recevoir les événements en temps réel :

1. **Senders & API** → **Webhooks**
2. **Add a webhook**
3. **URL** : `https://laiaconnect.fr/api/webhooks/brevo`
4. **Events** :
   - ✅ Email sent
   - ✅ Email delivered
   - ✅ Email opened
   - ✅ Email clicked
   - ✅ Email bounced

---

## 🔄 Migration de Resend vers Brevo

### Si vous voulez tout migrer

```typescript
// src/lib/email.ts

// Ancien code Resend
/*
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
export const sendEmail = (params) => resend.emails.send(params)
*/

// Nouveau code Brevo
import { sendEmail } from './brevo'
export { sendEmail }
```

Tous vos appels à `sendEmail()` fonctionneront sans changement ! 🎉

---

## 💰 Limites & Pricing

### Plan GRATUIT

- ✅ **300 emails/jour** (9000/mois)
- ✅ Domaines illimités
- ✅ Templates illimités
- ✅ Tracking basique
- ⚠️ Logo Brevo dans les emails

### Plan STARTER - 25€/mois

- ✅ **20 000 emails/mois**
- ✅ Sans logo Brevo
- ✅ Support prioritaire
- ✅ A/B testing
- ✅ Analyses avancées

### Plan BUSINESS - 65€/mois

- ✅ **Emails illimités**
- ✅ Automation marketing
- ✅ CRM intégré
- ✅ Chat en direct

---

## 🆘 Troubleshooting

### "Domain not verified"
→ Vérifiez les 3 enregistrements DNS chez Gandi
→ Utilisez [dnschecker.org](https://dnschecker.org)
→ Attendez 30 minutes

### "API key invalid"
→ Vérifiez que vous avez copié la clé complète
→ La clé commence par `xkeysib-`
→ Régénérez une nouvelle clé si nécessaire

### "Sender not authorized"
→ Ajoutez l'expéditeur dans **Senders**
→ Vérifiez que le domaine est vérifié

### "Email goes to spam"
→ Vérifiez SPF/DKIM/DMARC
→ Évitez les mots spam : "gratuit", "promo", "urgent"
→ Ajoutez un lien de désinscription

### "Daily limit reached"
→ Plan gratuit = 300 emails/jour
→ Passez au plan payant si besoin

---

## 📞 Support

- **Documentation** : [developers.brevo.com](https://developers.brevo.com)
- **Support** : Chat en direct (en bas à droite du dashboard)
- **Email** : contact@brevo.com
- **Status** : [status.brevo.com](https://status.brevo.com)

---

## 📋 Checklist finale

Configuration Brevo :
- [ ] Compte créé et vérifié
- [ ] Domaine `laiaconnect.fr` ajouté
- [ ] 3 enregistrements DNS configurés chez Gandi
- [ ] Domaine vérifié (✅ Verified)
- [ ] Expéditeur `contact@laiaconnect.fr` créé
- [ ] API Key générée et sauvegardée

Code :
- [ ] Package `@getbrevo/brevo` installé
- [ ] Fichier `src/lib/brevo.ts` créé
- [ ] Variables d'environnement configurées
- [ ] Test d'envoi réussi

Production :
- [ ] Variables ajoutées sur Vercel
- [ ] Redéploiement effectué
- [ ] Premier email envoyé avec succès

---

**Dernière mise à jour** : 29 octobre 2025
**Provider** : Brevo (ex-SendinBlue)
**Domaine** : laiaconnect.fr
**Plan** : Gratuit (300 emails/jour)
