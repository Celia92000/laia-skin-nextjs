# 📊 Données importables depuis d'autres logiciels

## ✅ Actuellement supporté (5 types)

| Type | Status | Utilité | Fréquence d'utilisation |
|------|--------|---------|-------------------------|
| 👥 **Clients** | ✅ | Base de données clients | ⭐⭐⭐⭐⭐ |
| 💅 **Services** | ✅ | Prestations proposées | ⭐⭐⭐⭐⭐ |
| 🛍️ **Produits** | ✅ | Produits vendus | ⭐⭐⭐⭐⭐ |
| 📅 **Rendez-vous** | ✅ | Historique des RDV | ⭐⭐⭐⭐ |
| 📚 **Formations** | ✅ | Formations proposées | ⭐⭐⭐ |

---

## 🎯 Très haute priorité (à ajouter en premier)

### 1. 🎁 Cartes cadeaux (GiftCard)

**Pourquoi c'est important**: Les instituts vendent beaucoup de cartes cadeaux, surtout pour Noël, fête des mères, etc.

**Données à importer**:
- Code unique de la carte
- Montant initial
- Montant restant
- Date d'achat
- Date d'expiration
- Client acheteur (optionnel)
- Client bénéficiaire (optionnel)
- Statut (active, utilisée, expirée)
- Notes

**Exemple CSV**:
```csv
code,initialAmount,remainingAmount,purchaseDate,expirationDate,buyerEmail,status,notes
NOEL2024-001,100,100,2024-12-01,2025-12-01,marie.dupont@test.com,active,Cadeau de Noël
FETE-MERES-042,50,25,2024-05-15,2025-05-15,julie.martin@test.com,active,Déjà utilisée 25€
```

**Bénéfice client**: Les clients ne perdent pas leurs cartes cadeaux en stock lors de la migration

---

### 2. 📦 Forfaits / Packages (Package)

**Pourquoi c'est important**: Les instituts vendent des forfaits (ex: cure de 5 séances) avec des prix avantageux.

**Données à importer**:
- Nom du forfait
- Description
- Prix
- Services inclus (liste)
- Nombre de séances incluses
- Durée de validité (en jours)
- Actif (true/false)

**Exemple CSV**:
```csv
name,description,price,services,sessionsCount,validityDays,active
Cure Minceur 5 séances,5 séances de palper-rouler + 1 enveloppement offert,350,Palper-rouler;Enveloppement,5,90,true
Forfait Visage,3 soins du visage au choix,180,Soin visage anti-âge;Soin visage hydratant;Peeling,3,60,true
```

**Bénéfice client**: Conservation des forfaits en cours vendus aux clients

---

### 3. 🎟️ Codes promo (PromoCode)

**Pourquoi c'est important**: Les instituts utilisent des codes promo pour fidéliser et attirer de nouveaux clients.

**Données à importer**:
- Code
- Type de réduction (pourcentage ou montant fixe)
- Valeur de la réduction
- Date de début
- Date de fin
- Nombre d'utilisations max
- Nombre d'utilisations actuelles
- Services applicables (optionnel)
- Actif (true/false)

**Exemple CSV**:
```csv
code,type,value,startDate,endDate,maxUses,currentUses,active
BIENVENUE10,percentage,10,2024-01-01,2024-12-31,100,45,true
NOEL20,fixed,20,2024-12-01,2024-12-25,50,12,true
FIDELITE15,percentage,15,2024-01-01,2024-12-31,unlimited,234,true
```

**Bénéfice client**: Les codes promo en cours restent valides

---

### 4. ⭐ Avis clients (Review)

**Pourquoi c'est important**: Les avis sont essentiels pour la e-réputation et la confiance des nouveaux clients.

**Données à importer**:
- Nom du client
- Email du client (optionnel)
- Note (1-5)
- Commentaire
- Date de l'avis
- Service concerné (optionnel)
- Validé (true/false)
- Publié (true/false)
- Réponse de l'institut (optionnel)

**Exemple CSV**:
```csv
clientName,clientEmail,rating,comment,date,service,validated,published,response
Sophie Martin,sophie.m@test.com,5,Excellent soin du visage ! Je recommande vivement.,2024-11-01,Soin du visage,true,true,Merci Sophie pour votre confiance !
Julie Dupont,,4,Très bon accueil et prestation de qualité,2024-10-15,,true,true,
```

**Bénéfice client**: Conservation de la e-réputation et de la preuve sociale

---

### 5. 📧 Abonnés newsletter (NewsletterSubscriber)

**Pourquoi c'est important**: Les instituts ont souvent une liste d'emails pour leurs newsletters.

**Données à importer**:
- Email
- Prénom
- Nom
- Date d'inscription
- Source (site web, Instagram, en institut, etc.)
- Statut (actif, désinscrit)
- Dernière campagne reçue (optionnel)

**Exemple CSV**:
```csv
email,firstName,lastName,subscriptionDate,source,status
marie.dupont@test.com,Marie,Dupont,2024-06-15,site-web,active
julie.martin@test.com,Julie,Martin,2024-03-20,instagram,active
sophie.bernard@test.com,Sophie,Bernard,2024-01-10,en-institut,unsubscribed
```

**Bénéfice client**: Conservation de la base emailing pour les campagnes marketing

---

## 📊 Haute priorité (à ajouter ensuite)

### 6. 📂 Catégories de services (ServiceCategory)

**Utilité**: Organiser les services par catégories (Soins visage, Soins corps, Épilation, Manucure, etc.)

**Données**: nom, description, ordre d'affichage, icône, couleur, actif

### 7. 📂 Catégories de produits (ProductCategory)

**Utilité**: Organiser les produits par catégories (Crèmes, Maquillage, Accessoires, etc.)

**Données**: nom, description, ordre d'affichage, icône, image, actif

### 8. 👤 Équipe / Employés (User avec role EMPLOYEE)

**Utilité**: Importer les praticiens/esthéticiennes avec leurs spécialités

**Données**: prénom, nom, email, téléphone, spécialités, bio, photo, actif

**Exemple CSV**:
```csv
firstName,lastName,email,phone,specialties,bio,active
Sophie,Durand,sophie.durand@institut.com,0612345678,Soins du visage;Épilation,15 ans d'expérience en esthétique,true
Marie,Blanc,marie.blanc@institut.com,0623456789,Manucure;Pédicure;Extensions de cils,Certifiée en extensions de cils,true
```

### 9. 📦 Mouvements de stock (StockMovement)

**Utilité**: Importer l'historique des entrées/sorties de stock

**Données**: produit, type (entrée/sortie/ajustement), quantité, date, motif, référence commande

### 10. 🏷️ Réductions (Discount)

**Utilité**: Réductions automatiques (ex: -10% sur les soins visage en janvier)

**Données**: nom, type, valeur, services concernés, date début, date fin, actif

---

## 🔧 Priorité moyenne (utile mais moins urgent)

### 11. 📄 Factures (Invoice)

**Utilité**: Historique des factures émises

**Données**: numéro, date, client, montant HT, TVA, montant TTC, statut (payée, impayée), items

### 12. 📊 Programme de fidélité (LoyaltyProfile)

**Utilité**: Points de fidélité existants des clients

**Données**: client, points actuels, niveau de fidélité, date d'adhésion, historique des points

### 13. 📝 Leads / Prospects (Lead)

**Utilité**: Personnes intéressées mais pas encore clientes

**Données**: nom, email, téléphone, source, statut, notes, date de contact

### 14. 🕐 Horaires de travail (WorkingHours)

**Utilité**: Heures d'ouverture et disponibilité du personnel

**Données**: jour de la semaine, heure de début, heure de fin, employé concerné, type (ouverture institut/disponibilité employé)

### 15. 📧 Templates d'emails (EmailTemplate)

**Utilité**: Emails personnalisés déjà créés

**Données**: nom, sujet, contenu HTML, type (confirmation RDV, relance, etc.)

---

## 📋 Priorité basse (nice to have)

### 16. 📝 Posts de blog (BlogPost)

**Utilité**: Articles de blog existants

**Données**: titre, contenu, auteur, date, catégorie, tags, publié

### 17. 📱 Posts réseaux sociaux (SocialMediaPost)

**Utilité**: Historique des publications

**Données**: plateforme, contenu, image, date, statistiques

### 18. 📞 Historique SMS (SMSLog)

**Utilité**: Historique des SMS envoyés

**Données**: destinataire, message, date, statut, coût

### 19. 📧 Historique emails (EmailHistory)

**Utilité**: Historique des emails envoyés

**Données**: destinataire, sujet, contenu, date, statut

### 20. 🔔 Créneaux bloqués (BlockedSlot)

**Utilité**: Créneaux indisponibles (congés, formations, etc.)

**Données**: date de début, date de fin, motif, employé concerné

---

## 📊 Récapitulatif par fréquence d'usage

### ⭐⭐⭐⭐⭐ Critique (utilisé quotidiennement)

- ✅ Clients
- ✅ Services
- ✅ Rendez-vous
- 🎁 **Cartes cadeaux** (à ajouter)
- 📦 **Forfaits** (à ajouter)

### ⭐⭐⭐⭐ Très important (utilisé régulièrement)

- ✅ Produits
- 🎟️ **Codes promo** (à ajouter)
- ⭐ **Avis clients** (à ajouter)
- 📧 **Abonnés newsletter** (à ajouter)
- 👤 **Équipe** (à ajouter)

### ⭐⭐⭐ Important (utilisé souvent)

- ✅ Formations
- 📂 Catégories services/produits
- 🏷️ Réductions
- 📦 Mouvements de stock

### ⭐⭐ Utile (utilisé occasionnellement)

- 📄 Factures
- 📊 Programme fidélité
- 📝 Leads
- 🕐 Horaires

### ⭐ Nice to have (utilisé rarement)

- 📝 Blog
- 📱 Réseaux sociaux
- 📞 Historique SMS/emails
- 🔔 Créneaux bloqués

---

## 🎯 Recommandation d'implémentation

### Phase 1 (Priorité IMMÉDIATE) - 2-3 jours

Ajouter les 5 types d'import suivants:

1. 🎁 **Cartes cadeaux**
2. 📦 **Forfaits/Packages**
3. 🎟️ **Codes promo**
4. ⭐ **Avis clients**
5. 📧 **Abonnés newsletter**

**ROI**: Ces 5 types couvrent 80% des besoins de migration

### Phase 2 (Priorité HAUTE) - 3-4 jours

Ajouter:

6. 📂 Catégories de services
7. 📂 Catégories de produits
8. 👤 Équipe/Employés
9. 📦 Mouvements de stock
10. 🏷️ Réductions

### Phase 3 (Priorité MOYENNE) - Sur demande

Ajouter selon les besoins des premiers clients.

---

## 🔍 Logiciels concurrents - Données exportables

### Planity

**Données exportables**:
- ✅ Clients (CSV)
- ✅ Rendez-vous (CSV)
- ✅ Services (CSV)
- ⚠️ Cartes cadeaux (format propriétaire)

### Treatwell

**Données exportables**:
- ✅ Clients (CSV)
- ✅ Rendez-vous (CSV)
- ✅ Avis clients (CSV ou API)
- ❌ Produits (non disponible)

### Shedul (Fresha)

**Données exportables**:
- ✅ Clients (CSV)
- ✅ Rendez-vous (CSV)
- ✅ Services (CSV)
- ✅ Produits (CSV)
- ✅ Cartes cadeaux (CSV)
- ✅ Forfaits (CSV)

### Timify

**Données exportables**:
- ✅ Clients (CSV)
- ✅ Rendez-vous (CSV)
- ✅ Services (CSV)
- ❌ Produits (non disponible)

### Résalib

**Données exportables**:
- ✅ Clients (CSV)
- ✅ Rendez-vous (CSV)
- ⚠️ Services (format propriétaire)

---

## 💡 Argument commercial

> **« Importez TOUTES vos données en quelques clics »**
>
> Migrez depuis Planity, Treatwell, Shedul, ou n'importe quel autre logiciel sans perdre vos données :
>
> - ✅ 10 types de données importables
> - ✅ Assistant ultra-guidé en 5 étapes
> - ✅ Vérification automatique des doublons
> - ✅ Validation des données en temps réel
> - ✅ Prévisualisation avant import
> - ✅ Rapport détaillé d'import
> - ✅ 100% autonome - pas besoin de support technique
>
> **Temps de migration**: 10-15 minutes au lieu de 2-4 heures !

---

## 📊 Statistiques d'utilisation (estimation)

| Type de données | % d'instituts qui l'utilisent | Fréquence d'import |
|-----------------|-------------------------------|-------------------|
| Clients | 100% | Systématique |
| Services | 100% | Systématique |
| Rendez-vous | 95% | Très fréquent |
| Produits | 85% | Fréquent |
| Cartes cadeaux | 75% | Fréquent |
| Forfaits | 70% | Fréquent |
| Codes promo | 65% | Fréquent |
| Avis clients | 60% | Occasionnel |
| Newsletter | 55% | Occasionnel |
| Formations | 40% | Occasionnel |
| Équipe | 90% | Systématique |
| Catégories | 80% | Systématique |

---

## 🚀 Prochaine étape

**Implémenter Phase 1**: Les 5 imports prioritaires

1. Créer les templates CSV pour chaque type
2. Ajouter les fonctions d'import dans `/api/admin/data-import/route.ts`
3. Mettre à jour `AssistedDataImport.tsx` avec les nouveaux types
4. Créer la documentation de test pour chaque type

**Temps estimé**: 2-3 jours de développement

**Impact**: Migration complète possible pour 95% des instituts !
