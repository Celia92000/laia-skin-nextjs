import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Nettoyage et export final...")
  
  // Supprimer les services inactifs
  const deleted = await prisma.service.deleteMany({
    where: { active: false }
  })
  console.log(`✅ ${deleted.count} services inactifs supprimés`)
  
  // Récupérer les données propres
  const services = await prisma.service.findMany({
    orderBy: { order: 'asc' }
  })
  const users = await prisma.user.findMany()
  const blogPosts = await prisma.blogPost.findMany()
  const reservations = await prisma.reservation.findMany()
  
  // Export final
  const exportData = {
    exportDate: new Date().toISOString(),
    projectName: "LAIA SKIN Institut",
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
  
  // Sauvegarder
  await fs.writeFile(
    'prisma/laia-skin-final-export.json',
    JSON.stringify(exportData, null, 2)
  )
  
  console.log("\n✅ Export final terminé !")
  console.log("=====================================")
  console.log(`📊 Contenu exporté :`)
  console.log(`- ${services.length} services`)
  services.forEach(s => console.log(`  • ${s.name} (${s.price}€)`))
  console.log(`- ${users.length} utilisateurs`)
  console.log(`- ${blogPosts.length} articles de blog`)
  console.log(`- ${reservations.length} réservations`)
  console.log("\n📁 Fichier : prisma/laia-skin-final-export.json")
  console.log("\n🚀 Prêt pour Supabase !")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())