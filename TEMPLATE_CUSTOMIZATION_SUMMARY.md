# Template Customization - Summary Report

## Overview
This document summarizes the changes needed to make ALL 15 templates 100% customizable with NO hardcoded data.

**Date:** 2025-11-21
**Templates Analyzed:** 15 total

---

## Reference Template
**TemplateModern.tsx** at `/src/components/templates/TemplateModern.tsx` is the PERFECT EXAMPLE with:
- Complete organization interface with all fields
- Logo support in header
- TemplateFooter component integration
- NO hardcoded contact data
- Optional founder section
- Dynamic colors throughout

---

## Common Issues Found

### 1. Incomplete Organization Interface
Most templates are missing these critical fields:
- `logoUrl`, `heroImage`, `faviconUrl`
- `email`, `contactEmail`, `phone`, `address`, `city`, `postalCode`, `country`
- `googleMapsUrl`
- `facebook`, `instagram`, `tiktok`, `whatsapp`, `linkedin`, `youtube`
- `businessHours`
- `founderName`, `founderTitle`, `founderQuote`, `founderImage`
- `siret`, `termsAndConditions`, `privacyPolicy`, `legalNotice`
- `metaTitle`, `metaDescription`

### 2. Hardcoded Contact Information
Templates contain hardcoded data like:
- Phone: `+33 6 31 10 75 31` (TemplateMinimal.tsx line 250)
- Address: "À 6 minutes de la gare de Nanterre Université" (TemplateMinimal.tsx line 238-240)
- Email: `contact@{organization.name}` (calculated, should come from org data)

### 3. Missing Logo Support
Most templates show organization.name as text instead of logo:
```typescript
// ❌ Current (most templates)
<h1>{organization.name}</h1>

// ✅ Should be
{organization.logoUrl ? (
  <img src={organization.logoUrl} alt={organization.name} className="h-12 w-auto" />
) : (
  <h1>{organization.name}</h1>
)}
```

### 4. Custom Footers Instead of Shared Component
Templates have custom footer code that should use:
```typescript
import TemplateFooter from './shared/TemplateFooter';
// ...
<TemplateFooter organization={organization} theme="dark" />
```

### 5. No Founder Section
Templates missing optional founder showcase:
```typescript
{organization.founderName && (
  <section className="py-20">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {organization.founderImage && (
          <img src={organization.founderImage} alt={organization.founderName} className="rounded-3xl" />
        )}
        <div>
          <h2 className="text-4xl font-bold mb-4">{organization.founderName}</h2>
          <p className="text-lg mb-4">{organization.founderTitle}</p>
          {organization.founderQuote && <blockquote className="italic text-xl">"{organization.founderQuote}"</blockquote>}
        </div>
      </div>
    </div>
  </section>
)}
```

---

## Template-by-Template Status

### ✅ Already Perfect
1. **TemplateModern.tsx** - Complete, use as reference

### ⚠️ Needs Updates (14 templates)

#### 2. ClassicTemplate.tsx
- **Issues:** Uses old TemplateData structure, hardcoded "LAIA SKIN" references
- **Required Changes:**
  - Update to new interface structure
  - Add logo support in header
  - Replace footer with TemplateFooter component
  - Add founder section
  - Remove hardcoded data

#### 3. ModernTemplate.tsx
- **Issues:** Same as ClassicTemplate (duplicate of old structure)
- **Required Changes:** Same as ClassicTemplate

#### 4. MinimalTemplate.tsx (old style)
- **Issues:** Same as ClassicTemplate (duplicate of old structure)
- **Required Changes:** Same as ClassicTemplate

#### 5. TemplateClassic.tsx (new style)
- **Status:** Partially updated
- **Issues:**
  - Missing: logoUrl, email, phone, address, social media, founder fields
  - Has hardcoded footer instead of TemplateFooter
- **Required Changes:**
  - Expand organization interface (add missing 20+ fields)
  - Add logo support: `{organization.logoUrl ? <img... /> : <h1.../>}`
  - Replace custom footer with `<TemplateFooter organization={organization} theme="light" />`
  - Add founder section (optional)
  - Make contact info dynamic

#### 6. TemplateMinimal.tsx (new style)
- **Status:** Partially updated
- **Issues:**
  - HARDCODED address: "À 6 minutes de la gare de Nanterre Université, 92000 Nanterre"
  - HARDCODED phone: "+33 6 31 10 75 31"
  - HARDCODED email pattern
  - HARDCODED social links (Facebook, Instagram, TikTok)
  - HARDCODED business hours
  - Custom footer instead of TemplateFooter
- **Required Changes:**
  - Expand organization interface
  - Replace ALL hardcoded contact with `{organization.phone && <a href={...}>}`
  - Replace ALL hardcoded social with `{organization.facebook && <a href={...}>}`
  - Replace ALL hardcoded address with organization fields
  - Add logo support
  - Replace footer with TemplateFooter component
  - Add founder section

#### 7. TemplateElegance.tsx
- **Status:** Partially updated
- **Issues:**
  - Missing contact fields, social media, founder, legal fields
  - Custom footer
  - No logo support (has Sparkles icon instead)
- **Required Changes:**
  - Expand organization interface (add missing 20+ fields)
  - Add logo option in header (alongside or replacing Sparkles icon)
  - Replace footer with TemplateFooter
  - Add founder section
  - Add contact info section with organization data

#### 8. TemplateZen.tsx
- **Status:** Partially updated
- **Issues:**
  - Missing most org fields
  - No contact section
  - Custom footer
  - HARDCODED business hours in commented code
- **Required Changes:**
  - Expand organization interface
  - Add logo support
  - Add contact section with dynamic organization data
  - Replace footer with TemplateFooter
  - Add founder section

#### 9. TemplateFresh.tsx
- **Status:** Partially updated
- **Issues:**
  - Missing org fields
  - Custom footer
  - No contact section
- **Required Changes:**
  - Expand organization interface
  - Add logo support in header
  - Add contact section
  - Replace footer with TemplateFooter (theme="dark")
  - Add founder section

#### 10. TemplateBoutique.tsx
- **Status:** Partially updated
- **Issues:**
  - Missing org fields
  - Custom footer
  - No dynamic contact info
- **Required Changes:**
  - Expand organization interface
  - Add logo support
  - Add contact section with organization data
  - Replace footer with TemplateFooter
  - Add founder section

#### 11. TemplateProfessional.tsx
- **Status:** Partially updated
- **Issues:**
  - Missing org fields
  - Custom footer
  - No contact section beyond generic text
- **Required Changes:**
  - Expand organization interface
  - Add logo support (currently just text)
  - Add detailed contact section
  - Replace footer with TemplateFooter
  - Add founder section

#### 12. TemplateLuxe.tsx
- **Status:** Partially updated
- **Issues:**
  - Missing most org fields
  - Custom footer
  - No logo support (uses Crown icon)
  - No contact section
- **Required Changes:**
  - Expand organization interface (ALL missing fields)
  - Add logo support (alongside or replacing Crown)
  - Add luxury-styled contact section
  - Replace footer with TemplateFooter (theme="dark")
  - Add founder section

#### 13-15. Medical-themed Templates
**TemplateMedical.tsx, TemplateSpaLuxe.tsx, TemplateLaserTech.tsx**
- **Status:** Not yet reviewed in detail
- **Assumed Issues:** Same as above templates
- **Required Changes:** Same pattern as above

---

## Standard Update Pattern

For EACH template, follow this pattern:

### Step 1: Update Interface
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

    // Business
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
  content?: BaseTemplateContent;
}
```

### Step 2: Add Logo to Header
```typescript
{organization.logoUrl ? (
  <img
    src={organization.logoUrl}
    alt={organization.name}
    className="h-12 w-auto object-contain"
  />
) : (
  <h1 className="text-2xl font-bold">{organization.name}</h1>
)}
```

### Step 3: Add Founder Section (before footer)
```typescript
{organization.founderName && (
  <section className="py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {organization.founderImage && (
          <div className="relative">
            <img
              src={organization.founderImage}
              alt={organization.founderName}
              className="rounded-3xl w-full h-auto object-cover"
            />
          </div>
        )}
        <div className={organization.founderImage ? '' : 'md:col-span-2 text-center'}>
          <h2 className="text-4xl font-bold mb-4">{organization.founderName}</h2>
          {organization.founderTitle && (
            <p className="text-lg mb-4">{organization.founderTitle}</p>
          )}
          {organization.founderQuote && (
            <blockquote className="italic text-xl">
              "{organization.founderQuote}"
            </blockquote>
          )}
        </div>
      </div>
    </div>
  </section>
)}
```

### Step 4: Replace Footer
```typescript
import TemplateFooter from './shared/TemplateFooter';

// At end of template (replace existing footer):
<TemplateFooter organization={organization} theme="light" />
// OR for dark templates:
<TemplateFooter organization={organization} theme="dark" />
```

### Step 5: Remove ALL Hardcoded Data
Search and replace patterns:
- `+33 6 31 10 75 31` → `{organization.phone}`
- `contact@laiaskin.fr` → `{organization.email || organization.contactEmail}`
- `92000 Nanterre` → `{organization.postalCode} {organization.city}`
- Any hardcoded social URLs → `{organization.facebook &&...}`
- Any hardcoded business hours → `{organization.businessHours &&...}`

### Step 6: Make Contact Info Dynamic
```typescript
{/* Contact Section */}
{(organization.phone || organization.email || organization.address) && (
  <section id="contact" className="py-20 px-6">
    <div className="max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold mb-12 text-center">Contact</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Phone */}
        {organization.phone && (
          <div>
            <h3 className="font-bold mb-2">Téléphone</h3>
            <a href={`tel:${organization.phone}`} className="hover:underline">
              {organization.phone}
            </a>
          </div>
        )}

        {/* Email */}
        {(organization.email || organization.contactEmail) && (
          <div>
            <h3 className="font-bold mb-2">Email</h3>
            <a
              href={`mailto:${organization.email || organization.contactEmail}`}
              className="hover:underline"
            >
              {organization.email || organization.contactEmail}
            </a>
          </div>
        )}

        {/* Address */}
        {organization.address && (
          <div>
            <h3 className="font-bold mb-2">Adresse</h3>
            <div>
              {organization.address}<br />
              {organization.postalCode} {organization.city}
              {organization.googleMapsUrl && (
                <a
                  href={organization.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-sm hover:underline"
                >
                  Voir sur Google Maps →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </section>
)}
```

---

## Verification Checklist

For each template, verify:

- [ ] Organization interface has ALL 25+ fields from TemplateModern
- [ ] Header shows logo if available, fallback to name
- [ ] NO hardcoded phone numbers anywhere
- [ ] NO hardcoded email addresses anywhere
- [ ] NO hardcoded physical addresses anywhere
- [ ] NO hardcoded social media links anywhere
- [ ] NO hardcoded business hours anywhere
- [ ] Footer uses TemplateFooter component
- [ ] Founder section present (conditional render)
- [ ] Contact info section uses organization data
- [ ] All colors use organization.primaryColor/secondaryColor/accentColor
- [ ] No references to "LAIA SKIN", "Nanterre", specific phone numbers, etc.

---

## Priority Order

### High Priority (User-facing templates)
1. TemplateClassic.tsx
2. TemplateMinimal.tsx
3. TemplateElegance.tsx
4. TemplateZen.tsx
5. TemplateFresh.tsx

### Medium Priority (Specialty templates)
6. TemplateBoutique.tsx
7. TemplateProfessional.tsx
8. TemplateLuxe.tsx
9. TemplateSpaLuxe.tsx

### Lower Priority (Niche templates)
10. TemplateMedical.tsx
11. TemplateLaserTech.tsx

### Duplicates (Can be deprecated or aligned)
12. ClassicTemplate.tsx (old style)
13. ModernTemplate.tsx (old style)
14. MinimalTemplate.tsx (old style)

---

## Files Reference

- **Perfect Example:** `/src/components/templates/TemplateModern.tsx`
- **Shared Footer:** `/src/components/templates/shared/TemplateFooter.tsx`
- **Type Definitions:** `/src/types/template-content.ts`

---

## Next Steps

1. Start with TemplateClassic.tsx (most commonly used)
2. Update TemplateMinimal.tsx (has most hardcoded data)
3. Update remaining templates in priority order
4. Test each template with real organization data
5. Verify no hardcoded data remains
6. Update any template preview/selection UI

---

## Notes

- The old-style templates (ClassicTemplate, ModernTemplate, MinimalTemplate) use a different data structure with `TemplateData` from `@/lib/template-data-loader`. These may need to be deprecated or fully refactored.
- TemplateModern.tsx (new style) is the gold standard - all templates should match its interface and flexibility.
- The TemplateFooter component handles all footer needs - no template should have custom footer code.

---

**End of Report**
