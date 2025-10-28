'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

export default function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if ('Notification' in window) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('[Push] Erreur vérification subscription:', error);
      }
    }
  }

  async function subscribeToPush() {
    setLoading(true);
    try {
      // Demander la permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        alert('Vous devez autoriser les notifications pour recevoir des alertes.');
        return;
      }

      // Enregistrer le Service Worker
      const registration = await navigator.serviceWorker.ready;

      // Clé publique VAPID (à configurer dans les variables d'environnement)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

      // Convertir la clé VAPID en Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // S'abonner aux notifications push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      setSubscription(subscription);

      // Envoyer la subscription au serveur
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify(subscription)
      });

      console.log('[Push] Abonnement réussi');
    } catch (error) {
      console.error('[Push] Erreur abonnement:', error);
      alert('Erreur lors de l\'abonnement aux notifications.');
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setLoading(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();

        // Informer le serveur
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });

        setSubscription(null);
        console.log('[Push] Désabonnement réussi');
      }
    } catch (error) {
      console.error('[Push] Erreur désabonnement:', error);
    } finally {
      setLoading(false);
    }
  }

  // Convertir clé VAPID base64 en Uint8Array
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Ne rien afficher côté serveur ou si les notifications ne sont pas supportées
  if (!isClient || typeof window === 'undefined') {
    return null;
  }

  if (typeof window !== 'undefined' && (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window))) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {permission === 'default' && !subscription && (
        <button
          onClick={subscribeToPush}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-[#d4b5a0] text-white rounded-lg shadow-lg hover:bg-[#c9a589] transition-all disabled:opacity-50"
        >
          <Bell className="w-5 h-5" />
          <span className="text-sm font-medium">
            {loading ? 'Activation...' : 'Activer les notifications'}
          </span>
        </button>
      )}

      {permission === 'granted' && subscription && (
        <button
          onClick={unsubscribeFromPush}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-all disabled:opacity-50"
          title="Désactiver les notifications"
        >
          <BellOff className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
