/**
 * Script de vérification des fuites de mots de passe dans la base de données
 * À exécuter IMMÉDIATEMENT après la correction du bug
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPasswordLeaks() {
  console.log('🔍 Vérification des mots de passe en clair dans CommunicationLog...\n')

  try {
    // Vérifier si la table existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'CommunicationLog'
      );
    `

    // @ts-ignore
    if (!tableExists[0]?.exists) {
      console.log('✅ Table CommunicationLog non trouvée - Aucun risque')
      return
    }

    // Chercher les logs avec des mots de passe stockés
    const leakedPasswords = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        "clientEmail",
        "sentAt",
        metadata->>'generatedPassword' as password,
        metadata->>'emailType' as email_type
      FROM "CommunicationLog"
      WHERE metadata->>'generatedPassword' IS NOT NULL
      ORDER BY "sentAt" DESC
      LIMIT 100;
    `

    if (leakedPasswords.length === 0) {
      console.log('✅ Aucun mot de passe trouvé en base - Site SÉCURISÉ\n')
      return
    }

    // 🚨 ALERTE - Mots de passe trouvés
    console.log(`🚨 ALERTE SÉCURITÉ CRITIQUE: ${leakedPasswords.length} mots de passe trouvés en clair!\n`)

    console.log('📊 Détails des fuites:')
    console.log('━'.repeat(80))

    leakedPasswords.forEach((log, index) => {
      console.log(`\n${index + 1}. Email: ${log.clientEmail}`)
      console.log(`   Date: ${log.sentAt}`)
      console.log(`   Mot de passe exposé: ${log.password ? '***' + log.password.slice(-3) : 'N/A'}`)
    })

    console.log('\n━'.repeat(80))
    console.log('\n⚠️  ACTIONS REQUISES:')
    console.log('1. 🔴 Nettoyer immédiatement les mots de passe de la BDD')
    console.log('2. 🟠 Forcer la réinitialisation des mots de passe pour ces utilisateurs')
    console.log('3. 🟡 Vérifier les sauvegardes et les supprimer')
    console.log('4. 🔵 Notifier les utilisateurs concernés (obligation RGPD)\n')

    // Proposer le nettoyage automatique
    console.log('💡 Pour nettoyer automatiquement:')
    console.log('   npx ts-node scripts/clean-password-leaks.ts\n')

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPasswordLeaks()
