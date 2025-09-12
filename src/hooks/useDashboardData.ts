import { useState, useEffect } from 'react';

interface DashboardData {
  stats: {
    todayReservations: number;
    weekReservations: number;
    monthReservations: number;
    pendingReservations: number;
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    totalClients: number;
    activeClients: number;
    occupancyRate: number;
    averageRating: string;
  };
  recentReservations: any[];
  upcomingReservations: any[];
  pendingReservationsList: any[];
  popularServices: any[];
  recentReviews: any[];
  blockedSlots: any[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      
      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les données du dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchDashboardData };
}

// Hook pour les statistiques détaillées
export function useStatistics(viewMode: string, selectedDate: string, selectedMonth: string, selectedYear: string) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          viewMode,
          selectedDate,
          selectedMonth,
          selectedYear
        });
        
        const response = await fetch(`/api/admin/statistics?${params}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [viewMode, selectedDate, selectedMonth, selectedYear]);

  return { stats, loading, error };
}