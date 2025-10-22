/**
 * Affiche le montant d'une réservation ou paiement
 * Priorité : paymentAmount > totalPrice
 * Si paymentAmount existe et diffère de totalPrice, affiche les deux
 */
export function displayPaymentAmount(
  paymentAmount: number | null | undefined,
  totalPrice: number | null | undefined,
  options?: {
    showTotal?: boolean; // Afficher "(sur XX€)" si différent
    decimals?: number;   // Nombre de décimales (défaut: 2)
  }
): {
  main: string;        // Montant principal à afficher
  sub?: string;        // Texte secondaire optionnel
  amount: number;      // Valeur numérique
} {
  const decimals = options?.decimals ?? 2;
  const showTotal = options?.showTotal ?? true;

  // Déterminer le montant à afficher
  const amount = paymentAmount ?? totalPrice ?? 0;
  const main = amount.toFixed(decimals) + '€';

  // Si paymentAmount existe ET est différent de totalPrice
  if (showTotal && paymentAmount && totalPrice && paymentAmount !== totalPrice) {
    return {
      main,
      sub: `(sur ${totalPrice.toFixed(decimals)}€)`,
      amount
    };
  }

  return { main, amount };
}

/**
 * Version simple pour JSX inline
 */
export function formatPaymentAmount(
  paymentAmount: number | null | undefined,
  totalPrice: number | null | undefined
): string {
  return displayPaymentAmount(paymentAmount, totalPrice).main;
}
