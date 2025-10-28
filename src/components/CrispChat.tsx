'use client';

import { useEffect } from 'react';

interface CrispChatProps {
  websiteId: string;
}

export default function CrispChat({ websiteId }: CrispChatProps) {
  useEffect(() => {
    if (!websiteId) return;

    // Crisp configuration
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;

    // Charger le script Crisp
    (function() {
      const d = document;
      const s = d.createElement('script');
      s.src = 'https://client.crisp.chat/l.js';
      s.async = true;
      d.getElementsByTagName('head')[0].appendChild(s);
    })();

    console.log('[Crisp] Chat widget chargé avec succès');

    // Nettoyage lors du démontage
    return () => {
      if (window.$crisp) {
        window.$crisp.push(['do', 'chat:hide']);
      }
    };
  }, [websiteId]);

  return null; // Le widget Crisp s'ajoute automatiquement
}

// Déclaration TypeScript pour window.$crisp
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}
