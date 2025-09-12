import { useEffect, useState, useCallback } from 'react';
import { dataSync } from '@/lib/data-sync';

interface SyncOptions {
  types: string[];
  onUpdate?: (type: string, data: any) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useDataSync(options: SyncOptions) {
  const [lastUpdate, setLastUpdate] = useState<{ type: string; data: any } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fonction de rafraîchissement
  const refresh = useCallback(async (type?: string) => {
    setIsRefreshing(true);
    try {
      // Déclencher un rafraîchissement pour le type spécifique ou tous les types
      const typesToRefresh = type ? [type] : options.types;
      
      for (const t of typesToRefresh) {
        dataSync.emitUpdate(t, { needsRefresh: true });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [options.types]);

  useEffect(() => {
    // S'abonner aux mises à jour
    const handleUpdate = (update: { type: string; data: any }) => {
      if (options.types.includes(update.type)) {
        setLastUpdate(update);
        
        // Appeler le callback personnalisé si fourni
        if (options.onUpdate) {
          options.onUpdate(update.type, update.data);
        }
      }
    };

    dataSync.onUpdate(handleUpdate);

    // Auto-refresh si activé
    let intervalId: NodeJS.Timeout | null = null;
    if (options.autoRefresh && options.refreshInterval) {
      intervalId = setInterval(() => {
        refresh();
      }, options.refreshInterval);
    }

    return () => {
      // Nettoyer l'intervalle
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [options.types, options.onUpdate, options.autoRefresh, options.refreshInterval, refresh]);

  return {
    lastUpdate,
    isRefreshing,
    refresh,
    dataSync
  };
}

// Hook spécialisé pour les réservations
export function useReservationSync(onUpdate?: (data: any) => void) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const { lastUpdate } = useDataSync({
    types: ['reservation', 'planning'],
    onUpdate: (type, data) => {
      if (data.needsRefresh) {
        fetchReservations();
      } else if (type === 'reservation' && data.id) {
        // Mise à jour optimiste
        setReservations(prev => {
          const index = prev.findIndex(r => r.id === data.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...data };
            return updated;
          }
          return [...prev, data];
        });
      }
      
      if (onUpdate) {
        onUpdate(data);
      }
    }
  });

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return {
    reservations,
    loading,
    lastUpdate,
    refresh: fetchReservations
  };
}

// Hook spécialisé pour les statistiques
export function useStatisticsSync() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/statistics?viewMode=month&selectedDate=' + new Date().toISOString());
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useDataSync({
    types: ['statistics', 'reservation', 'payment', 'client'],
    onUpdate: (type, data) => {
      if (data.needsRefresh || type !== 'statistics') {
        // Rafraîchir les statistiques quand n'importe quelle donnée change
        fetchStats();
      }
    },
    autoRefresh: true,
    refreshInterval: 60000 // Rafraîchir toutes les minutes
  });

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    refresh: fetchStats
  };
}

// Hook spécialisé pour les clients
export function useClientSync() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useDataSync({
    types: ['client', 'loyalty', 'reservation'],
    onUpdate: (type, data) => {
      if (data.needsRefresh) {
        fetchClients();
      } else if (type === 'client' && data.clientId) {
        // Mise à jour optimiste d'un client spécifique
        setClients(prev => {
          const index = prev.findIndex(c => c.id === data.clientId);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...data };
            return updated;
          }
          return prev;
        });
      }
    }
  });

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    refresh: fetchClients
  };
}