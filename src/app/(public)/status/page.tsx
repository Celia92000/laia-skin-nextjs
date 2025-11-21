'use client';

import { useEffect, useState } from 'react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  message?: string;
}

interface StatusData {
  status: 'operational' | 'degraded' | 'down';
  timestamp: string;
  services: ServiceStatus[];
  uptime: string;
}

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatusData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Tous les systèmes sont opérationnels';
      case 'degraded':
        return 'Performances dégradées';
      case 'down':
        return 'Incident en cours';
      default:
        return 'Statut inconnu';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-700';
      case 'degraded':
        return 'text-yellow-700';
      case 'down':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'down':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Statut de LAIA Connect
          </h1>
          <p className="text-gray-600">
            État actuel des services et de la plateforme
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Statut global */}
            <div className={`bg-white rounded-lg shadow-lg p-8 mb-8 border-2 ${statusData ? getStatusBgColor(statusData.status) : ''}`}>
              <div className="flex items-center justify-center mb-4">
                <div className={`w-4 h-4 rounded-full ${statusData ? getStatusColor(statusData.status) : 'bg-gray-500'} mr-3 animate-pulse`}></div>
                <h2 className={`text-2xl font-bold ${statusData ? getStatusTextColor(statusData.status) : 'text-gray-700'}`}>
                  {statusData ? getStatusText(statusData.status) : 'Chargement...'}
                </h2>
              </div>
              <div className="text-center text-gray-600 text-sm">
                Dernière mise à jour : {lastUpdate.toLocaleString('fr-FR')}
              </div>
            </div>

            {/* Uptime */}
            {statusData && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Disponibilité</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Uptime (30 derniers jours)</span>
                  <span className="text-2xl font-bold text-green-600">{statusData.uptime}</span>
                </div>
              </div>
            )}

            {/* Services */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">État des services</h3>
              <div className="space-y-4">
                {statusData?.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)} mr-3`}></div>
                      <div>
                        <div className="font-semibold text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-600">{service.message}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {service.responseTime !== undefined && (
                        <div className="text-sm text-gray-600">
                          {service.responseTime}ms
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historique des incidents (vide pour l'instant) */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Historique des incidents</h3>
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-medium">Aucun incident récent</p>
                <p className="text-sm mt-2">Tous les services fonctionnent normalement</p>
              </div>
            </div>

            {/* Maintenance planifiée */}
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Maintenance planifiée</h3>
              <div className="text-center text-gray-500 py-8">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg font-medium">Aucune maintenance prévue</p>
                <p className="text-sm mt-2">Nous vous informerons de toute intervention planifiée</p>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Des questions ? Contactez notre support technique
          </p>
          <a
            href="mailto:support@laiaconnect.fr"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            support@laiaconnect.fr
          </a>
          <p className="text-sm text-gray-500 mt-4">
            © {new Date().getFullYear()} LAIA Connect - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}
