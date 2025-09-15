import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer tous les services
  const allServices = await prisma.service.findMany({
    orderBy: { order: 'asc' }
  })
  
  console.log("📋 TOUS LES SERVICES DANS LA BASE :")
  console.log("=====================================")
  
  const activeServices = []
  const inactiveServices = []
  
  allServices.forEach(service => {
    if (service.active) {
      activeServices.push(service)
      console.log(`✅ ${service.name} (${service.category}) - ${service.price}€ - ACTIF`)
    } else {
      inactiveServices.push(service)
      console.log(`❌ ${service.name} - INACTIF`)
    }
  })
  
  console.log("\n📊 RÉSUMÉ :")
  console.log(`- Services actifs : ${activeServices.length}`)
  console.log(`- Services inactifs : ${inactiveServices.length}`)
  console.log(`- Total : ${allServices.length}`)
  
  // Nettoyer pour ne garder que les 5 services voulus
  console.log("\n🧹 NETTOYAGE - Garder uniquement 5 services :")
  console.log("1. Hydro'Naissance (Soin signature)")
  console.log("2. Renaissance (Soins essentiels)")
  console.log("3. Hydro'Cleaning (Soins essentiels)")
  console.log("4. BB Glow (Soins essentiels)")
  console.log("5. LED Thérapie (Soins essentiels)")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())