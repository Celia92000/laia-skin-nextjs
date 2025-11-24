/**
 * 🛡️ UTILITAIRES DE PARSING SÉCURISÉ
 * Fonctions pour éviter les crashes liés au parsing de données invalides
 */

/**
 * Parse JSON de manière sécurisée avec fallback
 * @param json - String JSON à parser (peut être null/undefined)
 * @param defaultValue - Valeur par défaut si parsing échoue
 * @returns Objet parsé ou valeur par défaut
 */
export function safeJsonParse<T = any>(
  json: string | null | undefined,
  defaultValue: T
): any {
  if (!json || typeof json !== 'string') {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(json);
    return parsed ?? defaultValue;
  } catch (error) {
    console.error('❌ JSON parse error:', error);
    return defaultValue;
  }
}

/**
 * Parse nombre de manière sécurisée
 * @param value - Valeur à parser en nombre
 * @param defaultValue - Valeur par défaut (défaut: 0)
 * @returns Nombre valide ou valeur par défaut
 */
export function safeParseNumber(
  value: string | number | null | undefined,
  defaultValue: number = 0
): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Parse entier de manière sécurisée
 * @param value - Valeur à parser en entier
 * @param defaultValue - Valeur par défaut (défaut: 0)
 * @returns Entier valide ou valeur par défaut
 */
export function safeParseInt(
  value: string | number | null | undefined,
  defaultValue: number = 0
): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const num = typeof value === 'number' ? value : parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Vérifie qu'une valeur est un tableau, sinon retourne le fallback
 * @param value - Valeur à vérifier
 * @param fallback - Tableau par défaut (défaut: [])
 * @returns Tableau validé ou fallback
 */
export function safeArray<T = any>(
  value: any,
  fallback: T[] = []
): any[] {
  return Array.isArray(value) ? value : fallback;
}

/**
 * Map sécurisé sur un tableau avec fallback
 * @param arr - Tableau source (peut être undefined/null)
 * @param callback - Fonction de transformation
 * @param fallback - Valeur de fallback si erreur
 * @returns Tableau transformé ou fallback
 */
export function safeMap<T = any, R = any>(
  arr: unknown,
  callback: (item: T, index: number) => R,
  fallback: any[] = []
): any[] {
  if (!Array.isArray(arr)) {
    return fallback;
  }

  try {
    return arr.map(callback);
  } catch (error) {
    console.error('❌ Array map error:', error);
    return fallback;
  }
}

/**
 * Filter sécurisé sur un tableau
 * @param arr - Tableau source
 * @param predicate - Fonction de filtrage
 * @param fallback - Valeur de fallback
 * @returns Tableau filtré ou fallback
 */
export function safeFilter<T = any>(
  arr: unknown,
  predicate: (item: T, index: number) => boolean,
  fallback: any[] = []
): any[] {
  if (!Array.isArray(arr)) {
    return fallback;
  }

  try {
    return arr.filter(predicate);
  } catch (error) {
    console.error('❌ Array filter error:', error);
    return fallback;
  }
}

/**
 * Récupère une propriété imbriquée de manière sécurisée
 * @param obj - Objet source
 * @param path - Chemin vers la propriété (ex: 'user.profile.name')
 * @param defaultValue - Valeur par défaut
 * @returns Valeur trouvée ou defaultValue
 */
export function safeGet<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }

  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result ?? defaultValue;
}

/**
 * Parse localStorage de manière sécurisée
 * @param key - Clé du localStorage
 * @param defaultValue - Valeur par défaut
 * @returns Valeur parsée ou defaultValue
 */
export function safeLocalStorage<T = any>(
  key: string,
  defaultValue: T
): any {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? safeJsonParse<T>(item, defaultValue) : defaultValue;
  } catch (error) {
    console.error(`❌ localStorage error for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set localStorage de manière sécurisée
 * @param key - Clé du localStorage
 * @param value - Valeur à stocker
 * @returns true si succès, false sinon
 */
export function safeSetLocalStorage<T>(
  key: string,
  value: T
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`❌ localStorage set error for key "${key}":`, error);
    return false;
  }
}
