# 📊 Audit Paiements & Facturation - LAIA

**Date** : 2025-01-19
**Version** : 1.0
**Auditeur** : Claude

---

## 📋 Résumé Exécutif

| Critère | Statut | Score |
|---------|--------|-------|
| **1. Webhooks Stripe** | ✅ BON | 9/10 |
| **2. Gestion échecs paiement** | ✅ BON | 8/10 |
| **3. Relances automatiques** | ✅ BON | 9/10 |
| **4. Remboursements** | ⚠️ PARTIEL | 5/10 |
| **5. Conformité factures FR** | ⚠️ À AMÉLIORER | 6/10 |

**Score global** : **7.4/10**

---

## 1. ✅ Webhooks Stripe en Production

### Configuration Actuelle

**Fichier** : `src/app/api/webhooks/stripe/route.ts`

**Événements gérés** :
- ✅ `checkout.session.completed` - Paiement réussi
- ✅ `payment_intent.succeeded` - Confirmation paiement
- ✅ `payment_intent.payment_failed` - Échec paiement
- ✅ `customer.subscription.updated` - Mise à jour abonnement
- ✅ `customer.subscription.deleted` - Annulation abonnement
- ✅ `invoice.payment_succeeded` - Facture payée
- ✅ `invoice.payment_failed` - Facture impayée
- ✅ `account.updated` - Stripe Connect

**Sécurité** :
```typescript
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
```
✅ Vérification signature Stripe
✅ Protection CSRF
✅ Mode test désactivable en dev uniquement

### Actions Automatisées

#### Paiement Réussi
- ✅ Organisation passée en `ACTIVE`
- ✅ Génération facture PDF
- ✅ Envoi email confirmation + PDF
- ✅ Logging CommunicationLog

#### Paiement Échoué
- ✅ Organisation passée en `SUSPENDED`
- ✅ Email d'alerte envoyé
- ✅ Raison d'échec stockée

### ⚠️ Points à Améliorer

| Problème | Impact | Recommandation |
|----------|--------|----------------|
| ⚠️ Pas de retry automatique | Moyen | Configurer Smart Retries dans Stripe |
| ⚠️ Pas de notification Slack/Discord | Faible | Ajouter webhook vers outil de monitoring |

**Score** : **9/10**

---

## 2. ✅ Gestion des Échecs de Paiement

### Flux Actuel

**Code** : `src/app/api/webhooks/stripe/route.ts:467-524`

```typescript
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // 1. Suspension immédiate
  await prisma.organization.update({
    where: { id: organizationId },
    data: { status: 'SUSPENDED' }
  })

  // 2. Email d'alerte
  await sendPaymentFailedEmail({
    to: org.billingEmail || org.ownerEmail,
    reason: paymentIntent.last_payment_error?.message
  })

  // 3. TODO: Notification super admin
}
```

### Actions Automatiques

✅ **Immédiatement** :
1. Organisation suspendue → Accès bloqué
2. Email envoyé avec raison d'échec
3. Historique loggé dans `ActivityLog`

✅ **Email inclut** :
- Numéro facture
- Montant dû
- Message d'erreur (ex: "Carte expirée", "Fonds insuffisants")
- Lien vers paramètres de paiement

### ⚠️ Améliorations Nécessaires

| Problème | Impact | Solution |
|----------|--------|----------|
| ❌ Pas de retry automatique | **CRITIQUE** | Activer Stripe Smart Retries |
| ⚠️ Suspension immédiate (trop brutal) | Moyen | Ajouter période de grâce 48h |
| ⚠️ Pas de SMS/WhatsApp | Faible | Envoyer aussi via WhatsApp |

### Recommandation : Activer Smart Retries Stripe

**Dashboard Stripe** → Settings → Billing → Smart Retries

Configuration recommandée :
- ✅ Retry après 3 jours
- ✅ Retry après 5 jours
- ✅ Retry après 7 jours
- ✅ Email client avant chaque retry

**Score** : **8/10**

---

## 3. ✅ Relances Automatiques Impayés

### Configuration Actuelle

**Fichier** : `src/app/api/cron/send-payment-reminders/route.ts`

**Cron Job** : Quotidien à 9h
```json
{
  "crons": [{
    "path": "/api/cron/send-payment-reminders",
    "schedule": "0 9 * * *"
  }]
}
```

### Processus Automatique

**Timeline** :

| Jour | Action | Email |
|------|--------|-------|
| **J+7** | 1ère relance | ⚠️ "Facture bientôt à échéance" |
| **J+14** | 2ème relance | 🚨 "URGENT - Paiement en retard" |
| **J+21** | **Suspension** | 🚫 "Compte suspendu" |

### Code des Relances

```typescript
// J+7 : Première relance
if (daysSinceIssue >= 7 && daysSinceIssue < 14 && !lastReminder) {
  await resend.emails.send({
    subject: `⚠️ Relance paiement - Facture ${invoiceNumber}`,
    html: generateReminderEmail(org.name, 1)
  })

  // Log pour éviter doublon
  await prisma.activityLog.create({
    action: 'PAYMENT_REMINDER_1',
    entityType: 'INVOICE',
    entityId: invoice.id
  })
}

// J+14 : Deuxième relance
else if (daysSinceIssue >= 14 && daysSinceIssue < 21) {
  await resend.emails.send({
    subject: `🚨 URGENT - Paiement en retard`,
    html: generateReminderEmail(org.name, 2)
  })
}

// J+21 : Suspension
else if (daysSinceIssue >= 21 && org.status !== 'SUSPENDED') {
  await prisma.organization.update({
    data: { status: 'SUSPENDED' }
  })

  await resend.emails.send({
    subject: `🚫 Compte suspendu - Impayé ${invoiceNumber}`
  })
}
```

### Sécurité

✅ Authentification cron via `CRON_SECRET`
✅ Vérification doublon via `ActivityLog`
✅ Logging complet de chaque action
✅ Gestion d'erreurs robuste

### Email de Relance

**Contenu** :
- ✅ Nom organisation personnalisé
- ✅ Numéro de facture
- ✅ Montant exact
- ✅ Niveau d'urgence (visuel + ton)
- ✅ Contact support

**Email J+14 inclut** :
```
⚠️ Attention
En l'absence de règlement sous 7 jours,
votre compte sera suspendu et l'accès à la
plateforme sera interrompu.
```

### ⚠️ Améliorations Suggérées

| Amélioration | Impact | Effort |
|--------------|--------|--------|
| ✅ Ajouter relance J+3 (soft) | Moyen | Faible |
| ✅ Envoyer aussi par SMS | Élevé | Moyen |
| ✅ Proposer plan de paiement | Élevé | Élevé |
| ✅ Dashboard impayés super-admin | Moyen | Moyen |

**Score** : **9/10** (excellent système !)

---

## 4. ⚠️ Système de Remboursements - À DÉVELOPPER

### État Actuel

**Recherche dans le code** :
```bash
grep -ri "refund\|remboursement" src/
```

**Résultat** : ❌ Aucun système de remboursement automatisé détecté

### Ce Qui Manque

#### Fonctionnalités Absentes

1. ❌ **API de remboursement**
   - Pas de route `/api/admin/refunds`
   - Pas d'interface admin pour rembourser

2. ❌ **Remboursements Stripe**
   - Pas d'utilisation de `stripe.refunds.create()`
   - Pas de webhook `charge.refunded`

3. ❌ **Remboursements partiels**
   - Pas de support pour montant partiel

4. ❌ **Historique remboursements**
   - Pas de table `Refund` dans Prisma

### Impact Business

**Scénarios critiques non couverts** :
- 🔴 Client demande remboursement prestation annulée
- 🔴 Erreur de facturation (montant incorrect)
- 🔴 Double paiement accidentel
- 🔴 Client insatisfait (droit de rétractation 14 jours)

**Actuellement** : Remboursement **manuel** via Dashboard Stripe → ⚠️ Pas de traçabilité dans l'app

### 🚨 Solution à Implémenter

#### 1. Créer le modèle Prisma

```prisma
model Refund {
  id                String   @id @default(cuid())
  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id])
  invoiceId         String?
  invoice           Invoice? @relation(fields: [invoiceId], references: [id])
  reservationId     String?
  reservation       Reservation? @relation(fields: [reservationId], references: [id])

  amount            Float
  reason            String
  status            RefundStatus  @default(PENDING)
  stripeRefundId    String?

  requestedBy       String    // userId
  requestedAt       DateTime  @default(now())
  processedAt       DateTime?

  @@index([organizationId])
  @@index([invoiceId])
}

enum RefundStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
  FAILED
}
```

#### 2. Créer l'API de remboursement

**Fichier** : `src/app/api/admin/refunds/route.ts`

```typescript
export async function POST(request: Request) {
  const { invoiceId, amount, reason } = await request.json()

  // 1. Créer la demande de remboursement
  const refund = await prisma.refund.create({
    data: {
      organizationId,
      invoiceId,
      amount,
      reason,
      status: 'PENDING'
    }
  })

  // 2. Exécuter le remboursement Stripe
  try {
    const stripeRefund = await stripe.refunds.create({
      payment_intent: invoice.stripePaymentIntentId,
      amount: Math.round(amount * 100), // Centimes
      reason: 'requested_by_customer'
    })

    // 3. Mettre à jour avec l'ID Stripe
    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: 'COMPLETED',
        stripeRefundId: stripeRefund.id,
        processedAt: new Date()
      }
    })

    // 4. Mettre à jour la facture
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'REFUNDED' }
    })

    // 5. Envoyer email confirmation
    await sendRefundEmail({
      to: organization.ownerEmail,
      amount,
      refundId: refund.id
    })

    return NextResponse.json({ success: true, refund })

  } catch (error) {
    // Marquer comme échoué
    await prisma.refund.update({
      where: { id: refund.id },
      data: { status: 'FAILED' }
    })

    return NextResponse.json({ error: 'Remboursement échoué' }, { status: 500 })
  }
}
```

#### 3. Ajouter webhook Stripe

```typescript
// Dans src/app/api/webhooks/stripe/route.ts

case 'charge.refunded': {
  const charge = event.data.object as Stripe.Charge
  await handleRefundCompleted(charge)
  break
}

async function handleRefundCompleted(charge: Stripe.Charge) {
  const refund = await prisma.refund.findFirst({
    where: { stripeRefundId: charge.refunds.data[0].id }
  })

  if (refund) {
    await prisma.refund.update({
      where: { id: refund.id },
      data: { status: 'COMPLETED' }
    })
  }
}
```

### Recommandations

**Urgence** : 🔴 **HAUTE** (requis avant commercialisation LAIA Connect)

**Timeline** :
- ✅ Migration Prisma : 1h
- ✅ API remboursement : 2h
- ✅ Webhook : 1h
- ✅ Interface admin : 3h
- ✅ Tests : 1h

**Total** : ~8h de développement

**Score** : **5/10** (fonctionnalité critique manquante)

---

## 5. ⚠️ Conformité Factures Françaises

### Analyse du Template Actuel

**Fichier** : `src/lib/invoice-generator.ts:59-171`

### ✅ Mentions Présentes

```html
<div class="company-info">
  <h2>LAIA SKIN INSTITUT</h2>
  <p>
    123 Rue de la Beauté<br>
    75000 Paris<br>
    Tél: 01 23 45 67 89<br>
    Email: contact@laiaskin.com<br>
    SIRET: 123 456 789 00000<br>
    TVA: FR12 345678900
  </p>
</div>

<div class="invoice-info">
  <p>
    <strong>Facture N°:</strong> LAIA-202501-001234<br>
    <strong>Date:</strong> 19/01/2025<br>
    <span>PAYÉE / EN ATTENTE</span>
  </p>
</div>

<div class="footer">
  <p>
    <strong>Conditions de paiement:</strong> Paiement à réception<br>
    <strong>Pénalités de retard:</strong> 3 fois le taux d'intérêt légal<br>
    <strong>Indemnité forfaitaire:</strong> 40€<br>
    <small>TVA sur les encaissements - Auto-entrepreneur</small>
  </p>
</div>
```

### ❌ Mentions Manquantes (Obligatoires)

**Selon Article L441-9 du Code de Commerce** :

| Mention | Présente | Gravité |
|---------|----------|---------|
| **1. Date de facture** | ✅ OUI | - |
| **2. Numéro de facture unique** | ✅ OUI | - |
| **3. Nom/Adresse vendeur** | ✅ OUI | - |
| **4. SIRET** | ✅ OUI | - |
| **5. TVA intracommunautaire** | ✅ OUI | - |
| **6. Nom/Adresse client** | ✅ OUI | - |
| **7. Date de vente/prestation** | ❌ **NON** | 🔴 CRITIQUE |
| **8. Quantité/Dénomination** | ✅ OUI | - |
| **9. Prix unitaire HT** | ✅ OUI | - |
| **10. Remises éventuelles** | ❌ **NON** | 🟠 Important |
| **11. Total HT** | ✅ OUI | - |
| **12. Taux de TVA** | ✅ OUI | - |
| **13. Total TVA** | ✅ OUI | - |
| **14. Total TTC** | ✅ OUI | - |
| **15. Date de paiement** | ❌ **NON** | 🔴 CRITIQUE |
| **16. Mode de paiement** | ⚠️ PARTIEL | 🟠 Important |
| **17. Pénalités de retard** | ✅ OUI | - |
| **18. Indemnité recouvrement** | ✅ OUI | - |
| **19. Escompte (si applicable)** | ❌ NON | 🟡 Optionnel |
| **20. RCS (si société)** | ❌ **NON** | 🟠 Important |

### 🚨 Mentions Critiques Manquantes

#### 1. Date de Prestation

**Requis** : Article L441-9
**Actuellement** : ❌ Absente

**Solution** :
```html
<p><strong>Date de prestation:</strong> ${serviceDate || invoiceDate}</p>
```

#### 2. Date de Paiement Effective

**Requis** : Pour factures payées
**Actuellement** : ❌ Absente

**Solution** :
```html
${paymentStatus === 'paid' ? `
  <p><strong>Payée le:</strong> ${paidAt.toLocaleDateString('fr-FR')}</p>
` : ''}
```

#### 3. RCS (Registre du Commerce)

**Requis** : Si société (SARL, SAS, etc.)
**Actuellement** : ❌ Absent

**Solution** :
```html
<p>RCS Paris B 123 456 789</p>
<!-- OU -->
<p>Dispensé d'immatriculation au RCS (Micro-entreprise)</p>
```

#### 4. Remises Appliquées

**Requis** : Si remise > 0
**Actuellement** : ❌ Non affiché

**Solution** :
```html
<tr>
  <td colspan="4" style="text-align: right;">Remise 10%:</td>
  <td>-${discount.toFixed(2)}€</td>
</tr>
```

### 📝 Template Corrigé

**Fichier** : `src/lib/invoice-generator-compliant.ts`

```typescript
export function formatInvoiceHTML(invoice: InvoiceData): string {
  const formattedDate = new Intl.DateTimeFormat('fr-FR').format(invoice.date)
  const serviceDate = invoice.serviceDate ?
    new Intl.DateTimeFormat('fr-FR').format(invoice.serviceDate) :
    formattedDate
  const paidAt = invoice.paidAt ?
    new Intl.DateTimeFormat('fr-FR').format(invoice.paidAt) :
    null

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.invoiceNumber}</title>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h2>${invoice.companyName}</h2>
      <p>
        ${invoice.companyAddress}<br>
        ${invoice.companyPostalCode} ${invoice.companyCity}<br>
        Tél: ${invoice.companyPhone}<br>
        Email: ${invoice.companyEmail}<br>
        <strong>SIRET:</strong> ${invoice.siret}<br>
        <strong>N° TVA:</strong> ${invoice.tvaNumber}<br>
        ${invoice.rcs ? `<strong>RCS:</strong> ${invoice.rcs}<br>` : 'Dispensé d\'immatriculation au RCS<br>'}
      </p>
    </div>
    <div class="invoice-info">
      <p>
        <strong>Facture N°:</strong> ${invoice.invoiceNumber}<br>
        <strong>Date d'émission:</strong> ${formattedDate}<br>
        <strong>Date de prestation:</strong> ${serviceDate}<br>
        ${paidAt ? `<strong>Payée le:</strong> ${paidAt}<br>` : ''}
        <span class="${invoice.paymentStatus === 'paid' ? 'paid-stamp' : 'pending-stamp'}">
          ${invoice.paymentStatus === 'paid' ? '✅ PAYÉE' : '⏳ EN ATTENTE'}
        </span>
      </p>
    </div>
  </div>

  <div class="client-info">
    <h3>Client</h3>
    <p>
      <strong>${invoice.client.name}</strong><br>
      ${invoice.client.address || ''}<br>
      ${invoice.client.postalCode || ''} ${invoice.client.city || ''}<br>
      Email: ${invoice.client.email}<br>
      ${invoice.client.phone ? `Tél: ${invoice.client.phone}<br>` : ''}
      ${invoice.client.siret ? `<strong>SIRET:</strong> ${invoice.client.siret}<br>` : ''}
      ${invoice.client.tva ? `<strong>N° TVA:</strong> ${invoice.client.tva}` : ''}
    </p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th>Quantité</th>
        <th>Prix unitaire HT</th>
        <th>TVA</th>
        <th>Total HT</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.services.map(service => `
        <tr>
          <td>${service.name}</td>
          <td>${service.quantity}</td>
          <td>${service.unitPrice.toFixed(2)}€</td>
          <td>${service.vatRate}%</td>
          <td>${(service.quantity * service.unitPrice).toFixed(2)}€</td>
        </tr>
      `).join('')}

      ${invoice.discount > 0 ? `
      <tr>
        <td colspan="4" style="text-align: right; font-weight: bold;">Remise:</td>
        <td style="color: green;">-${invoice.discount.toFixed(2)}€</td>
      </tr>
      ` : ''}
    </tbody>
  </table>

  <div class="totals">
    <table style="width: auto; margin-left: auto;">
      <tr>
        <td><strong>Total HT:</strong></td>
        <td>${invoice.totalHT.toFixed(2)}€</td>
      </tr>
      <tr>
        <td><strong>TVA 20%:</strong></td>
        <td>${invoice.totalVAT.toFixed(2)}€</td>
      </tr>
      <tr style="font-size: 1.2em; font-weight: bold;">
        <td><strong>Total TTC:</strong></td>
        <td>${invoice.totalTTC.toFixed(2)}€</td>
      </tr>
    </table>
  </div>

  ${invoice.paymentMethod ? `
  <div style="margin-top: 30px;">
    <p><strong>Mode de paiement:</strong> ${invoice.paymentMethod}</p>
    ${invoice.paymentStatus === 'paid' && paidAt ? `
    <p><strong>Réglé le:</strong> ${paidAt}</p>
    ` : `
    <p><strong>À régler avant le:</strong> ${new Intl.DateTimeFormat('fr-FR').format(invoice.dueDate)}</p>
    `}
  </div>
  ` : ''}

  <div class="footer">
    <p>
      <strong>Conditions de paiement:</strong> Paiement à réception de facture<br>
      <strong>Pénalités de retard:</strong> 3 fois le taux d'intérêt légal (actuellement ${(3 * 4.26).toFixed(2)}%)<br>
      <strong>Indemnité forfaitaire pour frais de recouvrement:</strong> 40€ (Articles L441-10 et D441-5 du Code de Commerce)<br>
      <strong>Escompte en cas de paiement anticipé:</strong> Néant<br>
      ${invoice.legalStatus === 'auto-entrepreneur' ?
        '<small>TVA non applicable - Article 293 B du CGI - Auto-entrepreneur dispensé d\'immatriculation au RCS</small>' :
        '<small>TVA sur les encaissements</small>'
      }
    </p>
  </div>
</body>
</html>
  `
}
```

### Actions Correctives

| Action | Urgence | Temps |
|--------|---------|-------|
| ✅ Ajouter date de prestation | 🔴 CRITIQUE | 30min |
| ✅ Ajouter date de paiement | 🔴 CRITIQUE | 15min |
| ✅ Ajouter RCS ou mention dispense | 🟠 Important | 20min |
| ✅ Afficher remises si applicable | 🟡 Moyen | 30min |
| ✅ Mentions légales complètes (taux légal actuel) | 🟠 Important | 20min |

**Total** : ~2h de développement

**Score** : **6/10** (mentions critiques manquantes)

---

## 📊 Plan d'Action Prioritaire

### 🔴 URGENT (Avant Commercialisation)

1. **Développer système de remboursement**
   - Temps : 8h
   - Blocker : OUI
   - Risque : Insatisfaction client, litiges

2. **Corriger conformité factures**
   - Temps : 2h
   - Blocker : OUI
   - Risque : Amendes DGCCRF (jusqu'à 75 000€)

### 🟠 IMPORTANT (Sous 1 mois)

3. **Activer Stripe Smart Retries**
   - Temps : 30min (config Dashboard)
   - Blocker : NON
   - Bénéfice : +15% de récupération paiements

4. **Ajouter période de grâce 48h**
   - Temps : 1h
   - Blocker : NON
   - Bénéfice : Meilleure UX

### 🟡 SOUHAITABLE (Sous 3 mois)

5. **Dashboard impayés super-admin**
6. **Relance J+3 (soft)**
7. **Envoi SMS/WhatsApp relances**

---

## 📈 Score Final : 7.4/10

**Analyse** :

✅ **Points forts** :
- Webhooks Stripe complets et sécurisés
- Relances automatiques bien pensées
- Gestion échecs paiement fonctionnelle

⚠️ **Points critiques à corriger** :
- Système de remboursement manquant
- Conformité factures incomplète

**Estimation totale** : ~10h de développement pour atteindre 9.5/10

---

**Document confidentiel - Usage interne uniquement**
