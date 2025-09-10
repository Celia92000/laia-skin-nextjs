'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, Euro, Award } from 'lucide-react';

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
  };
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  recurringClients: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const monthGrowth = stats.revenue.lastMonth > 0
    ? ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Cartes principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Réservations du mois</h3>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.reservations.thisMonth}</div>
            <p className="text-xs text-gray-500">
              {stats.reservations.today} aujourd'hui
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Chiffre d'affaires (mois)</h3>
            <Euro className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.revenue.thisMonth.toFixed(2)} €</div>
            <p className="text-xs text-gray-500 flex items-center">
              {Number(monthGrowth) > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">Croissance</span>
                </>
              ) : Number(monthGrowth) < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600">Baisse</span>
                </>
              ) : (
                <span>Stable</span>
              )}
              <span className="ml-1">vs mois dernier</span>
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

      {/* Top services */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold">Services les plus populaires</h3>
        </div>
        <div>
          <div className="space-y-4">
            {stats.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-500">{service.count} réservations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{service.revenue.toFixed(2)} €</p>
                  <p className="text-sm text-gray-500">CA généré</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique des 7 derniers jours */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold">Activité des 7 derniers jours</h3>
        </div>
        <div>
          <div className="space-y-2">
            {stats.dailyStats.map((day) => {
              const date = new Date(day._id);
              const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
              const maxRevenue = Math.max(...stats.dailyStats.map(d => d.revenue));
              const barWidth = maxRevenue > 0 ? (day.revenue / maxRevenue * 100) : 0;
              
              return (
                <div key={day._id} className="flex items-center space-x-4">
                  <div className="w-24 text-sm">{dayName}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div 
                          className="bg-rose-500 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${barWidth}%` }}
                        >
                          {day.revenue > 0 && (
                            <span className="text-xs text-white font-medium">
                              {day.revenue.toFixed(0)}€
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 w-16 text-right">
                        {day.count} rés.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Statuts des réservations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="pb-4">
          <h3 className="text-lg font-semibold">État des réservations</h3>
        </div>
        <div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.reservations.pending}</div>
              <p className="text-sm text-gray-500">En attente</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.reservations.confirmed}</div>
              <p className="text-sm text-gray-500">Confirmées</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.reservations.cancelled}</div>
              <p className="text-sm text-gray-500">Annulées</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}