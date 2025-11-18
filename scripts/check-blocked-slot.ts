import { prisma } from '../src/lib/prisma'

async function checkBlockedSlots() {
  const blockedSlotsWithoutLocation = await prisma.blockedSlot.count({
    where: { locationId: null }
  })

  console.log(`BlockedSlot.locationId null: ${blockedSlotsWithoutLocation}`)

  if (blockedSlotsWithoutLocation === 0) {
    console.log('✅ On peut rendre locationId obligatoire')
  } else {
    console.log(`⚠️  ${blockedSlotsWithoutLocation} BlockedSlots sans locationId`)
  }

  await prisma.$disconnect()
}

checkBlockedSlots()
