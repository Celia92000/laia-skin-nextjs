import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🕐 Initialisation des horaires de travail...")

  // Récupérer la première location
  let location = await prisma.location.findFirst({
    where: { isMainLocation: true }
  })

  if (!location) {
    location = await prisma.location.findFirst()
  }

  if (!location) {
    console.log("⚠️ Aucune location trouvée. Création d'une location par défaut...")
    location = await prisma.location.create({
      data: {
        name: "Institut Principal",
        address: "À définir",
        city: "Paris",
        postalCode: "75001",
        isMainLocation: true,
        active: true
      }
    })
  }

  // Définir les horaires par défaut (14h-20h tous les jours)
  const defaultHours = [
    { dayOfWeek: 0, startTime: '14:00', endTime: '20:00', isOpen: true, locationId: location.id }, // Dimanche
    { dayOfWeek: 1, startTime: '14:00', endTime: '20:00', isOpen: true, locationId: location.id }, // Lundi
    { dayOfWeek: 2, startTime: '14:00', endTime: '20:00', isOpen: true, locationId: location.id }, // Mardi
    { dayOfWeek: 3, startTime: '14:00', endTime: '20:00', isOpen: true, locationId: location.id }, // Mercredi
    { dayOfWeek: 4, startTime: '14:00', endTime: '20:00', isOpen: true, locationId: location.id }, // Jeudi
    { dayOfWeek: 5, startTime: '14:00', endTime: '20:00', isOpen: true, locationId: location.id }, // Vendredi
    { dayOfWeek: 6, startTime: '14:00', endTime: '20:00', isOpen: true, locationId: location.id }, // Samedi
  ]

  for (const hours of defaultHours) {
    // Chercher si l'enregistrement existe déjà
    const existing = await prisma.workingHours.findFirst({
      where: {
        dayOfWeek: hours.dayOfWeek,
        locationId: hours.locationId
      }
    })

    if (existing) {
      await prisma.workingHours.update({
        where: { id: existing.id },
        data: {
          startTime: hours.startTime,
          endTime: hours.endTime,
          isOpen: hours.isOpen
        }
      })
    } else {
      await prisma.workingHours.create({
        data: hours
      })
    }
  }

  console.log("✅ Horaires de travail initialisés")
  
  // Afficher les horaires
  const allHours = await prisma.workingHours.findMany({
    orderBy: { dayOfWeek: 'asc' }
  })
  
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  
  console.log("\n📅 Horaires configurés :")
  allHours.forEach(h => {
    console.log(`  ${dayNames[h.dayOfWeek]}: ${h.isOpen ? `${h.startTime} - ${h.endTime}` : 'Fermé'}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())