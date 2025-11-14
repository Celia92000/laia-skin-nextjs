/**
 * Configuration des forfaits SMS prépayés
 * Prix basés sur le tarif Brevo : 0.035€/SMS
 */

export interface SMSPackage {
  id: string
  name: string
  description: string
  credits: number // Nombre de SMS
  price: number // Prix en euros
  pricePerSMS: number // Prix unitaire
  popular?: boolean // Badge "Populaire"
  savings?: string // Économie par rapport au prix unitaire
  stripePriceId?: string // ID du prix Stripe
}

export const SMS_PACKAGES: SMSPackage[] = [
  {
    id: 'pack-100',
    name: 'Pack Starter',
    description: 'Idéal pour démarrer',
    credits: 100,
    price: 5,
    pricePerSMS: 0.05,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_SMS_PACK_100
  },
  {
    id: 'pack-500',
    name: 'Pack Business',
    description: 'Pour les campagnes régulières',
    credits: 500,
    price: 20,
    pricePerSMS: 0.04,
    popular: true,
    savings: '-20%',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_SMS_PACK_500
  },
  {
    id: 'pack-1000',
    name: 'Pack Premium',
    description: 'Meilleur rapport qualité/prix',
    credits: 1000,
    price: 35,
    pricePerSMS: 0.035,
    savings: '-30%',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_SMS_PACK_1000
  },
  {
    id: 'pack-5000',
    name: 'Pack Entreprise',
    description: 'Pour les gros volumes',
    credits: 5000,
    price: 150,
    pricePerSMS: 0.03,
    savings: '-40%',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_SMS_PACK_5000
  }
]

/**
 * Récupère un forfait par son ID
 */
export function getPackageById(id: string): SMSPackage | undefined {
  return SMS_PACKAGES.find(pkg => pkg.id === id)
}

/**
 * Récupère le forfait le plus avantageux pour un nombre de SMS donné
 */
export function getBestPackageForCredits(credits: number): SMSPackage {
  // Trouver le forfait qui offre au moins le nombre de SMS demandé
  const suitable = SMS_PACKAGES.filter(pkg => pkg.credits >= credits)

  // Si aucun forfait n'est assez grand, retourner le plus grand
  if (suitable.length === 0) {
    return SMS_PACKAGES[SMS_PACKAGES.length - 1]
  }

  // Sinon, retourner le moins cher par SMS
  return suitable.reduce((best, current) =>
    current.pricePerSMS < best.pricePerSMS ? current : best
  )
}

/**
 * Calcule le coût total pour un nombre de SMS donné
 */
export function calculateCost(smsCount: number): {
  package: SMSPackage
  totalCost: number
  savings: number
} {
  const bestPackage = getBestPackageForCredits(smsCount)
  const totalCost = bestPackage.price
  const baseCost = smsCount * 0.05 // Prix unitaire de base
  const savings = baseCost - totalCost

  return {
    package: bestPackage,
    totalCost,
    savings: Math.max(0, savings)
  }
}
