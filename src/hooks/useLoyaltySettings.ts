import { useState, useEffect } from 'react';

export interface LoyaltySettings {
  serviceThreshold: number;
  serviceDiscount: number;
  packageThreshold: number;
  packageDiscount: number;
  referralSponsorDiscount: number;
  referralReferredDiscount: number;
  birthdayDiscount: number;
}

const defaultSettings: LoyaltySettings = {
  serviceThreshold: 10,
  serviceDiscount: 10,
  packageThreshold: 3,
  packageDiscount: 20,
  referralSponsorDiscount: 10,
  referralReferredDiscount: 10,
  birthdayDiscount: 10,
};

export function useLoyaltySettings() {
  const [settings, setSettings] = useState<LoyaltySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/loyalty-settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings || defaultSettings);
        } else {
          // Si l'API n'existe pas encore ou retourne une erreur, utiliser les valeurs par défaut
          setSettings(defaultSettings);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres de fidélité:', err);
        setSettings(defaultSettings);
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
