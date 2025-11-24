'use client';

import { useState, useEffect } from 'react';

interface GoogleMapsEmbedProps {
  address?: string;
  googleMapsUrl?: string;
  googlePlaceId?: string;
  height?: string; // default: '400px'
  zoom?: number; // default: 15
  title?: string;
  primaryColor: string;
}

export default function GoogleMapsEmbed({
  address,
  googleMapsUrl,
  googlePlaceId,
  height = '400px',
  zoom = 15,
  title = 'Notre emplacement',
  primaryColor
}: GoogleMapsEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string>('');

  useEffect(() => {
    try {
      let url = '';
      let fallback = '';

      // Option 1: Direct Google Maps URL provided
      if (googleMapsUrl) {
        // Convert regular Google Maps URL to embed URL
        if (googleMapsUrl.includes('google.com/maps')) {
          // Extract coordinates or place ID from URL if present
          const placeIdMatch = googleMapsUrl.match(/place\/([^\/]+)/);
          const coordsMatch = googleMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

          if (placeIdMatch) {
            const encodedPlace = encodeURIComponent(placeIdMatch[1]);
            url = `https://www.google.com/maps/embed/v1/place?key=&q=${encodedPlace}&zoom=${zoom}`;
            fallback = googleMapsUrl;
          } else if (coordsMatch) {
            const lat = coordsMatch[1];
            const lng = coordsMatch[2];
            url = `https://www.google.com/maps/embed/v1/view?key=&center=${lat},${lng}&zoom=${zoom}`;
            fallback = googleMapsUrl;
          } else {
            // Use iframe embed format
            url = googleMapsUrl.replace('/maps/', '/maps/embed/');
            fallback = googleMapsUrl;
          }
        } else {
          fallback = googleMapsUrl;
          setHasError(true);
        }
      }
      // Option 2: Google Place ID provided
      else if (googlePlaceId) {
        url = `https://www.google.com/maps/embed/v1/place?key=&q=place_id:${googlePlaceId}&zoom=${zoom}`;
        fallback = `https://www.google.com/maps/search/?api=1&query=place_id:${googlePlaceId}`;
      }
      // Option 3: Address provided
      else if (address) {
        const encodedAddress = encodeURIComponent(address);
        url = `https://www.google.com/maps/embed/v1/place?key=&q=${encodedAddress}&zoom=${zoom}`;
        fallback = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      }
      // No valid input
      else {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      // Remove the key parameter if empty (for basic embed without API key)
      url = url.replace('key=&', '');

      setEmbedUrl(url);
      setFallbackUrl(fallback);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating Google Maps embed:', error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [address, googleMapsUrl, googlePlaceId, zoom]);

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const getDirectionsUrl = () => {
    if (googlePlaceId) {
      return `https://www.google.com/maps/dir/?api=1&destination=place_id:${googlePlaceId}`;
    } else if (address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    } else if (fallbackUrl) {
      return fallbackUrl;
    }
    return '';
  };

  // If no valid input provided
  if (!address && !googleMapsUrl && !googlePlaceId) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-lg">
        {/* Loading Skeleton */}
        {isLoading && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"
            style={{ height }}
            aria-label="Chargement de la carte"
          />
        )}

        {/* Map Embed or Error Fallback */}
        {!hasError && embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height={height}
            style={{ border: 0, display: isLoading ? 'none' : 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={title}
            onError={handleIframeError}
            onLoad={handleIframeLoad}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            aria-label={`Carte Google Maps - ${title}`}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center bg-gray-100 p-8 text-center"
            style={{ height }}
          >
            <div className="text-gray-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-lg font-medium">Carte non disponible</p>
              <p className="text-sm text-gray-500 mt-2">
                Ouvrez la carte dans Google Maps
              </p>
            </div>
            {fallbackUrl && (
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-6 py-3 rounded-lg font-medium text-white transition-all hover:shadow-lg hover:scale-105"
                style={{ backgroundColor: primaryColor }}
                aria-label="Ouvrir dans Google Maps"
              >
                Ouvrir dans Google Maps
              </a>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!hasError && (
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          {/* Get Directions Button */}
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-3 rounded-lg font-medium text-white text-center transition-all hover:shadow-lg hover:scale-105 transform"
            style={{ backgroundColor: primaryColor }}
            aria-label="Obtenir l'itinéraire"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Obtenir l'itinéraire
            </span>
          </a>

          {/* View Larger Map Button */}
          {fallbackUrl && (
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 rounded-lg font-medium text-center border-2 transition-all hover:shadow-md hover:scale-105 transform"
              style={{
                borderColor: primaryColor,
                color: primaryColor
              }}
              aria-label="Voir la carte en grand"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                Voir la carte en grand
              </span>
            </a>
          )}
        </div>
      )}

      {/* Address Display */}
      {address && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: primaryColor }}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Adresse</p>
              <p className="text-sm text-gray-600 mt-1">{address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
