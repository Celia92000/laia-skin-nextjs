import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Mise à jour de l\'index unique sur User.email...')

  try {
    // 1. Supprimer l'ancien index compound
    console.log('1️⃣ Suppression de l\'ancien index compound organizationId_email...')
    await prisma.$executeRawUnsafe(`
      DROP INDEX IF EXISTS "User_organizationId_email_key"
    `)

    // 2. Créer un nouvel index unique sur email seul
    console.log('2️⃣ Création du nouvel index unique sur email...')
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
    `)

    console.log('\n✅ Index unique sur email créé avec succès!')
    console.log('ℹ️  Les emails sont maintenant uniques globalement (nécessaire pour NextAuth OAuth)')
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ L\'index existe déjà')
    } else if (error.message.includes('duplicate key')) {
      console.error('❌ ERREUR: Il existe des emails en double dans la base!')
      console.error('   Vous devez d\'abord nettoyer les doublons.')
    } else {
      console.error('❌ Erreur:', error.message)
      throw error
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
