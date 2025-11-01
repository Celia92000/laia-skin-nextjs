import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  try {
    console.log('🧪 Testing Review model with organizationId...')

    // Essayer de lire les reviews
    const reviews = await prisma.review.findMany({
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`✅ Successfully fetched ${reviews.length} reviews`)

    if (reviews.length > 0) {
      console.log('\n📋 Sample review:')
      console.log({
        id: reviews[0].id,
        organizationId: reviews[0].organizationId,
        userId: reviews[0].userId,
        rating: reviews[0].rating,
        hasOrganizationId: reviews[0].organizationId !== null
      })
    }

    console.log('\n✨ Test completed successfully!')
    console.log('✅ La colonne organizationId est maintenant disponible dans le modèle Review')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

test()
