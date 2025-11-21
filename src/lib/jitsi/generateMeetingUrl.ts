import crypto from 'crypto'

/**
 * Génère un lien de visioconférence Jitsi Meet unique
 * @param bookingId - ID unique de la réservation
 * @param institutName - Nom de l'institut (pour personnaliser)
 * @returns URL complète Jitsi Meet
 */
export function generateJitsiMeetingUrl(bookingId: string, institutName?: string): string {
  // Générer un identifiant unique et sécurisé
  const hash = crypto
    .createHash('sha256')
    .update(`${bookingId}-${Date.now()}`)
    .digest('hex')
    .substring(0, 12)

  // Créer un nom de salle lisible et unique
  const roomName = institutName
    ? `laia-demo-${institutName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${hash}`
    : `laia-demo-${hash}`

  // Paramètres de configuration pour améliorer la qualité
  const config = {
    // Qualité vidéo
    'config.resolution': '720',          // Résolution 720p
    'config.constraints.video.height': '720',
    'config.startVideoMuted': 'false',   // Vidéo activée par défaut
    'config.startAudioMuted': 'false',   // Audio activé par défaut

    // Optimisations
    'config.enableLayerSuspension': 'true',
    'config.disableSimulcast': 'false',
    'config.channelLastN': '20',

    // Interface
    'config.prejoinPageEnabled': 'false', // Sauter la page de pré-jointure
    'interfaceConfig.SHOW_JITSI_WATERMARK': 'false',
    'interfaceConfig.SHOW_WATERMARK_FOR_GUESTS': 'false',
    'interfaceConfig.MOBILE_APP_PROMO': 'false'
  }

  const params = new URLSearchParams(config).toString()

  // URL Jitsi Meet publique et gratuite avec paramètres de qualité
  return `https://meet.jit.si/${roomName}#${params}`
}

/**
 * Extrait le nom de la salle depuis une URL Jitsi
 * @param url - URL Jitsi Meet
 * @returns Nom de la salle ou null
 */
export function extractRoomName(url: string): string | null {
  try {
    const match = url.match(/meet\.jit\.si\/(.+)$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}
