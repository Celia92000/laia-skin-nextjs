'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GalleryImage {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  description?: string;
  treatment?: string;
}

interface GallerySectionProps {
  title?: string;
  description?: string;
  images: GalleryImage[];
  primaryColor: string;
  secondaryColor?: string;
}

export default function GallerySection({
  title = 'Nos Résultats',
  description = 'Découvrez les transformations de nos clients',
  images,
  primaryColor,
  secondaryColor
}: GallerySectionProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImageIndex]);

  // Close lightbox on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImageIndex !== null) {
        setSelectedImageIndex(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedImageIndex]);

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      if (e.key === 'ArrowRight') {
        navigateNext();
      } else if (e.key === 'ArrowLeft') {
        navigatePrevious();
      }
    };
    document.addEventListener('keydown', handleArrowKeys);
    return () => document.removeEventListener('keydown', handleArrowKeys);
  }, [selectedImageIndex]);

  const navigateNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    setSliderPosition(50);
  };

  const navigatePrevious = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
    setSliderPosition(50);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe threshold: 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        navigateNext();
      } else {
        navigatePrevious();
      }
    }
    setTouchStart(null);
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: primaryColor }}
          >
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 aspect-[4/3]"
              onClick={() => setSelectedImageIndex(index)}
            >
              {/* Thumbnail - Simple before image */}
              <div className="relative w-full h-full">
                <img
                  src={image.beforeUrl}
                  alt={`Before ${image.treatment || 'treatment'}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"
                >
                  <div className="text-white">
                    {image.treatment && (
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {image.treatment}
                      </span>
                    )}
                    {image.description && (
                      <p className="text-sm font-medium">{image.description}</p>
                    )}
                  </div>
                </div>

                {/* Click to view indicator */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Avant/Après
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImageIndex !== null && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImageIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePrevious();
              }}
              className="absolute left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50 hidden md:block"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateNext();
              }}
              className="absolute right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50 hidden md:block"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Before/After Comparison */}
            <div
              className="relative max-w-4xl w-full aspect-[4/3] rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* After Image (full width) */}
              <div className="absolute inset-0">
                <img
                  src={images[selectedImageIndex].afterUrl}
                  alt="After"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-gray-800">
                  Après
                </div>
              </div>

              {/* Before Image (clipped by slider position) */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={images[selectedImageIndex].beforeUrl}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-gray-800">
                  Avant
                </div>
              </div>

              {/* Slider */}
              <div
                className="absolute inset-0 cursor-ew-resize"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
              >
                {/* Slider line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl"
                  style={{ left: `${sliderPosition}%` }}
                >
                  {/* Slider handle */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor})`
                    }}
                  >
                    <div className="flex gap-1">
                      <ChevronLeft className="w-4 h-4 text-white" />
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image info */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
                {images[selectedImageIndex].treatment && (
                  <span
                    className="inline-block px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {images[selectedImageIndex].treatment}
                  </span>
                )}
                {images[selectedImageIndex].description && (
                  <p className="mt-2 text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-1 rounded-full inline-block">
                    {images[selectedImageIndex].description}
                  </p>
                )}
              </div>

              {/* Counter */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Mobile swipe hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-sm md:hidden">
              Glissez pour naviguer
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
