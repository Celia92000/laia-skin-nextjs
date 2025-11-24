# 📤 Export de données et portabilité - Guide complet

## ⚖️ Aspect légal : RGPD (OBLIGATOIRE !)

### Article 20 du RGPD : Droit à la portabilité

**En France et dans l'UE, c'est OBLIGATOIRE** de permettre à tes clients d'exporter leurs données.

**Texte officiel** :
> Les personnes concernées ont le droit de recevoir les données à caractère personnel les concernant qu'elles ont fournies à un responsable du traitement, **dans un format structuré, couramment utilisé et lisible par machine**, et ont le droit de transmettre ces données à un autre responsable du traitement.

**Ce que ça veut dire** :
- ✅ Le client peut demander TOUTES ses données
- ✅ Dans un format lisible (CSV, JSON, Excel)
- ✅ Pour aller chez un concurrent
- ✅ Tu DOIS le permettre (max 30 jours)

**Sanction si non-respect** : Jusqu'à **20 millions €** ou **4% du CA mondial** 😱

---

## 🎯 Pourquoi c'est aussi un avantage business

### Arguments positifs

**1. Confiance client**
> "Vos données vous appartiennent. Exportez-les quand vous voulez, en 1 clic."

**2. Anti-churn argument**
> "Pas d'enfermement (vendor lock-in). Vous êtes libre de partir... mais vous resterez car c'est le meilleur !" 😉

**3. Argument commercial**
> "Contrairement à [Concurrent], chez LAIA vos données sont portables."

**4. Facilite les migrations VERS LAIA**
> "Vous voyez comme c'est facile d'exporter ? C'est pareil pour importer chez nous !"

---

## 📊 Le flux d'export complet

### Schéma utilisateur

```
┌─────────────────────┐
│  LAIA CONNECT       │
│  Espace Admin       │
└──────────┬──────────┘
           │
           │ 1️⃣ Clic "Exporter mes données"
           ▼
    ┌─────────────────┐
    │  Choix format   │
    │  ☑ CSV          │
    │  ☐ JSON         │
    │  ☐ Excel        │
    └──────┬──────────┘
           │
           │ 2️⃣ Sélection des données
           ▼
    ┌─────────────────────┐
    │  ☑ Clients (800)    │
    │  ☑ Services (25)    │
    │  ☑ Rendez-vous(3k)  │
    │  ☑ Cartes cadeaux   │
    │  ☑ Tout sélectionner│
    └──────┬──────────────┘
           │
           │ 3️⃣ Génération du fichier ZIP
           ▼
    ┌─────────────────────┐
    │  export-laia.zip    │
    │  ├─ clients.csv     │
    │  ├─ services.csv    │
    │  ├─ rendez-vous.csv │
    │  └─ README.txt      │
    └──────┬──────────────┘
           │
           │ 4️⃣ Téléchargement
           ▼
    ┌─────────────────────┐
    │  Fichier ZIP        │
    │  sur ordinateur     │
    └─────────────────────┘
```

---

## 🏗️ Architecture technique

### 1. Route API d'export

**Emplacement** : `/src/app/api/admin/data-export/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { Parser } from 'json2csv';
import AdmZip from 'adm-zip';

/**
 * POST /api/admin/data-export
 * Exporte toutes les données de l'organisation
 */
export async function POST(request: NextRequest) {
  // 1. Vérification auth
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.organizationId) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Seuls les admins peuvent exporter
  if (!['ORG_ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { format = 'csv', dataTypes = [] } = body;

    const prisma = await getPrismaClient();
    const organizationId = decoded.organizationId;

    // 2. Créer un fichier ZIP
    const zip = new AdmZip();

    // 3. Exporter chaque type de données
    for (const type of dataTypes) {
      let data: any[] = [];
      let filename = '';

      switch (type) {
        case 'clients':
          data = await prisma.user.findMany({
            where: { organizationId, role: 'CLIENT' },
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              address: true,
              city: true,
              zipCode: true,
              createdAt: true
            }
          });
          filename = 'clients.csv';
          break;

        case 'services':
          data = await prisma.service.findMany({
            where: { organizationId },
            select: {
              name: true,
              description: true,
              duration: true,
              price: true,
              category: true,
              active: true
            }
          });
          filename = 'services.csv';
          break;

        case 'products':
          data = await prisma.product.findMany({
            where: { organizationId },
            select: {
              name: true,
              description: true,
              price: true,
              stockQuantity: true,
              active: true
            }
          });
          filename = 'products.csv';
          break;

        case 'appointments':
          data = await prisma.reservation.findMany({
            where: { organizationId },
            select: {
              date: true,
              status: true,
              totalPrice: true,
              notes: true,
              user: {
                select: { email: true, firstName: true, lastName: true }
              },
              service: {
                select: { name: true }
              }
            }
          });
          // Aplatir les données
          data = data.map(appt => ({
            date: appt.date,
            clientEmail: appt.user?.email,
            clientName: `${appt.user?.firstName} ${appt.user?.lastName}`,
            service: appt.service?.name,
            status: appt.status,
            price: appt.totalPrice,
            notes: appt.notes
          }));
          filename = 'rendez-vous.csv';
          break;

        case 'giftcards':
          data = await prisma.giftCard.findMany({
            where: { organizationId },
            select: {
              code: true,
              initialAmount: true,
              remainingAmount: true,
              purchaseDate: true,
              expirationDate: true,
              status: true,
              buyer: {
                select: { email: true }
              }
            }
          });
          data = data.map(gc => ({
            ...gc,
            buyerEmail: gc.buyer?.email
          }));
          filename = 'cartes-cadeaux.csv';
          break;

        case 'packages':
          data = await prisma.package.findMany({
            where: { organizationId },
            select: {
              name: true,
              description: true,
              price: true,
              services: true,
              sessionsCount: true,
              validityDays: true,
              active: true
            }
          });
          filename = 'forfaits.csv';
          break;

        case 'promocodes':
          data = await prisma.promoCode.findMany({
            where: { organizationId },
            select: {
              code: true,
              type: true,
              value: true,
              startDate: true,
              endDate: true,
              maxUses: true,
              currentUses: true,
              active: true
            }
          });
          filename = 'codes-promo.csv';
          break;

        case 'reviews':
          data = await prisma.review.findMany({
            where: { organizationId },
            select: {
              clientName: true,
              rating: true,
              comment: true,
              date: true,
              validated: true,
              published: true,
              response: true,
              service: {
                select: { name: true }
              }
            }
          });
          data = data.map(r => ({
            ...r,
            serviceName: r.service?.name
          }));
          filename = 'avis-clients.csv';
          break;

        case 'newsletter':
          data = await prisma.newsletterSubscriber.findMany({
            where: { organizationId },
            select: {
              email: true,
              firstName: true,
              lastName: true,
              subscriptionDate: true,
              status: true,
              tags: true,
              phone: true
            }
          });
          filename = 'newsletter.csv';
          break;
      }

      // 4. Convertir en CSV
      if (data.length > 0) {
        const parser = new Parser();
        const csv = parser.parse(data);
        zip.addFile(filename, Buffer.from(csv, 'utf-8'));
      }
    }

    // 5. Ajouter un fichier README
    const readme = `
Export de données LAIA Connect
================================

Date d'export : ${new Date().toLocaleString('fr-FR')}
Organisation : ${organizationId}

Fichiers inclus :
${dataTypes.map(t => `- ${t}.csv`).join('\n')}

Format : CSV (UTF-8)
Séparateur : virgule (,)

Ces données peuvent être importées dans un autre logiciel.

Pour toute question : support@laia-connect.com
    `.trim();

    zip.addFile('README.txt', Buffer.from(readme, 'utf-8'));

    // 6. Retourner le ZIP
    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=export-laia-${Date.now()}.zip`
      }
    });

  } catch (error: any) {
    console.error('Erreur export:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export', details: error.message },
      { status: 500 }
    );
  }
}
```

### 2. Composant React d'export

**Emplacement** : `/src/components/DataExport.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Download, Check } from 'lucide-react';

export default function DataExport() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const dataTypes = [
    { id: 'clients', label: 'Clients', icon: '👥', count: 800 },
    { id: 'services', label: 'Services', icon: '💅', count: 25 },
    { id: 'products', label: 'Produits', icon: '🛍️', count: 50 },
    { id: 'appointments', label: 'Rendez-vous', icon: '📅', count: 3000 },
    { id: 'giftcards', label: 'Cartes cadeaux', icon: '🎁', count: 50 },
    { id: 'packages', label: 'Forfaits', icon: '📦', count: 10 },
    { id: 'promocodes', label: 'Codes promo', icon: '🎟️', count: 15 },
    { id: 'reviews', label: 'Avis clients', icon: '⭐', count: 120 },
    { id: 'newsletter', label: 'Newsletter', icon: '📧', count: 450 }
  ];

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const selectAll = () => {
    setSelectedTypes(dataTypes.map(t => t.id));
  };

  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      alert('Sélectionnez au moins un type de données');
      return;
    }

    setIsExporting(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/data-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          format: 'csv',
          dataTypes: selectedTypes
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      // Télécharger le fichier ZIP
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-laia-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('Export terminé ! Fichier téléchargé.');
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-2xl">
          📤
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Exporter vos données</h2>
          <p className="text-sm text-gray-600">Portabilité RGPD - Format CSV</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2 text-sm text-blue-900">
          <div className="mt-0.5">ℹ️</div>
          <div>
            <strong>Vos données vous appartiennent.</strong> Vous pouvez les exporter à tout
            moment pour les sauvegarder ou les transférer vers un autre logiciel.
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Sélectionnez les données à exporter</h3>
        <button
          onClick={selectAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Tout sélectionner
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {dataTypes.map(type => (
          <button
            key={type.id}
            onClick={() => toggleType(type.id)}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${selectedTypes.includes(type.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">{type.icon}</div>
              {selectedTypes.includes(type.id) && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="font-semibold text-gray-900">{type.label}</div>
            <div className="text-xs text-gray-600">{type.count} enregistrements</div>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-sm text-gray-900 mb-2">
          📦 Contenu de l'export
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Fichier ZIP contenant vos données</li>
          <li>• Format CSV (compatible Excel, Google Sheets)</li>
          <li>• Fichier README avec instructions</li>
          <li>• Données filtrées par votre organisation uniquement</li>
        </ul>
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting || selectedTypes.length === 0}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2
          ${isExporting || selectedTypes.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            Export en cours...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Exporter {selectedTypes.length > 0 ? `(${selectedTypes.length} types)` : ''}
          </>
        )}
      </button>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Conformément au RGPD (Article 20 - Droit à la portabilité des données)
      </div>
    </div>
  );
}
```

### 3. Intégration dans la page Settings

**Fichier** : `/src/app/admin/settings/page.tsx`

Ajouter une section :

```tsx
{/* Section Export de données */}
<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
  <DataExport />
</div>
```

---

## 📄 Formats d'export proposés

### Format 1 : CSV (Recommandé)

**Avantages** :
- ✅ Universel (Excel, Google Sheets, LibreOffice)
- ✅ Léger
- ✅ Facile à parser
- ✅ Compatible tous logiciels

**Exemple** : `clients.csv`

```csv
firstName,lastName,email,phone,address,city,zipCode,createdAt
Sophie,Martin,sophie.martin@gmail.com,0612345678,10 rue de la Paix,Paris,75001,2024-01-15T10:30:00Z
Julie,Dupont,julie.dupont@gmail.com,0623456789,5 avenue des Champs,Lyon,69001,2024-02-20T14:20:00Z
```

---

### Format 2 : JSON (Pour développeurs)

**Avantages** :
- ✅ Structuré
- ✅ Hiérarchie préservée
- ✅ Facile à parser en code

**Exemple** : `clients.json`

```json
[
  {
    "firstName": "Sophie",
    "lastName": "Martin",
    "email": "sophie.martin@gmail.com",
    "phone": "0612345678",
    "address": {
      "street": "10 rue de la Paix",
      "city": "Paris",
      "zipCode": "75001"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### Format 3 : Excel (.xlsx) (Premium)

**Avantages** :
- ✅ Feuilles multiples (1 par type de données)
- ✅ Mise en forme
- ✅ Filtres et tris
- ✅ Formules

**Bibliothèque** : `exceljs`

```bash
npm install exceljs
```

---

## 🔐 Sécurité de l'export

### 1. Authentification obligatoire

```typescript
// Vérifier le token JWT
const decoded = verifyToken(token);

if (!decoded || !decoded.organizationId) {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}
```

### 2. Filtrage strict par organizationId

```typescript
// Ne jamais oublier le filtre organizationId !
const data = await prisma.user.findMany({
  where: {
    organizationId: decoded.organizationId // ← CRUCIAL !
  }
});
```

### 3. Roles autorisés

```typescript
// Seuls les admins peuvent exporter
const allowedRoles = ['ORG_ADMIN', 'SUPER_ADMIN'];
if (!allowedRoles.includes(decoded.role)) {
  return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
}
```

### 4. Limitation de taille

```typescript
// Limiter l'export à 10 000 enregistrements par type
const MAX_RECORDS = 10000;

const data = await prisma.user.findMany({
  where: { organizationId },
  take: MAX_RECORDS
});

if (data.length === MAX_RECORDS) {
  console.warn(`Export limité à ${MAX_RECORDS} enregistrements`);
}
```

### 5. Audit des exports

```typescript
// Logger chaque export
await prisma.auditLog.create({
  data: {
    action: 'DATA_EXPORT',
    userId: decoded.userId,
    organizationId: decoded.organizationId,
    details: {
      dataTypes: selectedTypes,
      recordCount: totalRecords
    }
  }
});
```

---

## 📋 Checklist légale RGPD

### Obligations à respecter

- [ ] **Délai de réponse** : Max 30 jours après demande
- [ ] **Format lisible** : CSV, JSON ou Excel
- [ ] **Gratuité** : Export gratuit (sauf demandes abusives)
- [ ] **Données complètes** : Toutes les données du client
- [ ] **Données personnelles uniquement** : Pas les données d'autres clients
- [ ] **Information claire** : Expliquer comment exporter
- [ ] **Facilité d'accès** : Interface simple dans l'admin

### Données à inclure obligatoirement

- ✅ Données fournies par le client (clients, services, etc.)
- ✅ Données générées (rendez-vous, ventes)
- ✅ Données de profil (email, téléphone)
- ❌ Données de sécurité (mots de passe hashés)
- ❌ Données d'autres organisations

---

## 💡 Cas d'usage réels

### Cas 1 : Client veut changer de logiciel

**Scénario** :
> "Je pars chez Planity, je veux récupérer mes 800 clients."

**Processus** :
1. Client se connecte à LAIA Admin
2. Va dans **Paramètres** → **Export de données**
3. Sélectionne **"Clients"**
4. Clique sur **"Exporter"**
5. Télécharge `export-laia.zip`
6. Extrait `clients.csv`
7. Importe dans Planity

**Temps** : 2 minutes

---

### Cas 2 : Sauvegarde régulière

**Scénario** :
> "Je veux sauvegarder mes données chaque mois."

**Solution** :
- Export manuel mensuel
- OU automatisation avec script cron (future feature)

---

### Cas 3 : Audit comptable

**Scénario** :
> "Mon comptable veut toutes les factures de 2024."

**Processus** :
1. Export **"Rendez-vous"** + **"Paiements"**
2. Ouvrir dans Excel
3. Filtrer par date 2024
4. Envoyer au comptable

---

## 🚀 Améliorations futures

### 1. Export planifié automatique

```
┌──────────────────────────────────────────────────────┐
│ Export automatique                                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Fréquence : ● Mensuel  ○ Hebdomadaire  ○ Journalier│
│                                                      │
│  Email de notification : admin@institut.com          │
│                                                      │
│  [✅ Activer l'export automatique]                  │
└──────────────────────────────────────────────────────┘
```

### 2. Export partiel (dates)

```
┌──────────────────────────────────────────────────────┐
│ Filtrer par période                                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Date de début : [01/01/2024]                       │
│  Date de fin   : [31/12/2024]                       │
│                                                      │
│  → Exporter uniquement les données de 2024          │
└──────────────────────────────────────────────────────┘
```

### 3. Format Excel avec onglets

```
export-laia.xlsx
├─ 📋 Clients (800 lignes)
├─ 💅 Services (25 lignes)
├─ 📅 Rendez-vous (3000 lignes)
└─ 📊 Statistiques (résumé)
```

### 4. Export API (webhooks)

```bash
curl -X POST https://laia-connect.com/api/admin/data-export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dataTypes": ["clients", "services"]}'
```

---

## ✅ Résumé

### Pourquoi c'est important ?

**Légal** :
- ✅ OBLIGATOIRE (RGPD Article 20)
- ✅ Sanction jusqu'à 20M€ si non-respect

**Business** :
- ✅ Confiance client
- ✅ Anti-churn argument
- ✅ Différenciation concurrentielle

### Comment l'implémenter ?

**3 composants** :
1. **API Route** `/api/admin/data-export` (export backend)
2. **Composant React** `DataExport.tsx` (UI)
3. **Intégration** dans page Settings

**Formats** :
- CSV (recommandé)
- JSON (développeurs)
- Excel (premium)

**Sécurité** :
- JWT auth
- Filtrage organizationId
- Rôles ADMIN uniquement
- Audit logging

### Temps d'implémentation

**MVP (CSV uniquement)** : 4-6 heures
**Complet (CSV + JSON + Excel)** : 1-2 jours
**Avec améliorations (auto, filtres)** : 3-4 jours

---

## 🎉 Conclusion

**Oui, les clients PEUVENT récupérer leurs données !**

**C'est même OBLIGATOIRE** et c'est un **vrai avantage** :
- ✅ Confiance
- ✅ Transparence
- ✅ Légalité
- ✅ Argument commercial

**Prochaine étape** : Implémenter la fonctionnalité d'export ! 🚀
