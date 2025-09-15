import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("💰 Mise à jour des tarifs de lancement...")

  // 1. Hydro'Naissance
  await prisma.service.update({
    where: { slug: 'hydro-naissance' },
    data: {
      price: 120,  // Prix normal
      launchPrice: 90,  // Prix de lancement
      promoPrice: 90,
      forfaitPrice: 340,  // 90€ × 4 - 20€ = 340€
      duration: 90,
    }
  })
  console.log("✅ Hydro'Naissance : 90€ au lieu de 120€ (Forfait 4 séances : 340€)")

  // 2. Renaissance (Dermapen)
  await prisma.service.update({
    where: { slug: 'renaissance' },
    data: {
      price: 90,  // Prix normal
      launchPrice: 70,  // Prix de lancement
      promoPrice: 70,
      forfaitPrice: 260,  // 4 séances au prix de lancement
      duration: 60,
    }
  })
  console.log("✅ Renaissance : 70€ au lieu de 90€ (Forfait 4 séances : 260€)")

  // 3. Hydro'Cleaning
  await prisma.service.update({
    where: { slug: 'hydro-cleaning' },
    data: {
      price: 90,  // Prix normal
      launchPrice: 70,  // Prix de lancement
      promoPrice: 70,
      forfaitPrice: 260,  // 4 séances au prix de lancement
      duration: 60,
    }
  })
  console.log("✅ Hydro'Cleaning : 70€ au lieu de 90€ (Forfait 4 séances : 260€)")

  // 4. BB Glow
  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: {
      price: 70,  // Prix normal
      launchPrice: 60,  // Prix de lancement
      promoPrice: 60,
      forfaitPrice: 220,  // 4 séances au prix de lancement
      duration: 60,
    }
  })
  console.log("✅ BB Glow : 60€ au lieu de 70€ (Forfait 4 séances : 220€)")

  // 5. LED Thérapie
  await prisma.service.update({
    where: { slug: 'led-therapie' },
    data: {
      price: 60,  // Prix normal
      launchPrice: 45,  // Prix de lancement
      promoPrice: 45,
      forfaitPrice: 160,  // 4 séances au prix de lancement
      duration: 45,
    }
  })
  console.log("✅ LED Thérapie : 45€ au lieu de 60€ (Forfait 4 séances : 160€)")

  // Afficher le récapitulatif
  console.log("\n📊 NOUVEAUX TARIFS DE LANCEMENT")
  console.log("==================================")
  
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  })

  console.log("\n🌟 SOIN SIGNATURE")
  services.filter(s => s.category === 'Soin signature').forEach(s => {
    console.log(`• ${s.name} : ${s.launchPrice || s.promoPrice}€ (au lieu de ${s.price}€) | Forfait 4 séances : ${s.forfaitPrice}€`)
  })

  console.log("\n✨ SOINS ESSENTIELS")
  services.filter(s => s.category === 'Soins essentiels').forEach(s => {
    console.log(`• ${s.name} : ${s.launchPrice || s.promoPrice}€ (au lieu de ${s.price}€) | Forfait 4 séances : ${s.forfaitPrice}€`)
  })

  console.log("\n✅ Tous les tarifs de lancement ont été mis à jour !")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())