'use client';

import { Phone } from 'lucide-react';

interface FloatingCallButtonProps {
  phone: string;
  primaryColor: string;
  position?: 'bottom-right' | 'bottom-left';
  showOnMobileOnly?: boolean;
}

export default function FloatingCallButton({
  phone,
  primaryColor,
  position = 'bottom-right',
  showOnMobileOnly = true
}: FloatingCallButtonProps) {
  const positionClasses = position === 'bottom-right'
    ? 'right-6 bottom-6'
    : 'left-6 bottom-6';

  const visibilityClasses = showOnMobileOnly ? 'md:hidden' : '';

  return (
    <a
      href={`tel:${phone}`}
      className={`fixed ${positionClasses} ${visibilityClasses} z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-3xl group`}
      style={{ backgroundColor: primaryColor }}
      aria-label={`Appeler ${phone}`}
    >
      {/* Pulse animation background */}
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Icon */}
      <Phone className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
    </a>
  );
}
