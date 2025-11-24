# GoogleMapsEmbed Component

A fully-featured Google Maps embed component for beauty institute templates.

## Quick Start

```tsx
import GoogleMapsEmbed from '@/components/templates/shared/GoogleMapsEmbed';

<GoogleMapsEmbed
  address="123 Rue de la Beauté, 75001 Paris"
  primaryColor="#C8A882"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `address` | `string` | No* | - | Full address string |
| `googleMapsUrl` | `string` | No* | - | Direct Google Maps URL |
| `googlePlaceId` | `string` | No* | - | Google Place ID (recommended) |
| `height` | `string` | No | `'400px'` | Map height (CSS value) |
| `zoom` | `number` | No | `15` | Map zoom level (1-20) |
| `title` | `string` | No | `'Notre emplacement'` | Accessible title |
| `primaryColor` | `string` | **Yes** | - | Brand color for buttons |

*At least one of `address`, `googleMapsUrl`, or `googlePlaceId` must be provided.

## Examples

### Using Address
```tsx
<GoogleMapsEmbed
  address="10 Avenue des Champs-Élysées, 75008 Paris"
  primaryColor="#C8A882"
/>
```

### Using Google Maps URL
```tsx
<GoogleMapsEmbed
  googleMapsUrl="https://www.google.com/maps/place/Eiffel+Tower/@48.8583701,2.2944813,17z"
  primaryColor="#C8A882"
  height="600px"
  zoom={18}
/>
```

### Using Place ID (Best)
```tsx
<GoogleMapsEmbed
  googlePlaceId="ChIJLU7jZClu5kcR4PcOOO6p3I0"
  primaryColor="#C8A882"
  title="Notre Institut"
/>
```

### In Template Context
```tsx
<GoogleMapsEmbed
  address={`${organization.address}, ${organization.postalCode} ${organization.city}`}
  googleMapsUrl={organization.googleMapsUrl}
  primaryColor={organization.primaryColor}
  height="500px"
  zoom={17}
  title={`Carte - ${organization.name}`}
/>
```

## Features

- ✅ No API key required
- ✅ Automatic fallback handling
- ✅ Loading skeleton
- ✅ Responsive design
- ✅ "Get Directions" button
- ✅ "View Larger Map" button
- ✅ Address display
- ✅ Fully accessible
- ✅ Security hardened

## How to Get Google Place ID

1. Visit: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
2. Search for your location
3. Copy the Place ID

## Files

- **Component**: `/src/components/templates/shared/GoogleMapsEmbed.tsx`
- **Examples**: `/src/components/templates/shared/GoogleMapsEmbed.example.tsx`
- **Integration Guide**: `/src/components/templates/shared/GoogleMapsEmbed.integration.md`

## Common Use Cases

### Contact Page
```tsx
<section className="py-20">
  <h2 className="text-4xl font-bold text-center mb-12">Nous Trouver</h2>
  <GoogleMapsEmbed
    address={organization.address}
    primaryColor={organization.primaryColor}
    height="500px"
  />
</section>
```

### Footer Integration
```tsx
<GoogleMapsEmbed
  address={organization.address}
  primaryColor={organization.primaryColor}
  height="300px"
  zoom={15}
/>
```

### Full Contact Section
```tsx
<section id="contact">
  <GoogleMapsEmbed
    address={organization.address}
    googleMapsUrl={organization.googleMapsUrl}
    primaryColor={organization.primaryColor}
  />

  <div className="mt-8 grid md:grid-cols-3 gap-6">
    {/* Contact cards */}
  </div>
</section>
```

## Browser Support

- Chrome/Edge ✅
- Firefox ✅
- Safari ✅
- Mobile browsers ✅

## Security

- Iframe sandbox attributes
- Proper URL encoding
- XSS protection
- No external scripts

## Performance

- Lazy loading enabled
- No API quota limits
- Minimal bundle size
- Zero dependencies

---

**Version**: 1.0.0
**Created**: November 2025
