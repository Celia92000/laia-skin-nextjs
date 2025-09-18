'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Calendar, Euro, Award, Star, Heart, 
  ThumbsUp, MessageCircle, BarChart3, PieChart, Activity, Clock, Target, 
  Zap, Package, CreditCard, UserCheck, AlertCircle, Mail, MousePointer 
} from 'lucide-react';

interface Stats {
  reservations: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    conversionRate: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    lastYear: number;
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    averagePerClient: number;
    averagePerService: number;
    byMonth: Array<{ month: string; revenue: number; year: number }>;
    byDay: Array<{ date: string; revenue: number }>;
    byService: Array<{ service: string; revenue: number; percentage: number }>;
  };
  satisfaction: {
    average: number;
    total: number;
    distribution: {
      '5': number;
      '4': number;
      '3': number;
      '2': number;
      '1': number;
    };
    recentFeedback: Array<{
      clientName: string;
      rating: number;
      comment: string;
      date: Date;
      service: string;
    }>;
  };
  clients: {
    total: number;
    new: number;
    returning: number;
    vip: number;
    inactive: number;
    satisfactionRate: number;
  };
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
    satisfaction: number;
  }>;
  dailyStats: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  recurringClients: number;
  marketingPerformance: {
    emailOpenRate: number;
    emailClickRate: number;
    whatsappReadRate: number;
    whatsappResponseRate: number;
    campaignConversion: number;
  };
  products: {
    totalSold: number;
    revenue: number;
    topProducts: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
    stockAlert: number;
  };
  appointments: {
    nextWeek: number;
    occupancyRate: number;
    averageDuration: number;
    noShow: number;
    lastMinuteBookings: number;
    peakHours: Array<{
      hour: string;
      bookings: number;
    }>;
  };
  clientRetention: {
    rate: number;
    newClients: number;
    lostClients: number;
    averageVisitsPerClient: number;
    timeBetweenVisits: number;
  };
}

export default function AdminStatsEnhanced() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('month');

  // Fonction pour période vide (entreprise qui n'a pas démarré)
  const generateDataForPeriod = (date: Date) => {
    // Retourner des valeurs à zéro car l'activité n'a pas démarré
    return {
      dayRevenue: 0,
      dayReservations: 0,
      monthRevenue: 0,
      monthReservations: 0,
      yearRevenue: 0
    };
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Appeler l'API pour récupérer les vraies statistiques
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
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      
      // Fallback avec des données simulées en cas d'erreur
      const currentDate = viewMode === 'day' 
        ? new Date(selectedDate)
        : viewMode === 'month'
        ? new Date(selectedMonth + '-01')
        : new Date(selectedYear + '-01-01');
      
      const periodData = generateDataForPeriod(currentDate);
      
      // Valeurs initiales pour une entreprise qui démarre
      const initialStats: Stats = {
        reservations: {
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          conversionRate: 0
        },
        revenue: {
          total: 0,
          thisMonth: 0,
          lastMonth: 0,
          thisYear: 0,
          lastYear: 0,
          today: 0,
          yesterday: 0,
          thisWeek: 0,
          lastWeek: 0,
          averagePerClient: 0,
          averagePerService: 0,
          byMonth: [
            { month: 'Jan', revenue: 0, year: 2025 },
            { month: 'Fév', revenue: 0, year: 2025 },
            { month: 'Mar', revenue: 0, year: 2025 },
            { month: 'Avr', revenue: 0, year: 2025 },
            { month: 'Mai', revenue: 0, year: 2025 },
            { month: 'Jun', revenue: 0, year: 2025 },
            { month: 'Jul', revenue: 0, year: 2025 },
            { month: 'Aoû', revenue: 0, year: 2025 },
            { month: 'Sep', revenue: 0, year: 2025 },
            { month: 'Oct', revenue: 0, year: 2025 },
            { month: 'Nov', revenue: 0, year: 2025 },
            { month: 'Déc', revenue: 0, year: 2025 }
          ],
          byDay: [],
          byService: []
        },
        satisfaction: {
          average: 0,
          total: 0,
          distribution: {
            '5': 0,
            '4': 0,
            '3': 0,
            '2': 0,
            '1': 0
          },
          recentFeedback: []
        },
        clients: {
          total: 0,
          new: 0,
          returning: 0,
          vip: 0,
          inactive: 0,
          satisfactionRate: 0
        },
        topServices: [],
        dailyStats: [],
        recurringClients: 0,
        marketingPerformance: {
          emailOpenRate: 0,
          emailClickRate: 0,
          whatsappReadRate: 0,
          whatsappResponseRate: 0,
          campaignConversion: 0
        },
        products: {
          totalSold: 0,
          revenue: 0,
          topProducts: [],
          stockAlert: 0
        },
        appointments: {
          nextWeek: 0,
          occupancyRate: 0,
          averageDuration: 60,
          noShow: 0,
          lastMinuteBookings: 0,
          peakHours: []
        },
        clientRetention: {
          rate: 0,
          newClients: 0,
          lostClients: 0,
          averageVisitsPerClient: 0,
          timeBetweenVisits: 0
        }
      };
      
      setStats(initialStats);
      setLoading(false);
    }
  }, [viewMode, selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Chargement...</div>
            </div>
            <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const monthGrowth = (stats.revenue?.lastMonth || 0) > 0
    ? (((stats.revenue?.thisMonth || 0) - (stats.revenue?.lastMonth || 0)) / (stats.revenue?.lastMonth || 1) * 100).toFixed(1)
    : 0;

  // Fonction pour obtenir les stats de la période sélectionnée
  const getStatsForPeriod = () => {
    if (!stats) return null;
    
    const currentDate = viewMode === 'day' 
      ? new Date(selectedDate)
      : viewMode === 'month'
      ? new Date(selectedMonth + '-01')
      : new Date(selectedYear + '-01-01');
    
    const periodData = generateDataForPeriod(currentDate);
    
    if (viewMode === 'day') {
      return {
        revenue: periodData.dayRevenue,
        reservations: periodData.dayReservations,
        newClients: Math.floor(periodData.dayReservations * 0.3),
        label: new Date(selectedDate).toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })
      };
    } else if (viewMode === 'month') {
      const [year, month] = selectedMonth.split('-');
      const monthIndex = parseInt(month) - 1;
      return {
        revenue: periodData.monthRevenue,
        reservations: periodData.monthReservations,
        newClients: Math.floor(periodData.monthReservations * 0.15),
        label: new Date(parseInt(year), monthIndex).toLocaleDateString('fr-FR', { 
          month: 'long', 
          year: 'numeric' 
        })
      };
    } else {
      return {
        revenue: periodData.yearRevenue,
        reservations: Math.floor(periodData.yearRevenue / 100),
        newClients: Math.floor(periodData.yearRevenue / 500),
        label: `Année ${selectedYear}`
      };
    }
  };

  const periodStats = getStatsForPeriod();

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'day' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'month' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'year' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Année
            </button>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'day' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {viewMode === 'month' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {viewMode === 'year' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            )}
          </div>

          {periodStats && (
            <div className="flex-1 flex items-center justify-end gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Période sélectionnée</p>
                <p className="font-semibold text-gray-900">{periodStats.label}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{periodStats.revenue?.toFixed(0)}€</p>
                <p className="text-sm text-gray-600">Chiffre d'affaires</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{periodStats.reservations}</p>
                <p className="text-sm text-gray-600">Réservations</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Titre avec indicateur de satisfaction globale */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tableau de bord complet</h2>
            <p className="text-gray-600 mt-1">Vue d'ensemble détaillée de votre activité</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <span className="text-3xl font-bold">{stats.satisfaction?.average || 4.8}/5</span>
            </div>
            <p className="text-sm text-gray-600">Satisfaction globale</p>
          </div>
        </div>
      </div>

      {/* Cartes principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">
              Réservations {viewMode === 'day' ? 'du jour' : viewMode === 'month' ? 'du mois' : 'de l\'année'}
            </h3>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {periodStats?.reservations || stats.reservations.thisMonth}
            </div>
            <p className="text-xs text-gray-500">
              {viewMode === 'day' ? 'Pour cette journée' : 
               viewMode === 'month' ? 'Pour ce mois' : 
               'Pour cette année'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">
              Chiffre d'affaires {viewMode === 'day' ? 'du jour' : viewMode === 'month' ? 'du mois' : 'de l\'année'}
            </h3>
            <Euro className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {(periodStats?.revenue || stats.revenue?.thisMonth || 0).toFixed(2)} €
            </div>
            <p className="text-xs text-gray-500 flex items-center">
              {viewMode === 'month' && Number(monthGrowth) > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+{monthGrowth}%</span>
                </>
              ) : viewMode === 'month' && Number(monthGrowth) < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600">{monthGrowth}%</span>
                </>
              ) : (
                <span>{viewMode === 'day' ? 'Données du jour' : viewMode === 'year' ? 'Données annuelles' : 'Stable'}</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Taux de conversion</h3>
            <Award className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.reservations.conversionRate}%</div>
            <p className="text-xs text-gray-500">
              {stats.reservations.confirmed} confirmées sur {stats.reservations.total}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Clients fidèles</h3>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.recurringClients}</div>
            <p className="text-xs text-gray-500">
              Clients avec 2+ réservations
            </p>
          </div>
        </div>
      </div>

      {/* Analyses de revenus détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus par période */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="pb-4">
            <h3 className="text-lg font-semibold">Évolution des revenus</h3>
          </div>
          <div className="space-y-4">
            {/* Aujourd'hui vs Hier */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Aujourd'hui</p>
                <p className="text-xl font-bold">{(stats.revenue?.today || 0).toFixed(0)}€</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">vs Hier</p>
                <p className="text-lg font-semibold">
                  {(stats.revenue?.yesterday || 0).toFixed(0)}€
                  {(stats.revenue?.today || 0) > (stats.revenue?.yesterday || 0) ? (
                    <span className="text-green-600 text-sm ml-2">▲ +{stats.revenue?.yesterday ? (((stats.revenue?.today || 0) - (stats.revenue?.yesterday || 0)) / stats.revenue.yesterday * 100).toFixed(0) : 0}%</span>
                  ) : (
                    <span className="text-red-600 text-sm ml-2">▼ {stats.revenue?.yesterday ? (((stats.revenue?.today || 0) - (stats.revenue?.yesterday || 0)) / stats.revenue.yesterday * 100).toFixed(0) : 0}%</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Cette semaine vs Semaine dernière */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Cette semaine</p>
                <p className="text-xl font-bold">{(stats.revenue?.thisWeek || 0).toFixed(0)}€</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">vs Semaine dernière</p>
                <p className="text-lg font-semibold">
                  {(stats.revenue?.lastWeek || 0).toFixed(0)}€
                  {(stats.revenue?.thisWeek || 0) > (stats.revenue?.lastWeek || 0) ? (
                    <span className="text-green-600 text-sm ml-2">▲ +{stats.revenue?.lastWeek ? (((stats.revenue?.thisWeek || 0) - (stats.revenue?.lastWeek || 0)) / stats.revenue.lastWeek * 100).toFixed(0) : 0}%</span>
                  ) : (
                    <span className="text-red-600 text-sm ml-2">▼ {stats.revenue?.lastWeek ? (((stats.revenue?.thisWeek || 0) - (stats.revenue?.lastWeek || 0)) / stats.revenue.lastWeek * 100).toFixed(0) : 0}%</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Ce mois vs Mois dernier */}
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Ce mois</p>
                <p className="text-xl font-bold">{(stats.revenue?.thisMonth || 0).toFixed(0)}€</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">vs Mois dernier</p>
                <p className="text-lg font-semibold">
                  {(stats.revenue?.lastMonth || 0).toFixed(0)}€
                  {Number(monthGrowth) > 0 ? (
                    <span className="text-green-600 text-sm ml-2">▲ +{monthGrowth}%</span>
                  ) : Number(monthGrowth) < 0 ? (
                    <span className="text-red-600 text-sm ml-2">▼ {monthGrowth}%</span>
                  ) : (
                    <span className="text-gray-600 text-sm ml-2">= 0%</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Cette année vs Année dernière */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Cette année</p>
                <p className="text-xl font-bold">{(stats.revenue?.thisYear || 0).toFixed(0)}€</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">vs Année dernière</p>
                <p className="text-lg font-semibold">
                  {(stats.revenue?.lastYear || 0).toFixed(0)}€
                  <span className="text-green-600 text-sm ml-2">
                    ▲ +{stats.revenue?.lastYear ? (((stats.revenue?.thisYear || 0) - (stats.revenue?.lastYear || 0)) / stats.revenue.lastYear * 100).toFixed(0) : 0}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenus par service */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="pb-4">
            <h3 className="text-lg font-semibold">Revenus par service</h3>
          </div>
          <div className="space-y-3">
            {(() => {
              const serviceData = stats.revenue?.byService && stats.revenue.byService.length > 0 
                ? stats.revenue.byService
                : [
                    { service: "Hydro'Naissance", revenue: 0, percentage: 0 },
                    { service: "Hydro'Cleaning", revenue: 0, percentage: 0 },
                    { service: "Renaissance", revenue: 0, percentage: 0 },
                    { service: "BB Glow", revenue: 0, percentage: 0 },
                    { service: "LED Thérapie", revenue: 0, percentage: 0 }
                  ];
              
              return serviceData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-sm font-medium w-36 truncate">{item.service}</span>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        {item.revenue > 0 && (
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full absolute top-0 left-0"
                            style={{ width: `${item.percentage}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="font-semibold">{item.revenue.toFixed(0)}€</p>
                    <p className="text-xs text-gray-500">{item.percentage.toFixed(0)}%</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Graphique mensuel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Revenus mensuels {selectedYear}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Année :</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>
        {(() => {
          // Utiliser les données réelles ou des données de démonstration
          const yearInt = parseInt(selectedYear);
          const monthData = stats.revenue?.byMonth && stats.revenue.byMonth.length > 0 
            ? stats.revenue.byMonth.filter(m => m.year === yearInt)
            : [
                { month: 'Jan', revenue: 0, year: yearInt },
                { month: 'Fév', revenue: 0, year: yearInt },
                { month: 'Mar', revenue: 0, year: yearInt },
                { month: 'Avr', revenue: 0, year: yearInt },
                { month: 'Mai', revenue: 0, year: yearInt },
                { month: 'Jun', revenue: 0, year: yearInt },
                { month: 'Jul', revenue: 0, year: yearInt },
                { month: 'Aoû', revenue: 0, year: yearInt },
                { month: 'Sep', revenue: 0, year: yearInt },
                { month: 'Oct', revenue: 0, year: yearInt },
                { month: 'Nov', revenue: 0, year: yearInt },
                { month: 'Déc', revenue: 0, year: yearInt }
              ];
          
          const maxRevenue = Math.max(...monthData.map(m => m.revenue), 1000); // Minimum 1000 pour l'échelle
          
          return (
            <div className="h-64 flex items-end justify-between gap-1">
              {monthData.map((month, index) => {
                const heightPercent = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div 
                    key={index}
                    className="flex-1 flex flex-col items-center justify-end"
                  >
                    <div className="w-full flex flex-col items-center">
                      {month.revenue > 0 && (
                        <span className="text-xs font-semibold text-gray-700 mb-1">
                          {month.revenue >= 1000 ? `${(month.revenue / 1000).toFixed(1)}k€` : `${month.revenue}€`}
                        </span>
                      )}
                      <div 
                        className={`w-full rounded-t transition-all cursor-pointer relative group ${
                          month.revenue > 0 
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500' 
                            : 'bg-gray-200'
                        }`}
                        style={{ 
                          height: month.revenue > 0 ? `${Math.max(heightPercent * 2, 10)}px` : '4px',
                          minHeight: '4px'
                        }}
                      >
                        {month.revenue > 0 && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {month.revenue.toFixed(0)}€
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{month.month.substring(0, 3)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Section Satisfaction détaillée */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Satisfaction Client
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution des notes */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Distribution des notes</p>
            {stats.satisfaction?.distribution ? (
              Object.entries(stats.satisfaction.distribution)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([rating, count]) => {
                  const percentage = (count / (stats.satisfaction?.total || 1)) * 100;
                  return (
                    <div key={rating} className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div 
                          className="bg-yellow-500 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs text-white font-medium">{count}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-gray-500">Aucune donnée disponible</p>
            )}
          </div>
          
          {/* Derniers avis */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Derniers avis</p>
            <div className="space-y-3">
              {stats.satisfaction?.recentFeedback?.slice(0, 3).map((feedback, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{feedback.clientName}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < feedback.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 italic">"{feedback.comment}"</p>
                  <p className="text-xs text-gray-500 mt-1">{feedback.service}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gestion des rendez-vous */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Analyse des Rendez-vous
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.appointments?.nextWeek || 0}</p>
            <p className="text-xs text-gray-600">Prochaine semaine</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Target className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.appointments?.occupancyRate || 0}%</p>
            <p className="text-xs text-gray-600">Taux occupation</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Clock className="w-5 h-5 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.appointments?.averageDuration || 60}min</p>
            <p className="text-xs text-gray-600">Durée moyenne</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.appointments?.noShow || 0}</p>
            <p className="text-xs text-gray-600">No-shows</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.appointments?.lastMinuteBookings || 0}</p>
            <p className="text-xs text-gray-600">Dernière minute</p>
          </div>
        </div>
        
        {/* Heures de pointe */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Heures de pointe</p>
          <div className="grid grid-cols-6 gap-2">
            {(stats.appointments?.peakHours || []).map((hour, index) => {
              const maxBookings = Math.max(...(stats.appointments?.peakHours || []).map(h => h.bookings));
              const intensity = hour.bookings / maxBookings;
              
              return (
                <div key={index} className="text-center">
                  <div 
                    className="rounded-lg p-3 mb-1 transition-colors"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8})`,
                      color: intensity > 0.5 ? 'white' : 'black'
                    }}
                  >
                    <p className="text-sm font-bold">{hour.bookings}</p>
                  </div>
                  <p className="text-xs text-gray-600">{hour.hour}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vente de produits */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" />
            Vente de Produits
          </h3>
          {stats.products?.stockAlert && stats.products.stockAlert > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {stats.products.stockAlert} produits en rupture
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold">{stats.products?.totalSold || 0}</p>
            <p className="text-xs text-gray-600">Produits vendus</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold">{stats.products?.revenue || 0}€</p>
            <p className="text-xs text-gray-600">CA produits</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold">{stats.products?.totalSold && stats.products?.revenue ? (stats.products.revenue / stats.products.totalSold).toFixed(0) : 0}€</p>
            <p className="text-xs text-gray-600">Panier moyen</p>
          </div>
        </div>
        
        {/* Top produits */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Meilleures ventes</p>
          <div className="space-y-2">
            {(stats.products?.topProducts || []).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} vendus</p>
                  </div>
                </div>
                <p className="font-semibold">{product.revenue}€</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fidélisation client */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-500" />
            Fidélisation & Rétention
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.clientRetention?.rate || 0}%</p>
            <p className="text-xs text-gray-600">Taux de rétention</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">+{stats.clientRetention?.newClients || 0}</p>
            <p className="text-xs text-gray-600">Nouveaux clients</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">-{stats.clientRetention?.lostClients || 0}</p>
            <p className="text-xs text-gray-600">Clients perdus</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.clientRetention?.averageVisitsPerClient || 0}</p>
            <p className="text-xs text-gray-600">Visites/client</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.clientRetention?.timeBetweenVisits || 0}j</p>
            <p className="text-xs text-gray-600">Entre visites</p>
          </div>
        </div>
      </div>

      {/* Performance Marketing */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-500" />
            Performance Marketing
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Mail className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{stats.marketingPerformance?.emailOpenRate || 0}%</p>
            <p className="text-xs text-gray-600">Taux ouverture</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <MousePointer className="w-5 h-5 text-purple-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{stats.marketingPerformance?.emailClickRate || 0}%</p>
            <p className="text-xs text-gray-600">Taux de clic</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <MessageCircle className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{stats.marketingPerformance?.whatsappReadRate || 0}%</p>
            <p className="text-xs text-gray-600">WhatsApp lu</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <MessageCircle className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{stats.marketingPerformance?.whatsappResponseRate || 0}%</p>
            <p className="text-xs text-gray-600">WhatsApp réponse</p>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <Target className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{stats.marketingPerformance?.campaignConversion || 0}%</p>
            <p className="text-xs text-gray-600">Conversion</p>
          </div>
        </div>
      </div>
    </div>
  );
}