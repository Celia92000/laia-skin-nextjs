import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAll() {
  const email = 'celia.ivorra95@hotmail.fr'
  const newPassword = 'Laia2024!Admin'

  try {
    // Trouver tous les comptes avec cet email
    const users = await prisma.user.findMany({
      where: { email },
      include: {
        Organization: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    console.log(`\n🔍 Trouvé ${users.length} compte(s) avec l'email ${email}\n`)

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    for (const user of users) {
      console.log(`📝 Mise à jour du compte dans "${user.Organization?.name}"...`)
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      console.log(`   ✅ Mot de passe mis à jour\n`)
    }

    console.log('\n═══════════════════════════════════════════')
    console.log('✅ TOUS LES COMPTES ONT ÉTÉ MIS À JOUR !')
    console.log('═══════════════════════════════════════════\n')
    console.log(`Email: ${email}`)
    console.log(`Mot de passe: ${newPassword}\n`)
    console.log('Vous pouvez maintenant vous connecter avec ces identifiants.')
    console.log('Le système vous connectera à la première organisation trouvée.\n')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAll()
