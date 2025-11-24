'use client';

/**
 * EXAMPLE USAGE OF GallerySection Component
 *
 * This file demonstrates how to use the GallerySection component
 * in your beauty institute templates.
 */

import GallerySection from './GallerySection';

export default function GallerySectionExample() {
  // Example data - Replace with real data from your database
  const galleryImages = [
    {
      id: '1',
      beforeUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=600&fit=crop',
      afterUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=600&fit=crop',
      description: 'Résultat visible après 6 semaines',
      treatment: 'Soin Anti-Âge'
    },
    {
      id: '2',
      beforeUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop',
      afterUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
      description: 'Peau éclatante et hydratée',
      treatment: 'Hydrafacial'
    },
    {
      id: '3',
      beforeUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop',
      afterUrl: 'https://images.unsplash.com/photo-1526758097130-bab247274f58?w=800&h=600&fit=crop',
      description: 'Teint unifié et lumineux',
      treatment: 'Peeling Doux'
    },
    {
      id: '4',
      beforeUrl: 'https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=800&h=600&fit=crop',
      afterUrl: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&h=600&fit=crop',
      description: 'Raffermissement visible',
      treatment: 'Radiofréquence'
    },
    {
      id: '5',
      beforeUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&h=600&fit=crop',
      afterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop',
      description: 'Contour des yeux défatigué',
      treatment: 'Soin Regard'
    },
    {
      id: '6',
      beforeUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=600&fit=crop',
      afterUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=600&fit=crop',
      description: 'Réduction visible des rides',
      treatment: 'Microneedling'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <GallerySection
        title="Nos Transformations"
        description="Découvrez les résultats exceptionnels obtenus par nos clients grâce à nos soins experts"
        images={galleryImages}
        primaryColor="#D4A574"
        secondaryColor="#B88A5C"
      />
    </div>
  );
}

/**
 * HOW IT WORKS:
 *
 * 1. Grid View:
 *    - Shows thumbnails in a responsive grid (3 cols → 2 cols → 1 col)
 *    - Hover to see treatment info overlay
 *    - Click any thumbnail to open lightbox
 *
 * 2. Lightbox (Modal):
 *    - Full-screen before/after comparison
 *    - Drag the slider handle to reveal before/after
 *    - Click arrows or use keyboard to navigate
 *    - Swipe on mobile to change images
 *    - Press ESC to close
 *
 * 3. Features:
 *    - Touch-friendly on mobile
 *    - Lazy loading for performance
 *    - Smooth animations
 *    - Accessible (keyboard + screen readers)
 *
 * CUSTOMIZATION:
 *
 * - title: Change the section title
 * - description: Change the section description
 * - primaryColor: Your brand's primary color (hex or rgb)
 * - secondaryColor: Optional secondary color for gradients
 * - images: Array of before/after images with metadata
 *
 * IMAGE REQUIREMENTS:
 *
 * - Format: JPG, PNG, WebP
 * - Size: Recommended 800x600px (4:3 aspect ratio)
 * - Quality: High quality for best results
 * - Both before and after images should have same dimensions
 */
