/**
 * 🔒 VALIDATEUR DE VARIABLES D'ENVIRONNEMENT
 * S'assure que toutes les variables critiques sont définies au démarrage
 */

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const;

const RECOMMENDED_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Vérifier variables obligatoires
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Vérifier variables recommandées
  for (const varName of RECOMMENDED_ENV_VARS) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  // Erreur si variables critiques manquantes
  if (missing.length > 0) {
    const errorMessage = `
❌ ERREUR CRITIQUE: Variables d'environnement manquantes

Les variables suivantes sont OBLIGATOIRES pour le fonctionnement de l'application:
${missing.map(v => `  - ${v}`).join('\n')}

📝 Action requise:
1. Copiez le fichier .env.example vers .env.local
2. Remplissez toutes les variables manquantes
3. Redémarrez l'application

Pour plus d'informations, consultez le fichier CLAUDE.md
    `.trim();

    throw new Error(errorMessage);
  }

  // Warning si variables recommandées manquantes
  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(`
⚠️  AVERTISSEMENT: Variables d'environnement recommandées manquantes

Les variables suivantes sont recommandées pour toutes les fonctionnalités:
${warnings.map(v => `  - ${v}`).join('\n')}

Certaines fonctionnalités peuvent être limitées.
    `.trim());
  }

  // Success message (seulement en dev)
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Variables d\'environnement validées avec succès');
  }
}

/**
 * Vérifie si une variable d'environnement spécifique existe
 */
export function hasEnvVar(varName: string): boolean {
  return !!process.env[varName];
}

/**
 * Récupère une variable d'environnement avec valeur par défaut
 */
export function getEnvVar(varName: string, defaultValue?: string): string {
  const value = process.env[varName];
  if (!value && !defaultValue) {
    throw new Error(`Variable d'environnement ${varName} non trouvée et aucune valeur par défaut fournie`);
  }
  return value || defaultValue!;
}
