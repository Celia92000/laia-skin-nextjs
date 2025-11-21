'use client';

/**
 * Onglet Cartes Cadeaux - Toujours accessible (partie du programme de fidélité)
 * Affiche uniquement les commandes de type 'giftcard'
 */

import AdminOrdersTab from './AdminOrdersTab';

export default function AdminGiftCardsTab() {
  return <AdminOrdersTab filterType="giftcard" />;
}
