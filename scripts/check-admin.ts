import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    // Trouver TOUTES les organisations
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        ownerEmail: true
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
      console.log(`   Owner: ${org.ownerEmail}`)

      // Trouver les admins de cette organisation
      const admins = await prisma.user.findMany({
        where: {
          organizationId: org.id,
          role: { in: ['ORG_ADMIN', 'ORG_OWNER', 'SUPER_ADMIN'] }
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          lastLoginAt: true
        },
        orderBy: { email: 'asc' }
      })

      if (admins.length === 0) {
        console.log('   ⚠️  Aucun admin trouvé')
      } else {
        console.log(`\n   👥 Administrateurs (${admins.length}):`)
        admins.forEach(admin => {
          console.log(`      • ${admin.email} (${admin.role})`)
          console.log(`        Nom: ${admin.name}`)
          console.log(`        Tel: ${admin.phone || 'N/A'}`)
          console.log(`        Dernière connexion: ${admin.lastLoginAt || 'Jamais'}`)
        })
      }

      console.log('\n   ' + '─'.repeat(60))
    }
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
