import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function main() {
  console.log("📦 Export des données...")

  // Exporter tous les services
  const services = await prisma.service.findMany()
  
  // Exporter tous les utilisateurs
  const users = await prisma.user.findMany()
  
  // Exporter tous les articles de blog
  const blogPosts = await prisma.blogPost.findMany()
  
  // Exporter toutes les réservations
  const reservations = await prisma.reservation.findMany()

  const exportData = {
    exportDate: new Date().toISOString(),
    counts: {
      services: services.length,
      users: users.length,
      blogPosts: blogPosts.length,
      reservations: reservations.length
    },
    data: {
      services,
      users,
      blogPosts,
      reservations
    }
  }

  // Sauvegarder dans un fichier JSON
  await fs.writeFile(
    'prisma/export-backup.json',
    JSON.stringify(exportData, null, 2)
  )

  console.log("✅ Export terminé !")
  console.log(`- ${services.length} services`)
  console.log(`- ${users.length} utilisateurs`)
  console.log(`- ${blogPosts.length} articles de blog`)
  console.log(`- ${reservations.length} réservations`)
  console.log("\n📁 Fichier sauvegardé : prisma/export-backup.json")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })