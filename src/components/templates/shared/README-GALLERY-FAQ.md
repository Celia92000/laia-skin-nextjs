# GallerySection & FAQSection - Usage Guide

## GallerySection Component

### Features Implemented
- ✅ Before/After photo slider with draggable divider
- ✅ Lightbox modal on click with full-screen view
- ✅ Left/Right navigation arrows (desktop & mobile)
- ✅ Responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
- ✅ Treatment category labels
- ✅ Lazy loading images
- ✅ Touch gestures support (swipe to navigate)
- ✅ Keyboard navigation (ESC, Arrow keys)
- ✅ Smooth animations and transitions
- ✅ Accessible (ARIA attributes)

### Basic Usage

```tsx
import GallerySection from '@/components/templates/shared/GallerySection';

<GallerySection
  title="Nos Résultats"
  description="Découvrez les transformations de nos clients"
  images={[
    {
      id: '1',
      beforeUrl: '/images/before-1.jpg',
      afterUrl: '/images/after-1.jpg',
      description: 'Traitement anti-âge',
      treatment: 'Lifting'
    },
    {
      id: '2',
      beforeUrl: '/images/before-2.jpg',
      afterUrl: '/images/after-2.jpg',
      description: 'Hydratation profonde',
      treatment: 'Hydrafacial'
    }
  ]}
  primaryColor="#D4A574"
  secondaryColor="#B88A5C"
/>
```

### Props Interface

```typescript
interface GallerySectionProps {
  title?: string;                    // Default: 'Nos Résultats'
  description?: string;               // Default: 'Découvrez les transformations de nos clients'
  images: Array<{
    id: string;
    beforeUrl: string;
    afterUrl: string;
    description?: string;
    treatment?: string;
  }>;
  primaryColor: string;               // Required - Main brand color
  secondaryColor?: string;            // Optional - Used in gradients
}
```

### Design Features
- Modern before/after slider with draggable divider
- Click thumbnail to open full-screen lightbox
- Drag the slider handle to reveal before/after
- Swipe left/right on mobile to navigate between images
- Elegant hover effects on thumbnails
- Treatment badges with brand colors
- Image counter (1/10) in lightbox

---

## FAQSection Component

### Features Implemented
- ✅ Smooth accordion with height transitions
- ✅ Single or multiple items open (configurable)
- ✅ Search/filter (automatically shown when >8 FAQs)
- ✅ Category tabs (optional, auto-detected)
- ✅ Plus/Minus icon animation (rotates on open)
- ✅ Keyboard accessible
- ✅ Mobile-friendly touch targets
- ✅ Clean, minimalist design
- ✅ Hover states and smooth transitions

### Basic Usage

```tsx
import FAQSection from '@/components/templates/shared/FAQSection';

<FAQSection
  title="Questions Fréquentes"
  description="Tout ce que vous devez savoir sur nos services"
  faqs={[
    {
      id: '1',
      question: 'Combien de temps dure une séance ?',
      answer: 'Une séance dure généralement entre 45 minutes et 1h30 selon le traitement choisi.',
      category: 'Général'
    },
    {
      id: '2',
      question: 'Dois-je prendre rendez-vous ?',
      answer: 'Oui, nous travaillons uniquement sur rendez-vous pour garantir votre confort.',
      category: 'Réservation'
    }
  ]}
  primaryColor="#D4A574"
  allowMultipleOpen={false}
/>
```

### Props Interface

```typescript
interface FAQSectionProps {
  title?: string;                    // Default: 'Questions Fréquentes'
  description?: string;               // Default: 'Tout ce que vous devez savoir...'
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    category?: string;                // Optional - Enables category filtering
  }>;
  primaryColor: string;               // Required - Main brand color
  allowMultipleOpen?: boolean;        // Default: false (only one open at a time)
}
```

### Design Features
- Clean accordion with border highlighting on open
- Smooth height transitions (300ms)
- Plus icon rotates to Minus when opening
- Circular button background changes color
- Category badges with brand colors
- Search bar appears automatically if >8 FAQs
- Category tabs appear if any FAQ has a category
- Empty state with reset button when no results

---

## Integration Example in Templates

```tsx
'use client';

import GallerySection from '@/components/templates/shared/GallerySection';
import FAQSection from '@/components/templates/shared/FAQSection';

export default function TemplateExample({ organization }: TemplateProps) {
  const galleryImages = [
    {
      id: '1',
      beforeUrl: 'https://example.com/before-1.jpg',
      afterUrl: 'https://example.com/after-1.jpg',
      description: 'Résultat après 3 mois',
      treatment: 'Lifting visage'
    }
  ];

  const faqList = [
    {
      id: '1',
      question: 'Vos questions ici',
      answer: 'Nos réponses ici',
      category: 'Services'
    }
  ];

  return (
    <div>
      {/* Your hero, services, etc. */}

      <GallerySection
        images={galleryImages}
        primaryColor={organization.primaryColor}
        secondaryColor={organization.secondaryColor}
      />

      <FAQSection
        faqs={faqList}
        primaryColor={organization.primaryColor}
      />
    </div>
  );
}
```

---

## Design Decisions

### GallerySection
1. **Simple thumbnail preview** - Shows only the "before" image to create curiosity
2. **Draggable slider** - Users can drag the divider to reveal before/after
3. **Touch-friendly** - Swipe gestures on mobile for easy navigation
4. **Lazy loading** - Images load only when needed for performance
5. **Gradient backgrounds** - Elegant overlay on hover for treatment info

### FAQSection
1. **Smart features** - Search and categories appear only when needed
2. **Single-open default** - Cleaner UX, but configurable for multiple
3. **Smooth animations** - 300ms transitions for professional feel
4. **Visual feedback** - Icons rotate, colors change, borders highlight
5. **Mobile-first** - Large touch targets, responsive layout

---

## Performance Considerations

Both components are optimized for:
- ✅ No unnecessary re-renders
- ✅ Memoized computations (useMemo)
- ✅ Lazy loading images
- ✅ Smooth 60fps animations
- ✅ Small bundle size (uses only lucide-react icons)

---

## Accessibility

Both components include:
- ✅ ARIA attributes (aria-expanded, aria-controls, aria-label)
- ✅ Keyboard navigation (ESC, Arrow keys, Enter, Space)
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ Semantic HTML
- ✅ Color contrast compliance

---

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

Uses standard CSS features:
- CSS clip-path
- CSS transforms
- CSS transitions
- Flexbox & Grid

---

## File Locations

- `/src/components/templates/shared/GallerySection.tsx` (12KB)
- `/src/components/templates/shared/FAQSection.tsx` (8.7KB)
