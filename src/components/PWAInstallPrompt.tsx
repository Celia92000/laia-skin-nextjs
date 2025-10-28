'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Vérifier si l'utilisateur a déjà refusé l'installation
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = Math.floor((now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));

      // Réafficher après 7 jours
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Attendre 30 secondes avant d'afficher la bannière
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // 30 secondes
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Détecter si l'app a été installée
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('[PWA] Application installée avec succès !');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Afficher la prompt d'installation native
    deferredPrompt.prompt();

    // Attendre le choix de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] Utilisateur a accepté l\'installation');
    } else {
      console.log('[PWA] Utilisateur a refusé l\'installation');
    }

    // Réinitialiser
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  // Ne rien afficher si déjà installé ou pas de prompt disponible
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <>
      {/* Banner version desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#d4b5a0] to-[#c9a589] text-white shadow-lg animate-slideUp hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Download className="w-6 h-6" />
            <div>
              <p className="font-semibold">Installer LAIA Connect</p>
              <p className="text-sm text-white/90">
                Accédez plus rapidement à votre institut depuis votre ordinateur
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleInstallClick}
              className="px-6 py-2 bg-white text-[#d4b5a0] rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom banner version mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#d4b5a0] to-[#c9a589] text-white shadow-lg animate-slideUp md:hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <img src="/icons/icon-96x96.png" alt="LAIA" className="w-10 h-10" />
              </div>
              <div>
                <p className="font-semibold">LAIA Connect</p>
                <p className="text-sm text-white/90">
                  Installez l'application sur votre téléphone
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full px-6 py-3 bg-white text-[#d4b5a0] rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Installer l'application
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
