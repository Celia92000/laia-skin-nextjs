import { getSiteConfig } from './config-service';

export interface PaymentMethods {
  stripe: boolean;
  cash: boolean;
  check: boolean;
  transfer: boolean;
  paypal: boolean;
}

/**
 * Récupère les modes de paiement activés
 */
export async function getEnabledPaymentMethods(): Promise<PaymentMethods> {
  try {
    const config = await getSiteConfig();

    if (config.paymentMethods) {
      const methods = typeof config.paymentMethods === 'string'
        ? JSON.parse(config.paymentMethods)
        : config.paymentMethods;

      return methods;
    }

    // Valeurs par défaut si non configuré
    return {
      stripe: true,
      cash: true,
      check: true,
      transfer: false,
      paypal: false
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des modes de paiement:', error);
    // Retourner les valeurs par défaut en cas d'erreur
    return {
      stripe: true,
      cash: true,
      check: true,
      transfer: false,
      paypal: false
    };
  }
}

/**
 * Vérifie si un mode de paiement spécifique est activé
 */
export async function isPaymentMethodEnabled(method: keyof PaymentMethods): Promise<boolean> {
  const methods = await getEnabledPaymentMethods();
  return methods[method] || false;
}

/**
 * Récupère la liste des modes de paiement activés sous forme de tableau
 */
export async function getActivePaymentMethodsList(): Promise<Array<{key: string, label: string}>> {
  const methods = await getEnabledPaymentMethods();

  const allMethods = [
    { key: 'stripe', label: 'Carte bancaire (Stripe)', enabled: methods.stripe },
    { key: 'cash', label: 'Espèces', enabled: methods.cash },
    { key: 'check', label: 'Chèque', enabled: methods.check },
    { key: 'transfer', label: 'Virement bancaire', enabled: methods.transfer },
    { key: 'paypal', label: 'PayPal', enabled: methods.paypal }
  ];

  return allMethods
    .filter(m => m.enabled)
    .map(m => ({ key: m.key, label: m.label }));
}
