'use client';

import Image from 'next/image';

interface HeroMediaProps {
  videoUrl?: string;
  imageUrl?: string;
  alt: string;
  priority?: boolean;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
}

/**
 * HeroMedia Component
 *
 * Affiche une vidéo OU une image en arrière-plan du hero.
 * Priorité : videoUrl > imageUrl
 *
 * Features:
 * - Support vidéo (autoplay, loop, muted)
 * - Support image (Next.js Image avec optimisation)
 * - Overlay optionnel pour améliorer la lisibilité du texte
 * - Gestion automatique du fallback video → image
 */
export default function HeroMedia({
  videoUrl,
  imageUrl,
  alt,
  priority = true,
  className = '',
  overlay = false,
  overlayOpacity = 0.4,
  overlayColor = 'black',
}: HeroMediaProps) {
  // Si videoUrl est fournie, afficher la vidéo
  if (videoUrl) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster={imageUrl} // Utilise l'image comme poster pendant le chargement
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
          {/* Fallback sur l'image si la vidéo ne charge pas */}
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-cover"
              priority={priority}
            />
          )}
        </video>
        {overlay && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }}
          />
        )}
      </div>
    );
  }

  // Si seulement imageUrl est fournie, afficher l'image
  if (imageUrl) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
        />
        {overlay && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }}
          />
        )}
      </div>
    );
  }

  // Aucun media fourni - retourner null ou un background par défaut
  return null;
}
