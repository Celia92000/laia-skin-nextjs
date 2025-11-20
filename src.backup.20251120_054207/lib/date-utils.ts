/**
 * Utilitaires pour gérer correctement les dates UTC/local
 * Évite les problèmes de conversion de fuseau horaire
 */

/**
 * Convertit une date UTC de la base de données en format YYYY-MM-DD ou YYYY-MM-DDTHH:MM local
 * @param utcDateString Date en format ISO string (ex: "2025-10-14T22:00:00.000Z")
 * @param includeTime Si true, retourne YYYY-MM-DDTHH:MM, sinon YYYY-MM-DD
 * @returns Date au format local (ex: "2025-10-15" ou "2025-10-15T14:30")
 */
export function formatDateLocal(utcDateString: string | Date, includeTime: boolean = false): string {
  const dateObj = new Date(utcDateString);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Convertit une date locale en Date UTC pour la base de données
 * @param localDateString Date locale au format YYYY-MM-DD
 * @returns Date object en UTC
 */
export function parseLocalDate(localDateString: string): Date {
  const [year, month, day] = localDateString.split('-').map(Number);
  // Créer une date en heure locale (pas UTC)
  return new Date(year, month - 1, day);
}

/**
 * Formate une date pour l'affichage en français
 * @param date Date string ou Date object
 * @returns Date formatée (ex: "15 octobre 2025")
 */
export function formatDateFrench(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formate une date et heure pour l'affichage en français
 * @param date Date string ou Date object
 * @param time Heure au format HH:MM
 * @returns Date et heure formatées (ex: "15 octobre 2025 à 14h30")
 */
export function formatDateTimeFrench(date: string | Date, time?: string): string {
  const formatted = formatDateFrench(date);
  if (time) {
    const [hour, minute] = time.split(':');
    return `${formatted} à ${hour}h${minute}`;
  }
  return formatted;
}

/**
 * Compare deux dates (ignore l'heure)
 * @param date1 Première date
 * @param date2 Deuxième date
 * @returns true si les dates sont le même jour
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  return formatDateLocal(date1) === formatDateLocal(date2);
}

/**
 * Convertit une date ISO en date locale sans décalage horaire
 * ATTENTION: À utiliser uniquement pour l'affichage, pas pour les calculs
 * @param isoString Date ISO (ex: "2025-10-14T22:00:00.000Z")
 * @returns Date en heure locale
 */
export function toLocalDate(isoString: string): Date {
  return new Date(isoString);
}
