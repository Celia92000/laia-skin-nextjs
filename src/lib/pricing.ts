export interface ServicePricing {
  name: string;
  duration: string;
  classicPrice: number;
  launchPrice: number;
  package4Classic: number;
  package4Launch: number;
  canBeOption?: boolean;
}

export const servicePricing: Record<string, ServicePricing> = {
  "hydro-naissance": {
    name: "Hydro'Naissance",
    duration: "1h30",
    classicPrice: 120,
    launchPrice: 99,
    package4Classic: 440,
    package4Launch: 390
  },
  "hydro": {
    name: "Hydro'Cleaning",
    duration: "1h",
    classicPrice: 90,
    launchPrice: 70,
    package4Classic: 340,
    package4Launch: 260
  },
  "renaissance": {
    name: "Renaissance",
    duration: "1h15",
    classicPrice: 90,
    launchPrice: 70,
    package4Classic: 340,
    package4Launch: 260
  },
  "bbglow": {
    name: "BB Glow",
    duration: "1h",
    classicPrice: 70,
    launchPrice: 50,
    package4Classic: 240,
    package4Launch: 260,
    canBeOption: true
  },
  "led": {
    name: "LED Thérapie",
    duration: "45min",
    classicPrice: 70,
    launchPrice: 50,
    package4Classic: 240,
    package4Launch: 260,
    canBeOption: true
  }
};

// Fonction pour obtenir le prix actuel (lancement par défaut)
export function getCurrentPrice(serviceId: string, useLaunchPrice: boolean = true): number {
  const service = servicePricing[serviceId];
  if (!service) return 0;
  return useLaunchPrice ? service.launchPrice : service.classicPrice;
}

// Fonction pour obtenir le prix du forfait
export function getPackagePrice(serviceId: string, useLaunchPrice: boolean = true): number {
  const service = servicePricing[serviceId];
  if (!service) return 0;
  return useLaunchPrice ? service.package4Launch : service.package4Classic;
}

// Fonction pour calculer le prix total d'une réservation
export function calculateTotalPrice(services: string[], useLaunchPrice: boolean = true): number {
  return services.reduce((total, serviceId) => {
    return total + getCurrentPrice(serviceId, useLaunchPrice);
  }, 0);
}

// Fonction pour formater le prix avec les détails
export function formatPriceDetails(serviceId: string, useLaunchPrice: boolean = true): string {
  const service = servicePricing[serviceId];
  if (!service) return "";
  
  const price = useLaunchPrice ? service.launchPrice : service.classicPrice;
  const type = useLaunchPrice ? "lancement" : "classique";
  
  return `${service.duration} • ${price}€ (${type})`;
}