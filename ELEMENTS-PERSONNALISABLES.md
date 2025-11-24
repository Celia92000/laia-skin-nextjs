# Éléments Personnalisables - Audit Complet

## ✅ **DANS LE WIZARD** (Configuration initiale guidée)

### Étape 1 : Template
- ✅ Template de site (modern, classic, elegant...)

### Étape 2 : Couleurs
- ✅ Couleur primaire
- ✅ Couleur secondaire
- ✅ Couleur d'accent

### Étape 3 : Textes & Photos
- ✅ Nom de l'institut
- ✅ Slogan
- ✅ Description
- ✅ Titre Hero
- ✅ Sous-titre Hero
- ✅ Texte "À propos"
- ✅ Logo (URL)
- ✅ Image Hero (URL)
- ✅ Fondateur : nom, titre, citation, photo

### Étape 4 : Contact & Localisation
- ✅ Email de contact
- ✅ Téléphone
- ✅ Adresse complète
- ✅ Code postal, Ville, Pays
- ✅ Lien Google Maps
- ✅ Réseaux sociaux (Facebook, Instagram, TikTok, WhatsApp)
- ✅ Horaires d'ouverture (7 jours)

---

## ⚠️ **DISPONIBLES DANS LA BASE MAIS PAS DANS LE WIZARD**

### Apparence Avancée (OrganizationConfig)
- ❌ **Favicon** (faviconUrl)
- ❌ **Polices personnalisées** (fontFamily, headingFont, baseFontSize, headingSize)
- ❌ **Couleurs étendues** (extendedColors - JSON pour buttonHover, background, textMuted, etc.)
- ❌ **Template de homepage** (homeTemplate: classic, modern, elegant, minimal, bold)
- ❌ **Sections homepage personnalisables** (homeSections - JSON pour activer/désactiver/réordonner)
- ❌ **Configuration footer** (footerConfig - JSON pour colonnes, liens, newsletter)

### Contenu Enrichi
- ❌ **Témoignages clients** (testimonials - JSON)
- ❌ **Formations/Certifications** (formations - JSON)
- ❌ **Parcours du fondateur** (aboutIntro, aboutParcours)
- ❌ **LinkedIn & YouTube** (réseaux sociaux supplémentaires)

### Légal & Conformité
- ❌ **CGV** (termsAndConditions)
- ❌ **Politique de confidentialité** (privacyPolicy)
- ❌ **Mentions légales** (legalNotice)
- ❌ **Informations SIRET/SIREN** (siret, siren, tvaNumber, apeCode, rcs, capital, legalForm)
- ❌ **Assurance** (insuranceCompany, insuranceContract, insuranceAddress)
- ❌ **Banque** (bankName, bankIban, bankBic)
- ❌ **Représentant légal** (legalRepName, legalRepTitle)

### SEO & Analytics
- ❌ **Meta Title par défaut** (defaultMetaTitle)
- ❌ **Meta Description par défaut** (defaultMetaDescription)
- ❌ **Meta Keywords** (defaultMetaKeywords)
- ❌ **Google Analytics** (googleAnalyticsId)
- ❌ **Facebook Pixel** (facebookPixelId)
- ❌ **Codes de vérification** (metaVerificationCode, googleVerificationCode)

### Communication
- ❌ **Signature email** (emailSignature)
- ❌ **Email de bienvenue** (welcomeEmailText)
- ❌ **Chat Crisp** (crispWebsiteId, crispEnabled)

### Géolocalisation
- ❌ **Coordonnées GPS** (latitude, longitude)

### Google My Business
- ❌ **Place ID** (googlePlaceId)
- ❌ **URL Google Business** (googleBusinessUrl)
- ❌ **Clé API Google** (googleApiKey)
- ❌ **Sync automatique avis** (autoSyncGoogleReviews)

---

## 🔴 **ÉLÉMENTS CRITIQUES MANQUANTS**

Ces éléments devraient être ajoutés au wizard ou rendus facilement accessibles :

### Priorité HAUTE (indispensables pour un site complet)
1. **Favicon** - Logo dans l'onglet du navigateur
2. **Mentions légales** - Obligatoire légalement
3. **CGV** - Obligatoire pour vendre des services
4. **Politique de confidentialité** - RGPD
5. **SIRET** - Obligatoire pour une entreprise française
6. **SEO basique** - Meta title/description pour être visible sur Google

### Priorité MOYENNE (améliore l'expérience)
1. **Témoignages** - Preuve sociale
2. **Formations/Certifications** - Crédibilité
3. **LinkedIn & YouTube** - Présence complète
4. **Parcours fondateur** - Storytelling
5. **Google Analytics** - Tracking essentiel

### Priorité BASSE (fonctionnalités avancées)
1. **Polices personnalisées**
2. **Couleurs étendues**
3. **Configuration sections homepage**
4. **Footer personnalisé**
5. **Chat Crisp**

---

## 📋 **PLAN D'ACTION**

### Option 1 : Ajouter une Étape 6 au wizard (Éléments Essentiels)
- Favicon
- SIRET
- Meta title/description
- Mentions légales (avec template pré-rempli)

### Option 2 : Créer un onglet "Paramètres Complets" dans l'admin
- Regrouper TOUS les éléments par catégorie
- Afficher un indicateur de complétion (50% configuré)
- Guider l'utilisateur vers les éléments manquants

### Option 3 : Checklist post-onboarding
- Après le wizard, afficher une checklist :
  - ✅ Configuration de base
  - ⚠️ Éléments légaux (0/3)
  - ⚠️ SEO (0/2)
  - ⚠️ Témoignages (0)

---

## 🎯 **RECOMMANDATION**

**Faire une combinaison des 3 approches** :

1. **Wizard simplifié** (comme actuellement) - 5 étapes essentielles
2. **Checklist post-wizard** - "Votre site est à 60% ! Complétez ces éléments importants :"
3. **Section "Apparence" dans l'admin** avec TOUS les paramètres organisés par onglets :
   - Design (couleurs, polices, favicon)
   - Contenu (textes, images, témoignages)
   - SEO (meta, analytics)
   - Légal (CGV, mentions, SIRET)
   - Réseaux sociaux
   - Google My Business

Cette approche permet :
- ✅ Onboarding rapide (5 min)
- ✅ Personnalisation complète disponible
- ✅ Guidage progressif
- ✅ Aucun élément oublié
