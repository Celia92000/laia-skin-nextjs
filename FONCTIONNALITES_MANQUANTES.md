# ❌ FONCTIONNALITÉS MANQUANTES - LAIA PLATFORM
**Date** : 31 octobre 2025
**Audit** : Fonctionnalités identifiées mais NON implémentées

---

## 📦 1. STOCK - Déduction automatique (MANQUANT)

### ❌ Statut : NON IMPLÉMENTÉ

**Vérification** :
```bash
grep -rn "deduct\|stockDeduction\|updateStock" src/components/ValidationPaymentModalOptimized.tsx
```
**Résultat** : 0 occurrence

**Problème** :
- La validation de paiement ne déclenche PAS de déduction automatique du stock
- Lorsqu'un service est validé, les produits liés ne sont pas déduits
- L'admin doit gérer le stock manuellement

**Impact** :
- ⚠️ Stock non synchronisé avec les prestations
- ⚠️ Risque de rupture de stock non détectée
- ⚠️ Gestion manuelle chronophage

**Code actuel** :
```typescript
// src/components/ValidationPaymentModalOptimized.tsx
// Ligne 1-1260 : AUCUNE référence à stock
```

**Solution recommandée** :
```typescript
// À ajouter dans ValidationPaymentModalOptimized.tsx après validation paiement

async function deductStockForServices(reservationId: string) {
  // Récupérer les services de la réservation
  const reservationServices = await prisma.reservationService.findMany({
    where: { reservationId },
    include: {
      service: {
        include: {
          stockLinks: {
            include: { stockItem: true }
          }
        }
      }
    }
  })

  // Déduire le stock pour chaque produit lié
  for (const rs of reservationServices) {
    for (const link of rs.service.stockLinks) {
      await prisma.stockItem.update({
        where: { id: link.stockItemId },
        data: {
          quantity: {
            decrement: link.quantityPerUse  // Décrémenter selon liaison
          }
        }
      })

      // Logger l'historique
      await prisma.stockHistory.create({
        data: {
          stockItemId: link.stockItemId,
          type: 'DEDUCTION',
          quantity: -link.quantityPerUse,
          reason: `Service: ${rs.service.name}`,
          reservationId
        }
      })
    }
  }
}

// Appeler après validation paiement (ligne ~800)
await deductStockForServices(reservation.id)
```

**Fichiers à modifier** :
1. `/src/components/ValidationPaymentModalOptimized.tsx` (ajouter hook après paiement)
2. `/src/app/api/admin/reservations/[id]/payment/route.ts` (déduire côté serveur)

**Priorité** : 🟡 MOYENNE (fonctionnalité importante mais workaround manuel possible)

---

## 📦 2. STOCK - Commandes fournisseurs (MANQUANT)

### ❌ Statut : NON IMPLÉMENTÉ

**Vérification** :
```bash
grep -rn "supplier.*order\|PurchaseOrder" src/ --include="*.tsx" --include="*.ts"
```
**Résultat** : 0 occurrence

**Problème** :
- Aucune interface pour passer des commandes fournisseurs
- Pas de gestion des bons de commande
- Pas de tracking des livraisons

**Impact** :
- ⚠️ Réapprovisionnement manuel uniquement
- ⚠️ Pas d'historique des commandes
- ⚠️ Gestion papier nécessaire

**Solution recommandée** :

**1. Créer modèle Prisma** :
```prisma
// prisma/schema.prisma
model SupplierOrder {
  id            String   @id @default(cuid())
  orderNumber   String   @unique
  supplierId    String
  supplier      Supplier @relation(fields: [supplierId], references: [id])
  status        OrderStatus @default(PENDING)
  orderDate     DateTime @default(now())
  expectedDate  DateTime?
  receivedDate  DateTime?
  totalAmount   Float
  notes         String?
  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id])

  items         SupplierOrderItem[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SupplierOrderItem {
  id              String   @id @default(cuid())
  orderId         String
  order           SupplierOrder @relation(fields: [orderId], references: [id])
  stockItemId     String
  stockItem       StockItem @relation(fields: [stockItemId], references: [id])
  quantity        Int
  unitPrice       Float
  totalPrice      Float
}

enum OrderStatus {
  PENDING     // En attente
  SENT        // Envoyée
  CONFIRMED   // Confirmée fournisseur
  SHIPPED     // Expédiée
  RECEIVED    // Reçue
  CANCELLED   // Annulée
}

model Supplier {
  id             String   @id @default(cuid())
  name           String
  email          String?
  phone          String?
  address        String?
  contactPerson  String?
  paymentTerms   String?  // Conditions de paiement
  deliveryTime   Int?     // Délai de livraison en jours
  orders         SupplierOrder[]
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
}
```

**2. Créer composant UI** :
```typescript
// src/components/SupplierOrdersTab.tsx
export default function SupplierOrdersTab() {
  const [orders, setOrders] = useState([])
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)

  return (
    <div>
      <button onClick={() => setShowNewOrderModal(true)}>
        Nouvelle commande fournisseur
      </button>

      <table>
        <thead>
          <tr>
            <th>N° commande</th>
            <th>Fournisseur</th>
            <th>Date</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.orderNumber}</td>
              <td>{order.supplier.name}</td>
              <td>{formatDate(order.orderDate)}</td>
              <td>{order.totalAmount}€</td>
              <td>
                <StatusBadge status={order.status} />
              </td>
              <td>
                <button onClick={() => markAsReceived(order.id)}>
                  Marquer comme reçue
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**3. Ajouter route API** :
```typescript
// src/app/api/admin/supplier-orders/route.ts
export async function POST(request: Request) {
  const { supplierId, items, expectedDate } = await request.json()

  // Créer la commande
  const order = await prisma.supplierOrder.create({
    data: {
      orderNumber: generateOrderNumber(),
      supplierId,
      status: 'PENDING',
      expectedDate,
      totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
      organizationId,
      items: {
        create: items
      }
    }
  })

  // Envoyer email au fournisseur
  await sendSupplierOrderEmail(order)

  return NextResponse.json({ order })
}
```

**Priorité** : 🟢 BASSE (fonctionnalité avancée, gestion manuelle suffisante pour MVP)

---

## 📊 3. CRM - Segmentation RFM (MANQUANT)

### ❌ Statut : NON IMPLÉMENTÉ

**Vérification** :
```bash
grep -rn "rfm\|recency.*frequency.*monetary" src/
```
**Résultat** : 0 occurrence

**Problème** :
- Pas de scoring RFM (Recency, Frequency, Monetary)
- Pas de segmentation automatique des clients
- Impossible d'identifier les clients VIP/risque

**Impact** :
- ⚠️ Pas de ciblage marketing efficace
- ⚠️ Impossible de détecter clients à risque
- ⚠️ Pas de stratégie de rétention

**Solution recommandée** :

**1. Créer fonction de calcul RFM** :
```typescript
// src/lib/rfm-calculator.ts
interface RFMScore {
  recency: number      // 1-5 (5 = très récent)
  frequency: number    // 1-5 (5 = très fréquent)
  monetary: number     // 1-5 (5 = gros budget)
  score: number        // Score combiné 3-15
  segment: 'vip' | 'fidele' | 'actif' | 'risque' | 'perdu'
}

export async function calculateRFM(userId: string, organizationId: string): Promise<RFMScore> {
  const today = new Date()

  // RECENCY : Dernière visite (en jours)
  const lastReservation = await prisma.reservation.findFirst({
    where: { userId, organizationId, status: 'completed' },
    orderBy: { date: 'desc' }
  })

  const daysSinceLastVisit = lastReservation
    ? Math.floor((today.getTime() - lastReservation.date.getTime()) / (1000 * 60 * 60 * 24))
    : 999

  const recency =
    daysSinceLastVisit < 30 ? 5 :
    daysSinceLastVisit < 60 ? 4 :
    daysSinceLastVisit < 90 ? 3 :
    daysSinceLastVisit < 180 ? 2 : 1

  // FREQUENCY : Nombre de visites (12 derniers mois)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const visitCount = await prisma.reservation.count({
    where: {
      userId,
      organizationId,
      status: 'completed',
      date: { gte: oneYearAgo }
    }
  })

  const frequency =
    visitCount >= 12 ? 5 :
    visitCount >= 8 ? 4 :
    visitCount >= 4 ? 3 :
    visitCount >= 2 ? 2 : 1

  // MONETARY : Montant dépensé (12 derniers mois)
  const totalSpent = await prisma.reservation.aggregate({
    where: {
      userId,
      organizationId,
      status: 'completed',
      date: { gte: oneYearAgo }
    },
    _sum: { totalPrice: true }
  })

  const spent = totalSpent._sum.totalPrice || 0

  const monetary =
    spent >= 1000 ? 5 :
    spent >= 500 ? 4 :
    spent >= 200 ? 3 :
    spent >= 100 ? 2 : 1

  // Score combiné
  const score = recency + frequency + monetary

  // Segmentation
  let segment: RFMScore['segment'] = 'perdu'

  if (recency >= 4 && frequency >= 4 && monetary >= 4) {
    segment = 'vip'  // Champions
  } else if (recency >= 3 && frequency >= 3) {
    segment = 'fidele'  // Clients fidèles
  } else if (recency >= 3) {
    segment = 'actif'  // Clients actifs
  } else if (frequency >= 2 || monetary >= 2) {
    segment = 'risque'  // À risque de churn
  } else {
    segment = 'perdu'  // Clients perdus
  }

  return { recency, frequency, monetary, score, segment }
}
```

**2. Créer cron de mise à jour** :
```typescript
// src/app/api/cron/update-rfm-scores/route.ts
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Mettre à jour tous les clients
  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' }
  })

  for (const client of clients) {
    const rfm = await calculateRFM(client.id, client.organizationId!)

    await prisma.user.update({
      where: { id: client.id },
      data: {
        rfmRecency: rfm.recency,
        rfmFrequency: rfm.frequency,
        rfmMonetary: rfm.monetary,
        rfmScore: rfm.score,
        rfmSegment: rfm.segment
      }
    })
  }

  return NextResponse.json({ updated: clients.length })
}
```

**3. Ajouter champs BDD** :
```prisma
model User {
  // ...
  rfmRecency    Int?
  rfmFrequency  Int?
  rfmMonetary   Int?
  rfmScore      Int?
  rfmSegment    String?  // vip, fidele, actif, risque, perdu
  rfmUpdatedAt  DateTime?
}
```

**4. Interface de segmentation** :
```typescript
// src/components/ClientSegmentation.tsx
export default function ClientSegmentation() {
  const [clients, setClients] = useState([])
  const [selectedSegment, setSelectedSegment] = useState('all')

  useEffect(() => {
    loadClients()
  }, [selectedSegment])

  const segments = [
    { value: 'vip', label: 'VIP Champions', color: 'bg-purple-500', count: clients.filter(c => c.rfmSegment === 'vip').length },
    { value: 'fidele', label: 'Clients fidèles', color: 'bg-blue-500', count: clients.filter(c => c.rfmSegment === 'fidele').length },
    { value: 'actif', label: 'Clients actifs', color: 'bg-green-500', count: clients.filter(c => c.rfmSegment === 'actif').length },
    { value: 'risque', label: 'À risque', color: 'bg-orange-500', count: clients.filter(c => c.rfmSegment === 'risque').length },
    { value: 'perdu', label: 'Clients perdus', color: 'bg-red-500', count: clients.filter(c => c.rfmSegment === 'perdu').length }
  ]

  return (
    <div>
      <h2>Segmentation RFM</h2>

      <div className="grid grid-cols-5 gap-4">
        {segments.map(seg => (
          <button
            key={seg.value}
            onClick={() => setSelectedSegment(seg.value)}
            className={`${seg.color} p-4 rounded text-white`}
          >
            <div className="text-3xl font-bold">{seg.count}</div>
            <div>{seg.label}</div>
          </button>
        ))}
      </div>

      <table>
        {/* Liste des clients du segment sélectionné */}
      </table>
    </div>
  )
}
```

**Priorité** : 🟡 MOYENNE (fonctionnalité marketing avancée)

---

## 🤖 4. CRM - Workflows automatisés (MANQUANT)

### ❌ Statut : NON IMPLÉMENTÉ

**Vérification** :
```bash
grep -rn "workflow\|automation.*trigger" src/components/UnifiedCRMTab.tsx
```
**Résultat** : 0 occurrence

**Problème** :
- Pas de workflows automatisés
- Pas de déclenchement d'actions selon conditions
- Gestion manuelle des relances

**Exemple de workflows manquants** :
- Client inactif > 60 jours → Email de relance automatique
- Client VIP → Notification admin pour offre personnalisée
- Anniversaire client → Email + SMS automatiques
- 3 RDV annulés → Flag "client à risque"

**Solution recommandée** :

**1. Créer modèle Workflow** :
```prisma
model Workflow {
  id            String   @id @default(cuid())
  name          String
  description   String?
  enabled       Boolean  @default(true)

  // Trigger
  triggerType   String   // 'time_based', 'event_based', 'manual'
  triggerConfig Json     // { event: 'client_inactive_60_days' }

  // Conditions
  conditions    Json     // [{ field: 'totalSpent', operator: '>', value: 100 }]

  // Actions
  actions       Json     // [{ type: 'send_email', template: 'reactivation' }]

  organizationId String
  organization  Organization @relation(fields: [organizationId], references: [id])

  executions    WorkflowExecution[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model WorkflowExecution {
  id           String   @id @default(cuid())
  workflowId   String
  workflow     Workflow @relation(fields: [workflowId], references: [id])
  userId       String?
  user         User?    @relation(fields: [userId], references: [id])
  status       String   // 'success', 'failed', 'pending'
  result       Json?
  executedAt   DateTime @default(now())
}
```

**2. Moteur de workflows** :
```typescript
// src/lib/workflow-engine.ts
export async function executeWorkflow(workflowId: string, context: any) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId }
  })

  if (!workflow || !workflow.enabled) return

  // Vérifier les conditions
  const conditionsMet = evaluateConditions(workflow.conditions, context)
  if (!conditionsMet) return

  // Exécuter les actions
  const actions = workflow.actions as any[]

  for (const action of actions) {
    switch (action.type) {
      case 'send_email':
        await sendEmail({
          to: context.user.email,
          template: action.template,
          data: context
        })
        break

      case 'send_sms':
        await sendSMS({
          to: context.user.phone,
          message: action.message
        })
        break

      case 'add_tag':
        await addUserTag(context.user.id, action.tag)
        break

      case 'create_task':
        await createTask({
          userId: context.user.id,
          title: action.title,
          description: action.description
        })
        break
    }
  }

  // Logger l'exécution
  await prisma.workflowExecution.create({
    data: {
      workflowId,
      userId: context.user.id,
      status: 'success',
      result: { actionsExecuted: actions.length }
    }
  })
}
```

**3. Cron de vérification** :
```typescript
// src/app/api/cron/check-workflows/route.ts
export async function GET(request: NextRequest) {
  const workflows = await prisma.workflow.findMany({
    where: {
      enabled: true,
      triggerType: 'time_based'
    }
  })

  for (const workflow of workflows) {
    const config = workflow.triggerConfig as any

    // Exemple: clients inactifs 60 jours
    if (config.event === 'client_inactive_60_days') {
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const inactiveClients = await prisma.user.findMany({
        where: {
          role: 'CLIENT',
          organizationId: workflow.organizationId,
          lastReservationDate: { lt: sixtyDaysAgo }
        }
      })

      for (const client of inactiveClients) {
        await executeWorkflow(workflow.id, { user: client })
      }
    }
  }

  return NextResponse.json({ checked: workflows.length })
}
```

**Priorité** : 🟡 MOYENNE (automatisation utile mais non bloquante)

---

## 📉 5. CRM - Prédiction churn (MANQUANT)

### ❌ Statut : NON IMPLÉMENTÉ

**Vérification** :
```bash
grep -rn "churn\|attrition" src/
```
**Résultat** : 1 occurrence (inactive-clients segment seulement)

**Problème** :
- Pas de prédiction de churn (risque de perte de client)
- Pas de score de risque
- Détection tardive des clients à risque

**Solution recommandée** :

**1. Fonction de calcul du risque** :
```typescript
// src/lib/churn-predictor.ts
interface ChurnRisk {
  score: number         // 0-100 (100 = très haut risque)
  level: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]     // Facteurs de risque détectés
  recommendations: string[]
}

export async function predictChurn(userId: string, organizationId: string): Promise<ChurnRisk> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      reservations: {
        where: { organizationId },
        orderBy: { date: 'desc' },
        take: 10
      }
    }
  })

  let score = 0
  const factors: string[] = []

  // Facteur 1: Inactivité récente
  const lastVisit = user.reservations[0]?.date
  if (lastVisit) {
    const daysSince = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSince > 180) {
      score += 40
      factors.push('Inactif depuis 6 mois')
    } else if (daysSince > 90) {
      score += 25
      factors.push('Inactif depuis 3 mois')
    } else if (daysSince > 60) {
      score += 15
      factors.push('Inactif depuis 2 mois')
    }
  }

  // Facteur 2: Baisse de fréquence
  const recentVisits = user.reservations.slice(0, 3).length
  const olderVisits = user.reservations.slice(3, 6).length

  if (recentVisits < olderVisits) {
    score += 20
    factors.push('Baisse de fréquence des visites')
  }

  // Facteur 3: Annulations récentes
  const recentCancellations = user.reservations.filter(r =>
    r.status === 'cancelled' &&
    r.date > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  ).length

  if (recentCancellations >= 2) {
    score += 15
    factors.push(`${recentCancellations} annulations récentes`)
  }

  // Facteur 4: Baisse du panier moyen
  const recentAvg = average(user.reservations.slice(0, 3).map(r => r.totalPrice))
  const olderAvg = average(user.reservations.slice(3, 6).map(r => r.totalPrice))

  if (recentAvg < olderAvg * 0.7) {
    score += 10
    factors.push('Baisse du panier moyen')
  }

  // Facteur 5: Pas d'interaction récente (emails non ouverts, etc.)
  // À implémenter avec tracking emails

  // Niveau de risque
  const level: ChurnRisk['level'] =
    score >= 70 ? 'critical' :
    score >= 50 ? 'high' :
    score >= 30 ? 'medium' : 'low'

  // Recommandations
  const recommendations: string[] = []

  if (score >= 50) {
    recommendations.push('Appel téléphonique personnel recommandé')
    recommendations.push('Offre personnalisée -30%')
  } else if (score >= 30) {
    recommendations.push('Email de relance avec offre spéciale')
    recommendations.push('SMS de rappel')
  }

  return { score, level, factors, recommendations }
}
```

**2. Dashboard de monitoring** :
```typescript
// src/components/ChurnMonitoring.tsx
export default function ChurnMonitoring() {
  const [atRiskClients, setAtRiskClients] = useState([])

  useEffect(() => {
    loadAtRiskClients()
  }, [])

  const riskLevels = [
    { level: 'critical', label: 'Critique', color: 'bg-red-500', count: atRiskClients.filter(c => c.churnRisk?.level === 'critical').length },
    { level: 'high', label: 'Haut', color: 'bg-orange-500', count: atRiskClients.filter(c => c.churnRisk?.level === 'high').length },
    { level: 'medium', label: 'Moyen', color: 'bg-yellow-500', count: atRiskClients.filter(c => c.churnRisk?.level === 'medium').length }
  ]

  return (
    <div>
      <h2>Monitoring Churn</h2>

      <div className="grid grid-cols-3 gap-4">
        {riskLevels.map(risk => (
          <div key={risk.level} className={`${risk.color} p-6 rounded text-white`}>
            <div className="text-4xl font-bold">{risk.count}</div>
            <div>{risk.label} risque</div>
          </div>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Score risque</th>
            <th>Facteurs</th>
            <th>Recommandations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {atRiskClients.map(client => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>
                <span className={`badge ${getRiskColor(client.churnRisk.score)}`}>
                  {client.churnRisk.score}/100
                </span>
              </td>
              <td>
                <ul>
                  {client.churnRisk.factors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </td>
              <td>
                <ul>
                  {client.churnRisk.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </td>
              <td>
                <button onClick={() => sendRetentionEmail(client.id)}>
                  Envoyer email
                </button>
                <button onClick={() => createTask(client.id)}>
                  Créer tâche
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Priorité** : 🟡 MOYENNE (fonctionnalité avancée, utile pour rétention)

---

## 💌 6. FIDÉLITÉ - Email invitation parrainage (MANQUANT)

### ⚠️ Statut : CODE COMMENTÉ (à décommenter)

**Vérification** :
```typescript
// src/app/api/referral/route.ts:146-147
// Envoyer un email d'invitation (à implémenter avec Resend)
// ...
```

**Problème** :
- L'email d'invitation parrainage n'est PAS envoyé
- Le code est prêt mais commenté
- Les parrainages sont créés en BDD mais sans notification

**Impact** :
- ⚠️ Filleul ne reçoit pas son lien de parrainage
- ⚠️ Taux de conversion parrainage faible
- ⚠️ Partage manuel nécessaire

**Solution** :

**1. Décommenter et implémenter** :
```typescript
// src/app/api/referral/route.ts (ligne 146)

// Envoyer un email d'invitation
const referrer = await prisma.user.findUnique({
  where: { id: decoded.id },
  select: { name: true, email: true }
})

const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${loyaltyProfile?.referralCode}`

await getResend().emails.send({
  from: process.env.RESEND_FROM_EMAIL!,
  to: email,
  subject: `${referrer.name} vous recommande ${config.siteName} ! 🎁`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    .offer-box { background: #f0f9ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎁 Vous êtes invité(e) !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${name},</p>

      <p><strong>${referrer.name}</strong> pense que vous allez adorer ${config.siteName} !</p>

      <div class="offer-box">
        <h3>🎉 Offre de bienvenue</h3>
        <p><strong>-10% sur votre première prestation</strong></p>
        <p>Réservez dès maintenant et profitez de votre réduction exclusive.</p>
      </div>

      <p>En plus :</p>
      <ul>
        <li>✅ Équipe professionnelle et qualifiée</li>
        <li>✅ Produits haut de gamme</li>
        <li>✅ Ambiance relaxante</li>
        <li>✅ Résultats garantis</li>
      </ul>

      <div style="text-align: center;">
        <a href="${referralLink}" class="cta-button">
          Découvrir et réserver
        </a>
      </div>

      <p>À très bientôt,<br>
      L'équipe ${config.siteName}</p>

      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        Cette invitation est valable 30 jours. Offre non cumulable.
      </p>
    </div>
  </div>
</body>
</html>
  `,
  text: `${referrer.name} vous recommande ${config.siteName} ! Profitez de -10% sur votre première prestation. Réservez ici : ${referralLink}`
})

// Logger l'envoi
await prisma.emailHistory.create({
  data: {
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: `Invitation parrainage ${config.siteName}`,
    content: 'Email invitation parrainage avec lien personnalisé',
    template: 'referral_invitation',
    status: 'sent',
    direction: 'outgoing',
    organizationId: decoded.organizationId
  }
})
```

**Priorité** : 🟡 MOYENNE (quick win, 30 min de travail)

---

## 🤖 7. WHATSAPP - Chatbot AI (MANQUANT)

### ❌ Statut : NON IMPLÉMENTÉ

**Vérification** :
```bash
grep -rn "openai\|chatgpt\|bot.*reply" src/
```
**Résultat** : 0 occurrence (package openai installé mais non utilisé)

**Problème** :
- Pas de réponses automatiques WhatsApp
- Pas de chatbot pour questions fréquentes
- Réponses manuelles uniquement

**Impact** :
- ⚠️ Disponibilité limitée aux horaires d'ouverture
- ⚠️ Temps de réponse long
- ⚠️ Charge de travail admin élevée

**Solution recommandée** :

**1. Créer service chatbot** :
```typescript
// src/lib/whatsapp-chatbot.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface BotContext {
  userName: string
  organizationName: string
  services: string[]
  openingHours: string
}

export async function generateBotResponse(
  userMessage: string,
  context: BotContext,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
): Promise<string> {
  const systemPrompt = `Tu es l'assistant virtuel de ${context.organizationName}, un institut de beauté.

Informations importantes :
- Services disponibles : ${context.services.join(', ')}
- Horaires : ${context.openingHours}

Consignes :
- Réponds de manière professionnelle et amicale
- Si demande de réservation : propose de les rediriger vers le lien de réservation
- Si question sur tarifs : donne une fourchette approximative et invite à réserver pour devis précis
- Si urgence ou question complexe : propose de transférer à un conseiller humain
- Reste concis (max 2-3 phrases)`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',  // Modèle rapide et économique
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 150
  })

  return response.choices[0].message.content || 'Désolé, je n\'ai pas compris. Un conseiller va vous répondre.'
}

// Détection d'intention
export function shouldBotReply(message: string): boolean {
  const botTriggers = [
    'horaires',
    'ouvert',
    'tarif',
    'prix',
    'services',
    'rdv',
    'réserver',
    'disponibilité',
    'bonjour',
    'info'
  ]

  const lowerMessage = message.toLowerCase()
  return botTriggers.some(trigger => lowerMessage.includes(trigger))
}

// Ne PAS répondre si...
export function shouldTransferToHuman(message: string): boolean {
  const humanTriggers = [
    'urgent',
    'problème',
    'plainte',
    'annuler',
    'remboursement',
    'conseiller',
    'humain'
  ]

  const lowerMessage = message.toLowerCase()
  return humanTriggers.some(trigger => lowerMessage.includes(trigger))
}
```

**2. Intégrer au webhook WhatsApp** :
```typescript
// src/app/api/webhooks/whatsapp/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()

  // Message reçu
  if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
    const message = body.entry[0].changes[0].value.messages[0]
    const from = message.from
    const text = message.text?.body

    if (!text) return NextResponse.json({ success: true })

    // Vérifier si bot doit répondre
    if (shouldTransferToHuman(text)) {
      // Notifier admin
      await notifyAdmin({
        from,
        message: text,
        priority: 'high'
      })
      return NextResponse.json({ success: true })
    }

    if (shouldBotReply(text)) {
      // Charger contexte
      const org = await getOrganization()
      const conversationHistory = await getConversationHistory(from)

      // Générer réponse
      const botResponse = await generateBotResponse(text, {
        userName: from,
        organizationName: org.name,
        services: org.services.map(s => s.name),
        openingHours: org.openingHours
      }, conversationHistory)

      // Envoyer réponse
      await sendWhatsAppMessage({
        to: from,
        message: botResponse
      })

      // Logger conversation
      await saveConversation({
        from,
        userMessage: text,
        botMessage: botResponse,
        timestamp: new Date()
      })
    } else {
      // Message complexe → notifier admin
      await notifyAdmin({
        from,
        message: text,
        priority: 'normal'
      })
    }
  }

  return NextResponse.json({ success: true })
}
```

**3. Interface de configuration** :
```typescript
// src/components/ChatbotSettings.tsx
export default function ChatbotSettings() {
  const [enabled, setEnabled] = useState(false)
  const [autoReplyHours, setAutoReplyHours] = useState('24/7')
  const [welcomeMessage, setWelcomeMessage] = useState('')

  return (
    <div>
      <h2>Chatbot WhatsApp</h2>

      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Activer le chatbot
      </label>

      <select value={autoReplyHours} onChange={(e) => setAutoReplyHours(e.target.value)}>
        <option value="24/7">24h/24 7j/7</option>
        <option value="business_hours">Uniquement horaires d'ouverture</option>
        <option value="off_hours">Uniquement hors horaires</option>
      </select>

      <textarea
        value={welcomeMessage}
        onChange={(e) => setWelcomeMessage(e.target.value)}
        placeholder="Message de bienvenue personnalisé..."
      />

      <button onClick={saveSettings}>Enregistrer</button>
    </div>
  )
}
```

**Coût estimé** :
- OpenAI GPT-4o-mini : ~0.0001€ par message
- 1000 messages/mois = ~0.10€/mois (négligeable)

**Priorité** : 🟡 MOYENNE (amélioration expérience client significative)

---

## 💬 8. SOCIAL MEDIA - Réponses automatiques (MANQUANT)

### ❌ Statut : NON IMPLÉMENTÉ

**Vérification** :
```bash
grep -rn "auto.*reply\|auto.*response" src/app/api/admin/social-media/
```
**Résultat** : 0 occurrence

**Problème** :
- Pas de réponses automatiques aux commentaires
- Pas de réponses aux messages privés
- Gestion manuelle uniquement

**Impact** :
- ⚠️ Temps de réponse élevé
- ⚠️ Taux d'engagement faible
- ⚠️ Image de marque impactée

**Solution recommandée** :

**1. Système de réponses automatiques** :
```typescript
// src/lib/social-auto-reply.ts
interface AutoReplyRule {
  id: string
  platform: 'instagram' | 'facebook'
  triggerType: 'comment' | 'message' | 'mention'
  keywords: string[]          // Mots-clés déclencheurs
  responseTemplate: string    // Template de réponse
  enabled: boolean
}

const defaultRules: AutoReplyRule[] = [
  {
    id: '1',
    platform: 'instagram',
    triggerType: 'comment',
    keywords: ['tarif', 'prix', 'combien'],
    responseTemplate: 'Bonjour ! 😊 Pour connaître nos tarifs, je vous invite à consulter notre site : {website}. Vous pouvez aussi nous contacter en MP pour un devis personnalisé.',
    enabled: true
  },
  {
    id: '2',
    platform: 'instagram',
    triggerType: 'comment',
    keywords: ['rdv', 'réserver', 'réservation', 'disponibilité'],
    responseTemplate: 'Merci pour votre intérêt ! 🌸 Vous pouvez réserver directement ici : {booking_link}',
    enabled: true
  },
  {
    id: '3',
    platform: 'instagram',
    triggerType: 'comment',
    keywords: ['horaires', 'ouvert', 'fermé'],
    responseTemplate: 'Nos horaires : {opening_hours}. Au plaisir de vous accueillir ! ✨',
    enabled: true
  },
  {
    id: '4',
    platform: 'instagram',
    triggerType: 'message',
    keywords: ['bonjour', 'hello', 'salut'],
    responseTemplate: 'Bonjour ! 😊 Comment puis-je vous aider aujourd\'hui ?',
    enabled: true
  }
]

export async function processComment(
  comment: {
    id: string
    text: string
    userId: string
    platform: 'instagram' | 'facebook'
  },
  context: {
    website: string
    bookingLink: string
    openingHours: string
  }
): Promise<{ shouldReply: boolean; response?: string }> {
  const lowerText = comment.text.toLowerCase()

  // Chercher règle correspondante
  for (const rule of defaultRules) {
    if (
      rule.enabled &&
      rule.platform === comment.platform &&
      rule.triggerType === 'comment' &&
      rule.keywords.some(keyword => lowerText.includes(keyword))
    ) {
      // Remplacer variables dans template
      const response = rule.responseTemplate
        .replace('{website}', context.website)
        .replace('{booking_link}', context.bookingLink)
        .replace('{opening_hours}', context.openingHours)

      return { shouldReply: true, response }
    }
  }

  return { shouldReply: false }
}
```

**2. Webhook Instagram/Facebook** :
```typescript
// src/app/api/webhooks/instagram/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()

  // Nouveau commentaire
  if (body.entry?.[0]?.changes?.[0]?.value?.comment) {
    const comment = body.entry[0].changes[0].value.comment

    // Vérifier si réponse auto activée
    const settings = await getAutoReplySettings()
    if (!settings.enabled) return NextResponse.json({ success: true })

    // Traiter commentaire
    const context = await getOrganizationContext()
    const result = await processComment({
      id: comment.id,
      text: comment.text,
      userId: comment.from.id,
      platform: 'instagram'
    }, context)

    // Envoyer réponse
    if (result.shouldReply && result.response) {
      await replyToInstagramComment(comment.id, result.response)

      // Logger
      await prisma.autoReplyLog.create({
        data: {
          platform: 'instagram',
          commentId: comment.id,
          commentText: comment.text,
          response: result.response,
          status: 'sent'
        }
      })
    }
  }

  return NextResponse.json({ success: true })
}
```

**3. Interface de configuration** :
```typescript
// src/components/AutoReplySettings.tsx
export default function AutoReplySettings() {
  const [rules, setRules] = useState<AutoReplyRule[]>([])
  const [showAddRule, setShowAddRule] = useState(false)

  return (
    <div>
      <h2>Réponses automatiques</h2>

      <button onClick={() => setShowAddRule(true)}>
        Ajouter une règle
      </button>

      <table>
        <thead>
          <tr>
            <th>Plateforme</th>
            <th>Type</th>
            <th>Mots-clés</th>
            <th>Réponse</th>
            <th>Activé</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(rule => (
            <tr key={rule.id}>
              <td>{rule.platform}</td>
              <td>{rule.triggerType}</td>
              <td>{rule.keywords.join(', ')}</td>
              <td>{rule.responseTemplate}</td>
              <td>
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => toggleRule(rule.id)}
                />
              </td>
              <td>
                <button onClick={() => editRule(rule.id)}>✏️</button>
                <button onClick={() => deleteRule(rule.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Priorité** : 🟢 BASSE (amélioration engagement mais non critique)

---

## 🛡️ 9. SOCIAL MEDIA - Modération commentaires (MANQUANT)

### ❌ Statut : NON IMPLÉMENTÉ

**Vérification** :
```bash
grep -rn "moderate\|spam.*filter\|bad.*word" src/
```
**Résultat** : 0 occurrence

**Problème** :
- Pas de filtrage automatique spam/insultes
- Pas de modération des commentaires
- Risque de commentaires négatifs non gérés

**Impact** :
- ⚠️ Image de marque à risque
- ⚠️ Commentaires inappropriés visibles
- ⚠️ Modération manuelle chronophage

**Solution recommandée** :

**1. Système de modération** :
```typescript
// src/lib/content-moderation.ts
interface ModerationResult {
  isSpam: boolean
  isInappropriate: boolean
  isNegative: boolean
  score: number          // 0-100 (100 = très problématique)
  action: 'approve' | 'hide' | 'delete' | 'review'
  reason?: string
}

const spamKeywords = [
  'gagne de l\'argent',
  'clique ici',
  'offre exclusive',
  'promo limitée',
  'dm me',
  'follow pour follow',
  'abonne toi'
]

const inappropriateWords = [
  'con',
  'merde',
  'putain',
  // ... liste complète à adapter
]

export async function moderateComment(text: string): Promise<ModerationResult> {
  const lowerText = text.toLowerCase()
  let score = 0
  let isSpam = false
  let isInappropriate = false
  let reason = ''

  // Détection spam
  const spamMatches = spamKeywords.filter(keyword => lowerText.includes(keyword))
  if (spamMatches.length > 0) {
    isSpam = true
    score += 40
    reason = `Spam détecté: ${spamMatches.join(', ')}`
  }

  // Détection mots inappropriés
  const badWords = inappropriateWords.filter(word => lowerText.includes(word))
  if (badWords.length > 0) {
    isInappropriate = true
    score += 30
    reason = `Langage inapproprié`
  }

  // Détection MAJUSCULES EXCESSIVES
  const uppercaseRatio = (text.match(/[A-Z]/g) || []).length / text.length
  if (uppercaseRatio > 0.7 && text.length > 10) {
    score += 15
    reason += ' | Caps lock abuse'
  }

  // Détection URLs suspectes
  const urls = text.match(/https?:\/\/[^\s]+/g) || []
  if (urls.length > 2) {
    score += 20
    reason += ' | Trop de liens'
  }

  // Sentiment négatif (simpliste, peut utiliser OpenAI pour plus de précision)
  const negativeWords = ['nul', 'horrible', 'arnaque', 'déçu', 'pire', 'mauvais']
  const isNegative = negativeWords.some(word => lowerText.includes(word))

  // Décision
  let action: ModerationResult['action'] = 'approve'

  if (score >= 60) {
    action = 'delete'  // Suppression automatique
  } else if (score >= 40) {
    action = 'hide'    // Masquer en attendant review
  } else if (score >= 20 || isNegative) {
    action = 'review'  // Signaler pour review manuelle
  }

  return {
    isSpam,
    isInappropriate,
    isNegative,
    score,
    action,
    reason
  }
}
```

**2. Intégrer à webhook** :
```typescript
// src/app/api/webhooks/instagram/route.ts (ajouter)

// Nouveau commentaire
if (body.entry?.[0]?.changes?.[0]?.value?.comment) {
  const comment = body.entry[0].changes[0].value.comment

  // Modération automatique
  const moderation = await moderateComment(comment.text)

  if (moderation.action === 'delete') {
    // Supprimer commentaire
    await deleteInstagramComment(comment.id)

    // Logger
    await prisma.moderationLog.create({
      data: {
        platform: 'instagram',
        commentId: comment.id,
        commentText: comment.text,
        action: 'deleted',
        reason: moderation.reason,
        score: moderation.score
      }
    })
  } else if (moderation.action === 'hide') {
    // Masquer commentaire
    await hideInstagramComment(comment.id)
  } else if (moderation.action === 'review') {
    // Notifier admin
    await notifyAdminForReview({
      commentId: comment.id,
      text: comment.text,
      score: moderation.score,
      reason: moderation.reason
    })
  }

  // Réponse automatique si commentaire négatif
  if (moderation.isNegative && moderation.action === 'approve') {
    await replyToInstagramComment(
      comment.id,
      'Nous sommes désolés de lire cela. Pouvez-vous nous contacter en message privé pour que nous puissions améliorer votre expérience ? 🙏'
    )
  }
}
```

**3. Dashboard de modération** :
```typescript
// src/components/ModerationDashboard.tsx
export default function ModerationDashboard() {
  const [pendingReview, setPendingReview] = useState([])

  return (
    <div>
      <h2>Modération des commentaires</h2>

      <div className="stats">
        <div className="stat">
          <div className="text-3xl">{pendingReview.length}</div>
          <div>En attente de review</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Plateforme</th>
            <th>Commentaire</th>
            <th>Score</th>
            <th>Raison</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingReview.map(item => (
            <tr key={item.id}>
              <td>{item.platform}</td>
              <td>{item.commentText}</td>
              <td>
                <span className={getScoreColor(item.score)}>
                  {item.score}/100
                </span>
              </td>
              <td>{item.reason}</td>
              <td>
                <button onClick={() => approveComment(item.id)}>✅ Approuver</button>
                <button onClick={() => hideComment(item.id)}>👁️ Masquer</button>
                <button onClick={() => deleteComment(item.id)}>🗑️ Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Priorité** : 🟡 MOYENNE (protection image de marque)

---

## 🎁 10. CARTES CADEAUX - Email automatique (MANQUANT)

### ⚠️ Statut : PARTIELLEMENT IMPLÉMENTÉ

**Vérification** :
```bash
find src/app/api -name "*gift*" | xargs grep -l "sendEmail\|resend"
```
**Résultat** : Aucune route email trouvée

**Problème** :
- La carte cadeau est créée en BDD
- Le PDF est généré
- MAIS l'email n'est pas envoyé automatiquement

**Impact** :
- ⚠️ Client doit télécharger manuellement le PDF
- ⚠️ Pas d'email de confirmation
- ⚠️ Expérience utilisateur incomplète

**Solution** :

**1. Ajouter envoi email** :
```typescript
// src/app/api/admin/gift-cards/route.ts (créer ou modifier)

export async function POST(request: NextRequest) {
  const { purchasedFor, purchasedByEmail, amount, message } = await request.json()

  // Créer carte cadeau
  const giftCard = await prisma.giftCard.create({
    data: {
      code: generateGiftCardCode(),
      amount,
      balance: amount,
      purchasedFor,
      message,
      status: 'active',
      organizationId
    }
  })

  // Générer PDF
  const pdfBuffer = await generateGiftCardPDF(giftCard, settings)

  // Envoyer email avec PDF en pièce jointe
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: purchasedByEmail,
    subject: `🎁 Votre carte cadeau ${config.siteName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .card-info { background: #fdf2f8; border: 2px solid #ec4899; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .code { font-size: 24px; font-weight: bold; color: #ec4899; letter-spacing: 2px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎁 Votre Carte Cadeau</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>

      <p>Votre carte cadeau ${config.siteName} a bien été créée !</p>

      <div class="card-info">
        <h3>Montant : ${amount}€</h3>
        <div>Code :</div>
        <div class="code">${giftCard.code}</div>
        ${message ? `<p><em>"${message}"</em></p>` : ''}
      </div>

      <p><strong>Comment l'utiliser ?</strong></p>
      <ol>
        <li>Réservez votre prestation en ligne ou par téléphone</li>
        <li>Indiquez le code de la carte cadeau au moment du paiement</li>
        <li>Le montant sera automatiquement déduit</li>
      </ol>

      <p><strong>📄 PDF joint</strong><br>
      Votre carte cadeau au format PDF est jointe à cet email. Vous pouvez l'imprimer ou l'offrir directement par email.</p>

      <p><strong>ℹ️ Informations importantes</strong></p>
      <ul>
        <li>Valable 1 an à partir de la date d'achat</li>
        <li>Non remboursable, non échangeable contre de l'argent</li>
        <li>Utilisable en plusieurs fois</li>
        <li>Solde consultable à tout moment</li>
      </ul>

      <p>Pour toute question :<br>
      📞 ${config.phone}<br>
      ✉️ ${config.email}</p>

      <p>Merci et à très bientôt !<br>
      L'équipe ${config.siteName}</p>
    </div>
  </div>
</body>
</html>
    `,
    attachments: [
      {
        filename: `carte-cadeau-${giftCard.code}.pdf`,
        content: pdfBuffer.toString('base64')
      }
    ]
  })

  // Logger l'envoi
  await prisma.emailHistory.create({
    data: {
      from: process.env.RESEND_FROM_EMAIL!,
      to: purchasedByEmail,
      subject: `Carte cadeau ${config.siteName}`,
      content: 'Email carte cadeau avec PDF joint',
      template: 'gift_card',
      status: 'sent',
      direction: 'outgoing',
      organizationId
    }
  })

  return NextResponse.json({ success: true, giftCard })
}
```

**2. Email au bénéficiaire (si différent)** :
```typescript
// Si purchasedFor !== purchasedByEmail
if (purchasedForEmail && purchasedForEmail !== purchasedByEmail) {
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: purchasedForEmail,
    subject: `🎁 Vous avez reçu une carte cadeau !`,
    html: `
      <p>Bonjour,</p>
      <p>Bonne nouvelle ! Vous avez reçu une carte cadeau de ${amount}€ pour ${config.siteName} ! 🎉</p>
      ${message ? `<p><em>"${message}"</em></p>` : ''}
      <p>Code : <strong>${giftCard.code}</strong></p>
      <p>Réservez dès maintenant et profitez de votre cadeau !</p>
    `
  })
}
```

**Priorité** : 🟡 MOYENNE (amélioration UX importante)

---

# 📊 RÉCAPITULATIF FONCTIONNALITÉS MANQUANTES

| Fonctionnalité | Statut | Priorité | Temps estimé |
|----------------|--------|----------|--------------|
| Stock déduction auto | ❌ Non implémenté | 🟡 Moyenne | 4h |
| Commandes fournisseurs | ❌ Non implémenté | 🟢 Basse | 16h |
| CRM Segmentation RFM | ❌ Non implémenté | 🟡 Moyenne | 8h |
| CRM Workflows | ❌ Non implémenté | 🟡 Moyenne | 12h |
| CRM Prédiction churn | ❌ Non implémenté | 🟡 Moyenne | 6h |
| Email parrainage | ⚠️ Commenté | 🟡 Moyenne | 30 min |
| WhatsApp Chatbot AI | ❌ Non implémenté | 🟡 Moyenne | 6h |
| Social Réponses auto | ❌ Non implémenté | 🟢 Basse | 4h |
| Social Modération | ❌ Non implémenté | 🟡 Moyenne | 4h |
| Gift card email | ⚠️ Partiel | 🟡 Moyenne | 2h |

**Total : 62h30 de développement**

---

# 🎯 RECOMMANDATION PRIORISATION

## 🔴 Phase 1 : Quick wins (3h30)
1. Email parrainage (30 min)
2. Gift card email (2h)
3. Stock déduction auto (4h)  → Annulé, mettre en Phase 2

## 🟡 Phase 2 : Fonctionnalités business (20h)
1. CRM Segmentation RFM (8h)
2. WhatsApp Chatbot AI (6h)
3. CRM Prédiction churn (6h)

## 🟢 Phase 3 : Automatisations avancées (28h)
1. CRM Workflows (12h)
2. Commandes fournisseurs (16h)

## 🟢 Phase 4 : Engagement social (8h)
1. Social Réponses auto (4h)
2. Social Modération (4h)

**GO PRODUCTION** possible dès maintenant ! Ces fonctionnalités sont des **améliorations** mais **NON bloquantes**.
