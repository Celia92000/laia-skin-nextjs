// Service de synchronisation des données pour assurer la cohérence entre tous les onglets

import { EventEmitter } from 'events';

class DataSyncService extends EventEmitter {
  private static instance: DataSyncService;
  private updateQueue: Map<string, any> = new Map();
  
  private constructor() {
    super();
  }

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  // Émettre une mise à jour globale
  emitUpdate(type: string, data: any) {
    this.emit('dataUpdate', { type, data });
    
    // Mettre à jour la file d'attente
    this.updateQueue.set(type, data);
    
    // Propager aux autres onglets via localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sync_${type}_${Date.now()}`, JSON.stringify(data));
      
      // Nettoyer les anciennes entrées
      setTimeout(() => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(`sync_${type}_`) && !key.endsWith(Date.now().toString())) {
            localStorage.removeItem(key);
          }
        });
      }, 1000);
    }
  }

  // S'abonner aux mises à jour
  onUpdate(callback: (update: { type: string; data: any }) => void) {
    this.on('dataUpdate', callback);
    
    // Écouter les changements localStorage pour la synchronisation entre onglets
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('sync_')) {
          const [, type] = e.key.split('_');
          if (e.newValue) {
            try {
              const data = JSON.parse(e.newValue);
              callback({ type, data });
            } catch (error) {
              console.error('Erreur lors de la synchronisation:', error);
            }
          }
        }
      });
    }
  }

  // Synchroniser une réservation confirmée
  async confirmReservation(reservationId: string, status: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedReservation = await response.json();
        
        // Émettre les mises à jour
        this.emitUpdate('reservation', updatedReservation);
        this.emitUpdate('statistics', { needsRefresh: true });
        this.emitUpdate('dashboard', { needsRefresh: true });
        this.emitUpdate('client', { 
          clientId: updatedReservation.userId,
          needsRefresh: true 
        });
        
        return updatedReservation;
      }
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      throw error;
    }
  }

  // Synchroniser l'ajout d'une nouvelle réservation
  async addReservation(reservationData: any) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservationData)
      });

      if (response.ok) {
        const newReservation = await response.json();
        
        // Émettre les mises à jour
        this.emitUpdate('reservation', newReservation);
        this.emitUpdate('statistics', { needsRefresh: true });
        this.emitUpdate('dashboard', { needsRefresh: true });
        this.emitUpdate('planning', { needsRefresh: true });
        this.emitUpdate('client', { 
          clientId: newReservation.userId,
          needsRefresh: true 
        });
        
        return newReservation;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      throw error;
    }
  }

  // Synchroniser la mise à jour des points de fidélité
  async updateLoyaltyPoints(clientId: string, points: number, reason: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/loyalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clientId, points, reason })
      });

      if (response.ok) {
        const updatedLoyalty = await response.json();
        
        // Émettre les mises à jour
        this.emitUpdate('loyalty', updatedLoyalty);
        this.emitUpdate('client', { 
          clientId,
          loyaltyPoints: updatedLoyalty.points 
        });
        this.emitUpdate('statistics', { needsRefresh: true });
        
        return updatedLoyalty;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des points:', error);
      throw error;
    }
  }

  // Synchroniser la mise à jour d'un service
  async updateService(serviceId: string, serviceData: any) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceData)
      });

      if (response.ok) {
        const updatedService = await response.json();
        
        // Émettre les mises à jour
        this.emitUpdate('service', updatedService);
        this.emitUpdate('statistics', { needsRefresh: true });
        this.emitUpdate('reservations', { needsRefresh: true });
        
        return updatedService;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service:', error);
      throw error;
    }
  }

  // Synchroniser un paiement
  async processPayment(reservationId: string, paymentData: any) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reservations/${reservationId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        const paymentResult = await response.json();
        
        // Émettre les mises à jour
        this.emitUpdate('payment', paymentResult);
        this.emitUpdate('reservation', { 
          reservationId,
          paymentStatus: 'paid' 
        });
        this.emitUpdate('statistics', { 
          revenue: paymentData.amount,
          needsRefresh: true 
        });
        this.emitUpdate('client', { 
          clientId: paymentResult.userId,
          totalSpent: paymentData.amount,
          needsRefresh: true 
        });
        
        return paymentResult;
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      throw error;
    }
  }

  // Récupérer les données en attente
  getPendingUpdate(type: string) {
    return this.updateQueue.get(type);
  }

  // Nettoyer les données en attente
  clearPendingUpdate(type: string) {
    this.updateQueue.delete(type);
  }
}

export const dataSync = DataSyncService.getInstance();