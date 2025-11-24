/**
 * GoogleMapsEmbed - Usage Examples
 *
 * This file demonstrates different ways to use the GoogleMapsEmbed component
 */

import GoogleMapsEmbed from './GoogleMapsEmbed';

// Example 1: Using an address
export function Example1_WithAddress() {
  return (
    <GoogleMapsEmbed
      address="123 Rue de la Beauté, 75001 Paris, France"
      primaryColor="#C8A882"
      height="450px"
      zoom={16}
      title="Institut de Beauté Paris"
    />
  );
}

// Example 2: Using a Google Maps URL
export function Example2_WithGoogleMapsUrl() {
  return (
    <GoogleMapsEmbed
      googleMapsUrl="https://www.google.com/maps/place/Eiffel+Tower/@48.8583701,2.2944813,17z"
      primaryColor="#C8A882"
      height="400px"
      title="Tour Eiffel"
    />
  );
}

// Example 3: Using a Google Place ID (most reliable)
export function Example3_WithPlaceId() {
  return (
    <GoogleMapsEmbed
      googlePlaceId="ChIJLU7jZClu5kcR4PcOOO6p3I0"
      primaryColor="#C8A882"
      zoom={15}
      title="Notre emplacement"
    />
  );
}

// Example 4: In a template context
export function Example4_InTemplate() {
  const organization = {
    name: "Laia Skin Institut",
    address: "123 Rue de la Beauté, 75001 Paris",
    primaryColor: "#C8A882"
  };

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: organization.primaryColor }}
          >
            Nous Trouver
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visitez notre institut de beauté pour profiter de nos soins
            d'exception dans un cadre luxueux et apaisant.
          </p>
        </div>

        <GoogleMapsEmbed
          address={organization.address}
          primaryColor={organization.primaryColor}
          height="500px"
          zoom={17}
          title={`Carte - ${organization.name}`}
        />

        {/* Additional contact information */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">📍</div>
            <h3 className="font-semibold mb-2">Adresse</h3>
            <p className="text-sm text-gray-600">{organization.address}</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">📞</div>
            <h3 className="font-semibold mb-2">Téléphone</h3>
            <p className="text-sm text-gray-600">01 23 45 67 89</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">⏰</div>
            <h3 className="font-semibold mb-2">Horaires</h3>
            <p className="text-sm text-gray-600">Lun-Sam: 9h-19h</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Example 5: Responsive mobile-friendly version
export function Example5_Responsive() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <GoogleMapsEmbed
        address="123 Rue de la Beauté, 75001 Paris"
        primaryColor="#C8A882"
        height="300px" // Smaller on mobile
        zoom={15}
        title="Notre institut"
      />
    </div>
  );
}

/**
 * NOTES ON USAGE:
 *
 * 1. Priority of parameters:
 *    - If googleMapsUrl is provided, it's used first
 *    - If googlePlaceId is provided, it's used second
 *    - If address is provided, it's used third
 *
 * 2. Google Place ID is the most reliable option:
 *    - To find a Place ID: https://developers.google.com/maps/documentation/places/web-service/place-id
 *    - Or use: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
 *
 * 3. No API key required:
 *    - This component uses Google Maps iframe embed
 *    - No API key needed for basic functionality
 *    - Some features may be limited without API key
 *
 * 4. Accessibility:
 *    - All interactive elements have aria-labels
 *    - Proper semantic HTML structure
 *    - Keyboard navigation supported
 *
 * 5. Security:
 *    - Iframe has sandbox attributes for security
 *    - External links use rel="noopener noreferrer"
 *    - XSS protection via proper encoding
 */
