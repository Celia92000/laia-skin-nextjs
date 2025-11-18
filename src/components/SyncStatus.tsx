'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { dataSync } from '@/lib/data-sync';

export default function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState(0);

  useEffect(() => {
    // Vérifier la connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouter les mises à jour de synchronisation
    dataSync.onUpdate((update) => {
      setSyncStatus('syncing');
      setPendingUpdates(prev => prev + 1);
      
      // Simuler la fin de la synchronisation
      setTimeout(() => {
        setSyncStatus('synced');
        setLastSync(new Date());
        setPendingUpdates(prev => Math.max(0, prev - 1));
      }, 1000);
    });

    // Vérifier périodiquement l'état
    const interval = setInterval(() => {
      // Ici on pourrait faire un ping à l'API pour vérifier la connexion
      setLastSync(new Date());
    }, 60000); // Toutes les minutes

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const formatLastSync = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
    
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return `Il y a ${Math.floor(diff / 86400)} j`;
  };

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    
    try {
      // Déclencher une synchronisation manuelle de toutes les données
      const types = ['reservation', 'client', 'statistics', 'dashboard', 'service', 'loyalty'];
      
      for (const type of types) {
        dataSync.emitUpdate(type, { needsRefresh: true });
        await new Promise(resolve => setTimeout(resolve, 200)); // Petit délai entre les requêtes
      }
      
      setSyncStatus('synced');
      setLastSync(new Date());
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setSyncStatus('error');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-3">
        {/* Indicateur de connexion */}
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </div>

        {/* État de synchronisation */}
        <div className="flex items-center space-x-2">
          {syncStatus === 'synced' && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-600">Synchronisé</span>
            </>
          )}
          {syncStatus === 'syncing' && (
            <>
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-xs text-gray-600">Synchronisation...</span>
            </>
          )}
          {syncStatus === 'error' && (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-600">Erreur</span>
            </>
          )}
        </div>

        {/* Dernière synchronisation */}
        <span className="text-xs text-gray-500">{formatLastSync()}</span>

        {/* Mises à jour en attente */}
        {pendingUpdates > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
            {pendingUpdates}
          </span>
        )}

        {/* Bouton de synchronisation manuelle */}
        <button
          onClick={handleManualSync}
          disabled={syncStatus === 'syncing'}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Synchroniser maintenant"
        >
          <RefreshCw 
            className={`w-4 h-4 text-gray-600 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>
    </div>
  );
}