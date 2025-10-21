/**
 * 🔐 Script de Migration - Chiffrement des Données Bancaires
 *
 * Ce script chiffre tous les IBAN/BIC existants dans la base de données
 * Utilise le service de chiffrement AES-256-GCM
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { encrypt, decrypt, validateIban, validateBic } from '@/lib/encryption-service'

const prisma = new PrismaClient()

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

async function encryptBankingData() {
  try {
    log('\n' + '═'.repeat(70), colors.bright)
    log('🔐 CHIFFREMENT DES DONNÉES BANCAIRES - LAIA Platform', colors.bright + colors.cyan)
    log('═'.repeat(70) + '\n', colors.bright)

    // Vérifier que ENCRYPTION_KEY est configurée
    if (!process.env.ENCRYPTION_KEY) {
      log('❌ ERREUR : ENCRYPTION_KEY n\'est pas configurée', colors.red)
      log('\n💡 Exécutez d\'abord : npx tsx scripts/security/secure-production.ts', colors.yellow)
      process.exit(1)
    }

    log('✅ ENCRYPTION_KEY configurée', colors.green)

    // Récupérer toutes les organisations avec des données bancaires
    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          { sepaIban: { not: null } },
          { sepaBic: { not: null } },
        ]
      },
      select: {
        id: true,
        name: true,
        sepaIban: true,
        sepaBic: true,
        sepaAccountHolder: true,
      }
    })

    log(`\n📊 ${organizations.length} organisations avec données bancaires trouvées\n`, colors.blue)

    if (organizations.length === 0) {
      log('✅ Aucune donnée bancaire à chiffrer', colors.green)
      return
    }

    let encryptedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const org of organizations) {
      log(`\n📋 Organisation : ${org.name}`, colors.cyan)

      try {
        const updates: any = {}

        // Chiffrer sepaIban
        if (org.sepaIban) {
          try {
            decrypt(org.sepaIban)
            log(`  ⏭️  SEPA IBAN déjà chiffré`, colors.yellow)
            skippedCount++
          } catch {
            const cleanIban = org.sepaIban.replace(/\s/g, '').toUpperCase()
            if (validateIban(cleanIban)) {
              const encryptedIban = encrypt(cleanIban)
              updates.sepaIban = encryptedIban
              const testDecrypt = decrypt(encryptedIban)
              if (testDecrypt === cleanIban) {
                log(`  ✅ SEPA IBAN chiffré et vérifié`, colors.green)
              } else {
                log(`  ❌ ERREUR : Vérification du chiffrement SEPA IBAN échouée`, colors.red)
                errorCount++
                continue
              }
            } else {
              log(`  ⚠️  SEPA IBAN invalide, ignoré`, colors.yellow)
              skippedCount++
            }
          }
        }

        // Chiffrer sepaBic
        if (org.sepaBic) {
          try {
            decrypt(org.sepaBic)
            log(`  ⏭️  SEPA BIC déjà chiffré`, colors.yellow)
            skippedCount++
          } catch {
            const cleanBic = org.sepaBic.replace(/\s/g, '').toUpperCase()
            if (validateBic(cleanBic)) {
              const encryptedBic = encrypt(cleanBic)
              updates.sepaBic = encryptedBic
              const testDecrypt = decrypt(encryptedBic)
              if (testDecrypt === cleanBic) {
                log(`  ✅ SEPA BIC chiffré et vérifié`, colors.green)
              } else {
                log(`  ❌ ERREUR : Vérification du chiffrement SEPA BIC échouée`, colors.red)
                errorCount++
                continue
              }
            } else {
              log(`  ⚠️  SEPA BIC invalide, ignoré`, colors.yellow)
              skippedCount++
            }
          }
        }


        // Mettre à jour l'organisation si des données ont été chiffrées
        if (Object.keys(updates).length > 0) {
          await prisma.organization.update({
            where: { id: org.id },
            data: updates
          })

          encryptedCount++
          log(`  💾 Organisation mise à jour`, colors.green)
        }

      } catch (error) {
        log(`  ❌ ERREUR lors du chiffrement : ${error}`, colors.red)
        errorCount++
      }
    }

    // Rapport final
    log('\n' + '═'.repeat(70), colors.bright)
    log('📊 RAPPORT DE CHIFFREMENT', colors.bright + colors.cyan)
    log('═'.repeat(70), colors.bright)

    log(`\n✅ Organisations chiffrées : ${encryptedCount}`, colors.green)
    log(`⏭️  Déjà chiffrées (ignorées) : ${skippedCount}`, colors.yellow)
    if (errorCount > 0) {
      log(`❌ Erreurs : ${errorCount}`, colors.red)
    }

    if (errorCount === 0) {
      log('\n🎉 Chiffrement terminé avec succès !', colors.green)
      log('\n⚠️  IMPORTANT : Sauvegardez ENCRYPTION_KEY dans un endroit sûr', colors.yellow)
      log('   Sans cette clé, les données bancaires seront DÉFINITIVEMENT PERDUES', colors.yellow)
    } else {
      log('\n⚠️  Chiffrement terminé avec des erreurs. Vérifiez les logs ci-dessus.', colors.yellow)
    }

  } catch (error) {
    log('\n❌ ERREUR CRITIQUE :', colors.red)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function testEncryption() {
  log('\n🧪 Test du service de chiffrement...', colors.cyan)

  try {
    const testData = {
      iban: 'FR7630006000011234567890189',
      bic: 'BNPAFRPPXXX',
    }

    log(`\nDonnées de test :`, colors.blue)
    log(`  IBAN : ${testData.iban}`, colors.blue)
    log(`  BIC  : ${testData.bic}`, colors.blue)

    // Test IBAN
    const encryptedIban = encrypt(testData.iban)
    const decryptedIban = decrypt(encryptedIban)

    log(`\n✅ IBAN chiffré : ${encryptedIban.substring(0, 30)}...`, colors.green)
    log(`✅ IBAN déchiffré : ${decryptedIban}`, colors.green)

    if (decryptedIban === testData.iban) {
      log(`✅ Test IBAN réussi`, colors.green)
    } else {
      log(`❌ Test IBAN échoué`, colors.red)
      process.exit(1)
    }

    // Test BIC
    const encryptedBic = encrypt(testData.bic)
    const decryptedBic = decrypt(encryptedBic)

    log(`\n✅ BIC chiffré : ${encryptedBic.substring(0, 30)}...`, colors.green)
    log(`✅ BIC déchiffré : ${decryptedBic}`, colors.green)

    if (decryptedBic === testData.bic) {
      log(`✅ Test BIC réussi`, colors.green)
    } else {
      log(`❌ Test BIC échoué`, colors.red)
      process.exit(1)
    }

    log(`\n🎉 Tous les tests réussis !`, colors.green)

  } catch (error) {
    log('\n❌ Erreur lors du test de chiffrement :', colors.red)
    console.error(error)
    process.exit(1)
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--test')) {
    // Mode test
    await testEncryption()
  } else {
    // Mode normal - chiffrer les données
    await encryptBankingData()
  }
}

main()
