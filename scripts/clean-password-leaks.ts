/**
 * Script de nettoyage des mots de passe en clair dans la BDD
 * ⚠️ À exécuter UNIQUEMENT après vérification manuelle
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanPasswordLeaks() {
  console.log('🧹 Nettoyage des mots de passe en clair...\n')

  try {
    // Mettre à jour tous les logs pour supprimer les mots de passe
    const result = await prisma.$executeRaw`
      UPDATE "CommunicationLog"
      SET metadata = jsonb_set(
        metadata - 'generatedPassword',
        '{passwordSentViaEmail}',
        'true'::jsonb
      )
      WHERE metadata->>'generatedPassword' IS NOT NULL;
    `

    console.log(`✅ ${result} enregistrements nettoyés avec succès\n`)
    console.log('📊 Vérification finale...')

    // Vérifier qu'il ne reste plus de mots de passe
    const remaining = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM "CommunicationLog"
      WHERE metadata->>'generatedPassword' IS NOT NULL;
    `

    // @ts-ignore
    if (remaining[0]?.count === 0) {
      console.log('✅ Tous les mots de passe ont été supprimés - BDD SÉCURISÉE\n')
    } else {
      // @ts-ignore
      console.log(`⚠️  ${remaining[0]?.count} mots de passe restants - Recommencer le nettoyage\n`)
    }

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanPasswordLeaks()
