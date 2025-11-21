# 🚀 Guide de Migration des Données

## 📋 Vue d'ensemble

Ce guide vous explique comment migrer les données d'un institut depuis son ancien logiciel vers LAIA.

## 💰 Service Premium

La migration de données est un **service payant premium** que vous proposez à vos clients.

**Tarification suggérée :**
- Migration basique (clients + services) : 200€
- Migration complète (tout l'historique) : 500€
- Migration + formation : 750€

---

## 📂 Structure des fichiers

```
migrations/
├── templates/          # Fichiers CSV exemples à donner au client
│   ├── 1-clients.csv
│   ├── 2-services.csv
│   ├── 3-employees.csv
│   ├── 4-reservations.csv
│   ├── 5-gift-cards.csv
│   ├── 6-products.csv
│   ├── 7-loyalty-points.csv
│   └── 8-payments.csv
├── scripts/            # Scripts d'import
│   ├── import-all.js  # Script principal
│   ├── 1-import-clients.js
│   ├── 2-import-services.js
│   └── ...
├── logs/              # Logs des migrations
└── docs/              # Documentation
```

---

## 🔄 Processus de migration (étape par étape)

### **ÉTAPE 1 : Préparation avec le client**

1. **Demander l'export des données** depuis leur ancien logiciel
   - Format préféré : Excel ou CSV
   - Encodage : UTF-8

2. **Envoyer les templates CSV** au client
   ```bash
   # Les templates sont dans migrations/templates/
   # Vous pouvez les envoyer par email
   ```

3. **Expliquer au client** comment remplir les fichiers :
   - 1 ligne = 1 client/service/réservation
   - Respecter les noms de colonnes
   - Format des dates : YYYY-MM-DD (ex: 2024-12-25)
   - Pas de virgules dans les textes

---

### **ÉTAPE 2 : Réception et vérification**

1. **Récupérer les fichiers** du client (email ou clé USB)

2. **Vérifier les fichiers :**
   - Ouvrir avec Excel/LibreOffice
   - Vérifier qu'il n'y a pas de doublons d'emails
   - Vérifier les formats de dates
   - Vérifier qu'il n'y a pas de caractères bizarres

3. **Renommer les fichiers** selon la nomenclature :
   ```
   1-clients.csv
   2-services.csv
   3-employees.csv
   etc.
   ```

4. **Placer les fichiers** dans `migrations/templates/`

---

### **ÉTAPE 3 : Récupérer l'ID de l'organisation**

1. Connectez-vous à Prisma Studio :
   ```bash
   npx prisma studio
   ```

2. Allez sur la table **Organization**

3. **Copiez l'ID** de l'organisation du client
   - Exemple : `cmgyi476b0000bla76887z7d6`

---

### **ÉTAPE 4 : Lancer la migration**

1. **Ouvrir le terminal WSL** (tapez `wsl` dans PowerShell)

2. **Aller dans le dossier du projet :**
   ```bash
   cd /home/celia/laia-github-temp/laia-skin-nextjs
   ```

3. **Lancer le script de migration complet :**
   ```bash
   node migrations/scripts/import-all.js <organizationId>
   ```

   **Exemple :**
   ```bash
   node migrations/scripts/import-all.js cmgyi476b0000bla76887z7d6
   ```

4. **Observer les résultats :**
   ```
   ╔════════════════════════════════════════════╗
   ║   🚀 MIGRATION COMPLÈTE DES DONNÉES      ║
   ╚════════════════════════════════════════════╝

   📋 Organization ID: cmgyi476b0000bla76887z7d6

   ✅ Organisation trouvée : Institut Belle Vie

   ──────────────────────────────────────────────

   📦 Import Clients...
   ──────────────────────────────────────────────
     ✅ Marie Dupont
     ✅ Sophie Martin
     ✅ Julie Bernard
   ✅ Clients : 3 importés, 0 erreurs

   📦 Import Services...
   ──────────────────────────────────────────────
     ✅ Soin du visage classique
     ✅ Massage relaxant
   ✅ Services : 2 importés, 0 erreurs

   ...

   ╔════════════════════════════════════════════╗
   ║          📊 RÉSUMÉ DE LA MIGRATION         ║
   ╚════════════════════════════════════════════╝

   ✅ Clients (3 éléments)
   ✅ Services (2 éléments)
   ✅ Employés (2 éléments)
   ⚠️  Réservations (ignoré)

   ⏱️  Durée totale : 2.45s

   ✨ Migration terminée !
   ```

---

### **ÉTAPE 5 : Vérification**

1. **Ouvrir Prisma Studio** : http://localhost:5555

2. **Vérifier chaque table :**
   - **User** : Tous les clients sont là ?
   - **Service** : Tous les services sont là ?
   - **Reservation** : Les réservations sont correctes ?

3. **Vérifier avec le client :**
   - Lui montrer son espace admin
   - Vérifier quelques données ensemble
   - Corriger si besoin

---

### **ÉTAPE 6 : Import individuel (si besoin)**

Si vous voulez importer seulement les clients (par exemple) :

```bash
node migrations/scripts/1-import-clients.js
```

**OU** pour les services seulement :

```bash
node migrations/scripts/2-import-services.js
```

---

## 🔧 En cas de problème

### Erreur : "Client déjà existant"
→ Normal, le script ignore les doublons

### Erreur : "Email invalide"
→ Vérifier le format des emails dans le CSV

### Erreur : "Date invalide"
→ Vérifier le format : YYYY-MM-DD (ex: 2024-12-25)

### Erreur : "Organization non trouvée"
→ Vérifier l'ID de l'organisation

---

## 📝 Checklist avant facturation

- [ ] Toutes les données ont été importées
- [ ] Le client a vérifié et validé les données
- [ ] Les employés peuvent se connecter
- [ ] Les clients peuvent se connecter
- [ ] Les réservations sont visibles
- [ ] Le client est formé à l'utilisation

---

## 💡 Conseils professionnels

1. **Toujours faire une sauvegarde** avant la migration
2. **Tester sur une organisation de test** d'abord
3. **Planifier la migration** un soir ou week-end
4. **Prévoir 2-3h** pour une migration complète
5. **Rester disponible** pour le client le lendemain

---

## 📞 Support

Si vous rencontrez un problème pendant la migration :
1. Notez le message d'erreur exact
2. Vérifiez le fichier CSV concerné
3. Contactez le support technique LAIA

---

**✨ Bon courage avec vos migrations !**
