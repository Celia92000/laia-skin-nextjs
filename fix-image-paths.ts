import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orgId = '9739c909-c945-4548-bf53-4d226457f630'
  
  const updates = [
    { name: "Hydro'Naissance", newPath: "/services/hydro-naissance.jpg" },
    { name: "Hydro'Cleaning", newPath: "/services/hydro-cleaning.jpg" },
    { name: "Renaissance", newPath: "/services/renaissance.jpg" },
    { name: "BB Glow", newPath: "/services/bb-glow.jpg" },
    { name: "LED Thérapie", newPath: "/services/led-therapie.jpg" }
  ]
  
  for (const update of updates) {
    const result = await prisma.service.updateMany({
      where: { 
        organizationId: orgId,
        name: update.name
      },
      data: { mainImage: update.newPath }
    })
    console.log(`✅ ${update.name}: ${result.count} service(s) mis à jour avec ${update.newPath}`)
  }
  
  console.log('\n✨ Tous les chemins d\'images ont été corrigés !')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
