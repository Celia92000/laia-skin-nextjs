# Plan de Mise à Jour de Tous les Templates

## 🎯 Objectif

Rendre **TOUS les templates 100% personnalisables** en éliminant **TOUTES les données en dur**.

---

## ✅ Template DÉJÀ MIS À JOUR

### TemplateModern.tsx
- ✅ Interface TypeScript complète (70+ champs)
- ✅ Logo dynamique dans le header
- ✅ Section fondateur si données présentes
- ✅ Coordonnées réelles dans la section contact
- ✅ Footer complet avec toutes les données
- ✅ Horaires d'ouverture affichés
- ✅ Réseaux sociaux cliquables
- ✅ Mentions légales en footer
- ✅ SIRET affiché
- ✅ Toutes les couleurs appliquées partout

---

## 📋 Templates À METTRE À JOUR (15 templates)

### Liste des templates

1. **ClassicTemplate.tsx**
2. **ModernTemplate.tsx**
3. **MinimalTemplate.tsx**
4. **TemplateClassic.tsx**
5. **TemplateMinimal.tsx**
6. **TemplateElegance.tsx**
7. **TemplateZen.tsx**
8. **TemplateFresh.tsx**
9. **TemplateBoutique.tsx**
10. **TemplateProfessional.tsx**
11. **TemplateLuxe.tsx**
12. **TemplateMedical.tsx**
13. **TemplateSpaLuxe.tsx**
14. **TemplateLaserTech.tsx**

---

## 🔧 Modifications À Appliquer

### 1. Interface TypeScript Complète

Chaque template doit avoir cette interface :

```typescript
interface TemplateProps {
  organization: {
    name: string;
    description?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;

    // Images
    logoUrl?: string;
    heroImage?: string;
    faviconUrl?: string;

    // Contact
    email?: string;
    contactEmail?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    googleMapsUrl?: string;

    // Social Media
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
    linkedin?: string;
    youtube?: string;

    // Business Hours
    businessHours?: any;

    // Founder
    founderName?: string;
    founderTitle?: string;
    founderQuote?: string;
    founderImage?: string;

    // Legal
    siret?: string;
    termsAndConditions?: string;
    privacyPolicy?: string;
    legalNotice?: string;

    // SEO
    metaTitle?: string;
    metaDescription?: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  }>;
  team?: Array<{
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
  }>;
  content?: any;
}
```

### 2. Header avec Logo

```typescript
// Ajouter logo dans le header
{organization.logoUrl ? (
  <img
    src={organization.logoUrl}
    alt={organization.name}
    className="h-12 w-auto object-contain"
  />
) : (
  <h1>{organization.name}</h1>
)}
```

### 3. Section Fondateur (Optionnelle)

```typescript
{organization.founderName && (
  <section className="py-20">
    <h2>{organization.founderName}</h2>
    <p>{organization.founderTitle}</p>
    {organization.founderQuote && <blockquote>{organization.founderQuote}</blockquote>}
    {organization.founderImage && <img src={organization.founderImage} alt={organization.founderName} />}
  </section>
)}
```

### 4. Contact Dynamique

```typescript
// Remplacer TOUTES les coordonnées en dur par :
{organization.phone && <a href={`tel:${organization.phone}`}>{organization.phone}</a>}
{organization.email && <a href={`mailto:${organization.email}`}>{organization.email}</a>}
{organization.address && <div>{organization.address}, {organization.postalCode} {organization.city}</div>}
{organization.googleMapsUrl && <a href={organization.googleMapsUrl}>Voir sur Google Maps</a>}
```

### 5. Footer Complet

Remplacer le footer en dur par :

```typescript
import TemplateFooter from './shared/TemplateFooter';

// En fin de template
<TemplateFooter organization={organization} theme="dark" />
// OU
<TemplateFooter organization={organization} theme="light" />
```

### 6. Couleurs Partout

S'assurer que les couleurs `primaryColor`, `secondaryColor` et `accentColor` sont utilisées dans :
- Header
- Boutons
- Titres de sections
- Bordures
- Backgrounds
- Hover effects
- Footer

---

## 🚨 DONNÉES À ÉLIMINER (Ne JAMAIS mettre en dur)

### ❌ Coordonnées en dur
```typescript
// ❌ MAUVAIS
<p>+33 6 31 10 75 31</p>
<p>contact@example.com</p>
<p>123 Rue de Paris, 75001 Paris</p>

// ✅ BON
{organization.phone && <p>{organization.phone}</p>}
{organization.email && <p>{organization.email}</p>}
{organization.address && <p>{organization.address}, {organization.postalCode} {organization.city}</p>}
```

### ❌ Réseaux sociaux en dur
```typescript
// ❌ MAUVAIS
<a href="#">Facebook</a>

// ✅ BON
{organization.facebook && <a href={organization.facebook}>Facebook</a>}
```

### ❌ Horaires en dur
```typescript
// ❌ MAUVAIS
<p>Lun-Sam: 9h-18h</p>

// ✅ BON
{organization.businessHours && Object.entries(organization.businessHours).map(...)}
```

### ❌ Couleurs en dur
```typescript
// ❌ MAUVAIS
background: '#d4b5a0'

// ✅ BON
background: organization.primaryColor
```

---

## 📈 Résultat Attendu

### Avant
- ❌ 11% de personnalisation (8 champs / 70)
- ❌ Données en dur partout
- ❌ Pas de logo
- ❌ Pas de coordonnées
- ❌ Footer générique

### Après
- ✅ 95%+ de personnalisation (70+ champs / 70)
- ✅ Aucune donnée en dur
- ✅ Logo affiché
- ✅ Coordonnées complètes
- ✅ Réseaux sociaux fonctionnels
- ✅ Horaires affichés
- ✅ Section fondateur
- ✅ Footer complet avec mentions légales
- ✅ Couleurs appliquées partout

---

## 🎯 Prochaine Étape

Utiliser un agent pour mettre à jour automatiquement tous les 15 templates restants avec ces modifications.
