import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDemoSlots() {
  const now = new Date()
  
  // Créer des créneaux pour les 7 prochains jours
  const slots = []
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(now)
    date.setDate(date.getDate() + day + 1) // Commencer demain
    
    // Créer 3 créneaux par jour : 10h, 14h, 16h
    const times = [
      { hour: 10, minute: 0 },
      { hour: 14, minute: 0 },
      { hour: 16, minute: 0 }
    ]
    
    for (const time of times) {
      const slotDate = new Date(date)
      slotDate.setHours(time.hour, time.minute, 0, 0)
      
      slots.push({
        date: slotDate,
        duration: 30,
        isAvailable: true
      })
    }
  }
  
  // Insérer les créneaux
  const created = await prisma.demoSlot.createMany({
    data: slots,
    skipDuplicates: true
  })
  
  console.log(`✅ ${created.count} créneaux de démo créés`)
  
  // Afficher les créneaux créés
  const allSlots = await prisma.demoSlot.findMany({
    where: {
      date: { gte: now }
    },
    orderBy: { date: 'asc' },
    take: 10
  })
  
  console.log('\n📅 Prochains créneaux disponibles:')
  allSlots.forEach(slot => {
    console.log(`   - ${slot.date.toLocaleString('fr-FR')} (${slot.duration} min)`)
  })
}

createDemoSlots()
  .then(() => {
    console.log('\n✨ Terminé !')
    process.exit(0)
  })
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
