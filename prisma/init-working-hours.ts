import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🕐 Initialisation des horaires de travail...")

  // Définir les horaires par défaut (14h-20h tous les jours)
  const defaultHours = [
    { dayOfWeek: 0, startTime: '14:00', endTime: '20:00', isOpen: true }, // Dimanche
    { dayOfWeek: 1, startTime: '14:00', endTime: '20:00', isOpen: true }, // Lundi
    { dayOfWeek: 2, startTime: '14:00', endTime: '20:00', isOpen: true }, // Mardi
    { dayOfWeek: 3, startTime: '14:00', endTime: '20:00', isOpen: true }, // Mercredi
    { dayOfWeek: 4, startTime: '14:00', endTime: '20:00', isOpen: true }, // Jeudi
    { dayOfWeek: 5, startTime: '14:00', endTime: '20:00', isOpen: true }, // Vendredi
    { dayOfWeek: 6, startTime: '14:00', endTime: '20:00', isOpen: true }, // Samedi
  ]

  for (const hours of defaultHours) {
    await prisma.workingHours.upsert({
      where: { dayOfWeek: hours.dayOfWeek },
      update: hours,
      create: hours
    })
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