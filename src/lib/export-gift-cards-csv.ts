interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  initialAmount?: number;
  purchasedBy?: string;
  purchasedFor?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  message?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt: string;
  expiryDate?: string;
  usedDate?: string;
  notes?: string;
  purchaser?: {
    id: string;
    name: string;
    email: string;
  };
  reservations?: any[];
}

/**
 * Convertit un tableau de cartes cadeaux en CSV
 */
export function convertGiftCardsToCSV(giftCards: GiftCard[]): string {
  // Vérifier que giftCards est un tableau
  const safeGiftCards = Array.isArray(giftCards) ? giftCards : [];

  // En-têtes du CSV
  const headers = [
    'Code',
    'Montant initial',
    'Solde restant',
    'Montant utilisé',
    'Statut',
    'Statut paiement',
    'Méthode paiement',
    'Acheté par',
    'Email acheteur',
    'Bénéficiaire',
    'Email bénéficiaire',
    'Téléphone',
    'Message',
    'Date de création',
    'Date d\'expiration',
    'Date d\'utilisation',
    'Nombre d\'utilisations',
    'Notes'
  ];

  // Fonction pour échapper les valeurs CSV (guillemets et virgules)
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);

    // Si la valeur contient des guillemets, virgules, ou sauts de ligne
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
      // Échapper les guillemets en les doublant et entourer de guillemets
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  // Fonction pour formater les dates
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Traduire les statuts
  const translateStatus = (status: string): string => {
    const translations: { [key: string]: string } = {
      'active': 'Active',
      'used': 'Utilisée',
      'expired': 'Expirée',
      'cancelled': 'Annulée',
      'pending': 'En attente',
      'paid': 'Payée'
    };
    return translations[status] || status;
  };

  // Créer les lignes CSV
  const rows = safeGiftCards.map(card => {
    const usedAmount = card.amount - card.balance;
    const usageCount = card.reservations?.length || 0;

    return [
      escapeCSV(card.code),
      escapeCSV(card.amount.toFixed(2)),
      escapeCSV(card.balance.toFixed(2)),
      escapeCSV(usedAmount.toFixed(2)),
      escapeCSV(translateStatus(card.status)),
      escapeCSV(card.paymentStatus ? translateStatus(card.paymentStatus) : ''),
      escapeCSV(card.paymentMethod || ''),
      escapeCSV(card.purchaser?.name || card.purchasedBy || ''),
      escapeCSV(card.purchaser?.email || ''),
      escapeCSV(card.purchasedFor || ''),
      escapeCSV(card.recipientEmail || ''),
      escapeCSV(card.recipientPhone || ''),
      escapeCSV(card.message || ''),
      escapeCSV(formatDate(card.createdAt)),
      escapeCSV(formatDate(card.expiryDate)),
      escapeCSV(formatDate(card.usedDate)),
      escapeCSV(usageCount),
      escapeCSV(card.notes || '')
    ].join(',');
  });

  // Joindre en-têtes et lignes
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Télécharge les cartes cadeaux en fichier CSV
 */
export function downloadGiftCardsCSV(giftCards: GiftCard[], filename?: string) {
  const csv = convertGiftCardsToCSV(giftCards);

  // Ajouter le BOM UTF-8 pour Excel
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csv;

  // Créer un blob
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });

  // Créer un lien de téléchargement
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename || `Cartes_Cadeaux_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Libérer l'URL
  URL.revokeObjectURL(url);
}

/**
 * Convertit les cartes cadeaux en format Excel (TSV pour meilleure compatibilité)
 */
export function downloadGiftCardsExcel(giftCards: GiftCard[], filename?: string) {
  // Vérifier que giftCards est un tableau
  const safeGiftCards = Array.isArray(giftCards) ? giftCards : [];

  // Pour Excel, on utilise des tabulations au lieu de virgules
  const headers = [
    'Code',
    'Montant initial',
    'Solde restant',
    'Montant utilisé',
    'Statut',
    'Statut paiement',
    'Méthode paiement',
    'Acheté par',
    'Email acheteur',
    'Bénéficiaire',
    'Email bénéficiaire',
    'Téléphone',
    'Message',
    'Date de création',
    'Date d\'expiration',
    'Date d\'utilisation',
    'Nombre d\'utilisations',
    'Notes'
  ];

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const translateStatus = (status: string): string => {
    const translations: { [key: string]: string } = {
      'active': 'Active',
      'used': 'Utilisée',
      'expired': 'Expirée',
      'cancelled': 'Annulée',
      'pending': 'En attente',
      'paid': 'Payée'
    };
    return translations[status] || status;
  };

  const rows = safeGiftCards.map(card => {
    const usedAmount = card.amount - card.balance;
    const usageCount = card.reservations?.length || 0;

    return [
      card.code,
      card.amount.toFixed(2),
      card.balance.toFixed(2),
      usedAmount.toFixed(2),
      translateStatus(card.status),
      card.paymentStatus ? translateStatus(card.paymentStatus) : '',
      card.paymentMethod || '',
      card.purchaser?.name || card.purchasedBy || '',
      card.purchaser?.email || '',
      card.purchasedFor || '',
      card.recipientEmail || '',
      card.recipientPhone || '',
      card.message || '',
      formatDate(card.createdAt),
      formatDate(card.expiryDate),
      formatDate(card.usedDate),
      usageCount,
      card.notes || ''
    ].join('\t');
  });

  const tsv = [headers.join('\t'), ...rows].join('\n');

  // Ajouter le BOM UTF-8 pour Excel
  const BOM = '\uFEFF';
  const tsvWithBOM = BOM + tsv;

  // Créer un blob avec type Excel
  const blob = new Blob([tsvWithBOM], { type: 'application/vnd.ms-excel;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename || `Cartes_Cadeaux_${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export statistiques en CSV
 */
export function downloadGiftCardsStatsCSV(giftCards: GiftCard[], filename?: string) {
  // Vérifier que giftCards est un tableau
  const safeGiftCards = Array.isArray(giftCards) ? giftCards : [];

  // Calculer les statistiques
  const total = safeGiftCards.length;
  const totalRevenue = safeGiftCards
    .filter(c => c.paymentStatus === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalUsed = safeGiftCards.reduce((sum, c) => sum + (c.amount - c.balance), 0);
  const active = safeGiftCards.filter(c => c.status === 'active' && c.balance > 0).length;
  const used = safeGiftCards.filter(c => c.balance === 0 || c.status === 'used').length;
  const expired = safeGiftCards.filter(c => c.status === 'expired').length;
  const pending = safeGiftCards.filter(c => c.paymentStatus === 'pending').length;
  const averageAmount = total > 0 ? totalRevenue / total : 0;
  const conversionRate = total > 0 ? (used / total) * 100 : 0;

  // Créer le CSV des statistiques
  const statsCSV = [
    'Statistique,Valeur',
    `Nombre total de cartes,${total}`,
    `Chiffre d'affaires total,${totalRevenue.toFixed(2)}€`,
    `Montant moyen par carte,${averageAmount.toFixed(2)}€`,
    `Montant total utilisé,${totalUsed.toFixed(2)}€`,
    `Cartes actives,${active}`,
    `Cartes utilisées,${used}`,
    `Cartes expirées,${expired}`,
    `Cartes en attente de paiement,${pending}`,
    `Taux d'utilisation,${conversionRate.toFixed(2)}%`
  ].join('\n');

  const BOM = '\uFEFF';
  const csvWithBOM = BOM + statsCSV;

  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename || `Statistiques_Cartes_Cadeaux_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
