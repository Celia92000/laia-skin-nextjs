/**
 * Script pour vérifier si l'organisation de test a été créée
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkOrganization() {
  console.log('🔍 Recherche de l\'organisation de test...\n')

  try {
    const organization = await prisma.organization.findFirst({
      where: {
        slug: 'test-institut-beaute'
      },
      include: {
        config: true,
        locations: true,
        users: true,
        services: true
      }
    })

    if (organization) {
      console.log('✅ Organisation trouvée !')
      console.log('=' .repeat(60))
      console.log('📋 Détails:')
      console.log('  - ID:', organization.id)
      console.log('  - Nom:', organization.name)
      console.log('  - Slug:', organization.slug)
      console.log('  - Plan:', organization.plan)
      console.log('  - Status:', organization.status)
      console.log('  - Stripe Customer:', organization.stripeCustomerId)
      console.log('  - Subscription ID:', organization.subscriptionId)
      console.log('  - Créée le:', organization.createdAt)
      console.log('')
      console.log('👤 Utilisateurs:', organization.users.length)
      organization.users.forEach(user => {
        console.log(`    - ${user.name} (${user.email}) - ${user.role}`)
      })
      console.log('')
      console.log('📍 Locations:', organization.locations.length)
      console.log('🛠️ Services:', organization.services.length)
      console.log('⚙️ Config:', organization.config ? 'Oui' : 'Non')
      console.log('=' .repeat(60))
    } else {
      console.log('❌ Organisation non trouvée')
      console.log('')
      console.log('💡 Vérifications possibles:')
      console.log('  1. Le webhook a-t-il été reçu ?')
      console.log('  2. Y a-t-il des erreurs dans les logs du serveur ?')
      console.log('  3. La signature du webhook est-elle valide ?')
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrganization()
