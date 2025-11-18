// 🧹 Input Sanitization - Protection XSS et injection
// Nettoie et valide les inputs utilisateur pour éviter les failles de sécurité

/**
 * Échappe les caractères HTML dangereux
 * Prévient les attaques XSS (Cross-Site Scripting)
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'\/]/g, (char) => map[char] || char);
}

/**
 * Supprime tous les tags HTML d'une chaîne
 * Utiliser pour les champs qui ne doivent contenir que du texte brut
 */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Nettoie une chaîne pour utilisation dans une URL
 * Prévient l'injection d'URL malveillantes
 */
export function sanitizeUrl(url: string): string {
  // Autoriser uniquement les protocoles sûrs
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

  try {
    const parsed = new URL(url);
    if (!safeProtocols.includes(parsed.protocol)) {
      return '';
    }
    return url;
  } catch {
    // URL invalide
    return '';
  }
}

/**
 * Nettoie un email
 * Validation basique + suppression des caractères dangereux
 */
export function sanitizeEmail(email: string): string {
  // Supprimer les espaces
  email = email.trim().toLowerCase();

  // Regex basique email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error('Format email invalide');
  }

  return email;
}

/**
 * Nettoie un numéro de téléphone
 * Garde uniquement les chiffres et le +
 */
export function sanitizePhone(phone: string): string {
  // Garder uniquement +, chiffres et espaces
  return phone.replace(/[^+0-9\s]/g, '').trim();
}

/**
 * Nettoie une chaîne générique
 * Supprime les caractères spéciaux dangereux mais garde les accents
 */
export function sanitizeText(text: string): string {
  // Supprimer les caractères de contrôle et caractères spéciaux dangereux
  return text
    .replace(/[\x00-\x1F\x7F]/g, '') // Caractères de contrôle
    .replace(/[<>]/g, '') // Balises HTML
    .trim();
}

/**
 * Nettoie un objet entier (récursif)
 * Applique sanitizeText à toutes les valeurs string
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'object' ? sanitizeObject(item) :
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Valide et nettoie un slug (URL-friendly)
 * Utilisé pour les identifiants dans les URLs
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-') // Remplacer les caractères spéciaux par -
    .replace(/-+/g, '-') // Supprimer les - multiples
    .replace(/^-|-$/g, ''); // Supprimer les - au début/fin
}

/**
 * Validation stricte de nombre
 * Prévient l'injection via des nombres
 */
export function sanitizeNumber(value: any): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Valeur numérique invalide');
  }
  return num;
}

/**
 * Validation stricte de boolean
 */
export function sanitizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true' || value === '1' || value === 1) {
    return true;
  }
  if (value === 'false' || value === '0' || value === 0) {
    return false;
  }
  throw new Error('Valeur booléenne invalide');
}

/**
 * Limite la longueur d'une chaîne
 * Prévient les attaques par buffer overflow
 */
export function limitLength(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    return text.substring(0, maxLength);
  }
  return text;
}

/**
 * Nettoie une chaîne pour utilisation en SQL (en plus de Prisma)
 * Double protection contre injection SQL
 */
export function sanitizeForSQL(text: string): string {
  // Échapper les quotes et backslashes
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\x00/g, '\\0');
}

/**
 * Vérifie si une chaîne contient du code potentiellement dangereux
 * Détecte des patterns suspects
 */
export function containsSuspiciousCode(text: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(text));
}

/**
 * Middleware de sanitization pour les API routes
 * Utilisation : const clean = sanitizeRequestBody(request.body)
 */
export function sanitizeRequestBody<T extends Record<string, any>>(body: T): T {
  // Vérifier d'abord si le body contient du code suspect
  const bodyStr = JSON.stringify(body);
  if (containsSuspiciousCode(bodyStr)) {
    throw new Error('Input contient du code potentiellement dangereux');
  }

  // Nettoyer l'objet
  return sanitizeObject(body);
}

/**
 * Sanitize spécifique pour les noms (prénom, nom)
 * Autorise lettres, espaces, tirets, apostrophes
 */
export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '') // Garder lettres, accents, espace, tiret, apostrophe
    .replace(/\s+/g, ' '); // Normaliser les espaces
}

/**
 * Sanitize pour adresse postale
 * Plus permissif car les adresses contiennent des chiffres et caractères spéciaux
 */
export function sanitizeAddress(address: string): string {
  return address
    .trim()
    .replace(/[<>]/g, '') // Supprimer les balises
    .replace(/[\x00-\x1F\x7F]/g, ''); // Supprimer caractères de contrôle
}

/**
 * Rate limiting basé sur le contenu
 * Détecte les tentatives de spam ou d'abus
 */
export function detectSpam(text: string): boolean {
  // Trop de majuscules (> 70%)
  const uppercaseRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (uppercaseRatio > 0.7 && text.length > 10) {
    return true;
  }

  // Trop de liens (> 3)
  const linkCount = (text.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) {
    return true;
  }

  // Mots répétés excessivement
  const words = text.toLowerCase().split(/\s+/);
  const wordCount: Record<string, number> = {};
  for (const word of words) {
    wordCount[word] = (wordCount[word] || 0) + 1;
  }
  const maxRepeat = Math.max(...Object.values(wordCount));
  if (maxRepeat > 5 && text.length > 50) {
    return true;
  }

  return false;
}

/**
 * Exemple d'utilisation dans une API route
 */
export function sanitizeExample() {
  const examples = {
    // Email
    email: sanitizeEmail('  User@Example.COM  '), // → 'user@example.com'

    // Téléphone
    phone: sanitizePhone('+33 6 12 34 56 78 (portable)'), // → '+33 6 12 34 56 78'

    // Nom
    name: sanitizeName("Jean-François O'Connor"), // → "Jean-François O'Connor"

    // HTML
    html: escapeHtml('<script>alert("XSS")</script>'), // → '&lt;script&gt;...'

    // Slug
    slug: sanitizeSlug('Mon Super Article !!'), // → 'mon-super-article'

    // Objet complet
    user: sanitizeObject({
      name: '<script>Bad</script>John',
      email: ' john@test.com ',
      age: '25',
    }),
  };

  return examples;
}
