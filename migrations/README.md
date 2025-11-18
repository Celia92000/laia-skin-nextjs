# 🔄 Système de Migration de Données LAIA

## 📌 Qu'est-ce que c'est ?

Ce dossier contient tous les outils nécessaires pour **migrer les données d'un institut** depuis son ancien logiciel vers LAIA.

## 📁 Structure

```
migrations/
├── templates/              # 📋 Fichiers CSV exemples
│   ├── 1-clients.csv      # Données clients
│   ├── 2-services.csv     # Services proposés
│   ├── 3-employees.csv    # Employés/praticiens
│   ├── 4-reservations.csv # Historique RDV
│   ├── 5-gift-cards.csv   # Cartes cadeaux
│   ├── 6-products.csv     # Produits vendus
│   ├── 7-loyalty-points.csv # Points fidélité
│   └── 8-payments.csv     # Historique paiements
│
├── scripts/                # 🔧 Scripts d'import
│   ├── import-all.js      # ⭐ Script principal
│   ├── verify-migration.js # ✅ Vérification
│   ├── 1-import-clients.js
│   ├── 2-import-services.js
│   └── ...
│
├── logs/                   # 📝 Logs des migrations
├── docs/                   # 📚 Documentation
├── MIGRATION-GUIDE.md      # 📖 Guide complet
└── README.md              # 👋 Ce fichier
```

## 🚀 Quick Start

### 1. Préparer les fichiers CSV

Demandez au client de remplir les templates CSV dans `templates/`

### 2. Récupérer l'ID de l'organisation

```bash
npx prisma studio
# → Table Organization → Copier l'ID
```

### 3. Lancer la migration

```bash
node migrations/scripts/import-all.js <organizationId>
```

### 4. Vérifier les données

```bash
node migrations/scripts/verify-migration.js <organizationId>
```

## 📖 Documentation complète

Lisez le **[MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)** pour le guide détaillé étape par étape.

## 💰 Tarification suggérée

- Migration basique : **200€**
- Migration complète : **500€**
- Migration + formation : **750€**

## ⚠️ Important

- Toujours faire une **sauvegarde** avant migration
- Tester d'abord sur une **organisation de test**
- Planifier la migration en **dehors des heures d'ouverture**

## 📞 Support

En cas de problème, contactez le support LAIA.

---

**✨ Créé avec ❤️ par l'équipe LAIA**
