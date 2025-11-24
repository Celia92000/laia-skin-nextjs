# 📥 Guide d'import de données LAIA Connect

## Vue d'ensemble

L'outil d'import permet à vos clients d'importer leurs données existantes eux-mêmes, sans intervention de votre part. Cela fait gagner un temps considérable lors de l'onboarding de nouveaux clients.

## Accès

**URL** : `/admin/import`

**Rôles autorisés** : `ORG_ADMIN`, `SUPER_ADMIN`

## Types de données supportés

### 1. Clients (👥)

**Colonnes requises** :
- `email` (obligatoire, unique)
- `firstName`
- `lastName`
- `phone`
- `address`
- `city`
- `zipCode`
- `notes`

**Exemple** :
```csv
firstName,lastName,email,phone,address,city,zipCode,notes
Sophie,Martin,sophie.martin@example.com,0612345678,10 rue de la Paix,Paris,75001,Cliente VIP
```

**Comportement** :
- Les doublons (même email dans la même organisation) sont ignorés
- Les clients sans email valide sont rejetés
- Aucun mot de passe n'est créé - le client devra le définir lui-même

### 2. Services (💅)

**Colonnes requises** :
- `name` (obligatoire, unique par organisation)
- `description`
- `duration` (en minutes)
- `price` (en euros)
- `category`
- `active` (true/false)

**Exemple** :
```csv
name,description,duration,price,category,active
Soin du visage,Soin complet du visage,60,75,Soins du visage,true
```

**Comportement** :
- Les doublons (même nom dans la même organisation) sont ignorés
- Durée par défaut : 60 minutes si non spécifié
- Prix par défaut : 0€ si non spécifié

### 3. Produits (🛍️)

**Colonnes requises** :
- `name` (obligatoire, unique par organisation)
- `description`
- `price`
- `stock`
- `supplier`
- `reference`
- `active` (true/false)

**Exemple** :
```csv
name,description,price,stock,supplier,reference,active
Crème hydratante,Crème pour peaux sèches,29.90,25,L'Oréal,CREM-001,true
```

**Comportement** :
- Les doublons (même nom) sont ignorés
- Stock par défaut : 0 si non spécifié

### 4. Rendez-vous historiques (📅)

**Colonnes requises** :
- `clientEmail` (doit correspondre à un client existant)
- `serviceName` (doit correspondre à un service existant)
- `date` (format ISO : YYYY-MM-DD)
- `time` (format HH:MM)
- `status` (completed, cancelled, etc.)
- `notes`

**Exemple** :
```csv
clientEmail,serviceName,date,time,status,notes
sophie.martin@example.com,Soin du visage,2024-01-15,10:00,completed,RDV effectué
```

**Comportement** :
- Le client ET le service doivent exister avant l'import
- Utile pour importer l'historique depuis un ancien système
- Les rendez-vous futurs ne sont pas supportés (utiliser le calendrier normal)

## Format de fichier

**Formats acceptés** :
- ✅ CSV (`.csv`) - recommandé
- ❌ Excel (`.xlsx`, `.xls`) - pas encore supporté (à venir)

**Encodage** : UTF-8

**Séparateur** : Virgule (`,`)

**Guillemets** : Optionnels, sauf si le contenu contient des virgules

## Processus d'import

### Étape 1 : Télécharger le template

Cliquez sur "📥 Télécharger template" pour obtenir un fichier CSV pré-formaté avec :
- Les en-têtes de colonnes correctes
- 2-3 exemples de lignes
- Les formats attendus

### Étape 2 : Remplir le fichier

1. Ouvrir le template dans Excel, Google Sheets, ou un éditeur CSV
2. Remplacer les exemples par vos vraies données
3. **Ne pas modifier les en-têtes de colonnes**
4. Sauvegarder en CSV

### Étape 3 : Uploader et importer

1. Sélectionner le type de données
2. Choisir votre fichier
3. Cliquer sur "🚀 Lancer l'import"
4. Attendre le résultat

## Résultats

Après l'import, vous verrez un rapport détaillé :

```
✅ Import terminé
✅ Importés : 47
❌ Échecs : 3

Erreurs :
• Email invalide : john.doe
• Client existe déjà : marie@example.com
• Service non trouvé : Massage Thai
```

## Limitations

**Taille de fichier** : Max 5 MB (environ 10 000 lignes)

**Doublons** : Automatiquement ignorés (pas d'écrasement)

**Validation** :
- Emails : Doit contenir `@`
- Dates : Format ISO (YYYY-MM-DD)
- Prix/Durée : Nombres valides uniquement

## Conseils & bonnes pratiques

### ✅ À faire

- **Utilisez les templates** fournis pour éviter les erreurs
- **Testez d'abord** avec 5-10 lignes avant d'importer 500 clients
- **Vérifiez les doublons** dans votre fichier source
- **Nettoyez vos données** (espaces, caractères spéciaux)
- **Faites un backup** avant un gros import

### ❌ À éviter

- ❌ Modifier les noms de colonnes
- ❌ Mélanger plusieurs types de données dans un fichier
- ❌ Utiliser des caractères spéciaux dans les identifiants
- ❌ Importer sans tester avec un petit échantillon
- ❌ Ignorer les messages d'erreur

## Cas d'usage typiques

### 1. Migration depuis un autre logiciel

**Scénario** : Client qui vient de Planity, Treatwell, ou un autre système

**Processus** :
1. Exporter les clients depuis l'ancien système (CSV)
2. Adapter le format au template LAIA Connect
3. Importer les clients
4. Importer les services
5. (Optionnel) Importer l'historique de rendez-vous

### 2. Récupération de données Excel

**Scénario** : Client qui gérait tout dans Excel

**Processus** :
1. Copier les colonnes pertinentes dans le template
2. Ajuster les formats (dates, prix)
3. Sauvegarder en CSV UTF-8
4. Importer

### 3. Import massif de produits

**Scénario** : Institut avec 200+ produits à importer

**Processus** :
1. Utiliser le template produits
2. Tester avec 10 produits d'abord
3. Si OK, importer le fichier complet
4. Vérifier le stock après import

## Dépannage

### "Email invalide"

**Cause** : Email ne contient pas `@` ou est vide

**Solution** : Vérifier que tous les emails sont au format `nom@domaine.com`

### "Client existe déjà"

**Cause** : Un client avec cet email existe déjà dans l'organisation

**Solution** : Normal, les doublons sont ignorés automatiquement

### "Service non trouvé"

**Cause** : Import de rendez-vous alors que le service n'existe pas

**Solution** : Importer d'abord les services, puis les rendez-vous

### "Date invalide"

**Cause** : Format de date incorrect

**Solution** : Utiliser le format ISO `YYYY-MM-DD` (ex: 2024-01-15)

### "Fichier vide"

**Cause** : Le CSV contient seulement les en-têtes, pas de données

**Solution** : Ajouter au moins une ligne de données

## Support technique

Si vous rencontrez un problème avec l'import :

1. **Vérifiez le format** avec le template fourni
2. **Testez avec 1 seule ligne** pour identifier le problème
3. **Consultez les logs** pour plus de détails
4. **Contactez le support** si le problème persiste

## Améliorations futures (V2)

- ✨ Support Excel (`.xlsx`)
- ✨ Prévisualisation avant import
- ✨ Mapping de colonnes personnalisé
- ✨ Import incrémental (mise à jour des existants)
- ✨ Import de photos de clients
- ✨ Détection intelligente de doublons
- ✨ Export de données (pour backup)

---

**Date de création** : 24 novembre 2025
**Version** : 1.0
