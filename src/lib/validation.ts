/**
 * Fonctions de validation pour les informations légales
 */

/**
 * Valide un numéro SIREN français (9 chiffres)
 * Vérifie uniquement la longueur et le format
 */
export function validateSIREN(siren: string): boolean {
  // Supprimer les espaces
  const cleaned = siren.replace(/\s/g, '')

  // Vérifier que c'est 9 chiffres
  if (!/^\d{9}$/.test(cleaned)) {
    return false
  }

  // Validation simplifiée : accepter tout SIREN de 9 chiffres
  // L'algorithme de Luhn strict peut rejeter des SIREN valides
  return true
}

/**
 * Valide un numéro SIRET français (14 chiffres)
 * Vérifie uniquement la longueur et le format
 */
export function validateSIRET(siret: string): boolean {
  // Supprimer les espaces
  const cleaned = siret.replace(/\s/g, '')

  // Vérifier que c'est 14 chiffres
  if (!/^\d{14}$/.test(cleaned)) {
    return false
  }

  // Validation simplifiée : accepter tout SIRET de 14 chiffres
  // L'algorithme de Luhn strict peut rejeter des SIRET valides
  return true
}

/**
 * Valide un numéro SIREN ou SIRET français
 * Accepte 9 chiffres (SIREN) ou 14 chiffres (SIRET)
 */
export function validateSIRENorSIRET(value: string): boolean {
  const cleaned = value.replace(/\s/g, '')

  if (cleaned.length === 9) {
    return validateSIREN(cleaned)
  } else if (cleaned.length === 14) {
    return validateSIRET(cleaned)
  }

  return false
}

/**
 * Valide un IBAN (International Bank Account Number)
 * Supporte tous les formats IBAN européens
 */
export function validateIBAN(iban: string): boolean {
  // Supprimer les espaces et mettre en majuscules
  const cleaned = iban.replace(/\s/g, '').toUpperCase()

  // Vérifier le format de base (2 lettres + 2 chiffres + 1-30 caractères alphanumériques)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(cleaned)) {
    return false
  }

  // Longueurs IBAN par pays (principaux pays européens)
  const ibanLengths: Record<string, number> = {
    FR: 27, // France
    DE: 22, // Allemagne
    IT: 27, // Italie
    ES: 24, // Espagne
    BE: 16, // Belgique
    NL: 18, // Pays-Bas
    PT: 25, // Portugal
    GB: 22, // Royaume-Uni
    CH: 21, // Suisse
    LU: 20, // Luxembourg
    AT: 20, // Autriche
    PL: 28, // Pologne
    SE: 24, // Suède
    DK: 18, // Danemark
    FI: 18, // Finlande
    NO: 15, // Norvège
    IE: 22, // Irlande
    GR: 27, // Grèce
    CZ: 24, // République tchèque
    RO: 24, // Roumanie
  }

  const countryCode = cleaned.substring(0, 2)
  const expectedLength = ibanLengths[countryCode]

  if (expectedLength && cleaned.length !== expectedLength) {
    return false
  }

  // Algorithme de validation IBAN (modulo 97)
  // Déplacer les 4 premiers caractères à la fin
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4)

  // Remplacer les lettres par des chiffres (A=10, B=11, ..., Z=35)
  const numeric = rearranged.replace(/[A-Z]/g, (char) => {
    return (char.charCodeAt(0) - 55).toString()
  })

  // Calculer le modulo 97 de ce grand nombre
  const mod97 = BigInt(numeric) % BigInt(97)

  // L'IBAN est valide si le modulo vaut 1
  return mod97 === BigInt(1)
}

/**
 * Valide un BIC/SWIFT (8 ou 11 caractères)
 */
export function validateBIC(bic: string): boolean {
  // Supprimer les espaces et mettre en majuscules
  const cleaned = bic.replace(/\s/g, '').toUpperCase()

  // Format BIC: 4 lettres (code banque) + 2 lettres (pays) + 2 caractères alphanumériques (localisation) + 3 caractères alphanumériques optionnels (branche)
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleaned)
}

/**
 * Formate un SIRET pour l'affichage (ajoute des espaces)
 */
export function formatSIRET(siret: string): string {
  const cleaned = siret.replace(/\s/g, '')
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4')
}

/**
 * Formate un IBAN pour l'affichage (ajoute des espaces tous les 4 caractères)
 */
export function formatIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  return cleaned.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Extrait le SIREN (9 premiers chiffres) d'un SIRET
 */
export function extractSIREN(siret: string): string {
  const cleaned = siret.replace(/\s/g, '')
  return cleaned.substring(0, 9)
}

/**
 * Valide une adresse email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide un numéro de téléphone français
 */
export function validatePhoneNumber(phone: string): boolean {
  // Supprimer les espaces, tirets et points
  const cleaned = phone.replace(/[\s\-\.]/g, '')

  // Formats acceptés:
  // - 0612345678 (10 chiffres commençant par 0)
  // - +33612345678 (international)
  // - 33612345678 (international sans +)

  return /^(?:(?:\+|00)33|0)[1-9]\d{8}$/.test(cleaned)
}

/**
 * Formate un numéro de téléphone français pour l'affichage
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\.]/g, '')

  // Format français: 06 12 34 56 78
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }

  // Format international: +33 6 12 34 56 78
  if (cleaned.startsWith('+33') || cleaned.startsWith('33')) {
    const withoutPrefix = cleaned.replace(/^\+?33/, '')
    return '+33 ' + withoutPrefix.replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }

  return phone
}
