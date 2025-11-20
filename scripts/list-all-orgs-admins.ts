import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listAll() {
  try {
    // Toutes les organisations
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        ownerEmail: true,
        domain: true,
        subdomain: true
      },
      orderBy: { name: 'asc' }
    })

    console.log('\n═══════════════════════════════════════════')
    console.log('📊 TOUTES LES ORGANISATIONS')
    console.log('═══════════════════════════════════════════\n')

    for (const org of orgs) {
      console.log(`\n📁 ${org.name}`)
      console.log(`   ID: ${org.id}`)
      console.log(`   Slug: ${org.slug}`)
      console.log(`   Domain: ${org.domain || 'N/A'}`)
      console.log(`   Subdomain: ${org.subdomain}`)
      console.log(`   Owner: ${org.ownerEmail}`)

      // Trouver les admins
      const admins = await prisma.user.findMany({
        where: {
          organizationId: org.id,
          role: { in: ['ORG_ADMIN', 'ORG_OWNER', 'SUPER_ADMIN'] }
        },
        select: {
          email: true,
          name: true,
          role: true
        }
      })

      if (admins.length > 0) {
        console.log(`\n   👥 Administrateurs (${admins.length}):`)
        admins.forEach(admin => {
          console.log(`      • ${admin.email} (${admin.role}) - ${admin.name}`)
        })
      } else {
        console.log(`   ⚠️  Aucun admin trouvé`)
      }
      
      console.log('\n   ' + '─'.repeat(60))
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listAll()
