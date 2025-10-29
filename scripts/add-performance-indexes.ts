import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Ajout des index pour améliorer les performances...')

  try {
    // Index sur SiteConfig - très fréquemment recherché par organizationId
    console.log('  ✓ Index sur SiteConfig.organizationId...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "SiteConfig_organizationId_idx"
      ON "SiteConfig"("organizationId");
    `

    // Index sur ApiToken - recherché par platform et organizationId
    console.log('  ✓ Index sur ApiToken.organizationId...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ApiToken_organizationId_idx"
      ON "ApiToken"("organizationId");
    `

    console.log('  ✓ Index sur ApiToken.platform...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ApiToken_platform_idx"
      ON "ApiToken"("platform");
    `

    // Index composé pour chercher par organization + platform (très commun)
    console.log('  ✓ Index composé sur ApiToken (organizationId + platform)...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ApiToken_organizationId_platform_idx"
      ON "ApiToken"("organizationId", "platform");
    `

    // Index sur User.organizationId pour les jointures rapides
    console.log('  ✓ Index sur User.organizationId...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "User_organizationId_idx"
      ON "User"("organizationId");
    `

    // Index sur User.role pour filtrer rapidement par rôle
    console.log('  ✓ Index sur User.role...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "User_role_idx"
      ON "User"("role");
    `

    // Index sur Organization.slug pour recherche rapide
    console.log('  ✓ Index sur Organization.slug...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Organization_slug_idx"
      ON "Organization"("slug");
    `

    // Index sur Reservation.organizationId
    console.log('  ✓ Index sur Reservation.organizationId...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Reservation_organizationId_idx"
      ON "Reservation"("organizationId");
    `

    // Index sur Service.organizationId
    console.log('  ✓ Index sur Service.organizationId...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Service_organizationId_idx"
      ON "Service"("organizationId");
    `

    console.log('\n✅ Index créés avec succès !')
    console.log('Les requêtes devraient être beaucoup plus rapides maintenant.')
  } catch (error) {
    console.error('❌ Erreur lors de la création des index:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
