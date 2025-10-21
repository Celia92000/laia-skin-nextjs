import crypto from 'crypto'

// L'algorithme AES-256-GCM est recommandé pour le chiffrement de données sensibles
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // Pour AES, c'est toujours 16 octets
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const TAG_POSITION = SALT_LENGTH + IV_LENGTH
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH

/**
 * Récupère la clé de chiffrement depuis l'environnement
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    throw new Error('🔐 ENCRYPTION_KEY manquant dans .env.local - Exécutez: npx tsx scripts/security/secure-production.ts')
  }

  if (key.length !== 64) {
    throw new Error('🔐 ENCRYPTION_KEY doit faire 64 caractères (32 bytes en hex)')
  }

  return key
}

/**
 * Dérive une clé à partir de la clé d'encryption et d'un salt
 */
function getKey(salt: Buffer): Buffer {
  const ENCRYPTION_KEY = getEncryptionKey()
  return crypto.pbkdf2Sync(
    ENCRYPTION_KEY!,
    salt,
    100000, // Nombre d'itérations
    32, // Longueur de la clé (256 bits)
    'sha512'
  )
}

/**
 * Chiffre une donnée sensible (IBAN, BIC, etc.)
 * @param text Texte en clair à chiffrer
 * @returns Texte chiffré en base64
 */
export function encrypt(text: string): string {
  if (!text) return text

  try {
    // Générer un salt aléatoire
    const salt = crypto.randomBytes(SALT_LENGTH)

    // Dériver une clé à partir du salt
    const key = getKey(salt)

    // Générer un IV (vecteur d'initialisation) aléatoire
    const iv = crypto.randomBytes(IV_LENGTH)

    // Créer le cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    // Chiffrer le texte
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ])

    // Obtenir le tag d'authentification
    const tag = cipher.getAuthTag()

    // Combiner salt + iv + tag + données chiffrées
    const result = Buffer.concat([salt, iv, tag, encrypted])

    // Retourner en base64
    return result.toString('base64')
  } catch (error) {
    console.error('Erreur chiffrement:', error)
    throw new Error('Erreur lors du chiffrement des données')
  }
}

/**
 * Déchiffre une donnée sensible
 * @param encryptedText Texte chiffré en base64
 * @returns Texte en clair
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText

  try {
    // Décoder de base64
    const data = Buffer.from(encryptedText, 'base64')

    // Extraire les composants
    const salt = data.subarray(0, SALT_LENGTH)
    const iv = data.subarray(SALT_LENGTH, TAG_POSITION)
    const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION)
    const encrypted = data.subarray(ENCRYPTED_POSITION)

    // Dériver la clé à partir du salt
    const key = getKey(salt)

    // Créer le decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    // Déchiffrer
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Erreur déchiffrement:', error)
    throw new Error('Erreur lors du déchiffrement des données')
  }
}

/**
 * Masque un IBAN pour l'affichage (ex: FR76 **** **** **** 1234)
 */
export function maskIban(iban: string): string {
  if (!iban || iban.length < 8) return '****'

  const last4 = iban.slice(-4)
  const countryCode = iban.slice(0, 2)

  return `${countryCode}** **** **** **** ${last4}`
}

/**
 * Masque un BIC pour l'affichage (ex: ABCD****XXX)
 */
export function maskBic(bic: string): string {
  if (!bic || bic.length < 8) return '****'

  const first4 = bic.slice(0, 4)
  const last3 = bic.slice(-3)

  return `${first4}****${last3}`
}

/**
 * Valide un IBAN (format basique)
 */
export function validateIban(iban: string): boolean {
  // Enlever les espaces
  const cleanIban = iban.replace(/\s/g, '')

  // Vérifier la longueur (entre 15 et 34 caractères)
  if (cleanIban.length < 15 || cleanIban.length > 34) {
    return false
  }

  // Vérifier le format (2 lettres + 2 chiffres + alphanumériques)
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/
  if (!ibanRegex.test(cleanIban)) {
    return false
  }

  return true
}

/**
 * Valide un BIC (format basique)
 */
export function validateBic(bic: string): boolean {
  // Format BIC : 8 ou 11 caractères (AAAABBCCXXX)
  const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/
  return bicRegex.test(bic)
}
