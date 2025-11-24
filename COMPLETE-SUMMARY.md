# 📘 LAIA Connect - Documentation Complète & Parcours Client

**Date de création** : 24 novembre 2025
**Version du projet** : Ultra-complète (fusion totale LAIA Connect)
**Framework** : Next.js 15.5.1 avec TypeScript et Turbopack
**Base de données** : PostgreSQL (Supabase) avec Prisma 6.16.1

---

## 📋 Table des matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Ce que vous obtenez avec LAIA Connect](#ce-que-vous-obtenez-avec-laia-connect)
3. [Parcours client complet détaillé](#parcours-client-complet-détaillé)
4. [Architecture technique](#architecture-technique)
5. [Système de templates](#système-de-templates)
6. [Fonctionnalités implémentées récemment](#fonctionnalités-implémentées-récemment)
7. [Guide de démarrage rapide](#guide-de-démarrage-rapide)

---

## 🎯 Vue d'ensemble du projet

### Qu'est-ce que LAIA Connect ?

**LAIA Connect** est une plateforme SaaS multi-tenant complète pour instituts de beauté comprenant :

- **Un logiciel de gestion complet** (réservations, CRM, planning, stock, compta, etc.)
- **Un générateur de site vitrine personnalisable** avec 14 templates au choix
- **Un espace client** pour les clients finaux de l'institut
- **Un système d'onboarding guidé** pour configurer rapidement son institut
- **Des intégrations complètes** : Stripe, Brevo, Twilio, WhatsApp Business, etc.

### Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                      LAIA CONNECT                           │
│                  (Plateforme Centrale)                      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────────┐                  ┌──────────────────┐
│ Super Admin LAIA  │                  │ Organisations    │
│  /super-admin     │                  │ (Multi-tenant)   │
└───────────────────┘                  └──────────────────┘
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        │                      │                      │
                        ▼                      ▼                      ▼
            ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
            │  Admin Institut   │  │  Site Vitrine     │  │  Espace Client    │
            │     /admin        │  │  /[slug]          │  │  /espace-client   │
            │  (23 onglets)     │  │  (14 templates)   │  │  (Clients finaux) │
            └───────────────────┘  └───────────────────┘  └───────────────────┘
```

---

## 💼 Ce que vous obtenez avec LAIA Connect

Quand un institut de beauté s'abonne à **LAIA Connect**, il obtient une solution **complète en 3 parties** :

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VOTRE ABONNEMENT LAIA CONNECT                    │
│                    (49€ à 249€/mois selon le plan)                  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌────────────────┐        ┌────────────────┐        ┌────────────────┐
│   1️⃣ SITE       │        │   2️⃣ ADMIN      │        │   3️⃣ ESPACE     │
│   VITRINE      │        │   COMPLET      │        │   CLIENT       │
│   PERSONNALISÉ │        │   (23 onglets) │        │   AUTOMATIQUE  │
└────────────────┘        └────────────────┘        └────────────────┘
```

---

### 1️⃣ SITE VITRINE PERSONNALISÉ - Votre présence en ligne professionnelle

**URL** : `https://votre-institut.laia-connect.fr` ou votre propre domaine (ex: `www.mon-institut.fr`)

Le client obtient un **site web complet et professionnel** généré automatiquement avec :

#### **A. Choix parmi 14 templates professionnels**

**Templates CLASSIQUES (7)** - Inclus dans TOUS les plans (SOLO, DUO, TEAM, PREMIUM) :
- ✨ **Classic** - Intemporel et élégant
- 🎨 **Modern** - Contemporain et raffiné
- ⚪ **Minimal** - Épuré et sophistiqué
- 💼 **Professional** - Rigoureux et corporate
- 🏪 **Boutique** - Chaleureux et accueillant
- ⚡ **Fresh (Dynamique)** - Énergique et coloré
- 🌿 **Zen (Nature)** - Apaisant et naturel

**Templates PREMIUM (7)** - Uniquement plans TEAM & PREMIUM 💎 :
- 🌸 **LAIA Signature** - Design rose gold exclusif
- 🖤 **Luxe Noir** - Dark luxury avec accents dorés + glassmorphisme
- ✨ **Élégance Raffinée** - Particules animées + effets premium
- 🏥 **Medical** - Design clinique ultra-professionnel
- 💆 **Spa Luxe** - Parallax immersif + sections plein écran
- 🔬 **Laser Tech** - Précision technologique + design high-tech
- 🎭 **Autre premium** - Design exclusif

**Récapitulatif accès templates** :
- 📦 **SOLO** (49€/mois) : 7 templates classiques
- 📦 **DUO** (89€/mois) : 7 templates classiques
- 📦 **TEAM** (149€/mois) : 14 templates (classiques + premium) 💎
- 📦 **PREMIUM** (249€/mois) : 14 templates (classiques + premium) 💎

**Chaque template inclut** :
- ✅ Design responsive (mobile, tablette, desktop)
- ✅ Navigation fluide et intuitive
- ✅ Animations et transitions professionnelles
- ✅ Optimisation des performances (vitesse de chargement)
- ✅ Compatibilité tous navigateurs

---

#### **B. Personnalisation complète (70+ paramètres)**

**Couleurs** :
- 🎨 Couleur primaire (votre identité)
- 🎨 Couleur secondaire (variante)
- 🎨 Couleur d'accent (boutons, liens)
- Aperçu en temps réel avant validation

**Images** :
- 🖼️ Logo (header + footer + favicon)
- 🖼️ Image hero (bannière d'accueil)
- 🎥 Vidéo hero (bannière vidéo, optionnel)
- 👤 Photo du fondateur
- 📸 Galerie de photos (jusqu'à 50 images)

**Contenu personnalisable** :
- 📝 Titre et slogan du hero
- 📝 Section "À propos" complète
- 📝 Histoire du fondateur
- 📝 Valeurs et mission
- 📝 Footer personnalisé (3 colonnes)

---

#### **C. Pages incluses dans le site**

**Page d'accueil** :
```
┌──────────────────────────────────────────────┐
│  [LOGO]         Accueil Services À propos    │
│                         Contact [RÉSERVER]   │
├──────────────────────────────────────────────┤
│                                              │
│  ╔════════════════════════════════════════╗ │
│  ║     HERO SECTION (Image ou Vidéo)      ║ │
│  ║                                        ║ │
│  ║    "Une peau respectée,                ║ │
│  ║     une beauté révélée"                ║ │
│  ║                                        ║ │
│  ║     [Découvrir nos soins]              ║ │
│  ╚════════════════════════════════════════╝ │
│                                              │
│  🎯 NOS SERVICES                             │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ Soin   │ │ Épila- │ │Massage │          │
│  │visage  │ │ tion   │ │        │          │
│  │ 85€    │ │ 45€    │ │ 65€    │          │
│  │[Voir]  │ │[Voir]  │ │[Voir]  │          │
│  └────────┘ └────────┘ └────────┘          │
│  [Voir tous les services]                   │
│                                              │
│  💎 POURQUOI NOUS CHOISIR                    │
│  ✨ Expertise reconnue depuis 10 ans         │
│  🌿 Produits bio et naturels                │
│  💆 Ambiance zen et relaxante               │
│  🎁 Programme de fidélité avantageux        │
│                                              │
│  👤 À PROPOS                                 │
│  ┌──────┐  "Notre histoire commence en...   │
│  │Photo │  Depuis 2015, nous accompagnons   │
│  │      │  nos clients dans leur quête      │
│  └──────┘  de beauté naturelle..."          │
│                                              │
│  ⭐ TÉMOIGNAGES                              │
│  ┌────────────────────────────────────────┐ │
│  │ "Service exceptionnel ! L'équipe est   │ │
│  │  à l'écoute et professionnelle."       │ │
│  │  ⭐⭐⭐⭐⭐ - Marie D.                    │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  📍 NOUS TROUVER                             │
│  ┌────────────────┐  123 Rue de la Beauté   │
│  │  Google Maps   │  75001 Paris            │
│  │   [Carte]      │  📞 01 23 45 67 89      │
│  └────────────────┘  ✉️ contact@institut.fr │
│                                              │
│  📧 NEWSLETTER                               │
│  [_____________] [S'inscrire]                │
│                                              │
│  ──────────────────────────────────────────  │
│  FOOTER                                      │
│  Horaires      │  Contact     │  Légal       │
│  Lun-Ven       │  01 23 45 67 │  Mentions    │
│  10h-19h       │  contact@... │  CGV         │
│  Sam 10h-18h   │              │  RGPD        │
│                                              │
│  [Facebook] [Instagram] [TikTok] [WhatsApp] │
│                                              │
│  © 2025 Mon Institut - Propulsé par LAIA    │
└──────────────────────────────────────────────┘
```

**Page Services** :
- Catalogue complet des services/soins
- Filtres par catégorie (Visage, Corps, Épilation, etc.)
- Fiches détaillées (description, prix, durée, images)
- Bouton "Réserver" sur chaque service

**Page À propos** :
- Histoire de l'institut
- Présentation du fondateur/de l'équipe
- Valeurs et engagements
- Certifications et labels

**Page Contact** :
- Formulaire de contact
- Coordonnées complètes
- Carte Google Maps interactive
- Horaires d'ouverture détaillés
- Liens réseaux sociaux

**Page Blog** (optionnel) :
- Articles de blog
- Conseils beauté
- Actualités de l'institut
- SEO optimisé

**Pages légales** :
- Mentions légales (auto-générées)
- CGV (Conditions Générales de Vente)
- Politique de confidentialité (RGPD)
- Politique de cookies

---

#### **D. Fonctionnalités du site vitrine**

**Réservation en ligne intégrée** ⚡ :
```
Client clique "Réserver" → Formulaire 4 étapes :
1. Choix du service
2. Sélection date + heure (calendrier temps réel)
3. Informations client (nom, email, tél)
4. Paiement (Stripe) ou paiement sur place
→ Confirmation immédiate + email + SMS
```

**Paiement sécurisé** :
- 💳 Stripe intégré (cartes bancaires)
- 💶 SEPA (virement)
- 🏪 Paiement sur place
- 🔒 Sécurité PCI-DSS niveau 1

**SEO optimisé** 📈 :
- Meta tags configurables (titre, description, keywords)
- Sitemap.xml généré automatiquement
- Schema.org (données structurées)
- URLs optimisées
- Performance : score 90+ sur Google PageSpeed

**Analytics intégrés** 📊 :
- Google Analytics
- Facebook Pixel
- Suivi des conversions
- Rapports de trafic

**Multilingue** (optionnel) 🌍 :
- Français par défaut
- Anglais disponible
- Autres langues sur demande

**Chat en direct** (optionnel) 💬 :
- Widget Crisp
- Réponses automatiques
- Historique des conversations

**Newsletter** 📧 :
- Formulaire d'inscription
- Intégration Brevo/Mailchimp
- Campagnes automatiques

---

#### **E. Performance et sécurité**

**Performance** :
- ⚡ Temps de chargement < 2 secondes
- 🚀 CDN mondial (Cloudflare)
- 📱 100% responsive
- 💾 Cache intelligent

**Sécurité** :
- 🔒 HTTPS (SSL/TLS)
- 🛡️ Protection DDoS
- 🔐 Sauvegarde quotidienne
- ✅ Conformité RGPD

**Hébergement** :
- ☁️ Infrastructure cloud (Vercel/AWS)
- 🌍 Disponibilité 99.9%
- 📈 Scalabilité automatique
- 🔄 Mises à jour automatiques

---

### 2️⃣ ADMIN COMPLET - Votre tableau de bord de gestion

**URL** : `https://votre-institut.laia-connect.fr/admin`

Le propriétaire de l'institut accède à un **panneau d'administration complet avec 23 onglets** pour gérer toute son activité.

#### **Vue d'ensemble de l'admin**

```
┌──────────────────────────────────────────────────────────────────┐
│  LAIA CONNECT - Admin                  👤 Jean Dupont ▼          │
│  Mon Institut Beauté                        [Notifications] 🔔 3 │
├──────────────────────────────────────────────────────────────────┤
│  ╔════════════════════════════════════════════════════════════╗ │
│  ║  📊 VUE D'ENSEMBLE - Aujourd'hui                           ║ │
│  ╠════════════════════════════════════════════════════════════╣ │
│  ║  💰 CA du jour: 1 250€  │  📅 RDV: 12  │  👥 Clients: 8   ║ │
│  ╚════════════════════════════════════════════════════════════╝ │
│                                                                  │
│  🔽 NAVIGATION (23 ONGLETS)                                     │
│                                                                  │
│  📊 TABLEAU DE BORD & ANALYTICS                                 │
│  ├─ Stats (Dashboard principal)                                │
│  └─ Notifications (Centre de notifications)                     │
│                                                                  │
│  📅 RÉSERVATIONS & PLANNING                                     │
│  ├─ Planning (Calendrier interactif)                           │
│  ├─ Validation (Confirmer les RDV)                             │
│  ├─ Pending (RDV en attente)                                   │
│  └─ Réservations (Liste complète)                              │
│                                                                  │
│  💰 FINANCES & PAIEMENTS                                        │
│  ├─ Paiements (Gestion des paiements)                          │
│  ├─ Soins-Paiements (Réconciliation)                           │
│  └─ Comptabilité (Factures, devis, TVA)                        │
│                                                                  │
│  👥 CLIENTS & CRM                                               │
│  ├─ CRM (Fiches clients détaillées)                            │
│  ├─ Fidélité (Programme de points)                             │
│  └─ Reviews (Avis clients)                                      │
│                                                                  │
│  🛎️ CATALOGUE                                                   │
│  ├─ Services (Gestion des soins)                               │
│  ├─ Products (Vente de produits)                               │
│  ├─ Stock (Gestion des stocks)                                 │
│  └─ Stock-Advanced (Alertes & prévisions)                      │
│                                                                  │
│  📣 MARKETING & COMMUNICATION                                   │
│  ├─ Emailing (Campagnes email)                                 │
│  ├─ SMS (Envoi de SMS)                                          │
│  ├─ WhatsApp (WhatsApp Business)                               │
│  ├─ Social-Media (Réseaux sociaux)                             │
│  └─ Blog (Gestion du blog)                                      │
│                                                                  │
│  ⚙️ PARAMÈTRES                                                  │
│  ├─ Configuration (Site vitrine)                                │
│  ├─ Locations (Multi-emplacements)                             │
│  └─ Permissions (Utilisateurs & rôles)                          │
└──────────────────────────────────────────────────────────────────┘
```

---

#### **Détail des 23 onglets**

**1. 📊 STATS - Tableau de bord principal**

Votre vue d'ensemble en temps réel :

```
┌─────────────────────────────────────────────────────┐
│  📊 DASHBOARD - Vue d'ensemble                      │
├─────────────────────────────────────────────────────┤
│  ╔═══════════════╗ ╔═══════════════╗ ╔═══════════╗ │
│  ║ CA AUJOURD'HUI║ ║  RDV DU JOUR  ║ ║  CLIENTS  ║ │
│  ║    1 250€     ║ ║      12       ║ ║     8     ║ │
│  ║  +15% vs hier ║ ║  3 en attente ║ ║ 2 nouveaux║ │
│  ╚═══════════════╝ ╚═══════════════╝ ╚═══════════╝ │
│                                                     │
│  📈 GRAPHIQUE CA (30 derniers jours)                │
│  [Graphique en courbe montrant l'évolution]        │
│                                                     │
│  🔝 TOP SERVICES                                    │
│  1. Soin visage anti-âge (28 réservations)         │
│  2. Épilation complète (21 réservations)           │
│  3. Massage relaxant (18 réservations)             │
│                                                     │
│  ⏰ PROCHAINS RDV                                   │
│  • 14:00 - Marie D. - Soin visage                  │
│  • 15:30 - Sophie L. - Épilation                   │
│  • 17:00 - Julie M. - Massage                      │
└─────────────────────────────────────────────────────┘
```

**Fonctionnalités** :
- KPIs en temps réel (CA, RDV, clients, taux de remplissage)
- Graphiques d'évolution (CA, réservations, nouveaux clients)
- Comparaisons période précédente
- Top services/produits
- Prochains rendez-vous
- Alertes importantes

---

**2. 📅 PLANNING - Calendrier interactif**

Votre agenda intelligent :

```
┌──────────────────────────────────────────────────────┐
│  📅 PLANNING - Semaine du 20-26 Nov 2025             │
├──────────────────────────────────────────────────────┤
│  [Jour] [Semaine] [Mois]    👤 Tous les praticiens ▼│
│                                                      │
│         Lun 20  Mar 21  Mer 22  Jeu 23  Ven 24      │
│  09:00  ░░░░░░  ░░░░░░  ░░░░░░  ░░░░░░  ░░░░░░      │
│  10:00  [Marie] ░░░░░░  [Julie] ░░░░░░  [Sophie]    │
│  11:00  [Soin ] ░░░░░░  [Épil.] ░░░░░░  [Massage]   │
│  12:00  ░░░░░░  ░░░░░░  ░░░░░░  ░░░░░░  ░░░░░░      │
│  13:00  ── PAUSE DÉJEUNER ──────────────────────     │
│  14:00  [Sophie]  [Anne]  [Marie]  Libre   [Julie]  │
│  15:00  [Massage] [Soin]  [Soin ]         [Épil.]   │
│  16:00  ░░░░░░  ░░░░░░  ░░░░░░  [Claire]  ░░░░░░    │
│  17:00  ░░░░░░  [Julie] ░░░░░░  [Soin ]  ░░░░░░     │
│  18:00  ░░░░░░  ░░░░░░  ░░░░░░  ░░░░░░  ░░░░░░      │
│                                                      │
│  [+ Ajouter un RDV]  [Bloquer un créneau]           │
└──────────────────────────────────────────────────────┘
```

**Fonctionnalités** :
- Vue jour/semaine/mois
- Drag & drop pour déplacer les RDV
- Code couleur par type de service
- Filtres par praticien
- Créneaux disponibles en vert
- RDV confirmés/en attente
- Blocages de créneaux
- Synchronisation Google Calendar
- Notifications de changements

---

**3. ✅ VALIDATION - Confirmer les réservations**

```
┌──────────────────────────────────────────────────────┐
│  ✅ RÉSERVATIONS À VALIDER (8)                       │
├──────────────────────────────────────────────────────┤
│  🔔 Nouvelles réservations en attente de validation  │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📅 22 Nov 2025 - 14:00                         │ │
│  │ 👤 Marie Dupont - marie@email.com              │ │
│  │ 📞 06 12 34 56 78                              │ │
│  │ 💆 Soin du visage anti-âge (90 min)            │ │
│  │ 💰 85€ - 💳 Payé en ligne (Stripe)             │ │
│  │ 📝 Note : "Première fois, peau sensible"       │ │
│  │                                                │ │
│  │ [✅ Confirmer]  [📅 Proposer autre date]       │ │
│  │ [❌ Refuser]    [💬 Contacter]                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📅 23 Nov 2025 - 16:00                         │ │
│  │ 👤 Sophie Martin - sophie@email.com            │ │
│  │ 🦵 Épilation jambes complètes (60 min)         │ │
│  │ 💰 45€ - Paiement sur place                    │ │
│  │ [✅ Confirmer]  [❌ Refuser]                    │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Actions possibles** :
- ✅ Confirmer (email automatique envoyé)
- ❌ Refuser (avec raison)
- 📅 Proposer une autre date
- 💬 Contacter le client (email/SMS/WhatsApp)

---

**4. ⏳ PENDING - Réservations en attente de paiement**

Liste des RDV non payés avec relances automatiques.

---

**5. 💳 PAIEMENTS - Gestion des transactions**

```
┌──────────────────────────────────────────────────────┐
│  💳 PAIEMENTS - Historique & gestion                 │
├──────────────────────────────────────────────────────┤
│  📊 CA du mois : 8 450€  │  En attente : 320€        │
│                                                      │
│  🔍 [Rechercher]  📅 [Nov 2025 ▼]  [Exporter CSV]   │
│                                                      │
│  Date      Client        Service      Montant  Statut│
│  ────────────────────────────────────────────────────│
│  22/11 14h Marie D.      Soin visage   85€  ✅ Payé │
│  22/11 16h Sophie L.     Épilation     45€  ✅ Payé │
│  23/11 10h Julie M.      Massage       65€  ⏳ Attente│
│  23/11 14h Anne B.       Soin corps    95€  ✅ Payé │
│  24/11 15h Claire R.     Épilation     45€  ❌ Échoué│
│                                                      │
│  [Détails]  [Remboursement]  [Envoyer reçu]         │
└──────────────────────────────────────────────────────┘
```

**Fonctionnalités** :
- Historique complet
- Filtre par date/client/statut
- Export comptable (CSV, Excel)
- Remboursements Stripe
- Envoi de reçus
- Gestion des échecs de paiement

---

**6. 💰 SOINS-PAIEMENTS - Réconciliation**

Associer chaque soin réalisé à son paiement.

---

**7. 🎁 FIDÉLITÉ - Programme de points**

```
┌──────────────────────────────────────────────────────┐
│  🎁 PROGRAMME DE FIDÉLITÉ                            │
├──────────────────────────────────────────────────────┤
│  ⚙️ CONFIGURATION                                    │
│  • 1€ dépensé = 10 points                            │
│  • Paliers : Bronze (0) / Silver (500) / Gold (1000)│
│  • Récompenses actives : 5                           │
│                                                      │
│  📊 STATISTIQUES                                     │
│  • Membres actifs : 156                              │
│  • Points distribués ce mois : 12 450                │
│  • Récompenses utilisées : 23 (-460€)               │
│                                                      │
│  🏆 TOP CLIENTS FIDÈLES                              │
│  1. 👑 Marie D. - 2 450 pts (Gold)                   │
│  2. 🥈 Sophie L. - 1 820 pts (Gold)                  │
│  3. 🥉 Julie M. - 1 350 pts (Gold)                   │
│                                                      │
│  🎁 RÉCOMPENSES DISPONIBLES                          │
│  • 200 pts → Réduction 10€                           │
│  • 500 pts → Soin gratuit (jusqu'à 50€)             │
│  • 1000 pts → Bon cadeau 100€                        │
└──────────────────────────────────────────────────────┘
```

---

**8. 👥 CRM - Gestion de la relation client**

```
┌──────────────────────────────────────────────────────┐
│  👥 CRM - Base clients (234 clients)                 │
├──────────────────────────────────────────────────────┤
│  🔍 [Rechercher]  [+ Ajouter client]  [Importer CSV]│
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 👤 Marie Dupont                    🌟🌟🌟🌟🌟   │ │
│  │ 📧 marie@email.com  📞 06 12 34 56 78          │ │
│  │ 🎂 28 ans  📍 Paris 75001                      │ │
│  │ 💰 LTV : 1 250€  |  👑 Gold (2450 pts)         │ │
│  │                                                │ │
│  │ 📊 STATISTIQUE                                 │ │
│  │ • Client depuis : 2 ans                        │ │
│  │ • Réservations : 18                            │ │
│  │ • Dernier RDV : 15 Nov 2025                    │ │
│  │ • Prochain RDV : 22 Nov 2025                   │ │
│  │ • Taux d'annulation : 5%                       │ │
│  │                                                │ │
│  │ 🏷️ TAGS                                         │ │
│  │ [VIP] [Peau sensible] [Allergies]             │ │
│  │                                                │ │
│  │ 📝 NOTES                                        │ │
│  │ "Préfère les soins naturels. Allergique aux    │ │
│  │  parfums synthétiques. Très fidèle."           │ │
│  │                                                │ │
│  │ 📅 HISTORIQUE (18 RDV)                         │ │
│  │ • 15/11 - Soin visage - 85€ ⭐⭐⭐⭐⭐          │ │
│  │ • 10/10 - Épilation - 45€ ⭐⭐⭐⭐⭐            │ │
│  │ • 05/09 - Massage - 65€ ⭐⭐⭐⭐⭐              │ │
│  │ [Voir tout l'historique]                       │ │
│  │                                                │ │
│  │ [📧 Email] [💬 SMS] [📱 WhatsApp] [✏️ Modifier]│ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Fonctionnalités** :
- Fiches clients ultra-détaillées
- Historique complet des RDV
- Tags et segmentation
- Notes personnalisées
- Calcul LTV (Lifetime Value)
- Alertes anniversaire/fidélité
- Export de listes

---

**9. 🛎️ SERVICES - Catalogue de soins**

Gérez votre offre de services :

```
┌──────────────────────────────────────────────────────┐
│  🛎️ CATALOGUE SERVICES (23 services)                │
├──────────────────────────────────────────────────────┤
│  [+ Ajouter un service]  [Catégories]  [Réorganiser]│
│                                                      │
│  CATÉGORIE : SOINS DU VISAGE (8)                    │
│  ┌────────────────────────────────────────────────┐ │
│  │ 💆 Soin du visage anti-âge                     │ │
│  │ ⏱️ 90 min  │  💰 85€  │  ⭐ En vedette          │ │
│  │ 📊 28 réservations ce mois                     │ │
│  │ [✏️ Modifier] [📋 Dupliquer] [🗑️ Supprimer]    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  CATÉGORIE : ÉPILATION (6)                          │
│  CATÉGORIE : MASSAGES (5)                           │
│  CATÉGORIE : SOINS DU CORPS (4)                     │
└──────────────────────────────────────────────────────┘
```

**Pour chaque service** :
- Nom, description courte/longue
- Durée, prix, prix promo
- Catégorie
- Images (jusqu'à 5)
- En vedette (homepage)
- Actif/Inactif
- Options (choix de praticien, options supplémentaires)

---

**10. 📦 PRODUCTS - Vente de produits**

Vendez vos produits cosmétiques :
- Catalogue produits
- Gestion stock
- Prix de vente
- Photos produits
- Vente en ligne (intégrée au site)

---

**11-12. 📊 STOCK & STOCK-ADVANCED**

```
┌──────────────────────────────────────────────────────┐
│  📊 GESTION DU STOCK                                 │
├──────────────────────────────────────────────────────┤
│  🚨 ALERTES (3)                                      │
│  • Crème hydratante : Stock faible (2 unités)        │
│  • Huile de massage : Rupture imminente              │
│  • Cire épilation : Commande recommandée             │
│                                                      │
│  📦 PRODUITS (45 références)                         │
│  Produit              Stock   Seuil   Valeur         │
│  ──────────────────────────────────────────────────  │
│  Crème hydratante      2 ⚠️    5      60€           │
│  Sérum anti-âge       12 ✅    5     420€           │
│  Huile massage         3 ⚠️    8      45€           │
│  Cire épilation        1 🔴    10     15€           │
│                                                      │
│  [+ Entrée stock] [+ Sortie] [📊 Inventaire]        │
│  [📈 Prévisions] [🔔 Alertes] [📄 Rapport]          │
└──────────────────────────────────────────────────────┘
```

**Stock-Advanced** :
- Prévisions de consommation
- Suggestions de commande
- Gestion fournisseurs
- Historique mouvements
- Valorisation du stock

---

**13. 📧 EMAILING - Campagnes email**

```
┌──────────────────────────────────────────────────────┐
│  📧 CAMPAGNES EMAIL                                  │
├──────────────────────────────────────────────────────┤
│  [+ Nouvelle campagne]  [Templates]  [Contacts]     │
│                                                      │
│  📊 DERNIÈRES CAMPAGNES                              │
│  ┌────────────────────────────────────────────────┐ │
│  │ 🎄 Offre Noël 2025                             │ │
│  │ Envoyé le 20/11 à 234 contacts                 │ │
│  │ 📨 Ouvertures : 68% (159)                      │ │
│  │ 🖱️ Clics : 24% (56)                            │ │
│  │ 💰 Conversions : 12 réservations (1 020€)      │ │
│  │ [Voir détails] [Renvoyer] [Dupliquer]         │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  🎨 TEMPLATES DISPONIBLES                            │
│  • Newsletter mensuelle                              │
│  • Offre promotionnelle                              │
│  • Anniversaire client                               │
│  • Rappel de RDV                                     │
│  • Demande d'avis                                    │
└──────────────────────────────────────────────────────┘
```

**Fonctionnalités** :
- Éditeur drag & drop
- Templates prédéfinis
- Personnalisation (nom, prénom, etc.)
- Segmentation des contacts
- A/B testing
- Statistiques détaillées
- Automatisations

---

**14. 💬 SMS - Campagnes SMS**

Envoi de SMS groupés ou individuels :
- Rappels de RDV automatiques
- Campagnes promotionnelles
- Confirmations
- Statistiques (délivrés, clics)

---

**15. 📱 WHATSAPP - WhatsApp Business**

```
┌──────────────────────────────────────────────────────┐
│  📱 WHATSAPP BUSINESS                                │
├──────────────────────────────────────────────────────┤
│  [Conversations] [Campagnes] [Automations] [Templates│
│                                                      │
│  💬 CONVERSATIONS ACTIVES (8)                        │
│  ┌────────────────────────────────────────────────┐ │
│  │ 👤 Marie D.                          Il y a 5m │ │
│  │ "Bonjour, je voudrais déplacer mon RDV..."    │ │
│  │ [Ouvrir]                                       │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  🤖 RÉPONSES AUTOMATIQUES                            │
│  • Horaires d'ouverture                              │
│  • Tarifs des soins                                  │
│  • Confirmation de RDV                               │
│  • Liens de réservation                              │
│                                                      │
│  📊 STATISTIQUES                                     │
│  • Messages ce mois : 456                            │
│  • Temps de réponse moyen : 12 min                   │
│  • Taux de satisfaction : 96%                        │
└──────────────────────────────────────────────────────┘
```

---

**16. 📱 SOCIAL-MEDIA - Gestion réseaux sociaux**

Gérez tous vos réseaux sociaux depuis un seul endroit :

```
┌──────────────────────────────────────────────────────┐
│  📱 RÉSEAUX SOCIAUX                                  │
├──────────────────────────────────────────────────────┤
│  [Calendrier] [Publications] [Statistiques] [Médias]│
│                                                      │
│  🔗 COMPTES CONNECTÉS                                │
│  ✅ Facebook - @MonInstitutBeaute (2.4k abonnés)     │
│  ✅ Instagram - @mon_institut (5.8k abonnés)         │
│  ✅ TikTok - @moninstitu (1.2k abonnés)              │
│  ⚠️ LinkedIn - Non connecté [Connecter]              │
│                                                      │
│  📅 CALENDRIER ÉDITORIAL                             │
│  ┌────────────────────────────────────────────────┐ │
│  │ Semaine du 20-26 Nov 2025                      │ │
│  │                                                │ │
│  │ Lun 20  Mar 21  Mer 22  Jeu 23  Ven 24        │ │
│  │ 📸 FB   -       📸 IG   📱 TT   📸 FB/IG      │ │
│  │ 10h00           14h00   18h00   12h00         │ │
│  │                                                │ │
│  │ 📌 Publications planifiées : 7                 │ │
│  │ 📝 Brouillons : 3                              │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [+ Nouvelle publication]                            │
│                                                      │
│  📊 DERNIÈRES PUBLICATIONS                           │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📸 [Photo soin visage] - 19/11 à 14:00        │ │
│  │ Publié sur : Instagram, Facebook               │ │
│  │ 💙 458 J'aime  💬 23 Commentaires  🔄 12 Partages │
│  │ 📊 Portée : 2 340 personnes                   │ │
│  │ [Voir détails] [Booster]                      │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📹 [Vidéo massage relaxant] - 18/11 à 10:00   │ │
│  │ Publié sur : TikTok, Instagram Reels           │ │
│  │ ❤️ 1.2k J'aime  💬 45 Commentaires  📤 89 Partages │
│  │ 📊 Vues : 8 920                                │ │
│  │ [Voir détails] [Republier]                    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  📊 STATISTIQUES DU MOIS                             │
│  • Publications : 24                                 │
│  • Portée totale : 45 230 personnes                 │
│  • Engagement : 3.8% (+0.5%)                         │
│  • Nouveaux abonnés : +156                           │
│                                                      │
│  [📈 Rapport détaillé]                               │
└──────────────────────────────────────────────────────┘
```

**Fonctionnalités** :

**📅 Publication multi-plateformes** :
- Publier simultanément sur Facebook, Instagram, TikTok, LinkedIn
- Programmation à l'avance (jour, heure précise)
- Prévisualisation du rendu sur chaque réseau
- Publication immédiate ou différée

**✍️ Création de contenu** :
```
┌──────────────────────────────────────────────────┐
│  NOUVELLE PUBLICATION                            │
├──────────────────────────────────────────────────┤
│  📝 Texte :                                      │
│  [___________________________________________]   │
│  "✨ Offre spéciale novembre ! Profitez de..."   │
│                                                  │
│  📸 Média :                                      │
│  [Image uploadée : soin-visage-promo.jpg]        │
│                                                  │
│  🌐 Publier sur :                                │
│  ☑️ Facebook                                     │
│  ☑️ Instagram (Feed + Stories)                   │
│  ☐ TikTok                                        │
│  ☑️ LinkedIn                                     │
│                                                  │
│  📅 Programmer :                                 │
│  ○ Publier maintenant                            │
│  ● Programmer : [22/11/2025] à [14:00]          │
│                                                  │
│  🏷️ Hashtags suggérés :                          │
│  #beauté #paris #soinvisage #institutdebeauté    │
│                                                  │
│  [Aperçu] [Enregistrer brouillon] [Publier]     │
└──────────────────────────────────────────────────┘
```

**📊 Analytics détaillés** :
- Portée de chaque publication
- Engagement (J'aime, commentaires, partages)
- Meilleurs moments pour publier
- Analyse de la croissance des abonnés
- Comparaison entre réseaux
- Export de rapports PDF

**📚 Bibliothèque de médias** :
- Stockage de toutes vos photos/vidéos
- Organisation par dossiers (Soins, Produits, Équipe, Avant/Après)
- Recherche rapide
- Réutilisation facile

**💡 Suggestions de contenu** :
- Idées de publications basées sur votre activité
- Rappels d'événements (anniversaire institut, fêtes)
- Templates de posts prêts à l'emploi
- Suggestions de hashtags

**🤖 Automatisations** :
- Publications automatiques :
  - Anniversaire de clients (avec leur accord)
  - Nouveaux services
  - Avis clients 5 étoiles
  - Promotions en cours

**📌 Gestion des interactions** :
- Répondre aux commentaires depuis l'admin
- Modération des messages
- Alertes sur les mentions
- Suivi des conversations

**📈 Boost de publications** (si connecté à Facebook Ads) :
- Budget configurable
- Ciblage géographique (rayon autour de l'institut)
- Ciblage démographique (âge, sexe, centres d'intérêt)
- Suivi des performances

---

**17. ⭐ REVIEWS - Gestion des avis**

```
┌──────────────────────────────────────────────────────┐
│  ⭐ AVIS CLIENTS (89 avis - Note moyenne : 4.8/5)    │
├──────────────────────────────────────────────────────┤
│  🔔 NOUVEAUX AVIS À MODÉRER (3)                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ⭐⭐⭐⭐⭐ Marie Dupont - Il y a 2h             │ │
│  │ "Service exceptionnel ! L'esthéticienne était  │ │
│  │  à l'écoute et très professionnelle. Ma peau   │ │
│  │  n'a jamais été aussi belle !"                 │ │
│  │ 📸 [2 photos]                                   │ │
│  │ [✅ Approuver] [❌ Rejeter] [💬 Répondre]      │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  📊 RÉPARTITION DES NOTES                            │
│  ⭐⭐⭐⭐⭐ 72 avis (81%)  ████████████████████       │
│  ⭐⭐⭐⭐   12 avis (13%)  ███                        │
│  ⭐⭐⭐     5 avis (6%)   █                          │
│  ⭐⭐       0 avis (0%)                              │
│  ⭐         0 avis (0%)                              │
└──────────────────────────────────────────────────────┘
```

---

**18. 📝 BLOG - Gestion du blog**

Créez et publiez des articles :
- Éditeur riche (images, vidéos)
- Catégories
- SEO (meta tags)
- Planification
- Statistiques de lecture

---

**19. 📍 LOCATIONS - Multi-emplacements**

Pour les instituts avec plusieurs salons :
- Gestion de chaque emplacement
- Planning séparé
- Équipes différentes
- Transfert de clients

---

**20. 💼 COMPTABILITÉ - Gestion financière**

```
┌──────────────────────────────────────────────────────┐
│  💼 COMPTABILITÉ                                     │
├──────────────────────────────────────────────────────┤
│  📊 VUE D'ENSEMBLE - Novembre 2025                   │
│  • CA HT : 8 450€                                    │
│  • TVA collectée : 1 690€                            │
│  • CA TTC : 10 140€                                  │
│  • Charges : 2 340€                                  │
│  • Résultat net : 6 110€                             │
│                                                      │
│  📄 FACTURES (45)                                    │
│  [+ Nouvelle facture]  [Exporter]  [Imprimer]       │
│                                                      │
│  N°         Client        Montant    Statut  Date    │
│  ────────────────────────────────────────────────    │
│  F-2025-045 Marie D.     85€ TTC   ✅Payée  22/11   │
│  F-2025-044 Sophie L.    45€ TTC   ✅Payée  22/11   │
│  F-2025-043 Julie M.     65€ TTC   ⏳Envoyée 21/11  │
│                                                      │
│  📑 DEVIS (8)                                        │
│  📊 RAPPORTS TVA                                     │
│  📥 EXPORT COMPTABLE (FEC, CSV)                      │
└──────────────────────────────────────────────────────┘
```

**Fonctionnalités** :
- Génération factures/devis PDF
- Numérotation automatique
- Calcul TVA
- Export FEC (Fichier des Écritures Comptables)
- Rapports mensuels/annuels
- Suivi des impayés

---

**21. 🔔 NOTIFICATIONS - Centre de notifications**

Toutes vos alertes en un seul endroit :
- Nouvelles réservations
- Paiements reçus
- Avis clients
- Alertes stock
- Messages WhatsApp
- Anniversaires clients

---

**22. ⚙️ CONFIGURATION - Paramétrage du site**

C'est ici que vous pouvez **modifier votre site vitrine après l'onboarding** ! ✨

```
┌──────────────────────────────────────────────────────┐
│  ⚙️ CONFIGURATION DU SITE VITRINE                    │
├──────────────────────────────────────────────────────┤
│  [Général] [Template] [Contenus] [Images] [SEO]     │
│                                                      │
│  ╔════════════════════════════════════════════════╗ │
│  ║  ONGLET TEMPLATE (avec preview live!)         ║ │
│  ╚════════════════════════════════════════════════╝ │
│                                                      │
│  SÉLECTION (60%)          │   PREVIEW LIVE (40%)    │
│  ────────────────────────────────────────────────    │
│  💎 Plan DUO - Certains   │  ┌─────────────────┐   │
│  templates premium        │  │                 │   │
│  nécessitent un upgrade   │  │   APERÇU DU     │   │
│                           │  │   TEMPLATE      │   │
│  ┌────┐ ┌────┐ ┌────┐    │  │   EN DIRECT     │   │
│  │Clas│ │Mod │✓│Mini│    │  │                 │   │
│  │sic │ │ern │ │mal │    │  │                 │   │
│  └────┘ └────┘ └────┘    │  └─────────────────┘   │
│                           │  [💻Desktop][📱Mobile] │
│  💎 PREMIUM (🔒 verrouillés pour plan DUO)          │
│  ┌────┐ ┌────┐ ┌────┐                              │
│  │LAIA│ │Luxe│ │Eleg│                              │
│  │🔒  │ │🔒  │ │🔒  │                              │
│  └────┘ └────┘ └────┘                              │
│                                                      │
│  ─────────────────────────                          │
│  🎨 PERSONNALISATION COULEURS                        │
│  Primaire   : [🎨 #d4b5a0] ───────┐                │
│  Secondaire : [🎨 #c9a084]         │ Mise à jour    │
│  Accent     : [🎨 #2c3e50] ───────┘ en temps réel! │
│                                                      │
│  [Annuler]                      [💾 Enregistrer]    │
└──────────────────────────────────────────────────────┘
```

**Tous les onglets** :
- **Général** : Nom, slogan, coordonnées, horaires
- **Template** : Choix du design + couleurs (avec preview!)
- **Contenus** : Textes hero, À propos, footer
- **Images** : Logo, hero, fondateur
- **SEO** : Meta tags, analytics
- **Réseaux** : Facebook, Instagram, TikTok

---

**23. 🔐 PERMISSIONS - Utilisateurs & rôles**

Gérez votre équipe :
- Ajouter des utilisateurs
- Rôles : Admin, Staff, Réceptionniste, Comptable
- Permissions granulaires
- Historique des actions

---

### 3️⃣ ESPACE CLIENT - L'expérience de vos clients finaux

**URL** : `https://votre-institut.laia-connect.fr/espace-client`

Vos clients (Marie, Sophie, Julie, etc.) ont accès à un **espace personnel** pour gérer leurs rendez-vous et profiter de vos avantages fidélité.

```
┌──────────────────────────────────────────────────────┐
│  ESPACE CLIENT - Bienvenue Marie !    [Déconnexion]  │
├──────────────────────────────────────────────────────┤
│  [Mes RDV] [Profil] [Factures] [Fidélité] [Avis]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🎉 BIENVENUE MARIE !                                │
│  Membre Gold depuis 2 ans • 2 450 points            │
│                                                      │
│  ╔════════════════════════════════════════════════╗ │
│  ║  🚀 ACTION RAPIDE                              ║ │
│  ║  [📅 Prendre un nouveau RDV]                   ║ │
│  ╚════════════════════════════════════════════════╝ │
│                                                      │
│  📅 MES PROCHAINS RENDEZ-VOUS (2)                    │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📆 Vendredi 22 Nov 2025 - 14:00                │ │
│  │ 💆 Soin du visage anti-âge                     │ │
│  │ ⏱️ 90 minutes                                   │ │
│  │ 💰 85€ - ✅ Payé en ligne                       │ │
│  │ 👤 Avec Isabelle (esthéticienne)               │ │
│  │ 📍 Mon Institut Beauté, 123 Rue de la Beauté   │ │
│  │                                                │ │
│  │ [📅 Ajouter au calendrier] [🔔 Me rappeler]   │ │
│  │ [✏️ Modifier] [❌ Annuler]                     │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ 📆 Lundi 25 Nov 2025 - 10:00                   │ │
│  │ 🦵 Épilation jambes                            │ │
│  │ 💰 45€ - Paiement sur place                    │ │
│  │ [Modifier] [Annuler]                           │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  📜 HISTORIQUE (18 rendez-vous)                      │
│  • 15/11/2025 - Soin visage - 85€ ⭐⭐⭐⭐⭐        │
│  • 10/10/2025 - Épilation - 45€ ⭐⭐⭐⭐⭐          │
│  • 05/09/2025 - Massage - 65€ ⭐⭐⭐⭐⭐            │
│  [Voir tout]                                         │
│                                                      │
│  🎁 PROGRAMME DE FIDÉLITÉ                            │
│  ┌────────────────────────────────────────────────┐ │
│  │ 👑 Niveau GOLD                                 │ │
│  │ Vos points : 2 450 pts                         │ │
│  │                                                │ │
│  │ ████████████████░░░░ 2450/3000 (Platine)       │ │
│  │                                                │ │
│  │ 🎁 RÉCOMPENSES DISPONIBLES                     │ │
│  │ • 200 pts - Réduction 10€ [Utiliser]          │ │
│  │ • 500 pts - Soin gratuit [Utiliser]           │ │
│  │ • 1000 pts - Bon cadeau 100€ [Utiliser]       │ │
│  │                                                │ │
│  │ 📊 HISTORIQUE DES POINTS                       │ │
│  │ • +85 pts - RDV du 15/11 (Soin visage)        │ │
│  │ • +45 pts - RDV du 10/10 (Épilation)          │ │
│  │ • -500 pts - Récompense utilisée 05/09        │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  👥 PARRAINAGE - Invitez vos amies                   │
│  ┌────────────────────────────────────────────────┐ │
│  │ Votre code : MARIE123                          │ │
│  │ Votre lien : votre-institut.fr/?ref=MARIE123   │ │
│  │                                                │ │
│  │ 🎁 Parrainez une amie et gagnez :              │ │
│  │ • Vous : 20€ de réduction ou 200 points       │ │
│  │ • Votre amie : 10€ de réduction               │ │
│  │                                                │ │
│  │ [📧 Inviter par email] [📱 Partager]          │ │
│  │                                                │ │
│  │ ✅ Parrainages réussis : 3                     │ │
│  │ • Sophie M. - 20€ gagnés                       │ │
│  │ • Julie L. - 20€ gagnés                        │ │
│  │ • Anne B. - 20€ gagnés                         │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ⭐ MES AVIS                                          │
│  [Laisser un avis sur mon dernier RDV]              │
│                                                      │
│  📄 MES FACTURES (18)                                │
│  • Facture F-2025-045 - 85€ - 15/11 [📥 PDF]        │
│  • Facture F-2025-032 - 45€ - 10/10 [📥 PDF]        │
│  [Voir toutes]                                       │
│                                                      │
│  👤 MON PROFIL                                        │
│  • Email : marie@email.com                           │
│  • Téléphone : 06 12 34 56 78                        │
│  • Préférences notifications : Email + SMS          │
│  [Modifier mes informations]                         │
│  [Changer mon mot de passe]                          │
└──────────────────────────────────────────────────────┘
```

#### **Fonctionnalités de l'espace client**

**1. Gestion des rendez-vous** :
- Voir les RDV à venir
- Modifier un RDV (date, heure, service)
- Annuler un RDV (selon conditions)
- Ajouter au calendrier (Google, Apple, Outlook)
- Rappels automatiques (email + SMS)
- Historique complet

**2. Réservation en ligne** :
- Formulaire intuitif 4 étapes
- Sélection du service
- Choix de la date + heure
- Paiement sécurisé ou sur place
- Confirmation instantanée

**3. Programme de fidélité** :
- Voir le solde de points
- Historique des gains/utilisations
- Récompenses disponibles
- Niveaux (Bronze, Silver, Gold, Platine)
- Utilisation des récompenses en 1 clic

**4. Parrainage** :
- Code personnel unique
- Lien de partage
- Suivi des parrainages
- Récompenses automatiques
- Partage email/réseaux sociaux

**5. Avis et témoignages** :
- Laisser un avis après chaque RDV
- Note sur 5 étoiles
- Commentaire + photos
- Bonus points fidélité pour chaque avis

**6. Factures** :
- Téléchargement PDF
- Historique complet
- Détails de chaque paiement

**7. Profil** :
- Modifier informations personnelles
- Préférences de communication
- Changer mot de passe
- Gérer consentements RGPD

---

## 🎯 Récapitulatif : Pourquoi LAIA Connect est complet

Avec **un seul abonnement LAIA Connect** (49€ à 249€/mois), le propriétaire d'institut obtient :

### ✅ Une présence en ligne professionnelle
- Site vitrine personnalisé (14 designs au choix)
- 70+ paramètres de personnalisation
- Réservation en ligne intégrée
- Paiement sécurisé Stripe
- SEO optimisé
- Hébergement inclus
- HTTPS + sécurité

### ✅ Un outil de gestion complet
- 23 onglets de gestion
- Planning interactif
- CRM client détaillé
- Gestion stock + compta
- Marketing automatisé (email, SMS, WhatsApp)
- Statistiques temps réel
- Export comptable

### ✅ Gestion d'équipe multi-utilisateurs
- **SOLO** : 1 utilisateur (propriétaire seul)
- **DUO** : 3 utilisateurs (admin + 2 employés)
- **TEAM** : 10 utilisateurs (admin + 9 employés)
- **PREMIUM** : Utilisateurs illimités
- 5 rôles avec permissions personnalisables (Admin, Manager, Staff, Réceptionniste, Comptable)
- Génération automatique des accès avec email
- Interface adaptée selon les droits de chaque utilisateur

### ✅ Une expérience client moderne
- Espace client personnel
- Réservation 24/7
- Programme fidélité automatique
- Parrainage intégré
- Rappels automatiques
- Factures dématérialisées

### ✅ Des intégrations professionnelles
- Stripe (paiements)
- Brevo/Resend (emails)
- Twilio (SMS + WhatsApp)
- Google Analytics
- Facebook Pixel
- Google Calendar
- Et bien d'autres...

**Tout est inclus. Aucun frais caché. Aucun plugin à acheter séparément.**

---

## 🚀 Parcours client complet détaillé

### 📍 ÉTAPE 1 : Découverte de LAIA Connect

Le propriétaire d'institut découvre **LAIA Connect** (la plateforme SaaS).

**Point d'entrée** : Site marketing LAIA Connect
**URL** : Typiquement une landing page dédiée (non incluse dans ce repo)

---

### 📍 ÉTAPE 2 : Inscription sur LAIA Connect

Le propriétaire souhaite créer son compte pour utiliser LAIA Connect.

**Page** : `/register` (`/home/celia/laia-github-temp/laia-skin-nextjs/src/app/(platform)/register/page.tsx`)

**Processus d'inscription (3 étapes)** :

#### **Étape 1/3 : Choix du plan**

L'utilisateur choisit parmi 4 plans :

| Plan | Prix/mois | Emplacements | Utilisateurs | Stockage | Templates |
|------|-----------|--------------|--------------|----------|-----------|
| **SOLO** | 49€ | 1 | 1 | 5 GB | 7 templates classiques |
| **DUO** ⭐ | 89€ | 1 | 3 | 10 GB | 7 templates classiques |
| **TEAM** | 149€ | 3 | 10 | 50 GB | 14 templates (classiques + premium) 💎 |
| **PREMIUM** 💎 | 249€ | Illimité | Illimité | 999 GB | 14 templates (classiques + premium) |

#### **Étape 2/3 : Informations institut**

Formulaire avec :
- Nom de l'institut (requis)
- Raison sociale (auto-rempli depuis le nom)
- Ville (requis)
- SIRET
- Email de contact (requis)
- Téléphone
- Adresse de facturation

**Auto-génération** :
- `slug` : généré automatiquement depuis le nom (ex: "Mon Institut Beauté" → "mon-institut-beaute")
- `subdomain` : identique au slug (sera utilisé pour l'URL du site vitrine)

#### **Étape 3/3 : Paiement SEPA**

Configuration du prélèvement automatique :
- IBAN (requis)
- BIC (requis)
- Titulaire du compte (requis)
- ✅ Mandat SEPA (requis)

**Important** :
- 🎁 **30 jours d'essai gratuit**
- Aucun prélèvement avant la fin de la période d'essai
- Annulation possible à tout moment

#### **Validation de l'inscription**

Après validation du formulaire :

1. **API appelée** : `POST /api/super-admin/organizations`
2. **Création automatique** :
   - Organisation dans la base de données
   - Compte administrateur avec email : `{slug}-admin@laia-skin-institut.fr`
   - Mot de passe temporaire généré automatiquement
   - OrganizationConfig avec valeurs par défaut
3. **Affichage des identifiants** :
   - Email de connexion
   - Mot de passe temporaire
   - Boutons de copie
   - ⚠️ Message de sécurité pour noter ces identifiants

**Écran de confirmation** :

```
┌────────────────────────────────────────────────┐
│                🎉 Félicitations !              │
│                                                │
│  Votre institut a été créé avec succès.       │
│  Voici vos identifiants de connexion :        │
│                                                │
│  📧 Email : mon-institut-beaute-admin@...     │
│     [Copier]                                   │
│                                                │
│  🔑 Mot de passe : Ab12Xy89Zq...               │
│     [Copier]                                   │
│                                                │
│  ⚠️ Notez bien ces identifiants !              │
│                                                │
│  [Se connecter maintenant]                     │
│  [Retour à l'accueil]                          │
└────────────────────────────────────────────────┘
```

---

### 📍 ÉTAPE 3 : Première connexion (Admin principal uniquement)

**Page** : `/login` (`/home/celia/laia-github-temp/laia-skin-nextjs/src/app/(site)/login/page.tsx`)

**⚠️ IMPORTANT** : À ce stade, **SEUL le propriétaire/admin principal** peut se connecter !

L'administrateur principal se connecte avec les identifiants reçus lors de l'inscription :
- Email : `{slug}-admin@laia-skin-institut.fr`
- Mot de passe : mot de passe temporaire reçu
- Rôle : `ORG_ADMIN` (administrateur de l'organisation)

**Les autres utilisateurs (staff, réceptionniste, comptable, etc.) n'existent PAS encore.** Ils devront être créés manuellement par l'admin après l'onboarding via l'onglet "Permissions".

---

**Processus de connexion de l'admin** :

1. **API appelée** : `POST /api/auth/login`
2. **Vérification** :
   - Email et mot de passe validés
   - Rôle `ORG_ADMIN` vérifié
   - OrganizationId récupéré
3. **Création du token JWT** contenant :
   - `userId`
   - `email`
   - `role` : `ORG_ADMIN`
   - `organizationId`
   - `locationId`
   - Expiration : 24h par défaut, 30j si "Se souvenir de moi"
4. **Stockage** :
   - Token dans localStorage
   - Données utilisateur dans localStorage
5. **Redirection automatique** :
   - Si onboarding non complété → `/onboarding`
   - Si onboarding complété → `/admin`

**⚠️ Redirection spéciale pour nouvelle organisation** :

Puisque c'est la première connexion d'une nouvelle organisation qui vient de s'inscrire :
→ **Redirection automatique vers `/onboarding`** pour configurer le site

---

**Note importante : Création des autres utilisateurs**

Les employés de l'institut (esthéticiennes, réceptionnistes, comptables, etc.) seront créés **APRÈS l'onboarding** par l'admin via :

**Onglet "Permissions"** dans l'admin (`/admin` → Permissions → Ajouter un utilisateur)

---

### ⚠️ **LIMITE D'UTILISATEURS SELON LE PLAN**

Le nombre d'utilisateurs que l'admin peut créer est **limité par la formule choisie** :

| Plan | Utilisateurs max | Détail | Exemple |
|------|-----------------|--------|---------|
| **SOLO** 👤 | **1 utilisateur** | L'admin uniquement | ❌ **Aucun employé supplémentaire** possible |
| **DUO** 👥 | **3 utilisateurs** | Admin + 2 employés | ✅ Peut créer 2 comptes (ex: 1 esthéticienne + 1 réceptionniste) |
| **TEAM** 👨‍👩‍👧‍👦 | **10 utilisateurs** | Admin + 9 employés | ✅ Peut créer 9 comptes (équipe complète) |
| **PREMIUM** 👥👥👥 | **Illimité** | Aucune limite | ✅ Peut créer autant de comptes que nécessaire |

**Important** :
- L'**admin principal compte comme 1 utilisateur** dans la limite
- Si vous tentez de créer un utilisateur au-delà de votre limite, le système affichera :

```
┌──────────────────────────────────────────────────┐
│  ⚠️ LIMITE ATTEINTE                              │
├──────────────────────────────────────────────────┤
│  Votre plan DUO autorise 3 utilisateurs maximum. │
│                                                  │
│  Utilisateurs actuels : 3/3                      │
│  • Jean Dupont (Admin)                           │
│  • Sophie Martin (Staff)                         │
│  • Claire Petit (Réceptionniste)                 │
│                                                  │
│  Pour ajouter plus d'utilisateurs, passez au    │
│  plan TEAM (10 utilisateurs) ou PREMIUM.        │
│                                                  │
│  [Voir les offres] [Annuler]                     │
└──────────────────────────────────────────────────┘
```

**Cas d'usage typiques** :

**Plan SOLO** (1 utilisateur) :
- Institut avec propriétaire seul
- Praticien indépendant
- ❌ Ne peut PAS ajouter d'employés

**Plan DUO** (3 utilisateurs) :
- Petit institut avec 1-2 employés
- Ex: Propriétaire + 1 esthéticienne + 1 réceptionniste
- ✅ Parfait pour démarrer avec une petite équipe

**Plan TEAM** (10 utilisateurs) :
- Institut moyen avec équipe
- Ex: Propriétaire + 6 esthéticiennes + 2 réceptionnistes + 1 comptable
- ✅ Idéal pour un salon établi

**Plan PREMIUM** (Illimité) :
- Grande chaîne d'instituts
- Plusieurs emplacements
- ✅ Aucune limite, évolutif

---

**L'admin pourra créer des comptes avec les rôles suivants :**

| Rôle | Nom | Accès | Permissions typiques |
|------|-----|-------|---------------------|
| `ORG_ADMIN` | Admin principal | Accès total | Toutes les fonctionnalités |
| `LOCATION_MANAGER` | Gestionnaire de salon | Accès complet pour un salon | Planning, CRM, Services d'un salon |
| `STAFF` | Esthéticienne/Praticien | Accès limité | Voir son planning, marquer RDV comme terminés |
| `RECEPTIONIST` | Réceptionniste | Accès réservations | Planning, Validation des RDV, Paiements |
| `ACCOUNTANT` | Comptable | Accès finances | Paiements, Comptabilité, Factures |

**Processus de création d'un utilisateur** :

1. **Admin se connecte** → `/admin` → Onglet "Permissions"

**L'admin voit d'abord le compteur d'utilisateurs** :

```
┌──────────────────────────────────────────────────┐
│  👥 GESTION DES UTILISATEURS                     │
├──────────────────────────────────────────────────┤
│  Plan actuel : DUO (3 utilisateurs max)          │
│                                                  │
│  📊 Utilisateurs : 2/3                           │
│  ████████░░░░░░░░░░░░░░░░░░░░                    │
│                                                  │
│  ✅ 1 place disponible                           │
│                                                  │
│  [+ Ajouter un utilisateur]  [Upgrade au TEAM]  │
└──────────────────────────────────────────────────┘
```

2. Clique sur **"+ Ajouter un utilisateur"** (si places disponibles)
3. **Remplit le formulaire** :
   - Prénom (ex: "Sophie")
   - Nom (ex: "Martin")
   - Email (ex: "sophie.martin@institut.com")
   - **Rôle** (sélection dans la liste des rôles)
   - Salon/Location (si plusieurs emplacements)
   - **Permissions spécifiques** (optionnel) : cocher les accès autorisés

4. **Valide** → Le système :
   - Crée automatiquement le compte utilisateur
   - **Génère un mot de passe temporaire sécurisé** (ex: "Temp2025#Sophie")
   - Associe les **droits et permissions** selon le rôle sélectionné
   - Envoie un email automatique

5. **Email automatique envoyé à l'employé** :

```
┌──────────────────────────────────────────────────┐
│  Bienvenue dans l'équipe ! 🎉                    │
│                                                  │
│  Bonjour Sophie,                                 │
│                                                  │
│  Vous avez été ajouté(e) à Mon Institut Beauté   │
│  sur LAIA Connect.                               │
│                                                  │
│  📧 Email : sophie.martin@institut.com           │
│  🔑 Mot de passe temporaire : Temp2025#Sophie    │
│  👤 Rôle : Esthéticienne (STAFF)                 │
│                                                  │
│  [Activer mon compte et changer mon mot de passe]│
│                                                  │
│  Vos accès :                                     │
│  • Consulter votre planning                      │
│  • Marquer les rendez-vous comme terminés        │
│  • Voir les fiches clients                       │
│                                                  │
│  URL de connexion : votre-institut.fr/login      │
│                                                  │
│  À bientôt !                                     │
│  L'équipe LAIA Connect                           │
└──────────────────────────────────────────────────┘
```

6. **L'employé active son compte** :
   - Clique sur "Activer mon compte"
   - Se connecte avec l'email et le mot de passe temporaire
   - **Obligé de changer son mot de passe** lors de la première connexion
   - Accède à son espace personnalisé selon son rôle

---

**Vision et accès selon le rôle** :

Chaque utilisateur voit une **interface différente** selon ses droits :

### 👑 **ORG_ADMIN** (Admin principal) - Accès total

```
┌──────────────────────────────────────────────────┐
│  ADMIN - Mon Institut Beauté    👑 Jean Dupont   │
├──────────────────────────────────────────────────┤
│  📊 Stats  📅 Planning  ✅ Validation  ⏳ Pending │
│  💳 Paiements  💰 Soins  🎁 Fidélité  👥 CRM     │
│  🛎️ Services  📦 Products  📊 Stock              │
│  📧 Emailing  💬 SMS  📱 WhatsApp  📱 Social     │
│  ⭐ Reviews  📝 Blog  📍 Locations               │
│  💼 Comptabilité  🔔 Notifications               │
│  ⚙️ Configuration  🔐 Permissions                │
└──────────────────────────────────────────────────┘
```
**Accès** : Tous les 23 onglets

---

### 🏪 **LOCATION_MANAGER** (Gestionnaire de salon) - Accès salon

```
┌──────────────────────────────────────────────────┐
│  ADMIN - Salon Paris 15ème    🏪 Marie Dubois    │
├──────────────────────────────────────────────────┤
│  📊 Stats (salon)  📅 Planning  ✅ Validation    │
│  💳 Paiements  👥 CRM (clients du salon)         │
│  🛎️ Services  📦 Stock (salon)                   │
│  📧 Emailing  💬 SMS  ⭐ Reviews                 │
│  👥 Équipe (gestion staff du salon)              │
└──────────────────────────────────────────────────┘
```
**Accès** : Planning, Validation, CRM, Services, Stock, Reviews du salon uniquement
**Restrictions** : Ne peut pas modifier la config globale, ni les autres salons

---

### 💅 **STAFF** (Esthéticienne/Praticien) - Accès limité

```
┌──────────────────────────────────────────────────┐
│  MON PLANNING - Sophie Martin    💅              │
├──────────────────────────────────────────────────┤
│  📅 Mon Planning                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ Aujourd'hui - Mercredi 22 Nov              │ │
│  │                                            │ │
│  │ 10:00 - Marie D. - Soin visage   [Terminer]│ │
│  │ 14:00 - Sophie L. - Épilation    [Terminer]│ │
│  │ 16:00 - Julie M. - Massage       [Terminer]│ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  👥 Mes Clients (consultation seule)             │
│  📊 Mes Statistiques                             │
└──────────────────────────────────────────────────┘
```
**Accès** :
- Voir son propre planning
- Consulter les fiches clients (lecture seule)
- Marquer les RDV comme terminés
- Voir ses statistiques personnelles

**Restrictions** : Ne peut PAS voir le planning des autres, ni modifier les services, ni accéder aux finances

---

### 📞 **RECEPTIONIST** (Réceptionniste) - Accès réservations

```
┌──────────────────────────────────────────────────┐
│  RÉCEPTION - Mon Institut    📞 Claire Petit     │
├──────────────────────────────────────────────────┤
│  📅 Planning (tous praticiens)                   │
│  ✅ Validation des RDV                           │
│  👥 CRM (gestion clients)                        │
│  💳 Encaissements                                │
│  📧 Communications clients                       │
└──────────────────────────────────────────────────┘
```
**Accès** :
- Planning complet (tous praticiens)
- Valider/Refuser les réservations
- CRM (ajouter/modifier clients)
- Encaisser les paiements
- Envoyer emails/SMS de rappel

**Restrictions** : Ne peut PAS modifier les services, le stock, la config du site

---

### 💼 **ACCOUNTANT** (Comptable) - Accès finances

```
┌──────────────────────────────────────────────────┐
│  COMPTABILITÉ - Mon Institut    💼 Paul Legrand  │
├──────────────────────────────────────────────────┤
│  💳 Paiements                                    │
│  💼 Comptabilité                                 │
│  📊 Rapports financiers                          │
│  📄 Factures & Devis                             │
│  📥 Exports comptables                           │
└──────────────────────────────────────────────────┘
```
**Accès** :
- Historique des paiements
- Comptabilité complète
- Génération factures/devis
- Exports FEC
- Rapports TVA

**Restrictions** : Ne peut PAS voir le planning, ni modifier les services, ni la config

---

**Système de permissions granulaires** :

L'admin peut aussi **personnaliser les permissions** de chaque utilisateur :

```
┌──────────────────────────────────────────────────┐
│  ÉDITER UTILISATEUR - Sophie Martin              │
├──────────────────────────────────────────────────┤
│  Rôle de base : STAFF                            │
│                                                  │
│  ✅ Permissions supplémentaires :                │
│  ☑️ Peut voir le planning complet                │
│  ☐ Peut valider les réservations                │
│  ☑️ Peut consulter les stocks                    │
│  ☐ Peut modifier les prix                       │
│  ☐ Peut envoyer des emails                      │
│  ☑️ Peut laisser des notes sur les clients       │
│                                                  │
│  [Enregistrer]                                   │
└──────────────────────────────────────────────────┘
```

Cela permet une **flexibilité totale** : par exemple, une esthéticienne senior peut avoir des permissions supplémentaires comparé à une junior.

---

### 📍 ÉTAPE 4 : Onboarding complet (5 étapes)

**Page** : `/onboarding` (`/home/celia/laia-github-temp/laia-skin-nextjs/src/app/(platform)/onboarding/page.tsx`)

**Attention** : Ce fichier est très volumineux (38 343 tokens), c'est un wizard complet avec 5 étapes.

#### **Vue d'ensemble de l'onboarding** :

```
┌────────────────────────────────────────────────────────────┐
│  ONBOARDING - LAIA CONNECT                                 │
│                                                            │
│  ●━━━○━━━○━━━○━━━○                                        │
│  1   2   3   4   5                                        │
└────────────────────────────────────────────────────────────┘
```

#### **Étape 1/5 : Informations de base** 📝

**Objectif** : Recueillir les informations essentielles de l'institut

**Champs** :
- Nom de l'institut (pré-rempli)
- Description courte
- Slogan du site
- Adresse complète
- Code postal
- Ville
- Téléphone
- Email de contact
- Horaires d'ouverture (pour chaque jour de la semaine)

**Validation** : Au moins le nom et la ville sont requis

---

#### **Étape 2/5 : Choix du template et personnalisation** 🎨

**Objectif** : Choisir le design du site vitrine et le personnaliser

**Sous-section A : Sélection du template**

Affichage d'une grille avec **14 templates** (ou moins selon le plan) :

**Templates CLASSIQUES (accessibles à tous les plans)** :
1. **Classic** - "L'intemporalité au service de votre image"
2. **Modern** - "L'élégance contemporaine redéfinie"
3. **Minimal** - "La pureté des lignes, l'essence du raffinement"
4. **Professional** - "La rigueur au service de l'excellence"
5. **Boutique** - "L'art de l'accueil avec distinction"
6. **Fresh** (Dynamique) - "L'énergie sublimée par le design"
7. **Zen** (Nature) - "L'harmonie naturelle au cœur de votre espace"

**Templates PREMIUM (uniquement pour plans TEAM & PREMIUM)** 💎 :
8. **LAIA Signature** - Design rose gold, signature LAIA
9. **Luxe Noir** - Raffinement absolu dans l'obscurité dorée (dark luxury, accents or, glassmorphisme)
10. **Élégance Raffinée** - Grâce et sophistication avec particules flottantes
11. **Medical** - Excellence médicale avec prestance (design clinique)
12. **Spa Luxe (Harmonie Spa)** - Art du bien-être dans un écrin de luxe (parallax immersif)
13. **Laser Tech (Précision Laser)** - Précision technologique sublimée (design technique)

**Affichage selon le plan** :

Si plan = **SOLO ou DUO** :
- Templates classiques (7) : **disponibles** (bordure cliquable, couleur primaire)
- Templates premium (7) : **verrouillés** 🔒 avec :
  - Badge "💎 PREMIUM"
  - Overlay gris semi-transparent
  - Icône cadenas 🔒
  - Message "Upgrade vers TEAM ou PREMIUM requis"
  - Opacité réduite (60%)
  - Non cliquables

Si plan = **TEAM ou PREMIUM** :
- **Tous les 14 templates disponibles** ✅
- Templates premium marqués avec badge "💎 PREMIUM"
- Tous cliquables et personnalisables

**Layout split-screen** (60% / 40%) :

```
┌─────────────────────────────────┬─────────────────────┐
│  SÉLECTION TEMPLATE (60%)       │  PREVIEW LIVE (40%) │
│                                 │                     │
│  [Classic]    [Modern]          │  ┌───────────────┐ │
│  [Minimal]    [Professional]    │  │               │ │
│  [Boutique]   [Fresh]           │  │   PREVIEW     │ │
│  [Zen]                          │  │   EN TEMPS    │ │
│                                 │  │     RÉEL      │ │
│  💎 PREMIUM                      │  │               │ │
│  [LAIA] 🔒    [Luxe] 🔒         │  │               │ │
│  [Elegance] 🔒 [Medical] 🔒     │  │               │ │
│  [Spa Luxe] 🔒 [Laser Tech] 🔒  │  └───────────────┘ │
│                                 │  [💻] [📱]         │
└─────────────────────────────────┴─────────────────────┘
```

**Composant utilisé** : `<LiveTemplatePreview />` (créé récemment)

**Sous-section B : Personnalisation des couleurs**

Intégré dans la même vue, après la sélection du template :

**Sélecteurs de couleurs** :
- **Couleur primaire** (Color picker) - Par défaut : `#d4b5a0` (beige rosé)
- **Couleur secondaire** (Color picker) - Par défaut : `#c9a084` (beige plus foncé)
- **Couleur d'accent** (Color picker) - Par défaut : `#2c3e50` (bleu marine)

**Mise à jour en temps réel** :
- Chaque changement de couleur met à jour instantanément le `<LiveTemplatePreview />`
- L'utilisateur voit immédiatement le résultat sur le site

**Sous-section C : Textes hero (optionnel)**

Champs pour personnaliser le hero (section d'accueil) :
- Titre hero (ex: "Une peau respectée,")
- Sous-titre hero (ex: "une beauté révélée")

**Validation** : Au moins un template doit être sélectionné

---

#### **Étape 3/5 : Upload des images** 📸

**Objectif** : Ajouter les images essentielles du site

**Images uploadables** :

1. **Logo** (requis)
   - Format : PNG, JPG, SVG
   - Taille recommandée : 200x200px min
   - Poids max : 2 MB
   - Utilisation : Header, footer, favicon

2. **Image hero** (recommandé)
   - Format : JPG, PNG, WebP
   - Taille recommandée : 1920x1080px
   - Poids max : 5 MB
   - Utilisation : Bannière d'accueil

3. **Vidéo hero** (optionnel) 🎥
   - Format : MP4, WebM
   - Poids max : 20 MB
   - Utilisation : Bannière d'accueil animée (remplace l'image hero si fournie)

4. **Photo du fondateur** (optionnel)
   - Format : JPG, PNG
   - Taille recommandée : 400x400px
   - Poids max : 2 MB
   - Utilisation : Section "À propos"

**Fonctionnalités** :
- Drag & drop
- Prévisualisation immédiate
- Bouton de suppression
- Upload vers Cloudinary ou S3
- URL stockée dans la base de données

**Note technique** :
- Dans l'onboarding, les images sont uploadées via input file
- Les URLs sont ensuite envoyées à l'API lors de la sauvegarde
- Le `<LiveTemplatePreview />` affiche les images en temps réel

**Validation** : Au moins le logo est fortement recommandé

---

#### **Étape 4/5 : Ajout des services** 🛎️

**Objectif** : Créer le catalogue de services/soins proposés

**Interface** :
- Liste des services déjà créés
- Bouton "+ Ajouter un service"
- Formulaire de création/édition de service

**Champs pour chaque service** :

| Champ | Type | Description |
|-------|------|-------------|
| **Nom** | Texte | Nom du soin (ex: "Soin du visage") |
| **Description courte** | Texte | 1 ligne de résumé |
| **Description complète** | Texte long | Détails du soin |
| **Durée** | Nombre | En minutes (ex: 60) |
| **Prix** | Nombre | Prix en euros (ex: 85.00) |
| **Prix promo** | Nombre | Prix promotionnel (optionnel) |
| **Image** | Upload | Photo du soin |
| **Catégorie** | Select | Visage, Corps, Épilation, etc. |
| **En vedette** | Toggle | Afficher sur la page d'accueil |
| **Actif** | Toggle | Visible sur le site |
| **Ordre** | Nombre | Position d'affichage |

**Fonctionnalités** :
- Ajout illimité de services (selon le plan)
- Drag & drop pour réorganiser
- Duplication de service
- Suppression avec confirmation
- Prévisualisation du rendu sur le site

**Validation** : Au moins 1 service est recommandé

---

#### **Étape 5/5 : Informations légales et SEO** ⚖️📊

**Objectif** : Compléter les mentions légales et optimiser le référencement

**Section A : Informations légales** (Important pour conformité RGPD)

**Informations d'entreprise** :
- SIRET (déjà saisi)
- SIREN
- Numéro de TVA
- Code APE
- RCS
- Capital social
- Forme juridique (SARL, EURL, SAS, Auto-entrepreneur, etc.)
- Nom du représentant légal
- Titre du représentant

**Assurance** :
- Compagnie d'assurance
- Numéro de contrat
- Adresse de l'assurance

**Coordonnées bancaires** :
- Nom de la banque
- IBAN
- BIC

**Section B : SEO (Search Engine Optimization)**

**Meta tags** :
- Titre de la page (meta title) - Max 60 caractères
- Description de la page (meta description) - Max 160 caractères
- Mots-clés (meta keywords) - Séparés par des virgules

**Exemple** :
```
Titre : Institut de Beauté à Paris | Soins Visage & Corps
Description : Découvrez notre institut de beauté à Paris. Soins du visage, épilation, massages. Prenez rendez-vous en ligne.
Mots-clés : institut beauté Paris, soin visage, épilation, massage
```

**Analytics** :
- Google Analytics ID (ex: G-XXXXXXXXXX)
- Facebook Pixel ID
- Code de vérification Google
- Code de vérification Meta

**Validation** : Aucun champ requis, mais fortement recommandés

---

#### **Finalisation de l'onboarding** ✅

Après la dernière étape, l'utilisateur clique sur **"Terminer l'onboarding"**.

**API appelée** : `POST /api/admin/onboarding/complete`

**Données envoyées** : Toutes les informations collectées dans les 5 étapes

**Traitement backend** :
1. Validation des données
2. Mise à jour de l'organisation
3. Mise à jour de l'OrganizationConfig avec 70+ champs
4. Création des services
5. Upload des images
6. Marquage de l'onboarding comme complété (`onboardingCompleted: true`)
7. Génération du site vitrine

**Redirection** : `/onboarding/success` puis automatiquement vers `/admin`

**Message de succès** :
```
┌────────────────────────────────────────────────┐
│  🎉 Félicitations !                            │
│                                                │
│  Votre site vitrine est maintenant en ligne !  │
│                                                │
│  🌐 Votre site : mon-institut-beaute.fr        │
│  🔧 Admin : /admin                             │
│  👥 Clients : /espace-client                   │
│                                                │
│  [Accéder à l'admin]                           │
└────────────────────────────────────────────────┘
```

---

### 📍 ÉTAPE 5 : Accès à l'admin de l'institut

**Page** : `/admin` (`/home/celia/laia-github-temp/laia-skin-nextjs/src/app/admin/page.tsx`)

L'utilisateur arrive sur le **tableau de bord administrateur** de son institut.

**Architecture de l'admin** :

```
┌─────────────────────────────────────────────────────────────┐
│  LAIA CONNECT - Admin                                       │
│  Mon Institut Beauté                            👤 Jean D.  │
├─────────────────────────────────────────────────────────────┤
│  📊 Stats       📅 Planning      ✅ Validation              │
│  ⏳ Pending     💳 Paiements     💰 Soins-Paiements         │
│  🎁 Fidélité    👥 CRM           🛎️ Services               │
│  📦 Products    📊 Stock         📊 Stock-Advanced          │
│  📧 Emailing    💬 SMS           📱 WhatsApp                │
│  📱 Social      ⭐ Reviews       📝 Blog                     │
│  📍 Locations   💼 Comptabilité  🔔 Notifications           │
│  ⚙️ Configuration du site                                   │
└─────────────────────────────────────────────────────────────┘
```

#### **Les 23 onglets disponibles** :

| # | Onglet | Description | Fonctionnalités clés |
|---|--------|-------------|---------------------|
| 1 | **Stats** | Tableau de bord | KPIs, graphiques, analytics |
| 2 | **Planning** | Calendrier réservations | Vue jour/semaine/mois, drag & drop |
| 3 | **Validation** | Valider réservations | Liste des réservations à confirmer |
| 4 | **Pending** | Réservations en attente | Gestion des paiements en attente |
| 5 | **Paiements** | Gestion paiements | Historique, remboursements, Stripe |
| 6 | **Soins-Paiements** | Paiements des soins | Réconciliation soins/paiements |
| 7 | **Fidélité** | Programme fidélité | Points, récompenses, niveaux |
| 8 | **CRM** | Gestion clients | Fiches clients, historique, notes |
| 9 | **Services** | Catalogue services | CRUD services, catégories, prix |
| 10 | **Products** | Gestion produits | Vente de produits cosmétiques |
| 11 | **Stock** | Gestion stocks | Entrées/sorties, inventaire |
| 12 | **Stock-Advanced** | Stock avancé | Alertes, prévisions, fournisseurs |
| 13 | **Emailing** | Campagnes email | Templates, envois, statistiques |
| 14 | **SMS** | Envoi SMS | Campagnes SMS, rappels automatiques |
| 15 | **WhatsApp** | WhatsApp Business | Conversations, campagnes, automations |
| 16 | **Social-Media** | Réseaux sociaux | Planning publications, analytics |
| 17 | **Reviews** | Avis clients | Gestion avis avec photos |
| 18 | **Blog** | Blog intégré | Articles, catégories, SEO |
| 19 | **Locations** | Multi-emplacements | Gestion de plusieurs salons |
| 20 | **Comptabilité** | Compta intégrée | Factures, devis, TVA, exports |
| 21 | **Notifications** | Centre notifications | Notifications temps réel |
| 22 | **Configuration** | Config du site | Templates, couleurs, contenus |
| 23 | **Paramètres** | Paramètres généraux | Utilisateurs, permissions, etc. |

---

### 📍 ÉTAPE 6 : Personnalisation post-onboarding (Nouveau!)

**Onglet** : `/admin` → Onglet "Configuration du site"

**Fonctionnalité récente** : L'utilisateur peut **modifier son template et ses couleurs APRÈS l'onboarding** ! ✨

#### **Interface de configuration (Split-screen)** :

**Composant** : `AdminConfigTab.tsx` (récemment amélioré)

**Layout** :

```
┌────────────────────────────────────────────────────────────────┐
│  CONFIGURATION DU SITE                                         │
├────────────────────────────────────────────────────────────────┤
│  [Général] [Template] [Contenus] [Images] [SEO] [Réseaux]     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────┬─────────────────────────────┐ │
│  │  SÉLECTION (60%)           │  PREVIEW LIVE (40%)         │ │
│  │                            │                             │ │
│  │  💎 Plan DUO               │  ┌───────────────────────┐ │ │
│  │  Certains templates        │  │                       │ │ │
│  │  premium nécessitent       │  │     PREVIEW DU        │ │ │
│  │  un upgrade                │  │      TEMPLATE         │ │ │
│  │                            │  │     EN TEMPS          │ │ │
│  │  ┌────────┬────────┐       │  │       RÉEL            │ │ │
│  │  │Classic │ Modern │ ✓     │  │                       │ │ │
│  │  │ [img]  │ [img]  │       │  │                       │ │ │
│  │  └────────┴────────┘       │  │                       │ │ │
│  │  ┌────────┬────────┐       │  │                       │ │ │
│  │  │Minimal │Profess.│       │  └───────────────────────┘ │ │
│  │  │ [img]  │ [img]  │       │  [💻 Desktop] [📱Mobile] │ │
│  │  └────────┴────────┘       │                             │ │
│  │  ┌────────┬────────┐       │                             │ │
│  │  │Boutique│ Fresh  │       │                             │ │
│  │  │ [img]  │ [img]  │       │                             │ │
│  │  └────────┴────────┘       │                             │ │
│  │  ┌────────┐                │                             │ │
│  │  │  Zen   │                │                             │ │
│  │  │ [img]  │                │                             │ │
│  │  └────────┘                │                             │ │
│  │                            │                             │ │
│  │  💎 TEMPLATES PREMIUM      │                             │ │
│  │  ┌────────┬────────┐       │                             │ │
│  │  │ LAIA   │ Luxe   │       │                             │ │
│  │  │🔒[img] │🔒[img] │       │                             │ │
│  │  │Upgrade │Upgrade │       │                             │ │
│  │  │ requis │ requis │       │                             │ │
│  │  └────────┴────────┘       │                             │ │
│  │  (... autres premium)      │                             │ │
│  │                            │                             │ │
│  │  ─────────────────────     │                             │ │
│  │  COULEURS                  │                             │ │
│  │  🎨 Primaire [#d4b5a0]     │                             │ │
│  │  🎨 Secondaire [#c9a084]   │                             │ │
│  │  🎨 Accent [#2c3e50]       │                             │ │
│  │                            │                             │ │
│  └────────────────────────────┴─────────────────────────────┘ │
│                                                                │
│  [Annuler]                              [Enregistrer] ───────→│
└────────────────────────────────────────────────────────────────┘
```

#### **Fonctionnalités de personnalisation** :

**1. Changement de template**

L'utilisateur peut **changer de template à tout moment** :
- Cliquer sur un template disponible pour le sélectionner
- Voir immédiatement le rendu dans la preview
- Les templates premium sont **verrouillés** si plan Solo/Duo/Team

**Restrictions par plan** :

```typescript
// Fonction de filtrage automatique
const availableTemplates = getTemplatesForPlan(organizationPlan)

// Affichage conditionnel
if (!isAvailable) {
  // Template grisé avec icône cadenas
  // Message "Upgrade requis"
  // Opacité 60%
  // Non cliquable
}
```

**Indicateurs visuels** :
- ✓ **Checkmark** sur le template sélectionné
- 💎 **Badge "PREMIUM"** sur les templates haut de gamme
- 🔒 **Cadenas** sur les templates non accessibles
- **Bordure colorée** (couleur primaire) sur le template actif

**2. Modification des couleurs**

L'utilisateur peut modifier les 3 couleurs principales :
- **Color picker** pour chaque couleur
- **Mise à jour en temps réel** de la preview
- **Stockage** dans OrganizationConfig

**3. Autres configurations disponibles** (19 onglets au total) :

**Onglets de base** :
1. **Général** 🌐 : Nom du site, slogan, description
2. **Contact** ☎️ : Email, téléphone
3. **Entreprise** 🏢 : Nom légal, SIRET, SIREN, TVA, APE, RCS, capital, forme juridique
4. **Réseaux sociaux** 💬 : Facebook, Instagram, TikTok, WhatsApp, LinkedIn, YouTube
5. **Apparence** 🎨 : Couleurs (primaire, secondaire, accent), polices
6. **Template Web** 🖼️ : Sélection du template avec preview live
7. **Horaires** ⏰ : Horaires d'ouverture (7 jours)

**Onglets de contenu** :
8. **Contenu** 📝 : Titre hero, sous-titre, image hero, texte "À propos", CGV, politique
9. **À propos** 👤 : Fondateur (nom, titre, citation, photo), formations, témoignages
10. **Localisation** 📍 : Adresse complète, code postal, ville, pays, Google Maps

**Onglets marketing & analytics** :
11. **SEO & Tracking** 🔍 : Meta tags, Google Analytics, Facebook Pixel, codes de vérification
12. **Google Business** ⭐ : Google Place ID, URL, synchronisation avis

**Onglets techniques & intégrations** :
13. **Intégrations** ⚡ : Gestion des intégrations tierces
14. **API & Sécurité** 🔑 : Tokens API, gestion de la sécurité
15. **SMS Marketing** 📱 : Configuration Twilio
16. **Emailing** 📧 : Configuration Brevo/Resend
17. **WhatsApp** 💬 : WhatsApp Business API

**Onglets financiers & légaux** :
18. **Finances** 💳 : Banque, IBAN, BIC
19. **Légal** ⚖️ : Informations légales, assurance (compagnie, contrat, adresse)

**Sauvegarde** :

Bouton **"Enregistrer"** :
- API appelée : `PUT /api/admin/config`
- Mise à jour de l'OrganizationConfig
- Rechargement de la preview
- Notification de succès

---

## ❓ FAQ : Onboarding vs Configuration

### Question : Quelle est la différence entre l'onboarding et l'onglet "Configuration du site" ?

**Réponse courte** : **Même contenu, interfaces différentes** ✨

| Aspect | ONBOARDING | CONFIGURATION |
|--------|------------|---------------|
| **Quand ?** | **1ère connexion** (après inscription) | **À tout moment** dans l'admin |
| **Interface** | **Wizard guidé** en 5 étapes | **19 onglets** permanents |
| **Navigation** | Séquentielle (→ Suivant) | Libre (onglets cliquables) |
| **Objectif** | Configuration initiale rapide | Ajustements complets et continus |

### Ce qui est identique :

**✅ TOUS les champs de l'onboarding sont modifiables dans Configuration**

L'onboarding contient :
- **Étape 1** : Choix du template
- **Étape 2** : Couleurs (primaire, secondaire, accent)
- **Étape 3** : Textes (nom, slogan, hero) + Images (logo, hero, fondateur)
- **Étape 4** : Contact, adresse, réseaux sociaux, horaires
- **Étape 5** : Confirmation

Tous ces champs se retrouvent dans les onglets de Configuration :
- Template → **Onglet 6** (Template Web)
- Couleurs → **Onglet 5** (Apparence)
- Nom, slogan → **Onglet 1** (Général)
- Textes hero, images → **Onglet 8** (Contenu)
- Fondateur → **Onglet 9** (À propos)
- Contact → **Onglet 2** (Contact)
- Adresse → **Onglet 10** (Localisation)
- Réseaux sociaux → **Onglet 4** (Réseaux sociaux)
- Horaires → **Onglet 7** (Horaires)

### Ce qui est en PLUS dans Configuration :

**✅ Configuration contient des onglets supplémentaires** non présents dans l'onboarding :

- **Onglet 3** : Entreprise (SIRET, SIREN, TVA, etc.)
- **Onglet 11** : SEO & Tracking
- **Onglet 12** : Google Business
- **Onglet 13-17** : Intégrations (API, SMS, Email, WhatsApp)
- **Onglet 18** : Finances (Banque, IBAN, BIC)
- **Onglet 19** : Légal (Assurance, informations légales)

### Pourquoi deux interfaces ?

1. **Onboarding** = Configuration **guidée** et **simplifiée** pour démarrer rapidement
   - Wizard en 5 étapes (interface débutant-friendly)
   - Focus sur l'essentiel pour lancer le site

2. **Configuration** = Panneau de contrôle **complet** pour personnalisation avancée
   - 19 onglets avec accès libre
   - Tous les champs + options avancées (intégrations, APIs, etc.)
   - Modifications illimitées

**💡 Résumé** : L'onboarding permet de **lancer le site rapidement** avec les informations essentielles. La configuration permet ensuite d'**ajuster et optimiser continuellement** tous les aspects du site.

---

### 📍 ÉTAPE 7 : Le site vitrine est en ligne

**URL du site** : `https://{slug}.laia-connect.fr` ou domaine personnalisé

Le site vitrine est **automatiquement généré** avec :
- Le template sélectionné
- Les couleurs personnalisées
- Les images uploadées
- Les services créés
- Les informations de contact
- Les horaires d'ouverture
- Les mentions légales

**Architecture du site vitrine** :

```
┌──────────────────────────────────────────────────┐
│  [LOGO]                        ☎️ 01 23 45 67 89 │
│  Accueil  Services  À propos  Contact  Réserver  │
├──────────────────────────────────────────────────┤
│                                                  │
│          HERO SECTION                            │
│  ┌────────────────────────────────────────────┐ │
│  │                                            │ │
│  │     "Une peau respectée,                   │ │
│  │      une beauté révélée"                   │ │
│  │                                            │ │
│  │     [Réserver un soin]                     │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  NOS SERVICES                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ Soin   │ │ Épila- │ │Massage │              │
│  │ visage │ │ tion   │ │        │              │
│  │ 85€    │ │ 45€    │ │ 65€    │              │
│  └────────┘ └────────┘ └────────┘              │
│                                                  │
│  À PROPOS                                        │
│  ┌────────┐  Notre histoire...                  │
│  │ Photo  │                                     │
│  │fondateur                                     │
│  └────────┘                                      │
│                                                  │
│  TÉMOIGNAGES                                     │
│  ⭐⭐⭐⭐⭐ "Excellent service !"                  │
│                                                  │
│  FOOTER                                          │
│  Horaires | Contact | Mentions légales          │
│  Facebook | Instagram | TikTok                   │
└──────────────────────────────────────────────────┘
```

**Fonctionnalités du site vitrine** :
- **Responsive** : adapté mobile, tablette, desktop
- **SEO optimisé** : balises meta, sitemap, schema.org
- **Réservation en ligne** : formulaire de prise de RDV
- **Paiement en ligne** : via Stripe (si configuré)
- **Contact** : formulaire, téléphone, email, maps
- **Blog** : articles de blog (si activé)
- **Multilingue** : FR/EN (si configuré)

---

### 📍 ÉTAPE 8 : Les clients finaux découvrent le site

**Persona** : Marie, cliente potentielle, recherche un institut de beauté à Paris

**Parcours du client final** :

#### **1. Découverte du site**

Marie trouve le site via :
- Google : "institut beauté Paris"
- Facebook/Instagram : publication sponsorisée
- Bouche-à-oreille : lien partagé par une amie
- Google My Business : carte Google Maps

Marie arrive sur : `https://mon-institut-beaute.laia-connect.fr`

#### **2. Navigation sur le site**

Marie explore :
- Page d'accueil : découverte des services
- Page Services : catalogue complet avec prix
- Page À propos : histoire de l'institut
- Page Contact : coordonnées, map, formulaire

#### **3. Prise de rendez-vous**

Marie clique sur **"Réserver un soin"**

**Redirection** : `/reservation` ou `/booking`

**Processus de réservation** :

```
┌─────────────────────────────────────────────────┐
│  RÉSERVATION EN LIGNE                           │
├─────────────────────────────────────────────────┤
│  Étape 1/4 : Choisissez votre soin              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Soin     │ │ Épilation│ │ Massage  │        │
│  │ visage   │ │          │ │          │        │
│  │ 85€ ●    │ │ 45€      │ │ 65€      │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│  [Continuer] ────────────────────────────────→  │
├─────────────────────────────────────────────────┤
│  Étape 2/4 : Choisissez la date                 │
│  📅 Calendrier                                  │
│  [ 20 Nov ] [ 21 Nov ] [ 22 Nov ] ...           │
│                                                 │
│  🕐 Horaires disponibles                        │
│  [ 10:00 ] [ 11:30 ] [ 14:00 ] [ 16:30 ]        │
│                                                 │
│  [Précédent]              [Continuer] ────────→ │
├─────────────────────────────────────────────────┤
│  Étape 3/4 : Vos informations                   │
│  Prénom : [________]   Nom : [________]         │
│  Email  : [____________________]                │
│  Tél    : [____________________]                │
│  Message : [______________________]             │
│                                                 │
│  [Précédent]              [Continuer] ────────→ │
├─────────────────────────────────────────────────┤
│  Étape 4/4 : Confirmation et paiement           │
│  ✓ Soin visage - 85€                            │
│  ✓ 22 Nov 2025 à 14:00                          │
│  ✓ Marie Dupont - marie@email.com               │
│                                                 │
│  💳 Paiement sécurisé (Stripe)                  │
│  [ Payer maintenant ] ou [ Payer sur place ]    │
│                                                 │
│  [Précédent]              [Confirmer] ────────→ │
└─────────────────────────────────────────────────┘
```

**Après confirmation** :
1. **Email de confirmation** envoyé à Marie (via Brevo/Resend)
2. **SMS de rappel** 24h avant (via Twilio)
3. **Notification** dans l'admin de l'institut
4. **Création du compte client** automatique pour Marie

#### **4. Création du compte client**

Lors de la réservation, un compte client est **automatiquement créé** pour Marie :
- Email : `marie@email.com`
- Rôle : `CLIENT`
- Mot de passe : généré et envoyé par email
- Lien pour activer le compte

**Email reçu par Marie** :

```
┌──────────────────────────────────────────────────┐
│  Votre réservation est confirmée ! 🎉            │
│                                                  │
│  Bonjour Marie,                                  │
│                                                  │
│  Votre soin du visage est réservé pour le        │
│  22 novembre 2025 à 14:00.                       │
│                                                  │
│  Un compte client a été créé pour vous :         │
│  📧 Email : marie@email.com                      │
│  🔑 Mot de passe : TempPass123                   │
│                                                  │
│  [Activer mon compte]                            │
│  [Voir mes réservations]                         │
│                                                  │
│  À bientôt !                                     │
│  L'équipe Mon Institut Beauté                    │
└──────────────────────────────────────────────────┘
```

---

### 📍 ÉTAPE 9 : Espace client

**Page** : `/espace-client` (`/home/celia/laia-github-temp/laia-skin-nextjs/src/app/(site)/espace-client/page.tsx`)

Marie clique sur **"Activer mon compte"** ou se connecte manuellement via `/login`.

**Redirection automatique** : `/espace-client`

**Interface de l'espace client** :

```
┌──────────────────────────────────────────────────────────────┐
│  ESPACE CLIENT - Marie Dupont                   [Déconnexion]│
├──────────────────────────────────────────────────────────────┤
│  [Mes réservations] [Mon profil] [Mes factures] [Fidélité]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  MES PROCHAINES RÉSERVATIONS                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📅 22 Nov 2025 - 14:00                                 │ │
│  │ 💆 Soin du visage                                      │ │
│  │ 💰 85€ - Payé                                          │ │
│  │ 📍 Mon Institut Beauté, Paris                          │ │
│  │                                                        │ │
│  │ [Modifier]  [Annuler]  [Ajouter au calendrier]        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  HISTORIQUE                                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📅 15 Oct 2025 - Épilation - 45€ ⭐⭐⭐⭐⭐            │ │
│  │ 📅 10 Sep 2025 - Massage - 65€ ⭐⭐⭐⭐⭐             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  PROGRAMME DE FIDÉLITÉ 🎁                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Vos points : 250 pts                                   │ │
│  │ ████████░░░░░░░ 250/500 (Niveau Gold)                  │ │
│  │                                                        │ │
│  │ Récompenses disponibles :                              │ │
│  │ • 200 pts - Réduction 10€ sur prochain soin           │ │
│  │ • 500 pts - Soin gratuit au choix                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Prendre un nouveau rendez-vous]                            │
└──────────────────────────────────────────────────────────────┘
```

**Fonctionnalités de l'espace client** :

| Fonctionnalité | Description |
|----------------|-------------|
| **Mes réservations** | Liste des RDV passés et à venir |
| **Modifier un RDV** | Changer date/heure/soin |
| **Annuler un RDV** | Annulation avec conditions |
| **Mon profil** | Modifier infos perso, préférences |
| **Mes factures** | Télécharger factures PDF |
| **Fidélité** | Points, récompenses, historique |
| **Mes avis** | Laisser/modifier des avis |
| **Parrainages** | Inviter des amis, gagner des points |
| **Notifications** | Gérer les préférences de notification |

---

### 📍 ÉTAPE 10 : Boucle de fidélisation

#### **A. Rappels automatiques**

**24h avant le RDV** :
- 📧 Email de rappel (Brevo)
- 💬 SMS de rappel (Twilio)
- 📱 WhatsApp (si activé)

**Contenu** :
```
Bonjour Marie,

Rappel : Votre RDV demain le 22 nov à 14:00
Soin du visage - 85€

Si vous avez un empêchement, vous pouvez modifier
ou annuler votre RDV depuis votre espace client.

À demain !
Mon Institut Beauté
```

#### **B. Après le RDV : demande d'avis**

**Le lendemain du RDV** :
- Email demandant de laisser un avis
- Lien vers formulaire d'avis avec photos

**Contenu** :
```
┌──────────────────────────────────────────────────┐
│  Comment s'est passé votre soin ? 💆             │
│                                                  │
│  Bonjour Marie,                                  │
│                                                  │
│  Merci d'avoir choisi Mon Institut Beauté !      │
│  Votre avis nous aide à nous améliorer.          │
│                                                  │
│  Note : ⭐ ⭐ ⭐ ⭐ ⭐                             │
│                                                  │
│  Commentaire : [__________________]              │
│                                                  │
│  Photos (optionnel) : [📷 Ajouter]               │
│                                                  │
│  [Envoyer mon avis]                              │
│                                                  │
│  🎁 +50 points de fidélité offerts !             │
└──────────────────────────────────────────────────┘
```

**Bonus** : +50 points de fidélité pour avoir laissé un avis

#### **C. Programme de parrainage**

Marie peut inviter ses amies :
- Lien de parrainage unique : `https://mon-institut-beaute.fr/?ref=MARIE123`
- Récompense pour Marie : 20€ de réduction ou 100 points
- Récompense pour l'amie : 10€ de réduction

**Système de récompenses** :
- Dépense minimale : 50€
- Type de récompense : FIXE (20€) ou POURCENTAGE (10%)
- Limite d'utilisation : 1 fois par client
- Expiration : 90 jours

#### **D. Offres personnalisées**

**Email marketing automatisé** :

**J+7 après le soin** :
```
Bonjour Marie,

Nous espérons que votre peau est toujours aussi
éclatante ! ✨

Pour prolonger les effets de votre soin visage,
nous vous recommandons :

💎 Sérum hydratant - 35€ (au lieu de 45€)
🧴 Crème de nuit - 40€

[Acheter maintenant] → Livraison gratuite

À bientôt,
Mon Institut Beauté
```

**Anniversaire** :
```
🎂 Joyeux anniversaire Marie !

Pour fêter votre anniversaire, nous vous offrons :

🎁 20% de réduction sur tous nos soins
Code : ANNIV-MARIE

Valable jusqu'au 30 novembre

[Réserver mon soin d'anniversaire]
```

---

## 🏗️ Architecture technique

### Stack technologique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | Next.js 15.5.1, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Base de données** | PostgreSQL (Supabase) + Prisma ORM 6.16.1 |
| **Authentification** | JWT (jsonwebtoken), bcrypt |
| **Paiements** | Stripe Connect (multi-tenant) |
| **Emails** | Brevo (Sendinblue) ou Resend |
| **SMS** | Twilio |
| **WhatsApp** | WhatsApp Business API (Twilio) |
| **Stockage** | Cloudinary ou AWS S3 |
| **Monitoring** | Sentry |
| **Rate Limiting** | Upstash Redis |
| **Analytics** | Google Analytics, Facebook Pixel |
| **Déploiement** | Vercel |

### Architecture multi-tenant

**Isolation des données** : Chaque organisation est isolée via `organizationId`

```sql
-- Toutes les tables ont une colonne organizationId
SELECT * FROM "Service" WHERE "organizationId" = 'xxx';
SELECT * FROM "Booking" WHERE "organizationId" = 'xxx';
SELECT * FROM "Client" WHERE "organizationId" = 'xxx';
```

**Middleware de tenant** : `tenant-service.ts`

```typescript
// Chaque requête API vérifie l'organizationId
const { organizationId } = await verifyAuth(request);

// Toutes les requêtes DB sont filtrées
const services = await prisma.service.findMany({
  where: { organizationId }
});
```

**Routing multi-tenant** :

- Subdomain : `https://{slug}.laia-connect.fr`
- Custom domain : `https://www.mon-institut-beaute.fr`
- Path-based : `https://laia-connect.fr/{slug}`

### Flux de données typique

**Exemple** : Création d'une réservation

```
Client final                Admin institut               Base de données
    │                             │                            │
    │  1. Remplit formulaire      │                            │
    │  /reservation               │                            │
    │                             │                            │
    │  2. POST /api/bookings      │                            │
    ├─────────────────────────────┼────────────────────────────┤
    │                             │  3. Vérif JWT + orgId      │
    │                             │                            │
    │                             │  4. INSERT Booking         │
    │                             │  ──────────────────────────→│
    │                             │  5. Booking créé           │
    │                             │  ←──────────────────────────│
    │                             │                            │
    │  6. Email confirmation      │                            │
    │  ←────────────────          │                            │
    │                             │  7. Notification           │
    │                             │  ←─────────────            │
    │                             │                            │
    │  8. SMS rappel J-1          │                            │
    │  ←────────────────          │                            │
    │                             │                            │
```

---

## 🎨 Système de templates

### Fichiers clés

1. **`/src/lib/website-templates.ts`** : Configuration des 14 templates
2. **`/src/components/TemplateRenderer.tsx`** : Rendu dynamique des templates
3. **`/src/components/LiveTemplatePreview.tsx`** : Preview en temps réel
4. **`/src/components/templates/Template*.tsx`** : Composants individuels de chaque template

### Structure d'un template

**Interface** :

```typescript
export interface WebsiteTemplate {
  id: string                    // 'classic', 'modern', 'luxe', etc.
  name: string                  // 'Classique', 'Moderne', 'Luxe Noir'
  description: string           // Description marketing
  minTier: 'SOLO' | 'PREMIUM'  // Tier minimum requis
  thumbnail?: string            // URL de l'image preview
  previewUrl?: string          // URL de la page de preview
  features: string[]           // ['Animations', 'Glassmorphisme', etc.]
}
```

### Les 14 templates disponibles

#### Templates CLASSIQUES (7) - Accessibles à tous les plans

| ID | Nom | Description | Caractéristiques |
|----|-----|-------------|------------------|
| `classic` | Classique | L'intemporalité au service de votre image | Design sobre, élégant |
| `modern` | Moderne | L'élégance contemporaine redéfinie | Formes géométriques, transitions fluides |
| `minimal` | Minimaliste | La pureté des lignes | Beaucoup d'espace blanc, typographie épurée |
| `professional` | Professionnel | La rigueur au service de l'excellence | Layout structuré, couleurs sobres |
| `boutique` | Boutique | L'art de l'accueil avec distinction | Design chaleureux, invitant |
| `fresh` | Dynamique | L'énergie sublimée par le design | Couleurs vives, animations dynamiques |
| `zen` | Nature | L'harmonie naturelle au cœur de votre espace | Tons naturels, ambiance apaisante |

#### Templates PREMIUM (7) - Uniquement plan PREMIUM 💎

| ID | Nom | Description | Caractéristiques |
|----|-----|-------------|------------------|
| `laia` | LAIA Signature | L'élégance rose gold, signature LAIA | Rose gold, design premium LAIA |
| `luxe` | Luxe Noir | Le raffinement absolu dans l'obscurité dorée | Dark mode, accents or, glassmorphisme |
| `elegance` | Élégance Raffinée | La grâce et la sophistication avec particules | Particules animées, effets premium |
| `medical` | Médical Raffiné | L'excellence médicale avec prestance | Design clinique, minimalisme pro |
| `spa-luxe` | Harmonie Spa | L'art du bien-être dans un écrin de luxe | Parallax immersif, full-screen |
| `laser-tech` | Précision Laser | La précision technologique sublimée | Design technique, high-tech |

### Rendu d'un template

**Composant** : `<TemplateRenderer />`

**Props** :

```typescript
interface TemplateRendererProps {
  templateId: string      // 'modern', 'luxe', etc.
  organization: any       // Données de l'organisation
  services: any[]         // Liste des services
  config: any             // OrganizationConfig (70+ champs)
  testimonials?: any[]    // Témoignages clients
}
```

**Logique de rendu** :

```typescript
// TemplateRenderer.tsx
export function TemplateRenderer({ templateId, ... }) {

  // Préparation des données (70+ champs)
  const templateData = {
    organization: {
      name, slug, description,
      primaryColor, secondaryColor, accentColor,
      logoUrl, heroImage, heroVideo,
      email, phone, address, city,
      facebook, instagram, tiktok,
      businessHours, founderName, ...
    },
    services: [...],
    config: {...},
    testimonials: [...]
  }

  // Switch selon templateId
  switch (templateId?.toLowerCase()) {
    case 'modern':
      return <TemplateModern {...props} />
    case 'luxe':
      return <TemplateLuxe data={templateData} />
    case 'laia':
      return <TemplateLaia {...props} />
    // ... 11 autres templates
    default:
      return <TemplateModern {...props} />
  }
}
```

### Live Preview

**Composant** : `<LiveTemplatePreview />`

**Utilisation** :
- Dans l'onboarding (étape 2)
- Dans l'admin (onglet Template)

**Fonctionnalités** :
- Preview en temps réel
- Toggle Desktop/Mobile
- Données mock pour le rendu
- Sticky positioning

**Props** :

```typescript
interface LiveTemplatePreviewProps {
  templateId: string
  organizationName: string
  description?: string
  siteTagline?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  logoUrl?: string
  heroImage?: string
  heroVideo?: string
  heroTitle?: string
  heroSubtitle?: string
  phone?: string
  email?: string
  contactEmail?: string
  address?: string
}
```

**Rendu** :

```typescript
<LiveTemplatePreview
  templateId={config.websiteTemplate || 'modern'}
  organizationName={config.siteName}
  primaryColor={config.primaryColor || '#d4b5a0'}
  secondaryColor={config.secondaryColor || '#2c3e50'}
  // ... autres props
/>
```

**Affichage** :
- Cadre simulant un navigateur
- Toggle Desktop (💻) / Mobile (📱)
- Rendu iframe ou direct selon le template
- Mise à jour instantanée lors des changements

---

## ✨ Fonctionnalités implémentées récemment

### 1. Système de templates amélioré (Novembre 2024)

**Problème** : Les clients ne pouvaient pas changer de template après l'onboarding

**Solution** :
- Ajout de l'onglet "Template" dans AdminConfigTab
- Split-screen avec preview live
- Filtrage par plan (Solo/Duo/Team vs Premium)
- Indicateurs visuels (badges, cadenas, checkmarks)

**Fichiers modifiés** :
- `/src/components/AdminConfigTab.tsx` : Layout split-screen + filtrage
- `/src/components/LiveTemplatePreview.tsx` : Création du composant preview
- `/src/lib/website-templates.ts` : Correction de la catégorisation
- `/src/components/TemplateRenderer.tsx` : Ajout des templates manquants

**Détails techniques** :

```typescript
// AdminConfigTab.tsx - Ligne 137
const [organizationPlan, setOrganizationPlan] = useState<string>('SOLO');

// Récupération du plan lors du fetch
const fetchConfig = async () => {
  const response = await fetch('/api/admin/config');
  const data = await response.json();
  setConfig(data);

  // Récupérer le plan de l'organisation
  const orgResponse = await fetch('/api/organization/current');
  const orgData = await orgResponse.json();
  setOrganizationPlan(orgData.plan || 'SOLO');
};

// Filtrage des templates disponibles
const availableTemplates = getTemplatesForPlan(organizationPlan);

// Affichage conditionnel
{websiteTemplates.map((template) => {
  const isAvailable = availableTemplates.some(t => t.id === template.id);
  const isPremium = template.minTier === 'PREMIUM';

  return (
    <div
      className={!isAvailable ? 'opacity-60 cursor-not-allowed' : ''}
      onClick={() => isAvailable && selectTemplate(template.id)}
    >
      {isPremium && <Badge>💎 PREMIUM</Badge>}
      {!isAvailable && <Lock>🔒 Upgrade requis</Lock>}
      {/* ... */}
    </div>
  );
})}
```

**Bénéfices** :
- ✅ Clients peuvent changer de template à tout moment
- ✅ Restriction automatique selon le plan
- ✅ Preview en temps réel avant validation
- ✅ UX améliorée avec indicateurs visuels clairs

---

### 2. 70+ champs de personnalisation (vs 8 avant)

**Avant** :
- Seulement 8 champs configurables (nom, email, téléphone, etc.)
- Personnalisation limitée

**Maintenant** :
- **70+ champs disponibles** dans OrganizationConfig
- Personnalisation complète du site

**Catégories de champs** :

| Catégorie | Nombre de champs | Exemples |
|-----------|------------------|----------|
| **Identité** | 10 | name, slug, description, tagline, logo, favicon |
| **Couleurs** | 6 | primaryColor, secondaryColor, accentColor, textColor, bgColor, borderColor |
| **Images** | 8 | logoUrl, heroImage, heroVideo, founderImage, galleryImages |
| **Contact** | 12 | email, phone, address, city, postalCode, country, googleMapsUrl, lat, lng |
| **Réseaux sociaux** | 6 | facebook, instagram, tiktok, whatsapp, linkedin, youtube |
| **Horaires** | 1 (JSON) | businessHours avec 7 jours |
| **Fondateur** | 4 | founderName, founderTitle, founderQuote, founderImage |
| **Contenus** | 8 | aboutText, aboutIntro, aboutParcours, heroTitle, heroSubtitle |
| **Footer & Légal** | 5 | footerConfig, termsAndConditions, privacyPolicy, legalNotice |
| **Infos légales** | 10 | siret, siren, tvaNumber, apeCode, rcs, capital, legalForm, legalRepName |
| **Assurance** | 3 | insuranceCompany, insuranceContract, insuranceAddress |
| **Banque** | 3 | bankName, bankIban, bankBic |
| **SEO** | 4 | metaTitle, metaDescription, metaKeywords, ogImage |
| **Analytics** | 4 | googleAnalyticsId, facebookPixelId, googleVerificationCode, metaVerificationCode |
| **Google My Business** | 3 | googlePlaceId, googleBusinessUrl, googleApiKey |
| **Apparence** | 4 | fontFamily, headingFont, baseFontSize, headingSize |
| **Communication** | 4 | emailSignature, welcomeEmailText, crispWebsiteId, crispEnabled |
| **Template** | 2 | websiteTemplate, homeTemplate |

**Total** : **Environ 100 champs** dans le modèle OrganizationConfig

**Utilisation dans TemplateRenderer** :

```typescript
const templateData = {
  organization: {
    // Identité de base
    name: organization.name,
    slug: organization.slug,
    description: config.siteDescription,

    // Couleurs (critiques pour personnalisation)
    primaryColor: config.primaryColor || '#d4b5a0',
    secondaryColor: config.secondaryColor || '#c9a084',
    accentColor: config.accentColor || '#2c3e50',

    // Images (critiques)
    logoUrl: config.logoUrl,
    heroImage: config.heroImage,
    heroVideo: config.heroVideo,
    faviconUrl: config.faviconUrl,
    founderImage: config.founderImage,

    // Contact & Localisation (critiques)
    email: config.contactEmail,
    phone: config.phone,
    address: config.address,
    city: config.city,
    postalCode: config.postalCode,
    country: config.country || 'France',
    googleMapsUrl: config.googleMapsUrl,
    latitude: config.latitude,
    longitude: config.longitude,

    // Réseaux sociaux (importants)
    facebook: config.facebook,
    instagram: config.instagram,
    tiktok: config.tiktok,
    whatsapp: config.whatsapp,

    // ... 60+ autres champs
  },
  services: [...],
  config: {...}
};
```

---

### 3. Onboarding en 5 étapes (vs wizard simple avant)

**Avant** :
- Formulaire simple en une page
- Pas de guidance
- Configuration incomplète

**Maintenant** :
- **Wizard guidé en 5 étapes**
- Split-screen avec preview
- Validation à chaque étape
- Progress bar

**Avantages** :
- Meilleur taux de complétion
- Moins d'erreurs
- Site vitrine immédiatement opérationnel

---

### 4. Support vidéo hero

**Nouveau** : Champ `heroVideo` dans OrganizationConfig

**Utilisation** :
```typescript
{config.heroVideo ? (
  <video autoPlay loop muted playsInline>
    <source src={config.heroVideo} type="video/mp4" />
  </video>
) : (
  <img src={config.heroImage} alt="Hero" />
)}
```

**Formats supportés** :
- MP4
- WebM
- OGG

**Optimisations** :
- Lazy loading
- Fallback sur image si échec
- Compression automatique recommandée

---

### 5. Programme de parrainage

**Nouveau** : Système de parrainage client → client

**Modèle de données** :

```prisma
model Referral {
  id                  String   @id @default(cuid())
  organizationId      String
  referrerId          String   // Client qui parraine
  referredId          String?  // Client parrainé
  code                String   @unique // Code de parrainage (ex: MARIE123)
  status              String   // PENDING, COMPLETED, EXPIRED
  rewardAmount        Float    // Montant de la récompense
  rewardType          String   // FIXED, PERCENTAGE
  createdAt           DateTime @default(now())
  completedAt         DateTime?
  expiresAt           DateTime?

  referrer            User     @relation("Referrer", fields: [referrerId], references: [id])
  referred            User?    @relation("Referred", fields: [referredId], references: [id])
  organization        Organization @relation(fields: [organizationId], references: [id])
}
```

**Configuration** : Dans OrganizationConfig

```typescript
{
  referralEnabled: true,
  referralRewardType: 'FIXED', // ou 'PERCENTAGE'
  referralRewardAmount: 20.0,  // 20€ ou 20%
  referralMinimumPurchase: 50.0, // Achat minimum
  referralReferrerReward: 20.0,  // Récompense parrain
  referralReferredReward: 10.0,  // Récompense filleul
  referralTermsUrl: '/parrainage-cgv',
  referralEmailTemplate: 'default'
}
```

**Workflow** :

1. **Marie génère son lien de parrainage** :
   - Lien : `https://mon-institut-beaute.fr/?ref=MARIE123`
   - Code : `MARIE123` (généré automatiquement)

2. **Marie partage le lien** :
   - Email
   - SMS
   - Réseaux sociaux

3. **Sophie clique sur le lien** :
   - Cookie `referralCode` enregistré
   - Sophie s'inscrit et réserve un soin > 50€

4. **Récompenses attribuées** :
   - Marie : 20€ de crédit
   - Sophie : 10€ de crédit
   - Notification envoyée aux deux

**API endpoints** :

```typescript
// Générer un code de parrainage
POST /api/referral/generate
Response: { code: 'MARIE123', url: '...' }

// Valider un code
POST /api/referral/validate
Body: { code: 'MARIE123' }
Response: { valid: true, reward: 10 }

// Historique des parrainages
GET /api/referral/my-referrals
Response: [{ referred: 'Sophie', status: 'COMPLETED', reward: 20 }]
```

---

## 🚀 Guide de démarrage rapide

### 1. Installation

```bash
cd /home/celia/laia-github-temp/laia-skin-nextjs
npm install
```

### 2. Configuration de l'environnement

Créer `.env.local` :

```env
# Base de données
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# JWT & Encryption
JWT_SECRET="votre-secret-jwt-très-long-et-complexe"
ENCRYPTION_KEY="votre-clé-encryption-très-longue-et-complexe"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Brevo (Emails)
BREVO_API_KEY="xkeysib-..."
BREVO_SENDER_EMAIL="contact@laia-connect.fr"
BREVO_SENDER_NAME="LAIA Connect"

# Twilio (SMS & WhatsApp)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+33..."
TWILIO_WHATSAPP_NUMBER="whatsapp:+33..."

# Cloudinary (Stockage)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Sentry (Monitoring)
SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."

# Upstash (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**Générer des secrets forts** :

```bash
# JWT_SECRET
openssl rand -base64 64

# ENCRYPTION_KEY
openssl rand -base64 64
```

### 3. Base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Seed la base de données
npm run seed
```

### 4. Démarrer en développement

```bash
npm run dev
```

Le site sera accessible à : **http://localhost:3001**

### 5. Créer un super admin LAIA (optionnel)

```bash
npx tsx scripts/create-super-admin.ts
```

### 6. Créer une organisation de test

Option A : Via l'interface `/register`

Option B : Via script :

```bash
npx tsx scripts/create-test-org.ts
```

### 7. Se connecter

**Super Admin** : http://localhost:3001/super-admin
**Admin Institut** : http://localhost:3001/admin
**Espace Client** : http://localhost:3001/espace-client

**Identifiants** : Voir la base de données ou utiliser "Mot de passe oublié"

---

## 📊 Statistiques du projet

| Métrique | Valeur |
|----------|--------|
| **Fichiers totaux** | 1385+ |
| **Lignes de code** | 290 831+ |
| **Taille** | 27,5 MB |
| **Dépendances** | 100+ packages |
| **API Routes** | 150+ endpoints |
| **Composants React** | 300+ |
| **Templates** | 14 |
| **Onglets admin** | 23 |
| **Champs de config** | 70-100 |

---

## 🎯 Prochaines étapes recommandées

### À court terme

1. **Tests automatisés**
   - Tests unitaires (Jest)
   - Tests E2E (Playwright)
   - Tests d'intégration API

2. **Documentation utilisateur**
   - Guide d'utilisation client
   - Guide d'utilisation admin
   - FAQ

3. **Optimisations performance**
   - Lazy loading des images
   - Code splitting
   - Mise en cache agressive

4. **Accessibilité**
   - ARIA labels
   - Navigation clavier
   - Contraste couleurs

### À moyen terme

1. **Fonctionnalités avancées**
   - Chat en direct (Crisp)
   - Visioconférence (pour consultations)
   - Application mobile (React Native)

2. **Internationalisation**
   - Support multilingue (i18n)
   - Devises multiples
   - Fuseaux horaires

3. **Marketplace**
   - Extensions/plugins
   - Thèmes additionnels
   - Intégrations tierces

4. **Analytics avancés**
   - Dashboard analytique détaillé
   - Rapports personnalisés
   - Prévisions IA

### À long terme

1. **IA & Automatisation**
   - Recommandations de soins par IA
   - Chatbot intelligent
   - Optimisation automatique des prix

2. **Expansion internationale**
   - Support de nouveaux pays
   - Conformité RGPD/CCPA/etc.
   - Partenariats locaux

3. **Écosystème LAIA**
   - LAIA Academy (formation)
   - LAIA Marketplace (vente de produits)
   - LAIA Community (réseau social)

---

## 📝 Conclusion

**LAIA Connect** est une plateforme SaaS complète et production-ready pour instituts de beauté.

**Points forts** :
- ✅ Architecture multi-tenant robuste
- ✅ 23 onglets admin complets
- ✅ 14 templates personnalisables
- ✅ Onboarding guidé en 5 étapes
- ✅ Intégrations complètes (Stripe, Brevo, Twilio, WhatsApp)
- ✅ Espace client avec fidélité et parrainage
- ✅ SEO optimisé
- ✅ Sécurité (JWT, encryption, rate limiting)
- ✅ Monitoring (Sentry)

**Le parcours client est fluide** :
1. Inscription sur LAIA Connect (3 étapes)
2. Première connexion
3. Onboarding complet (5 étapes)
4. Accès admin (23 onglets)
5. Personnalisation post-onboarding
6. Site vitrine en ligne
7. Clients finaux découvrent et réservent
8. Espace client avec fidélité
9. Boucle de fidélisation (emails, SMS, parrainages)

**LAIA Connect transforme un institut de beauté traditionnel en une entreprise digitale moderne avec un site professionnel, une gestion complète et une expérience client exceptionnelle.** 🚀

---

**Document créé le** : 24 novembre 2025
**Auteur** : Claude (Anthropic)
**Version** : 1.0
