# GoogleMapsEmbed Component - Integration Guide

## Overview

The `GoogleMapsEmbed` component provides an easy way to embed Google Maps in beauty institute templates with automatic fallbacks, loading states, and accessible design.

## Location

```
/src/components/templates/shared/GoogleMapsEmbed.tsx
```

## Features

- ✅ Google Maps iframe embed (no API key required)
- ✅ Multiple input options (address, Google Maps URL, Place ID)
- ✅ Automatic fallback to link if embed fails
- ✅ Loading skeleton animation
- ✅ Responsive design (mobile-friendly)
- ✅ "Get Directions" CTA button
- ✅ "View Larger Map" button
- ✅ Address display below map
- ✅ Fully accessible (ARIA labels, keyboard navigation)
- ✅ Security hardened (sandbox attributes)

## Interface

```typescript
interface GoogleMapsEmbedProps {
  address?: string;          // Full address string
  googleMapsUrl?: string;    // Direct Google Maps URL
  googlePlaceId?: string;    // Google Place ID (most reliable)
  height?: string;           // Default: '400px'
  zoom?: number;             // Default: 15
  title?: string;            // Default: 'Notre emplacement'
  primaryColor: string;      // Required: Brand color for buttons
}
```

## Priority of Parameters

1. **googleMapsUrl** - If provided, used first
2. **googlePlaceId** - If provided, used second (most reliable)
3. **address** - If provided, used third

## Basic Usage

### 1. Import the component

```tsx
import GoogleMapsEmbed from '@/components/templates/shared/GoogleMapsEmbed';
```

### 2. Use in your template

```tsx
<GoogleMapsEmbed
  address="123 Rue de la Beauté, 75001 Paris, France"
  primaryColor="#C8A882"
  height="450px"
  zoom={16}
  title="Institut de Beauté Paris"
/>
```

## Integration in Existing Templates

### Step 1: Add to Contact/Location Section

Most templates have a "Contact" or "Nous Trouver" section. Add the component there:

```tsx
{/* Contact Section */}
<section id="contact" className="py-20 px-6">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-4xl font-bold text-center mb-12">
      Nous Trouver
    </h2>

    {/* Google Maps Embed */}
    <GoogleMapsEmbed
      address={organization.address}
      googleMapsUrl={organization.googleMapsUrl}
      primaryColor={organization.primaryColor}
      height="500px"
      zoom={17}
    />

    {/* Contact Info Grid */}
    <div className="mt-12 grid md:grid-cols-3 gap-6">
      {/* ... existing contact info ... */}
    </div>
  </div>
</section>
```

### Step 2: Update Template Interface (if needed)

Most templates already have these fields, but verify:

```typescript
interface TemplateProps {
  organization: {
    // ... other fields ...
    address?: string;
    city?: string;
    postalCode?: string;
    googleMapsUrl?: string;  // Should already exist
    primaryColor: string;
  };
}
```

## Real-World Examples

### Example 1: Simple Address

```tsx
<GoogleMapsEmbed
  address="10 Avenue des Champs-Élysées, 75008 Paris"
  primaryColor="#C8A882"
/>
```

### Example 2: Using Google Maps URL

```tsx
<GoogleMapsEmbed
  googleMapsUrl="https://www.google.com/maps/place/Eiffel+Tower/@48.8583701,2.2944813,17z"
  primaryColor="#C8A882"
  height="600px"
  zoom={18}
/>
```

### Example 3: Using Place ID (Recommended)

```tsx
<GoogleMapsEmbed
  googlePlaceId="ChIJLU7jZClu5kcR4PcOOO6p3I0"
  primaryColor="#C8A882"
  title="Notre Institut de Beauté"
/>
```

### Example 4: Complete Contact Section

```tsx
<section className="py-20 bg-gradient-to-b from-white to-gray-50">
  <div className="max-w-6xl mx-auto px-6">
    {/* Header */}
    <div className="text-center mb-16">
      <h2
        className="text-5xl font-bold mb-6"
        style={{ color: organization.primaryColor }}
      >
        Venez Nous Rencontrer
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Découvrez notre institut dans un cadre luxueux et apaisant
      </p>
    </div>

    {/* Map */}
    <GoogleMapsEmbed
      address={`${organization.address}, ${organization.postalCode} ${organization.city}`}
      googleMapsUrl={organization.googleMapsUrl}
      primaryColor={organization.primaryColor}
      height="500px"
      zoom={17}
      title={`Carte - ${organization.name}`}
    />

    {/* Contact Cards */}
    <div className="mt-12 grid md:grid-cols-3 gap-8">
      {/* Address Card */}
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="text-5xl mb-4">📍</div>
        <h3 className="text-xl font-bold mb-3">Notre Adresse</h3>
        <p className="text-gray-600">
          {organization.address}<br />
          {organization.postalCode} {organization.city}
        </p>
      </div>

      {/* Phone Card */}
      {organization.phone && (
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="text-5xl mb-4">📞</div>
          <h3 className="text-xl font-bold mb-3">Téléphone</h3>
          <a
            href={`tel:${organization.phone}`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            {organization.phone}
          </a>
        </div>
      )}

      {/* Hours Card */}
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="text-5xl mb-4">⏰</div>
        <h3 className="text-xl font-bold mb-3">Horaires</h3>
        <p className="text-gray-600">
          Lun-Ven: 9h-19h<br />
          Samedi: 9h-18h
        </p>
      </div>
    </div>
  </div>
</section>
```

## How to Get Google Place ID

1. **Using Place ID Finder**:
   - Visit: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
   - Search for your location
   - Copy the Place ID

2. **From Google Maps URL**:
   - Go to Google Maps
   - Search your location
   - Right-click on the marker
   - Click "What's here?"
   - The Place ID will appear in the details

3. **Using API** (for bulk operations):
   - Use Places API: https://developers.google.com/maps/documentation/places/web-service/place-id

## Styling Customization

### Custom Height

```tsx
<GoogleMapsEmbed
  address={organization.address}
  primaryColor={organization.primaryColor}
  height="700px"  // Larger map
/>
```

### Custom Zoom Level

```tsx
<GoogleMapsEmbed
  address={organization.address}
  primaryColor={organization.primaryColor}
  zoom={18}  // Very close zoom
/>
```

### Responsive Heights

```tsx
<div className="h-64 sm:h-96 lg:h-[500px]">
  <GoogleMapsEmbed
    address={organization.address}
    primaryColor={organization.primaryColor}
    height="100%"
  />
</div>
```

## Error Handling

The component automatically handles:

1. **Invalid URLs**: Shows fallback link
2. **Loading failures**: Shows error state with fallback
3. **Missing data**: Returns null (no render)
4. **Iframe blocking**: Shows "Open in Google Maps" button

## Accessibility Features

- ✅ Proper ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Semantic HTML structure
- ✅ Focus indicators on buttons

## Security Features

- ✅ Iframe sandbox attributes
- ✅ Proper URL encoding
- ✅ XSS protection
- ✅ HTTPS enforcement
- ✅ No external scripts required

## Browser Compatibility

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Full support
- ✅ IE11: Graceful degradation (shows fallback link)

## Performance Considerations

1. **Lazy Loading**: Iframe uses `loading="lazy"`
2. **No API Calls**: Uses embedded iframe (no quota limits)
3. **Minimal Bundle**: No external dependencies
4. **Optimized Rendering**: Loading skeleton prevents layout shift

## Common Issues & Solutions

### Issue: Map not loading

**Solution**: Check if iframe is being blocked by browser extensions or CSP policies.

### Issue: Wrong location shown

**Solution**: Use Google Place ID instead of address for most accurate results.

### Issue: Buttons not styled correctly

**Solution**: Ensure `primaryColor` is a valid CSS color (hex, rgb, or named color).

### Issue: Map too small on mobile

**Solution**: Use responsive height or ensure parent container has proper width.

## Template-Specific Examples

### For TemplateModern

```tsx
{/* In the Contact section */}
<GoogleMapsEmbed
  address={`${organization.address}, ${organization.postalCode} ${organization.city}`}
  googleMapsUrl={organization.googleMapsUrl}
  primaryColor={organization.primaryColor}
  height="600px"
  zoom={16}
/>
```

### For TemplateClassic

```tsx
{/* More traditional styling */}
<div className="border-4 border-double" style={{ borderColor: organization.primaryColor }}>
  <GoogleMapsEmbed
    address={organization.address}
    primaryColor={organization.primaryColor}
    height="450px"
  />
</div>
```

### For TemplateElegance

```tsx
{/* Elegant with shadow */}
<div className="shadow-2xl rounded-3xl overflow-hidden">
  <GoogleMapsEmbed
    address={organization.address}
    primaryColor={organization.primaryColor}
    height="500px"
    zoom={17}
  />
</div>
```

## Future Enhancements (Optional)

Potential additions for future versions:

- [ ] Multiple marker support
- [ ] Custom marker icons
- [ ] Street View integration
- [ ] Directions API integration
- [ ] Traffic layer toggle
- [ ] Multiple location support
- [ ] Satellite view option

## Support

For issues or questions:
- Check the example file: `GoogleMapsEmbed.example.tsx`
- Review existing template implementations
- Ensure all props are correctly typed

---

**Created**: November 2025
**Version**: 1.0.0
**Author**: LAIA Connect Team
