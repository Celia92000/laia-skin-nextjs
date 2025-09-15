import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("📊 Vérification des prix actuels dans la base...")
  
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  })
  
  console.log("\n🔍 SERVICES ACTUELS :")
  console.log("=====================")
  
  services.forEach(s => {
    console.log(`\n${s.name} (${s.slug})`)
    console.log(`  Prix normal: ${s.price}€`)
    console.log(`  Prix promo: ${s.launchPrice || s.promoPrice || 'Aucune'}€`)
    console.log(`  Forfait: ${s.forfaitPrice || 'Non défini'}€`)
    console.log(`  Durée: ${s.duration} min`)
    console.log(`  Catégorie: ${s.category}`)
  })
  
  console.log("\n\n❓ PRIX ATTENDUS SELON L'UTILISATEUR :")
  console.log("=========================================")
  console.log("D'après la conversation, les prix corrects sont :")
  console.log("\n🌟 SOIN SIGNATURE")
  console.log("• Hydro'Naissance : 180€ (promo 150€), forfait 3 séances : 400€")
  console.log("  = Hydro'Cleaning + Renaissance combinés")
  
  console.log("\n✨ SOINS ESSENTIELS")
  console.log("• Renaissance (Dermapen) : 120€, forfait 3 séances : 320€")
  console.log("• Hydro'Cleaning (notre HydraFacial) : 80€, forfait 3 séances : 210€")
  console.log("• BB Glow : 90€, forfait 3 séances : 240€")
  console.log("• LED Thérapie : 45€, forfait 6 séances : 240€")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())