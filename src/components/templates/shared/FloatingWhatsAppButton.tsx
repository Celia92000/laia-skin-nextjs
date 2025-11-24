'use client';

import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppButtonProps {
  whatsapp: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
  showOnMobileOnly?: boolean;
  offsetBottom?: string; // Pour positionner au-dessus du bouton tel si les 2 existent
}

export default function FloatingWhatsAppButton({
  whatsapp,
  message = 'Bonjour, je souhaite prendre rendez-vous',
  position = 'bottom-right',
  showOnMobileOnly = true,
  offsetBottom = '6rem' // 96px - laisse de la place pour le bouton call
}: FloatingWhatsAppButtonProps) {
  // Format phone number (remove spaces, dashes, etc.)
  const cleanPhone = whatsapp.replace(/\D/g, '');

  // Build WhatsApp URL with pre-filled message
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  const positionClasses = position === 'bottom-right'
    ? 'right-6'
    : 'left-6';

  const visibilityClasses = showOnMobileOnly ? 'md:hidden' : '';

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed ${positionClasses} ${visibilityClasses} z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-3xl group`}
      style={{
        backgroundColor: '#25D366', // WhatsApp official color
        bottom: offsetBottom
      }}
      aria-label="Contacter via WhatsApp"
    >
      {/* Pulse animation background */}
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{ backgroundColor: '#25D366' }}
      />

      {/* Icon */}
      <MessageCircle className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" fill="currentColor" />
    </a>
  );
}
