# 🧪 Test complet Import & Export de données

## 🎯 Objectif

Tester le cycle COMPLET :
1. **Import** de données test
2. **Vérification** dans l'admin
3. **Export** des données
4. **Comparaison** import vs export

---

## 📋 Prérequis

- ✅ Serveur démarré : `npm run dev` (port 3001)
- ✅ Compte admin disponible (ORG_ADMIN ou SUPER_ADMIN)
- ✅ Organisation de test créée

---

## 🚀 Test 1 : Import de cartes cadeaux

### Étape 1.1 : Se connecter

1. Ouvrir : **http://localhost:3001/login**
2. Se connecter avec un compte admin

### Étape 1.2 : Accéder à l'import

1. Aller dans **Paramètres** (en haut à droite)
2. Scroll jusqu'à **"Import de données"**
3. Cliquer sur **"🚀 Lancer l'assistant d'import"**

### Étape 1.3 : Télécharger le template

1. **Étape 1/5** : Sélectionner **"🎁 Cartes cadeaux"**
2. Cliquer sur **"Suivant"**
3. **Étape 2/5** : Cliquer sur **"📥 Télécharger template-giftcards.csv"**
4. Le fichier doit contenir 4 exemples

### Étape 1.4 : Importer

1. **Étape 3/5** : Cliquer sur **"Fichier rempli →"**
2. **Étape 4/5** : Sélectionner le fichier téléchargé
3. Vérifier la **preview** : 4 lignes visibles
4. Cliquer sur **"Suivant"**
5. **Étape 5/5** : Cliquer sur **"🎯 Confirmer l'import"**

**Résultat attendu** :
```
🎉 Import terminé !
✅ Importés : 4
❌ Échecs : 0
```

### Étape 1.5 : Vérifier dans l'admin

1. Retour à l'admin : **http://localhost:3001/admin**
2. Aller dans l'onglet approprié (si vous avez une page cartes cadeaux)
3. OU vérifier en base de données directement

**Expected** : 4 cartes cadeaux créées

---

## 🚀 Test 2 : Import de codes promo

### Étape 2.1 : Même processus

1. **Paramètres** → **"🚀 Lancer l'assistant d'import"**
2. Sélectionner **"🎟️ Codes promo"**
3. Télécharger template
4. Importer

**Résultat attendu** :
```
✅ Importés : 4
❌ Échecs : 0
```

---

## 🚀 Test 3 : Import de forfaits

### Même processus

1. Sélectionner **"📦 Forfaits"**
2. Template → Import

**Résultat attendu** :
```
✅ Importés : 4
❌ Échecs : 0
```

---

## 📤 Test 4 : Export de TOUTES les données

### Étape 4.1 : Accéder à l'export

1. Retour dans **Paramètres**
2. Scroll jusqu'à **"Exporter vos données"** (section bleue)

### Étape 4.2 : Sélectionner les données

Dans la section **"Exporter vos données"** :

1. Cliquer sur **"Tout sélectionner"** (en haut à droite)
2. Vérifier que TOUTES les cartes sont cochées (✓ bleu)

Les 10 types doivent être sélectionnés :
- ☑ Clients
- ☑ Services
- ☑ Produits
- ☑ Rendez-vous
- ☑ Formations
- ☑ Cartes cadeaux
- ☑ Forfaits
- ☑ Codes promo
- ☑ Avis clients
- ☑ Newsletter

### Étape 4.3 : Lancer l'export

1. Cliquer sur le bouton bleu **"Exporter 10 types de données"**
2. Attendre (quelques secondes)
3. Un fichier ZIP doit se télécharger automatiquement

**Nom du fichier** : `export-laia-[timestamp].zip`

### Étape 4.4 : Vérifier le contenu du ZIP

1. Extraire le fichier ZIP téléchargé
2. Le ZIP doit contenir :

```
export-laia-1732420000000.zip
├── README.txt               ← Instructions
├── clients.csv              ← Si des clients existent
├── services.csv             ← Si des services existent
├── produits.csv             ← Si des produits existent
├── rendez-vous.csv          ← Si des RDV existent
├── formations.csv           ← Si des formations existent
├── cartes-cadeaux.csv       ← 4 lignes (importées au Test 1)
├── forfaits.csv             ← 4 lignes (importées au Test 3)
├── codes-promo.csv          ← 4 lignes (importées au Test 2)
├── avis-clients.csv         ← Si des avis existent
└── newsletter.csv           ← Si des abonnés existent
```

### Étape 4.5 : Vérifier le contenu de cartes-cadeaux.csv

Ouvrir `cartes-cadeaux.csv` dans Excel ou un éditeur de texte.

**Contenu attendu** :
```csv
code,initialAmount,remainingAmount,purchaseDate,expirationDate,buyerEmail,recipientName,recipientEmail,status,notes
NOEL2024-001,100,100,2024-12-01T00:00:00.000Z,2025-12-01T00:00:00.000Z,marie.dupont@test.com,Sophie Martin,sophie.martin@test.com,active,Cadeau de Noël pour Sophie
FETE-MERES-042,50,25,2024-05-15T00:00:00.000Z,2025-05-15T00:00:00.000Z,julie.bernard@test.com,Maman,julie.bernard@test.com,active,Déjà utilisée pour 25€
ANNIV-2024-078,75,75,2024-09-20T00:00:00.000Z,2025-09-20T00:00:00.000Z,laura.petit@test.com,Emma Rousseau,emma.r@test.com,active,Anniversaire Emma
NOEL2024-002,150,0,2023-12-10T00:00:00.000Z,2024-12-10T00:00:00.000Z,claire.dubois@test.com,Marie Blanc,,used,Entièrement utilisée
```

**Vérifications** :
- ✅ 4 lignes de données (+ 1 ligne d'en-tête)
- ✅ Colonnes identiques au template d'import
- ✅ Données cohérentes
- ✅ Dates au format ISO

### Étape 4.6 : Vérifier codes-promo.csv

Ouvrir `codes-promo.csv`.

**Contenu attendu** :
```csv
code,type,value,startDate,endDate,maxUses,currentUses,minPurchase,applicableServices,active
BIENVENUE10,percentage,10,2024-01-01T00:00:00.000Z,2024-12-31T23:59:59.999Z,100,45,0,,true
NOEL20,fixed,20,2024-12-01T00:00:00.000Z,2024-12-25T23:59:59.999Z,50,12,50,,true
FIDELITE15,percentage,15,2024-01-01T00:00:00.000Z,2024-12-31T23:59:59.999Z,unlimited,234,0,,true
MASSAGE50,percentage,50,2024-06-01T00:00:00.000Z,2024-06-30T23:59:59.999Z,30,8,0,Massage relaxant;Massage du dos,true
```

**Vérifications** :
- ✅ 4 lignes de données
- ✅ `maxUses` affiche "unlimited" pour les illimités
- ✅ Services séparés par `;`

### Étape 4.7 : Vérifier forfaits.csv

Ouvrir `forfaits.csv`.

**Contenu attendu** :
```csv
name,description,price,services,sessionsCount,validityDays,active
Cure Minceur 5 séances,5 séances de palper-rouler + 1 enveloppement corporel offert,350,Palper-rouler;Enveloppement corporel,5,90,true
Forfait Visage Éclat,3 soins du visage au choix parmi notre sélection anti-âge,180,Soin visage anti-âge;Soin visage hydratant;Peeling doux,3,60,true
Pack Détente,2 massages relaxants 1h + 1 soin du dos,120,Massage relaxant;Soin du dos,3,45,true
Forfait Épilation Intégrale,6 séances d'épilation jambes complètes avec réduction,240,Épilation jambes,6,120,true
```

**Vérifications** :
- ✅ 4 lignes de données
- ✅ Services séparés par `;`
- ✅ Données complètes

### Étape 4.8 : Vérifier README.txt

Ouvrir `README.txt`.

**Contenu attendu** :
```
Export de données LAIA Connect
================================

Date d'export : [date actuelle]
Organisation : [votre organizationId]
Nombre total d'enregistrements : [nombre]

Fichiers inclus :
- clients.csv
- services.csv
[...]

Format : CSV (UTF-8)
Séparateur : virgule (,)
Encodage : UTF-8

Ces données peuvent être importées dans un autre logiciel de gestion.

CONFORMITÉ RGPD
================
Cet export est réalisé conformément à l'Article 20 du RGPD
(Droit à la portabilité des données).

Vos données vous appartiennent et peuvent être transférées
vers un autre logiciel à tout moment.

Pour toute question : support@laia-connect.com

---
LAIA Connect - https://laia-connect.com
```

---

## 🔄 Test 5 : Cycle complet (Import → Export → Comparaison)

### Test de cohérence

1. **Importer** les templates (cartes cadeaux, codes promo, forfaits)
2. **Exporter** immédiatement
3. **Comparer** les fichiers :
   - Template importé VS Fichier exporté
   - Les données doivent être identiques (sauf format dates)

**Exemple de comparaison** :

**Template importé** :
```csv
code,initialAmount,remainingAmount,purchaseDate,...
NOEL2024-001,100,100,2024-12-01,...
```

**Fichier exporté** :
```csv
code,initialAmount,remainingAmount,purchaseDate,...
NOEL2024-001,100,100,2024-12-01T00:00:00.000Z,...
```

**Différences acceptables** :
- ✅ Format des dates (ISO 8601 dans l'export)
- ✅ Ordre des lignes peut varier
- ✅ Colonnes supplémentaires si relations (ex: buyerEmail)

---

## 🔍 Test 6 : Export sélectif

### Tester l'export de 3 types uniquement

1. Retour dans **Paramètres** → **"Exporter vos données"**
2. **Désélectionner tout**
3. Sélectionner UNIQUEMENT :
   - ☑ Cartes cadeaux
   - ☑ Codes promo
   - ☑ Forfaits
4. Cliquer sur **"Exporter 3 types de données"**
5. Télécharger le ZIP

**Vérifications** :
- ✅ ZIP contient SEULEMENT 3 fichiers CSV + README.txt
- ✅ Pas de fichiers vides
- ✅ Chaque fichier a les bonnes données

---

## 🧪 Test 7 : Gestion des erreurs

### Test 7.1 : Export sans sélection

1. **Désélectionner tout**
2. Cliquer sur **"Exporter"**

**Résultat attendu** :
```
❌ Veuillez sélectionner au moins un type de données à exporter
```

### Test 7.2 : Export de données vides

1. Sélectionner un type pour lequel il n'y a PAS de données
   (ex: Newsletter si aucun abonné)
2. Exporter

**Résultat attendu** :
- ✅ ZIP téléchargé
- ✅ Fichier `newsletter.csv` absent (ou avec seulement les en-têtes)
- ✅ README.txt indique 0 enregistrements pour ce type

### Test 7.3 : Import puis export immédiat

1. Importer des données
2. IMMÉDIATEMENT après, exporter
3. Vérifier que les données sont là

**Résultat attendu** :
- ✅ Données importées présentes dans l'export
- ✅ Cohérence parfaite

---

## 📊 Tableau récapitulatif des tests

| Test | Type | Action | Résultat attendu | Statut |
|------|------|--------|------------------|--------|
| 1 | Import | Cartes cadeaux (4) | 4 importées | ☐ |
| 2 | Import | Codes promo (4) | 4 importés | ☐ |
| 3 | Import | Forfaits (4) | 4 importés | ☐ |
| 4 | Export | Tout sélectionner | ZIP avec 10 CSV | ☐ |
| 5 | Vérif | Contenu cartes-cadeaux.csv | 4 lignes correctes | ☐ |
| 6 | Vérif | Contenu codes-promo.csv | 4 lignes correctes | ☐ |
| 7 | Vérif | Contenu forfaits.csv | 4 lignes correctes | ☐ |
| 8 | Vérif | README.txt | Présent et correct | ☐ |
| 9 | Export | Sélection partielle (3 types) | ZIP avec 3 CSV | ☐ |
| 10 | Erreur | Export sans sélection | Message d'erreur | ☐ |
| 11 | Cycle | Import → Export → Compare | Cohérence | ☐ |

---

## ✅ Checklist finale

### Fonctionnalités d'import

- [ ] Import clients fonctionne
- [ ] Import services fonctionne
- [ ] Import produits fonctionne
- [ ] Import rendez-vous fonctionne
- [ ] Import formations fonctionne
- [ ] Import cartes cadeaux fonctionne
- [ ] Import forfaits fonctionne
- [ ] Import codes promo fonctionne
- [ ] Import avis clients fonctionne
- [ ] Import newsletter fonctionne

### Fonctionnalités d'export

- [ ] Export clients fonctionne
- [ ] Export services fonctionne
- [ ] Export produits fonctionne
- [ ] Export rendez-vous fonctionne
- [ ] Export formations fonctionne
- [ ] Export cartes cadeaux fonctionne
- [ ] Export forfaits fonctionne
- [ ] Export codes promo fonctionne
- [ ] Export avis clients fonctionne
- [ ] Export newsletter fonctionne

### Interface utilisateur

- [ ] Bouton "Lancer l'assistant d'import" visible
- [ ] Section "Exporter vos données" visible
- [ ] Sélection multiple fonctionne
- [ ] "Tout sélectionner" fonctionne
- [ ] "Tout désélectionner" fonctionne
- [ ] Indicateur de chargement pendant export
- [ ] Messages d'erreur clairs
- [ ] Téléchargement automatique du ZIP

### Sécurité

- [ ] Filtrage par organizationId (import)
- [ ] Filtrage par organizationId (export)
- [ ] Seuls les admins peuvent exporter
- [ ] Audit log créé pour chaque export
- [ ] Pas de fuite de données entre organisations

### Conformité RGPD

- [ ] Message RGPD affiché
- [ ] Format CSV lisible
- [ ] README.txt inclus
- [ ] Toutes les données exportables
- [ ] Export gratuit et illimité

---

## 🎯 Résultat attendu global

**Import** :
- ✅ 10 types de données supportés
- ✅ Templates avec exemples
- ✅ Validation automatique
- ✅ Rapport détaillé

**Export** :
- ✅ 10 types de données exportables
- ✅ Format CSV standard
- ✅ ZIP téléchargeable
- ✅ README.txt inclus
- ✅ Conforme RGPD

**Cycle complet** :
- ✅ Import → Vérification → Export → Comparaison
- ✅ Cohérence parfaite des données
- ✅ Aucune perte de données
- ✅ Portabilité garantie

---

## 🚀 Prochaines étapes

Si tous les tests passent :
- ✅ Système d'import/export PRÊT pour production
- ✅ Conformité RGPD assurée
- ✅ Argument commercial fort

Si des tests échouent :
- 🔧 Corriger les bugs identifiés
- 🧪 Ré-exécuter les tests
- 📝 Documenter les problèmes

---

**Temps estimé pour tous les tests** : 20-30 minutes

**Complexité** : ⭐⭐ Moyen

**Criticité** : ⭐⭐⭐⭐⭐ CRITIQUE (obligation légale RGPD)
