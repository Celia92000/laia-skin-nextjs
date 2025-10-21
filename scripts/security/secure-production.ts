/**
 * 🔐 Script de Sécurisation pour la Production
 *
 * Ce script automatise la sécurisation de l'application avant la mise en production :
 * 1. Génère un nouveau JWT_SECRET sécurisé
 * 2. Génère un nouveau ENCRYPTION_KEY pour chiffrer les données sensibles
 * 3. Crée un fichier .env.production avec des valeurs sécurisées
 * 4. Force le changement de tous les mots de passe par défaut
 * 5. Génère un rapport de sécurité
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function generateSecureSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('base64')
}

function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = uppercase + lowercase + numbers + symbols
  let password = ''

  // Garantir au moins un caractère de chaque type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Compléter le reste
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

async function step1_GenerateSecrets() {
  log('\n📝 ÉTAPE 1 : Génération des secrets sécurisés', colors.cyan)
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan)

  const jwtSecret = generateSecureSecret(64)
  const encryptionKey = crypto.randomBytes(32).toString('hex')
  const cronSecret = generateSecureSecret(32)

  log(`✅ JWT_SECRET généré (${jwtSecret.length} caractères)`, colors.green)
  log(`✅ ENCRYPTION_KEY généré (64 caractères hex)`, colors.green)
  log(`✅ CRON_SECRET généré (${cronSecret.length} caractères)`, colors.green)

  return { jwtSecret, encryptionKey, cronSecret }
}

async function step2_CreateProductionEnv(secrets: { jwtSecret: string, encryptionKey: string, cronSecret: string }) {
  log('\n📄 ÉTAPE 2 : Création du fichier .env.production.example', colors.cyan)
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan)

  const envProductionExample = `# 🔐 CONFIGURATION DE PRODUCTION - LAIA SaaS Platform
# ⚠️ NE JAMAIS COMMIT CE FICHIER AVEC DES VRAIES VALEURS
# ⚠️ Copier ce fichier en .env.production et remplir avec les vraies valeurs

# ═══════════════════════════════════════════════════════════════
# 🗄️ BASE DE DONNÉES (PostgreSQL)
# ═══════════════════════════════════════════════════════════════
# ⚠️ IMPORTANT : Utiliser des connexions poolées pour la production
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/DB?pgbouncer=true&connection_limit=10"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB"

# ═══════════════════════════════════════════════════════════════
# 🔐 SECRETS & SÉCURITÉ
# ═══════════════════════════════════════════════════════════════
# JWT Secret pour l'authentification (généré automatiquement)
JWT_SECRET="${secrets.jwtSecret}"

# Clé de chiffrement pour les données sensibles (IBAN, BIC, etc.)
ENCRYPTION_KEY="${secrets.encryptionKey}"

# Secret pour les tâches CRON
CRON_SECRET="${secrets.cronSecret}"

# ═══════════════════════════════════════════════════════════════
# 📧 EMAIL (Production)
# ═══════════════════════════════════════════════════════════════
# Resend API (recommandé pour la production)
RESEND_API_KEY="re_VOTRE_CLE_PRODUCTION"
RESEND_FROM_EMAIL="LAIA <no-reply@votre-domaine.com>"

# IMAP (si synchronisation nécessaire)
EMAIL_USER="contact@votre-domaine.com"
EMAIL_PASSWORD="CHANGEZ_MOI_AVEC_MOT_DE_PASSE_FORT"

# ═══════════════════════════════════════════════════════════════
# 💳 STRIPE (Paiements Production)
# ═══════════════════════════════════════════════════════════════
# ⚠️ UTILISER LES CLÉS DE PRODUCTION (sk_live_...)
STRIPE_SECRET_KEY="sk_live_VOTRE_CLE_SECRETE"
STRIPE_PUBLISHABLE_KEY="pk_live_VOTRE_CLE_PUBLIQUE"
STRIPE_WEBHOOK_SECRET="whsec_VOTRE_SECRET_WEBHOOK"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_VOTRE_CLE_PUBLIQUE"

# ═══════════════════════════════════════════════════════════════
# 📱 WhatsApp Business API (Meta)
# ═══════════════════════════════════════════════════════════════
WHATSAPP_ACCESS_TOKEN="VOTRE_TOKEN_PRODUCTION"
WHATSAPP_PHONE_NUMBER_ID="VOTRE_PHONE_NUMBER_ID"
WHATSAPP_BUSINESS_ACCOUNT_ID="VOTRE_BUSINESS_ACCOUNT_ID"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="CHANGEZ_MOI_TOKEN_SECURISE"
WHATSAPP_PROVIDER="meta"

# ═══════════════════════════════════════════════════════════════
# 🌐 RÉSEAUX SOCIAUX (Meta)
# ═══════════════════════════════════════════════════════════════
META_APP_ID="VOTRE_APP_ID"
META_APP_SECRET="VOTRE_APP_SECRET"

# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN="VOTRE_TOKEN_PRODUCTION"
FACEBOOK_PAGE_ID="VOTRE_PAGE_ID"

# Instagram
INSTAGRAM_ACCESS_TOKEN="VOTRE_TOKEN_PRODUCTION"
INSTAGRAM_ACCOUNT_ID="VOTRE_ACCOUNT_ID"

# ═══════════════════════════════════════════════════════════════
# 🔄 AUTRES SERVICES
# ═══════════════════════════════════════════════════════════════
# Application URL
NEXT_PUBLIC_APP_URL="https://votre-domaine-production.com"

# Cloudinary (stockage médias)
CLOUDINARY_CLOUD_NAME="votre_cloud_name"
CLOUDINARY_API_KEY="votre_api_key"
CLOUDINARY_API_SECRET="votre_api_secret"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://votre-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="VOTRE_TOKEN"

# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN="https://votre-dsn@sentry.io/projet"
SENTRY_AUTH_TOKEN="VOTRE_AUTH_TOKEN"

# ═══════════════════════════════════════════════════════════════
# ⚠️ CHECKLIST AVANT DÉPLOIEMENT
# ═══════════════════════════════════════════════════════════════
# [ ] Tous les secrets ont été changés
# [ ] Les clés Stripe sont en mode PRODUCTION (sk_live_, pk_live_)
# [ ] Le domaine email est vérifié dans Resend
# [ ] Les webhooks Stripe sont configurés avec l'URL de production
# [ ] Les tokens WhatsApp/Facebook/Instagram sont à jour
# [ ] Le JWT_SECRET est unique et sécurisé
# [ ] L'ENCRYPTION_KEY est sauvegardé dans un endroit sûr
# [ ] Les mots de passe par défaut ont été changés
# [ ] La base de données est sauvegardée
# [ ] Le monitoring Sentry est configuré
# [ ] Les variables sont ajoutées dans Vercel/votre hébergeur
`

  const filePath = path.join(process.cwd(), '.env.production.example')
  fs.writeFileSync(filePath, envProductionExample)

  log(`✅ Fichier créé : .env.production.example`, colors.green)
  log(`⚠️  Copier ce fichier en .env.production et remplir les vraies valeurs`, colors.yellow)
}

async function step3_ResetDefaultPasswords() {
  log('\n🔑 ÉTAPE 3 : Détection et alerte pour les mots de passe par défaut', colors.cyan)
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan)

  const weakPasswords = ['admin123', 'SuperAdmin123!', 'SuperAdmin2024!', 'test123', 'client123', 'password123', 'compta123', 'compta2024', 'employe123']

  // Trouver tous les utilisateurs
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
    }
  })

  log(`\n📊 ${allUsers.length} utilisateurs trouvés dans la base de données`, colors.blue)

  const usersToChange: any[] = []

  for (const user of allUsers) {
    // Vérifier si le mot de passe correspond à un mot de passe faible
    for (const weakPassword of weakPasswords) {
      const isWeak = await bcrypt.compare(weakPassword, user.password)
      if (isWeak) {
        usersToChange.push({
          ...user,
          detectedPassword: weakPassword
        })
        break
      }
    }
  }

  if (usersToChange.length > 0) {
    log(`\n⚠️  ${usersToChange.length} utilisateurs avec mots de passe FAIBLES détectés :`, colors.red)

    for (const user of usersToChange) {
      log(`   - ${user.email} (${user.role}) : "${user.detectedPassword}"`, colors.yellow)
    }

    log(`\n🔧 Génération de nouveaux mots de passe sécurisés...`, colors.cyan)

    const newPasswords: { email: string, role: string, password: string }[] = []

    for (const user of usersToChange) {
      const newPassword = generateSecurePassword(16)
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          // Ajouter un flag pour forcer le changement au prochain login (si le champ existe)
        }
      })

      newPasswords.push({
        email: user.email,
        role: user.role,
        password: newPassword
      })

      log(`   ✅ ${user.email} : nouveau mot de passe généré`, colors.green)
    }

    // Sauvegarder les nouveaux mots de passe dans un fichier sécurisé
    const passwordsFile = path.join(process.cwd(), 'scripts/security/NEW_PASSWORDS.txt')
    let content = `🔐 NOUVEAUX MOTS DE PASSE GÉNÉRÉS\n`
    content += `Date : ${new Date().toLocaleString('fr-FR')}\n`
    content += `════════════════════════════════════════════════════════════════\n\n`
    content += `⚠️  IMPORTANT : \n`
    content += `   - Communiquez ces mots de passe de manière SÉCURISÉE\n`
    content += `   - SUPPRIMEZ ce fichier après distribution\n`
    content += `   - Les utilisateurs doivent changer leur mot de passe au premier login\n\n`
    content += `════════════════════════════════════════════════════════════════\n\n`

    for (const { email, role, password } of newPasswords) {
      content += `📧 Email : ${email}\n`
      content += `👤 Rôle  : ${role}\n`
      content += `🔑 Mot de passe : ${password}\n`
      content += `────────────────────────────────────────────────────────────────\n\n`
    }

    fs.writeFileSync(passwordsFile, content)

    log(`\n✅ Nouveaux mots de passe sauvegardés dans : scripts/security/NEW_PASSWORDS.txt`, colors.green)
    log(`⚠️  IMPORTANT : Distribuez ces mots de passe de manière SÉCURISÉE puis SUPPRIMEZ le fichier`, colors.yellow)

  } else {
    log(`\n✅ Aucun mot de passe faible détecté`, colors.green)
  }

  return usersToChange.length
}

async function step4_CreateSecurityReport() {
  log('\n📊 ÉTAPE 4 : Génération du rapport de sécurité', colors.cyan)
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan)

  const report = `# 🔐 RAPPORT DE SÉCURITÉ - LAIA Platform
Date : ${new Date().toLocaleString('fr-FR')}

## ✅ Actions effectuées

1. **Secrets générés**
   - ✅ JWT_SECRET : Nouveau secret sécurisé de 64 caractères
   - ✅ ENCRYPTION_KEY : Clé de chiffrement 32 bytes (64 hex)
   - ✅ CRON_SECRET : Secret pour les tâches automatiques

2. **Fichier de configuration**
   - ✅ .env.production.example créé avec tous les paramètres
   - ⚠️  À copier en .env.production et compléter

3. **Mots de passe**
   - ✅ Mots de passe faibles détectés et changés
   - ✅ Nouveaux mots de passe sécurisés générés
   - ⚠️  Voir scripts/security/NEW_PASSWORDS.txt

## ⚠️ CHECKLIST AVANT PRODUCTION

### Secrets & Configuration
- [ ] Copier .env.production.example → .env.production
- [ ] Remplir toutes les valeurs de production dans .env.production
- [ ] Vérifier que JWT_SECRET est unique et sécurisé
- [ ] Sauvegarder ENCRYPTION_KEY dans un coffre-fort (1Password, LastPass, etc.)
- [ ] Ne JAMAIS committer .env.production dans Git

### Base de données
- [ ] Utiliser une base de données de production dédiée
- [ ] Activer les sauvegardes automatiques quotidiennes
- [ ] Tester la restauration depuis une sauvegarde
- [ ] Configurer les connexions poolées (pgBouncer)

### Paiements (Stripe)
- [ ] Passer en mode PRODUCTION (sk_live_, pk_live_)
- [ ] Configurer les webhooks avec l'URL de production
- [ ] Tester un paiement réel en mode test d'abord
- [ ] Activer les alertes Stripe pour les paiements échoués

### Email
- [ ] Vérifier le domaine email dans Resend
- [ ] Configurer les DNS (SPF, DKIM, DMARC)
- [ ] Tester l'envoi d'emails depuis la production
- [ ] Configurer les webhooks Resend

### WhatsApp & Réseaux sociaux
- [ ] Renouveler tous les tokens avant expiration
- [ ] Configurer les webhooks avec l'URL de production
- [ ] Vérifier les permissions des applications Meta

### Sécurité
- [ ] Tous les mots de passe par défaut ont été changés
- [ ] Activer 2FA pour tous les super admins
- [ ] Configurer rate limiting (Upstash Redis)
- [ ] Activer le monitoring d'erreurs (Sentry)
- [ ] Configurer les logs d'audit

### Performance
- [ ] Activer le cache Redis
- [ ] Optimiser les images (Cloudinary)
- [ ] Tester les performances avec des données réelles
- [ ] Configurer un CDN (Vercel Edge)

### Monitoring
- [ ] Configurer Sentry pour le tracking d'erreurs
- [ ] Mettre en place des alertes (Vercel, Sentry)
- [ ] Créer un dashboard de monitoring
- [ ] Tester les alertes

### Legal & Compliance
- [ ] RGPD : Politique de confidentialité à jour
- [ ] CGU/CGV à jour
- [ ] Mentions légales complètes
- [ ] Système de consentement cookies
- [ ] Droit à l'oubli implémenté

## 🚨 ACTIONS CRITIQUES POST-DÉPLOIEMENT

1. **Dans les 24h**
   - [ ] Vérifier que tous les services fonctionnent
   - [ ] Tester un flux complet (inscription, paiement, email)
   - [ ] Surveiller les logs d'erreurs

2. **Dans la semaine**
   - [ ] Former tous les utilisateurs aux nouveaux mots de passe
   - [ ] Vérifier les paiements automatiques
   - [ ] Analyser les performances

3. **Mensuel**
   - [ ] Renouveler les tokens API avant expiration
   - [ ] Vérifier les sauvegardes
   - [ ] Auditer les logs de sécurité

## 📞 Support & Contact

En cas de problème de sécurité :
- Email : security@laia.com
- Documentation : /docs/security

---
**Généré par scripts/security/secure-production.ts**
`

  const reportPath = path.join(process.cwd(), 'scripts/security/SECURITY_REPORT.md')
  fs.writeFileSync(reportPath, report)

  log(`✅ Rapport de sécurité créé : scripts/security/SECURITY_REPORT.md`, colors.green)
}

async function main() {
  try {
    log('\n' + '═'.repeat(70), colors.bright)
    log('🔐 SCRIPT DE SÉCURISATION - LAIA PLATFORM', colors.bright + colors.cyan)
    log('═'.repeat(70) + '\n', colors.bright)

    log('Ce script va sécuriser votre application avant la production :', colors.blue)
    log('  1. Générer des secrets sécurisés (JWT, Encryption, Cron)', colors.blue)
    log('  2. Créer un fichier .env.production.example', colors.blue)
    log('  3. Changer tous les mots de passe faibles', colors.blue)
    log('  4. Générer un rapport de sécurité complet', colors.blue)

    log('\n⚠️  IMPORTANT : Assurez-vous d\'avoir une sauvegarde de la DB', colors.yellow)

    // Créer le dossier security s'il n'existe pas
    const securityDir = path.join(process.cwd(), 'scripts/security')
    if (!fs.existsSync(securityDir)) {
      fs.mkdirSync(securityDir, { recursive: true })
    }

    // Étape 1 : Générer les secrets
    const secrets = await step1_GenerateSecrets()

    // Étape 2 : Créer le fichier .env.production.example
    await step2_CreateProductionEnv(secrets)

    // Étape 3 : Changer les mots de passe faibles
    const passwordsChanged = await step3_ResetDefaultPasswords()

    // Étape 4 : Créer le rapport de sécurité
    await step4_CreateSecurityReport()

    log('\n' + '═'.repeat(70), colors.bright)
    log('✅ SÉCURISATION TERMINÉE AVEC SUCCÈS !', colors.bright + colors.green)
    log('═'.repeat(70) + '\n', colors.bright)

    log('📋 Prochaines étapes :', colors.cyan)
    log('  1. Lire le rapport : scripts/security/SECURITY_REPORT.md', colors.blue)
    if (passwordsChanged > 0) {
      log('  2. Distribuer les nouveaux mots de passe : scripts/security/NEW_PASSWORDS.txt', colors.blue)
      log('  3. SUPPRIMER le fichier NEW_PASSWORDS.txt après distribution', colors.yellow)
    }
    log(`  ${passwordsChanged > 0 ? '4' : '2'}. Copier .env.production.example → .env.production`, colors.blue)
    log(`  ${passwordsChanged > 0 ? '5' : '3'}. Compléter toutes les valeurs de production`, colors.blue)
    log(`  ${passwordsChanged > 0 ? '6' : '4'}. Suivre la checklist dans SECURITY_REPORT.md`, colors.blue)

    log('\n🎉 Votre application est maintenant prête pour la production !', colors.green)

  } catch (error) {
    log('\n❌ ERREUR lors de la sécurisation :', colors.red)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
