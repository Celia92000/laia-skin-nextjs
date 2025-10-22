import { useState, useEffect } from 'react';

export interface LoyaltySettings {
  serviceThreshold: number;
  serviceDiscount: number;
  packageThreshold: number;
  packageDiscount: number;
  birthdayDiscount: number;
  referralSponsorDiscount: number;
  referralReferredDiscount: number;
  giftCardAmounts: number[];
  referralBonus: number;
  reviewBonus: number;
}

const defaultSettings: LoyaltySettings = {
  serviceThreshold: 5,
  serviceDiscount: 20,
  packageThreshold: 2,
  packageDiscount: 40,
  birthdayDiscount: 10,
  referralSponsorDiscount: 15,
  referralReferredDiscount: 10,
  giftCardAmounts: [50, 100, 150, 200],
  referralBonus: 1,
  reviewBonus: 1
};

export function useLoyaltySettings() {
  const [settings, setSettings] = useState<LoyaltySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setSettings(defaultSettings);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/admin/loyalty-settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          // En cas d'erreur, utiliser les valeurs par défaut
          setSettings(defaultSettings);
        }
      } catch (err) {
        console.error('Erreur récupération loyalty settings:', err);
        setError('Impossible de récupérer les paramètres de fidélité');
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
