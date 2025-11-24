# 🔄 Migration RÉELLE depuis d'autres logiciels - Guide complet

## 🎯 La vraie question

**Question** : "C'est comme ça que se passe une migration depuis un autre logiciel ?"

**Réponse courte** : Presque ! Il y a une étape **avant** : **exporter les données depuis l'ancien logiciel**.

---

## 📊 Le flux COMPLET de migration (réalité)

### Schéma réel

```
┌─────────────────────┐
│  ANCIEN LOGICIEL    │
│  (Planity, etc.)    │
└──────────┬──────────┘
           │
           │ 1️⃣ EXPORT CSV
           ▼
    ┌─────────────┐
    │ fichier.csv │ ← Format de l'ancien logiciel
    │ (format     │
    │  Planity)   │
    └──────┬──────┘
           │
           │ 2️⃣ TRANSFORMATION (si besoin)
           ▼
    ┌─────────────┐
    │ fichier.csv │ ← Format LAIA
    │ (format     │
    │  LAIA)      │
    └──────┬──────┘
           │
           │ 3️⃣ IMPORT dans LAIA
           ▼
┌─────────────────────┐
│  LAIA CONNECT       │
│  Assistant d'import │
└─────────────────────┘
```

---

## 🔍 Étape par étape - Exemple réel avec Planity

### Cas concret : Migrer 200 clients de Planity vers LAIA

#### 📥 Étape 1 : Export depuis Planity

**Action utilisateur** :
1. Se connecter à Planity
2. Aller dans **"Données"** → **"Export"**
3. Choisir **"Clients"**
4. Cliquer sur **"Télécharger CSV"**

**Fichier obtenu** : `planity-clients-export.csv`

```csv
Prénom,Nom,E-mail,Téléphone,Adresse complète,Note privée,Date création
Sophie,Martin,sophie.martin@gmail.com,06 12 34 56 78,10 rue de la Paix 75001 Paris,Cliente VIP,2024-01-15
Julie,Dupont,julie.dupont@gmail.com,06 23 45 67 89,5 avenue des Champs 69001 Lyon,,2024-02-20
Marie,Blanc,marie.blanc@gmail.com,06 34 56 78 90,,,2024-03-10
```

**Problème** : Ce format ne correspond **PAS exactement** au format LAIA !

#### 🔧 Étape 2 : Transformation (si nécessaire)

**Format attendu par LAIA** :

```csv
firstName,lastName,email,phone,address,city,zipCode,notes
```

**Format Planity** :

```csv
Prénom,Nom,E-mail,Téléphone,Adresse complète,Note privée,Date création
```

**Différences** :
- ❌ Noms de colonnes différents (`Prénom` vs `firstName`)
- ❌ Téléphone avec espaces (`06 12 34 56 78` vs `0612345678`)
- ❌ Adresse tout-en-un au lieu de séparée (adresse/ville/code postal)
- ❌ Colonne `Date création` inutile pour LAIA

**3 options pour transformer** :

##### Option A : Transformation manuelle dans Excel/Sheets (Simple)

1. Ouvrir `planity-clients-export.csv` dans Excel
2. Renommer les colonnes :
   - `Prénom` → `firstName`
   - `Nom` → `lastName`
   - `E-mail` → `email`
   - `Téléphone` → `phone`
   - `Note privée` → `notes`
3. Supprimer la colonne `Date création`
4. Nettoyer les téléphones (enlever les espaces)
5. Séparer l'adresse si possible (ou laisser tout dans `address`)
6. Enregistrer sous `laia-clients-import.csv`

**Temps** : 5-10 minutes pour 200 clients

##### Option B : Script de transformation automatique (Avancé)

```javascript
// scripts/transform-planity-to-laia.js
const fs = require('fs');

// Lire le fichier Planity
const planityCSV = fs.readFileSync('planity-clients-export.csv', 'utf-8');
const lines = planityCSV.split('\n');

// Nouvelle structure LAIA
const laiaCSV = ['firstName,lastName,email,phone,address,city,zipCode,notes'];

for (let i = 1; i < lines.length; i++) {
  const [prenom, nom, email, telephone, adresseComplete, notePrivee] = lines[i].split(',');

  // Nettoyer le téléphone
  const phone = telephone.replace(/\s/g, '');

  // Séparer l'adresse (basique)
  const [address = '', city = '', zipCode = ''] = adresseComplete.split(' ');

  // Nouvelle ligne
  laiaCSV.push([prenom, nom, email, phone, address, city, zipCode, notePrivee].join(','));
}

// Écrire le fichier LAIA
fs.writeFileSync('laia-clients-import.csv', laiaCSV.join('\n'));
console.log('✅ Transformation terminée !');
```

**Temps** : 10 secondes pour 10 000 clients

##### Option C : Template LAIA adaptatif (Future feature)

**Idée** : LAIA détecte automatiquement le format et propose de mapper les colonnes.

```
┌──────────────────────────────────────────────────────┐
│ 🔍 Détection automatique du format                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Format détecté : Planity ✅                         │
│                                                      │
│  Mappage proposé :                                  │
│  Prénom          →  firstName   ✅                  │
│  Nom             →  lastName    ✅                  │
│  E-mail          →  email       ✅                  │
│  Téléphone       →  phone       ✅                  │
│  Note privée     →  notes       ✅                  │
│                                                      │
│  [Confirmer le mappage] [Modifier]                  │
└──────────────────────────────────────────────────────┘
```

**Avantage** : Pas besoin de transformation manuelle !

#### 📤 Étape 3 : Import dans LAIA

Une fois le fichier au bon format :

1. Se connecter à LAIA Connect
2. Aller dans **Paramètres** → **Import de données**
3. Cliquer sur **"🚀 Lancer l'assistant d'import"**
4. Choisir **"👥 Clients"**
5. Upload `laia-clients-import.csv`
6. Vérifier la preview
7. Confirmer l'import

**Résultat** :
```
🎉 Import terminé !
✅ Importés : 197
❌ Échecs : 3

Erreurs :
- Email invalide : (ligne 45)
- Email existe déjà : sophie.martin@gmail.com (ligne 102)
- Email invalide : (ligne 156)
```

---

## 🎨 Formats d'export des principaux concurrents

### 1️⃣ Planity

**Export disponible** : ✅ Oui (CSV)

**Données exportables** :
- ✅ Clients
- ✅ Rendez-vous
- ✅ Services
- ❌ Cartes cadeaux (API seulement)
- ❌ Produits

**Format clients** :
```csv
Prénom,Nom,E-mail,Téléphone,Adresse complète,Note privée,Date création,Dernière visite
```

**Transformation nécessaire** : ⚠️ Moyenne
- Renommer colonnes ✅
- Nettoyer téléphones ✅
- Séparer adresse (optionnel)

---

### 2️⃣ Treatwell

**Export disponible** : ✅ Oui (CSV + API)

**Données exportables** :
- ✅ Clients
- ✅ Rendez-vous
- ✅ Avis clients
- ❌ Services (manuel)
- ❌ Produits

**Format clients** :
```csv
first_name,last_name,email,mobile,address_line_1,city,postal_code,notes,created_at
```

**Transformation nécessaire** : ✅ Facile
- Colonnes similaires à LAIA
- Juste renommer `mobile` → `phone`
- Supprimer `created_at` si non utilisé

---

### 3️⃣ Shedul / Fresha

**Export disponible** : ✅ Oui (CSV très complet)

**Données exportables** :
- ✅ Clients
- ✅ Rendez-vous
- ✅ Services
- ✅ Produits
- ✅ Cartes cadeaux
- ✅ Forfaits
- ✅ Ventes

**Format clients** :
```csv
FirstName,LastName,Email,MobilePhone,Address,City,PostalCode,Notes,ClientSince,TotalSpent
```

**Transformation nécessaire** : ✅ Très facile
- Format déjà proche de LAIA
- Supprimer colonnes inutiles (`TotalSpent`, etc.)

---

### 4️⃣ Timify

**Export disponible** : ⚠️ Limité (API seulement pour certaines données)

**Données exportables** :
- ✅ Clients (CSV)
- ✅ Rendez-vous (CSV)
- ⚠️ Services (API)
- ❌ Produits

**Format clients** :
```csv
vorname,nachname,email,telefon,strasse,stadt,plz,notizen
```

**Transformation nécessaire** : ⚠️ Moyenne
- Colonnes en **allemand** ! (vorname = prénom)
- Renommer toutes les colonnes

---

### 5️⃣ Résalib

**Export disponible** : ❌ Très limité

**Données exportables** :
- ⚠️ Clients (PDF seulement, pas de CSV !)
- ⚠️ Rendez-vous (PDF)
- ❌ Services
- ❌ Produits

**Transformation nécessaire** : ❌ Difficile
- Pas d'export CSV natif
- Il faut utiliser des outils de conversion PDF → CSV
- Beaucoup de nettoyage manuel

---

## 🛠️ Outils de transformation automatique

### Option 1 : Excel / Google Sheets (Manuel)

**Avantages** :
- ✅ Gratuit
- ✅ Interface visuelle
- ✅ Facile pour petits volumes (<500 lignes)

**Inconvénients** :
- ❌ Lent pour gros volumes
- ❌ Erreurs manuelles possibles
- ❌ Répétitif si plusieurs exports

**Comment faire** :
1. Ouvrir le CSV exporté
2. Utiliser **Rechercher/Remplacer** pour nettoyer
3. Renommer les colonnes
4. Supprimer colonnes inutiles
5. Enregistrer au format LAIA

---

### Option 2 : Script Node.js (Automatique)

**Avantages** :
- ✅ Rapide (10 000 lignes en 1 seconde)
- ✅ Reproductible
- ✅ Peut gérer des transformations complexes

**Inconvénients** :
- ❌ Nécessite des connaissances en code
- ❌ Maintenance si format change

**Script exemple** :

```javascript
// scripts/transform-csv.js
const fs = require('fs');
const path = require('path');

// Configuration du mappage
const COLUMN_MAPPING = {
  'Prénom': 'firstName',
  'Nom': 'lastName',
  'E-mail': 'email',
  'Téléphone': 'phone',
  'Note privée': 'notes'
};

function transformCSV(inputPath, outputPath) {
  const content = fs.readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  // Lire l'en-tête source
  const sourceHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  // Créer l'en-tête LAIA
  const laiaHeaders = sourceHeaders.map(h => COLUMN_MAPPING[h] || h);

  // Transformer les données
  const outputLines = [laiaHeaders.join(',')];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));

    // Nettoyer les téléphones
    const phoneIndex = sourceHeaders.indexOf('Téléphone');
    if (phoneIndex >= 0) {
      values[phoneIndex] = values[phoneIndex].replace(/\s/g, '');
    }

    outputLines.push(values.join(','));
  }

  fs.writeFileSync(outputPath, outputLines.join('\n'));
  console.log(`✅ Transformation terminée : ${outputLines.length - 1} lignes`);
}

// Utilisation
transformCSV('planity-export.csv', 'laia-import.csv');
```

**Utilisation** :
```bash
node scripts/transform-csv.js
```

---

### Option 3 : Outil en ligne (OpenRefine, CSV Lint)

**OpenRefine** (gratuit, open-source) :
- Interface visuelle pour nettoyer les données
- Détecte les doublons
- Transforme les formats
- Export en CSV propre

**Comment utiliser** :
1. Télécharger OpenRefine : https://openrefine.org/
2. Importer le CSV exporté
3. Appliquer des transformations
4. Exporter au format LAIA

---

### Option 4 : Fonction intégrée à LAIA (Future)

**Idée** : Ajouter un "mode transformation" dans l'assistant d'import.

```
┌──────────────────────────────────────────────────────┐
│ Étape 1bis : Transformation de format                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Format détecté : Planity                           │
│                                                      │
│  Voulez-vous que LAIA transforme automatiquement ?  │
│                                                      │
│  [✅ Oui, transformer automatiquement]              │
│  [❌ Non, j'ai déjà le bon format]                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Avantages** :
- ✅ Expérience utilisateur parfaite
- ✅ Pas de transformation manuelle
- ✅ Argument commercial fort

**Complexité** : Moyenne (2-3 jours de dev)

---

## 📋 Checklist de migration pour le client

### Avant la migration

- [ ] Exporter toutes les données de l'ancien logiciel
- [ ] Vérifier que les exports sont complets
- [ ] Sauvegarder les fichiers CSV exportés
- [ ] Identifier les données manquantes (non exportables)

### Pendant la transformation

- [ ] Télécharger les templates LAIA
- [ ] Comparer les colonnes (ancien vs LAIA)
- [ ] Transformer le format si nécessaire
- [ ] Nettoyer les données (téléphones, emails)
- [ ] Supprimer les doublons

### Pendant l'import LAIA

- [ ] Importer dans l'ordre (clients → services → rendez-vous)
- [ ] Vérifier la preview avant de confirmer
- [ ] Noter les erreurs d'import
- [ ] Corriger et ré-importer les échecs

### Après la migration

- [ ] Vérifier que toutes les données sont présentes
- [ ] Tester quelques recherches
- [ ] Vérifier les relations (client → rendez-vous)
- [ ] Archiver les fichiers CSV sources

---

## 🎯 Cas d'usage réels

### Cas 1 : Petit institut (1 praticien, 150 clients)

**Ancien logiciel** : Planity

**Données à migrer** :
- 150 clients
- 10 services
- 500 rendez-vous (historique 6 mois)

**Processus** :
1. Export Planity → 3 fichiers CSV (5 min)
2. Transformation dans Excel (10 min)
3. Import dans LAIA (5 min)

**Total** : **20 minutes** ✅

---

### Cas 2 : Institut moyen (3 praticiens, 800 clients)

**Ancien logiciel** : Treatwell

**Données à migrer** :
- 800 clients
- 25 services
- 50 produits
- 3000 rendez-vous
- 120 avis clients

**Processus** :
1. Export Treatwell → 5 fichiers CSV (10 min)
2. Script de transformation automatique (1 min)
3. Import dans LAIA (10 min)
4. Vérification + corrections (10 min)

**Total** : **31 minutes** ✅

---

### Cas 3 : Grand institut (5 praticiens, 2000 clients)

**Ancien logiciel** : Shedul

**Données à migrer** :
- 2000 clients
- 40 services
- 100 produits
- 10 000 rendez-vous
- 50 cartes cadeaux
- 20 forfaits actifs

**Processus** :
1. Export Shedul → 8 fichiers CSV (15 min)
2. Script de transformation (2 min)
3. Import dans LAIA (20 min)
4. Vérification approfondie (30 min)
5. Corrections erreurs (15 min)

**Total** : **82 minutes (1h22)** ✅

---

## 💡 Conseils pour faciliter les migrations

### Pour toi (éditeur LAIA)

**1. Documentation claire**

Créer des guides par logiciel concurrent :
- `MIGRATION-DEPUIS-PLANITY.md`
- `MIGRATION-DEPUIS-TREATWELL.md`
- `MIGRATION-DEPUIS-SHEDUL.md`

**2. Scripts de transformation pré-faits**

Dans `/scripts/migrations/` :
```
/scripts/migrations/
  ├── planity-to-laia.js
  ├── treatwell-to-laia.js
  ├── shedul-to-laia.js
  └── README.md
```

**3. Vidéos tutoriels**

- "Comment exporter depuis Planity"
- "Comment transformer les données"
- "Comment importer dans LAIA"

**4. Support migration (offre premium)**

Proposer un service payant :
- 99€ : Migration assistée par email
- 199€ : Migration faite par LAIA (on s'occupe de tout)

### Pour tes clients

**1. Tester avec un petit export d'abord**

Avant de tout migrer :
- Exporter 10 clients
- Tester la transformation
- Importer dans LAIA
- Vérifier que ça marche

**2. Migrer dans l'ordre**

```
1. Clients (base)
   ↓
2. Services (référencés par rendez-vous)
   ↓
3. Produits (référencés par ventes)
   ↓
4. Rendez-vous (référencent clients + services)
   ↓
5. Cartes cadeaux, forfaits, codes promo
   ↓
6. Avis clients, newsletter
```

**3. Garder l'ancien logiciel 1 mois**

En parallèle, pour vérifier que tout est bien migré.

---

## 🚀 Future : Import intelligent automatique

### Vision : LAIA détecte et transforme automatiquement

**Étape 1/5 améliorée** :

```
┌──────────────────────────────────────────────────────┐
│ D'où vient votre fichier ?                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │  Planity   │  │ Treatwell  │  │   Shedul   │    │
│  │            │  │            │  │            │    │
│  └────────────┘  └────────────┘  └────────────┘    │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │   Timify   │  │  Résalib   │  │   Autre    │    │
│  │            │  │            │  │            │    │
│  └────────────┘  └────────────┘  └────────────┘    │
│                                                      │
│  → LAIA adaptera automatiquement le format !        │
└──────────────────────────────────────────────────────┘
```

**Après sélection de "Planity"** :

```
┌──────────────────────────────────────────────────────┐
│ Téléchargez vos données depuis Planity              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📹 Voir la vidéo : Comment exporter de Planity     │
│                                                      │
│  Instructions :                                     │
│  1️⃣ Connectez-vous à Planity                        │
│  2️⃣ Menu "Données" → "Export"                       │
│  3️⃣ Sélectionnez "Clients"                          │
│  4️⃣ Cliquez "Télécharger CSV"                       │
│                                                      │
│  Puis uploadez le fichier ici :                    │
│  [📤 Sélectionner le fichier Planity]              │
│                                                      │
│  ✨ LAIA transformera automatiquement le format !   │
└──────────────────────────────────────────────────────┘
```

**Complexité** : Haute (1-2 semaines de dev)
**ROI** : Énorme (différenciation majeure)

---

## ✅ Résumé - La vraie migration

### Le flux réel en 3 étapes

```
1️⃣ EXPORT depuis ancien logiciel
   (Planity, Treatwell, Shedul...)
   → Fichier CSV format source

2️⃣ TRANSFORMATION (si format différent)
   - Option A : Manuel (Excel)
   - Option B : Script automatique
   - Option C : LAIA intelligent (future)
   → Fichier CSV format LAIA

3️⃣ IMPORT dans LAIA
   Assistant guidé 5 étapes
   → Données en base LAIA Connect
```

### Temps réel de migration

| Taille institut | Ancien logiciel | Temps total | Difficulté |
|-----------------|-----------------|-------------|------------|
| Petit (150 clients) | Planity | 20 min | ⭐ Facile |
| Moyen (800 clients) | Treatwell | 30 min | ⭐⭐ Moyen |
| Grand (2000 clients) | Shedul | 1h20 | ⭐⭐⭐ Avancé |

### Transformation nécessaire par logiciel

| Logiciel | Export CSV | Transformation | Note |
|----------|------------|----------------|------|
| Planity | ✅ Oui | ⚠️ Moyenne | Renommer colonnes |
| Treatwell | ✅ Oui | ✅ Facile | Format proche |
| Shedul/Fresha | ✅ Oui | ✅ Très facile | Format standard |
| Timify | ⚠️ Limité | ⚠️ Moyenne | Colonnes en allemand |
| Résalib | ❌ PDF | ❌ Difficile | Pas de CSV natif |

---

## 🎉 Conclusion

**Oui, c'est vraiment comme ça que ça se passe !**

Avec **une étape supplémentaire** :
1. **Export** depuis l'ancien logiciel (5-15 min)
2. **Transformation** si format différent (0-20 min selon méthode)
3. **Import** dans LAIA avec l'assistant (5-15 min)

**Total réaliste** : **15 minutes à 1h30** selon la taille

**Beaucoup mieux que** :
- ❌ Ressaisir manuellement : **4-8 heures**
- ❌ Migration manuelle par développeur : **500-1000€**

**L'assistant d'import LAIA est un VRAI avantage concurrentiel** ! 🚀
