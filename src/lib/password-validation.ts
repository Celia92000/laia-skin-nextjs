/**
 * Utilitaires de validation de mots de passe sécurisés
 * Conforme aux standards OWASP et ANSSI
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventUserInfo: boolean; // Empêcher nom, email, etc.
}

// Configuration par défaut (stricte)
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true,
};

// Mots de passe courants à bannir (top 100 des plus utilisés)
const COMMON_PASSWORDS = [
  'password', 'Password123', '12345678', 'qwerty', 'azerty',
  'admin', 'Admin123', 'password123', 'welcome', 'Welcome123',
  'letmein', 'monkey', '1234567890', 'abc123', 'password1',
  'qwertyuiop', 'iloveyou', 'princess', 'admin123', 'welcome123',
  'login123', 'passw0rd', 'master', 'hello', 'freedom',
  '123456789', 'test', 'test123', 'password!', 'qwerty123',
];

/**
 * Valide un mot de passe selon les exigences de sécurité
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS,
  userInfo?: { name?: string; email?: string }
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // 1. Longueur minimale (25 points)
  if (password.length < requirements.minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${requirements.minLength} caractères`);
  } else {
    score += 25;
    // Bonus pour longueur supplémentaire
    score += Math.min(15, (password.length - requirements.minLength) * 2);
  }

  // 2. Majuscules (15 points)
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  } else if (/[A-Z]/.test(password)) {
    score += 15;
  }

  // 3. Minuscules (15 points)
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  } else if (/[a-z]/.test(password)) {
    score += 15;
  }

  // 4. Chiffres (15 points)
  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  } else if (/[0-9]/.test(password)) {
    score += 15;
  }

  // 5. Caractères spéciaux (15 points)
  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  if (requirements.requireSpecialChars && !specialChars.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%&*...)');
  } else if (specialChars.test(password)) {
    score += 15;
  }

  // 6. Prévention mots de passe courants (malus de 50 points)
  if (requirements.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common.toLowerCase()))) {
      errors.push('Ce mot de passe est trop courant et facilement devinable');
      score = Math.max(0, score - 50);
    }
  }

  // 7. Prévention informations utilisateur (malus de 40 points)
  if (requirements.preventUserInfo && userInfo) {
    const lowerPassword = password.toLowerCase();

    if (userInfo.name) {
      const nameParts = userInfo.name.toLowerCase().split(' ');
      if (nameParts.some(part => part.length > 2 && lowerPassword.includes(part))) {
        errors.push('Le mot de passe ne doit pas contenir votre nom');
        score = Math.max(0, score - 40);
      }
    }

    if (userInfo.email) {
      const emailUsername = userInfo.email.split('@')[0].toLowerCase();
      if (emailUsername.length > 2 && lowerPassword.includes(emailUsername)) {
        errors.push('Le mot de passe ne doit pas contenir votre email');
        score = Math.max(0, score - 40);
      }
    }
  }

  // 8. Patterns répétitifs (malus)
  if (/(.)\1{2,}/.test(password)) { // 3+ caractères identiques consécutifs
    errors.push('Évitez les caractères répétitifs (ex: aaa, 111)');
    score = Math.max(0, score - 20);
  }

  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde)/.test(password.toLowerCase())) {
    errors.push('Évitez les séquences simples (ex: 123, abc)');
    score = Math.max(0, score - 20);
  }

  // Déterminer la force
  let strength: PasswordValidationResult['strength'];
  if (score >= 80) strength = 'very-strong';
  else if (score >= 60) strength = 'strong';
  else if (score >= 40) strength = 'medium';
  else strength = 'weak';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(100, Math.max(0, score)),
  };
}

/**
 * Génère un message d'aide pour créer un mot de passe fort
 */
export function getPasswordHelpMessage(requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS): string {
  const criteria = [];

  criteria.push(`Au moins ${requirements.minLength} caractères`);
  if (requirements.requireUppercase) criteria.push('Au moins une majuscule (A-Z)');
  if (requirements.requireLowercase) criteria.push('Au moins une minuscule (a-z)');
  if (requirements.requireNumbers) criteria.push('Au moins un chiffre (0-9)');
  if (requirements.requireSpecialChars) criteria.push('Au moins un caractère spécial (!@#$%&*...)');
  if (requirements.preventCommonPasswords) criteria.push('Évitez les mots de passe courants');
  if (requirements.preventUserInfo) criteria.push('N\'utilisez pas vos informations personnelles');

  return `Votre mot de passe doit contenir :\n• ${criteria.join('\n• ')}`;
}

/**
 * Génère des suggestions pour améliorer un mot de passe faible
 */
export function getPasswordSuggestions(result: PasswordValidationResult): string[] {
  const suggestions: string[] = [];

  if (result.score < 40) {
    suggestions.push('💡 Utilisez une phrase de passe: "J\'adore-les-Soins@2025!" (facile à retenir, difficile à deviner)');
  }

  if (result.errors.some(e => e.includes('caractères'))) {
    suggestions.push('📏 Ajoutez plus de caractères pour renforcer votre mot de passe');
  }

  if (result.strength === 'weak' || result.strength === 'medium') {
    suggestions.push('🔢 Ajoutez des chiffres et symboles pour plus de sécurité');
    suggestions.push('🔀 Mélangez majuscules, minuscules et caractères spéciaux');
  }

  if (!suggestions.length && result.strength === 'strong') {
    suggestions.push('✅ Bon mot de passe ! Pour encore plus de sécurité, ajoutez quelques caractères.');
  }

  return suggestions;
}

/**
 * Valide que deux mots de passe correspondent
 */
export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Estime le temps nécessaire pour craquer le mot de passe
 */
export function estimateCrackTime(password: string): string {
  const charsetSize = getCharsetSize(password);
  const combinations = Math.pow(charsetSize, password.length);

  // Hypothèse: 10 milliards de tentatives/seconde (GPU moderne)
  const attemptsPerSecond = 10_000_000_000;
  const secondsToCrack = combinations / attemptsPerSecond;

  if (secondsToCrack < 60) return 'moins d\'une minute';
  if (secondsToCrack < 3600) return `${Math.ceil(secondsToCrack / 60)} minutes`;
  if (secondsToCrack < 86400) return `${Math.ceil(secondsToCrack / 3600)} heures`;
  if (secondsToCrack < 31536000) return `${Math.ceil(secondsToCrack / 86400)} jours`;
  if (secondsToCrack < 3153600000) return `${Math.ceil(secondsToCrack / 31536000)} ans`;
  return 'plusieurs millénaires';
}

function getCharsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Caractères spéciaux courants
  return size;
}
