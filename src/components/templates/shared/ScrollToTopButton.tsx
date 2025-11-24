'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  showAfter?: number; // pixels (default: 300)
  primaryColor: string;
  position?: 'bottom-right' | 'bottom-left';
  offsetBottom?: string; // Pour éviter les boutons call/whatsapp
}

export default function ScrollToTopButton({
  showAfter = 300,
  primaryColor,
  position = 'bottom-right',
  offsetBottom = '12rem' // 192px - au-dessus des boutons call+whatsapp
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const positionClasses = position === 'bottom-right'
    ? 'right-6'
    : 'left-6';

  return (
    <button
      onClick={scrollToTop}
      className={`fixed ${positionClasses} z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{
        backgroundColor: primaryColor,
        bottom: offsetBottom
      }}
      aria-label="Retour en haut"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
