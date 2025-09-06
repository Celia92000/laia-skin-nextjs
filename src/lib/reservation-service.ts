// Service pour gérer les réservations et éviter les doubles réservations
import { format, addMinutes, isWithinInterval, parseISO } from 'date-fns';

export interface Reservation {
  id: string;
  client: string;
  clientId: string;
  email: string;
  telephone: string;
  service: string;
  date: string;
  heure: string;
  duree: number;
  prix: number;
  status: 'confirmee' | 'en_attente' | 'terminee' | 'annulee';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface Service {
  id: string;
  nom: string;
  duree: number;
  prix: number;
}

// Services disponibles
export const SERVICES: Service[] = [
  { id: '1', nom: 'LAIA Hydro\'Cleaning', duree: 60, prix: 90 },
  { id: '2', nom: 'LAIA Renaissance', duree: 75, prix: 120 },
  { id: '3', nom: 'BB Glow', duree: 90, prix: 150 },
  { id: '4', nom: 'LED Thérapie', duree: 45, prix: 70 },
  { id: '5', nom: 'Hydroneedling VIP', duree: 120, prix: 200 }
];

// Heures d'ouverture
export const BUSINESS_HOURS = {
  start: 9, // 9h00
  end: 19, // 19h00
  slotDuration: 30, // Créneaux de 30 minutes
  workDays: [1, 2, 3, 4, 5, 6] // Lundi à Samedi (0 = Dimanche)
};

// Stockage local simulé (remplacer par Supabase plus tard)
let reservations: Reservation[] = [
  {
    id: 'RES001',
    client: 'Sophie Martin',
    clientId: 'CLIENT001',
    email: 'sophie.martin@email.com',
    telephone: '06 12 34 56 78',
    service: 'LAIA Hydro\'Cleaning',
    date: '2024-02-15',
    heure: '10:00',
    duree: 60,
    prix: 90,
    status: 'confirmee',
    notes: '',
    createdAt: '2024-02-01T10:00:00',
    updatedAt: '2024-02-01T10:00:00'
  }
];

// Vérifier si un créneau est disponible
export function isSlotAvailable(date: string, time: string, duration: number): boolean {
  const requestedStart = parseISO(`${date}T${time}`);
  const requestedEnd = addMinutes(requestedStart, duration);

  // Vérifier les réservations existantes
  for (const reservation of reservations) {
    if (reservation.status === 'annulee') continue;
    if (reservation.date !== date) continue;

    const existingStart = parseISO(`${reservation.date}T${reservation.heure}`);
    const existingEnd = addMinutes(existingStart, reservation.duree);

    // Vérifier le chevauchement
    const hasOverlap = 
      (requestedStart >= existingStart && requestedStart < existingEnd) ||
      (requestedEnd > existingStart && requestedEnd <= existingEnd) ||
      (requestedStart <= existingStart && requestedEnd >= existingEnd);

    if (hasOverlap) {
      return false;
    }
  }

  return true;
}

// Obtenir les créneaux disponibles pour une date
export function getAvailableSlots(date: string, serviceDuration: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dayOfWeek = new Date(date).getDay();
  
  // Vérifier si c'est un jour ouvré
  if (!BUSINESS_HOURS.workDays.includes(dayOfWeek)) {
    return [];
  }

  // Générer tous les créneaux possibles
  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
    for (let minute = 0; minute < 60; minute += BUSINESS_HOURS.slotDuration) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Vérifier que le service ne dépasse pas l'heure de fermeture
      const slotEnd = hour * 60 + minute + serviceDuration;
      const closingTime = BUSINESS_HOURS.end * 60;
      
      if (slotEnd > closingTime) {
        slots.push({
          time,
          available: false,
          reason: 'Dépasse l\'heure de fermeture'
        });
        continue;
      }

      // Vérifier la disponibilité
      const available = isSlotAvailable(date, time, serviceDuration);
      slots.push({
        time,
        available,
        reason: available ? undefined : 'Créneau déjà réservé'
      });
    }
  }

  return slots;
}

// Créer une nouvelle réservation
export async function createReservation(data: {
  client: string;
  clientId: string;
  email: string;
  telephone: string;
  service: string;
  date: string;
  heure: string;
  notes?: string;
}): Promise<{ success: boolean; reservation?: Reservation; error?: string }> {
  // Trouver le service pour obtenir la durée et le prix
  const serviceInfo = SERVICES.find(s => s.nom === data.service);
  if (!serviceInfo) {
    return { success: false, error: 'Service non trouvé' };
  }

  // Vérifier la disponibilité
  if (!isSlotAvailable(data.date, data.heure, serviceInfo.duree)) {
    return { success: false, error: 'Ce créneau n\'est plus disponible' };
  }

  // Créer la réservation
  const reservation: Reservation = {
    id: `RES${Date.now()}`,
    ...data,
    duree: serviceInfo.duree,
    prix: serviceInfo.prix,
    status: 'confirmee',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Ajouter à la liste (simuler la base de données)
  reservations.push(reservation);

  return { success: true, reservation };
}

// Obtenir toutes les réservations
export function getAllReservations(): Reservation[] {
  return reservations;
}

// Obtenir les réservations d'un client
export function getClientReservations(clientId: string): Reservation[] {
  return reservations.filter(r => r.clientId === clientId);
}

// Obtenir les réservations pour une date
export function getReservationsByDate(date: string): Reservation[] {
  return reservations.filter(r => r.date === date);
}

// Annuler une réservation
export async function cancelReservation(id: string): Promise<{ success: boolean; error?: string }> {
  const reservation = reservations.find(r => r.id === id);
  
  if (!reservation) {
    return { success: false, error: 'Réservation non trouvée' };
  }

  if (reservation.status === 'annulee') {
    return { success: false, error: 'Réservation déjà annulée' };
  }

  // Vérifier si c'est possible d'annuler (par exemple, 24h avant)
  const reservationDate = parseISO(`${reservation.date}T${reservation.heure}`);
  const now = new Date();
  const hoursUntilReservation = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilReservation < 24) {
    return { success: false, error: 'Annulation impossible moins de 24h avant le rendez-vous' };
  }

  // Annuler la réservation
  reservation.status = 'annulee';
  reservation.updatedAt = new Date().toISOString();

  return { success: true };
}

// Mettre à jour le statut d'une réservation
export async function updateReservationStatus(
  id: string, 
  status: Reservation['status']
): Promise<{ success: boolean; error?: string }> {
  const reservation = reservations.find(r => r.id === id);
  
  if (!reservation) {
    return { success: false, error: 'Réservation non trouvée' };
  }

  reservation.status = status;
  reservation.updatedAt = new Date().toISOString();

  return { success: true };
}

// Obtenir les statistiques
export function getStats() {
  const total = reservations.length;
  const confirmees = reservations.filter(r => r.status === 'confirmee').length;
  const en_attente = reservations.filter(r => r.status === 'en_attente').length;
  const terminee = reservations.filter(r => r.status === 'terminee').length;
  const annulee = reservations.filter(r => r.status === 'annulee').length;
  
  const revenue = reservations
    .filter(r => r.status === 'confirmee' || r.status === 'terminee')
    .reduce((sum, r) => sum + r.prix, 0);

  return {
    total,
    confirmees,
    en_attente,
    terminee,
    annulee,
    revenue
  };
}