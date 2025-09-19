'use client';

import { useMemo } from 'react';
import { Globe, Phone, Instagram, MessageCircle, Users, MapPin, MoreHorizontal, TrendingUp } from 'lucide-react';

interface Reservation {
  id: string;
  source?: string;
  status: string;
  totalPrice: number;
  date: Date | string;
}

interface SourceStatsProps {
  reservations: Reservation[];
}

const sourceIcons: Record<string, any> = {
  website: Globe,
  site: Globe,
  phone: Phone,
  instagram: Instagram,
  tiktok: MessageCircle,
  facebook: Users,
  walkin: MapPin,
  other: MoreHorizontal
};

const sourceColors: Record<string, string> = {
  website: 'from-blue-500 to-blue-600',
  site: 'from-blue-500 to-blue-600',
  phone: 'from-green-500 to-green-600',
  instagram: 'from-pink-500 to-purple-600',
  tiktok: 'from-gray-800 to-black',
  facebook: 'from-blue-600 to-blue-700',
  walkin: 'from-orange-500 to-red-500',
  other: 'from-gray-500 to-gray-600'
};

const sourceLabels: Record<string, string> = {
  website: 'Site Web',
  site: 'Site Web',
  phone: 'Téléphone',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  walkin: 'Sur place',
  other: 'Autre'
};

export default function SourceStats({ reservations }: SourceStatsProps) {
  const sourceStats = useMemo(() => {
    // Grouper par source
    const stats: Record<string, { count: number; revenue: number; conversion: number }> = {};
    
    reservations.forEach(reservation => {
      const source = reservation.source || 'site';
      
      if (!stats[source]) {
        stats[source] = { count: 0, revenue: 0, conversion: 0 };
      }
      
      stats[source].count++;
      
      // Comptabiliser uniquement les réservations confirmées/terminées pour le CA
      if (reservation.status !== 'cancelled' && reservation.status !== 'pending') {
        stats[source].revenue += reservation.totalPrice;
      }
    });
    
    // Calculer le taux de conversion
    Object.keys(stats).forEach(source => {
      const confirmed = reservations.filter(r => 
        r.source === source && 
        (r.status === 'confirmed' || r.status === 'completed')
      ).length;
      
      stats[source].conversion = stats[source].count > 0 
        ? Math.round((confirmed / stats[source].count) * 100)
        : 0;
    });
    
    // Trier par nombre de réservations
    const sorted = Object.entries(stats)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([source, data]) => ({ source, ...data }));
    
    return sorted;
  }, [reservations]);

  const totalReservations = sourceStats.reduce((sum, s) => sum + s.count, 0);
  const totalRevenue = sourceStats.reduce((sum, s) => sum + s.revenue, 0);

  // Calculer le meilleur canal
  const bestChannel = sourceStats[0];
  const bestConversionChannel = [...sourceStats].sort((a, b) => b.conversion - a.conversion)[0];

  return (
    <div className="space-y-6">
      {/* Titre de section */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#2c3e50] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#d4b5a0]" />
          Analyse des Sources d'Acquisition
        </h3>
        <div className="text-sm text-gray-500">
          {totalReservations} réservations | {totalRevenue}€ générés
        </div>
      </div>

      {/* Statistiques clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Meilleur canal</span>
            {bestChannel && React.createElement(sourceIcons[bestChannel.source] || Globe, {
              className: "w-5 h-5 text-blue-600"
            })}
          </div>
          <p className="text-xl font-bold text-blue-600">
            {bestChannel ? sourceLabels[bestChannel.source] || bestChannel.source : '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {bestChannel ? `${bestChannel.count} réservations` : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Meilleur taux conversion</span>
            {bestConversionChannel && React.createElement(sourceIcons[bestConversionChannel.source] || Globe, {
              className: "w-5 h-5 text-green-600"
            })}
          </div>
          <p className="text-xl font-bold text-green-600">
            {bestConversionChannel ? `${bestConversionChannel.conversion}%` : '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {bestConversionChannel ? sourceLabels[bestConversionChannel.source] || bestConversionChannel.source : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Canaux actifs</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-purple-600">{sourceStats.length}</p>
          <p className="text-xs text-gray-500 mt-1">sources différentes</p>
        </div>
      </div>

      {/* Détail par source */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700">Performance par Canal</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {sourceStats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune donnée disponible
            </div>
          ) : (
            sourceStats.map(({ source, count, revenue, conversion }) => {
              const Icon = sourceIcons[source] || Globe;
              const percentage = totalReservations > 0 ? (count / totalReservations * 100).toFixed(1) : 0;
              
              return (
                <div key={source} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${sourceColors[source] || 'from-gray-500 to-gray-600'}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {sourceLabels[source] || source}
                        </p>
                        <p className="text-sm text-gray-500">
                          {count} réservation{count > 1 ? 's' : ''} ({percentage}%)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 items-center">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">CA généré</p>
                        <p className="font-semibold text-gray-900">{revenue}€</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Conversion</p>
                        <p className={`font-semibold ${
                          conversion >= 70 ? 'text-green-600' : 
                          conversion >= 50 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {conversion}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${sourceColors[source] || 'from-gray-500 to-gray-600'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Graphique mensuel par source (optionnel) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Évolution ce mois</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sourceStats.slice(0, 4).map(({ source, count }) => {
            const Icon = sourceIcons[source] || Globe;
            return (
              <div key={source} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{sourceLabels[source] || source}:</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Ajout de React pour éviter l'erreur de compilation
import React from 'react';