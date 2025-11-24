# 🔴 TODO CRITIQUES AVANT COMMERCIALISATION

**Date** : 24 novembre 2025
**Total TODO dans le code** : 66 occurrences dans 41 fichiers

---

## 🚨 BLOQUANTS (À CORRIGER IMMÉDIATEMENT)

### 1. **Authentification incomplète** - `/src/app/api/admin/search/route.ts`
```typescript
// ❌ PROBLÈME
const decoded: any = { userId: 'temp' }; // TODO: Remplacer par verifyToken(token)
```

**Impact** : Faille de sécurité MAJEURE - n'importe qui peut accéder à la recherche admin

**Solution** :
```typescript
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  // ... reste du code
}
```

**Fichiers à modifier** :
- `/src/app/api/admin/search/route.ts` (ligne 26 et 335)

---

### 2. **Vérification SUPER_ADMIN manquante** - `/src/app/api/super-admin/contract-clauses/route.ts`
```typescript
// ❌ PROBLÈME
// TODO: Ajouter vérification du rôle SUPER_ADMIN via session
```

**Impact** : N'importe quel admin peut modifier les clauses contractuelles

**Solution** :
```typescript
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  // ... reste du code
}
```

**Fichiers à modifier** :
- `/src/app/api/super-admin/contract-clauses/route.ts` (ligne 14 et 48)

---

### 3. **Modèle pushSubscription manquant** - Push notifications
```typescript
// ❌ PROBLÈME
// TODO: Ajouter le modèle pushSubscription dans schema.prisma si nécessaire
```

**Impact** : Push notifications ne fonctionnent pas

**Options** :
1. **Implémenter** : Ajouter le modèle Prisma + APIs complètes
2. **Supprimer** : Retirer les routes push si non utilisées (recommandé pour MVP)

**Fichiers concernés** :
- `/src/app/api/push/subscribe/route.ts`
- `/src/app/api/push/unsubscribe/route.ts`
- `/src/app/api/admin/push/send/route.ts`

**Recommandation** : **Supprimer** pour le MVP, ajouter en V2

---

## ⚠️ IMPORTANTS (À CORRIGER AVANT LANCEMENT)

### 4. **Emails manquants**

**Liste des emails à implémenter** :

| Email | Fichier | Priorité |
|-------|---------|----------|
| Confirmation achat SMS | `/api/webhooks/stripe/sms-purchase/route.ts:68` | 🟠 |
| Bienvenue lead converti | `/api/super-admin/leads/[id]/convert/route.ts:140` | 🟠 |
| Confirmation démo réservée | `/api/super-admin/demo-bookings/route.ts:94` | 🟠 |
| Avoir/remboursement | `/api/super-admin/invoices/[id]/credit-note/route.ts:181` | 🟡 |
| Erreurs génération factures | `/api/cron/generate-monthly-invoices/route.ts:161` | 🔴 |

**Solution** :
```typescript
import { sendEmail } from '@/lib/email-service';

// Exemple pour confirmation achat SMS
await sendEmail({
  to: organization.email,
  subject: 'Confirmation achat crédits SMS',
  template: 'sms-purchase-confirmation',
  data: {
    credits: smsCredits,
    price: amount / 100
  }
});
```

---

### 5. **Système de reminders incomplet** - `/api/cron/send-reminders/route.ts`
```typescript
// ❌ PROBLÈME
// TODO: Implémenter avec Redis ou une table dédiée
async function isReminderAlreadySent(key: string): Promise<boolean> {
  return false; // ⚠️ Permet envoi multiple du même reminder
}
```

**Impact** : Les clients peuvent recevoir 10x le même reminder

**Solution** :
```typescript
// Créer table SentReminder dans schema.prisma
model SentReminder {
  id           String   @id @default(cuid())
  bookingId    String
  reminderType String   // '24h' | '2h' | 'post-visit'
  sentAt       DateTime @default(now())

  @@unique([bookingId, reminderType])
  @@index([bookingId])
}

// Vérifier avant envoi
async function isReminderAlreadySent(bookingId: string, type: string) {
  const sent = await prisma.sentReminder.findUnique({
    where: {
      bookingId_reminderType: { bookingId, reminderType: type }
    }
  });
  return !!sent;
}
```

---

### 6. **Logging incomplet** - `/api/cron/generate-monthly-invoices/route.ts`
```typescript
// TODO: Créer le modèle ActivityLog si nécessaire
// await prisma.activityLog.create({ ... })
```

**Impact** : Pas de traçabilité des générations de factures

**Solution** : Utiliser le modèle **AuditLog** existant au lieu de créer ActivityLog

```typescript
await prisma.auditLog.create({
  data: {
    organizationId: organization.id,
    userId: 'SYSTEM',
    action: 'INVOICE_GENERATED',
    entityType: 'Invoice',
    entityId: invoice.id,
    metadata: JSON.stringify({
      period: `${year}-${month}`,
      amount: invoice.totalAmount,
      status: invoice.status
    })
  }
});
```

---

## 🟡 SOUHAITABLES (À FAIRE EN V2)

### 7. **Photos d'avis** - `/api/reviews/collect/route.ts:94`
```typescript
// TODO: Créer une table séparée pour les photos si nécessaire
```

**Statut** : Fonctionnel mais non optimal

**Action** : Garder pour V2

---

### 8. **Produits vendus** - Rapports
```typescript
// TODO: Implémenter quand le système de produits sera prêt
data.productsSold = 0;
```

**Statut** : Le système de produits existe déjà dans le schéma Prisma !

**Action** : Implémenter le calcul dans les rapports

---

### 9. **Taux de conversion leads** - Rapports
```typescript
// TODO: Implémenter un système de leads pour calculer le taux de conversion
data.conversionRate = 0;
```

**Statut** : Le modèle Lead existe déjà

**Action** : Calculer `(clients créés ce mois / leads reçus ce mois) * 100`

---

### 10. **Segmentation campagnes** - `/api/admin/campaigns/route.ts:126`
```typescript
segments: ['Tous les clients'], // TODO: Implémenter la segmentation
```

**Statut** : Fonctionnel mais basique

**Action** : Ajouter en V2 (segments par dépense, fréquence, etc.)

---

### 11. **Google Reviews API** - `/api/admin/google-reviews/sync/route.ts:20`
```typescript
// TODO: Implémenter l'appel à l'API Google Places pour récupérer les avis
// Pour le moment, on simule avec des données de test
```

**Statut** : Données mockées

**Action** : Implémenter API Google Places (nécessite clé API Google)

---

## 📊 RÉSUMÉ PRIORISATION

| Priorité | Nombre | Temps estimé | Bloquant ? |
|----------|--------|--------------|------------|
| 🔴 Critique | 3 | 2-3 jours | ✅ OUI |
| 🟠 Important | 6 | 3-4 jours | ⚠️ Recommandé |
| 🟡 Souhaitable | 5 | 5-7 jours | ❌ V2 |

**TOTAL : 10-14 jours pour tout corriger**

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Jour 1-2 : Sécurité (CRITIQUE)
- [ ] Corriger authentification `/api/admin/search/route.ts`
- [ ] Vérifier SUPER_ADMIN dans toutes les routes `/api/super-admin/*`
- [ ] Audit complet de sécurité (toutes les routes API)

### Jour 3-4 : Emails transactionnels
- [ ] Email confirmation achat SMS
- [ ] Email bienvenue lead converti
- [ ] Email confirmation démo
- [ ] Email erreurs génération factures (super admin)

### Jour 5-6 : Reminders & Logging
- [ ] Créer table `SentReminder` dans schema.prisma
- [ ] Implémenter vérification anti-doublons
- [ ] Ajouter logs AuditLog pour factures

### Jour 7 : Nettoyage & Décisions
- [ ] Supprimer routes push notifications (ou implémenter complètement)
- [ ] Décider : Google Reviews API (V1 ou V2 ?)
- [ ] Décider : Rapports produits/leads (V1 ou V2 ?)

### Jour 8-10 : Tests E2E
- [ ] Tester tout le parcours client
- [ ] Tester génération factures
- [ ] Tester envoi reminders
- [ ] Tester sécurité (injection, XSS, etc.)

---

## ✅ CHECKLIST VALIDATION

Avant de passer en production :

### Sécurité
- [ ] ✅ Toutes les routes `/api/admin/*` vérifient l'authentification
- [ ] ✅ Toutes les routes `/api/super-admin/*` vérifient le rôle SUPER_ADMIN
- [ ] ✅ Aucun TODO critique restant
- [ ] ✅ Injection SQL impossible (Prisma protège)
- [ ] ✅ XSS impossible (React protège)
- [ ] ✅ CSRF protection activée

### Emails
- [ ] ✅ Tous les emails transactionnels configurés
- [ ] ✅ Templates designés (logo LAIA)
- [ ] ✅ Tests envoi réels effectués

### Fonctionnalités
- [ ] ✅ Reminders envoyés 1 seule fois
- [ ] ✅ Factures générées correctement
- [ ] ✅ Logs AuditLog pour traçabilité
- [ ] ✅ Rapports avec données réelles

---

**Prochaine action** : Commencer par l'audit de sécurité complet !
