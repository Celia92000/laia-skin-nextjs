import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetLaiaAdmins() {
  const organizationId = '9739c909-c945-4548-bf53-4d226457f630' // Laia Skin Institut
  const newPassword = 'Laia2024!Admin'

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Réinitialiser admin@laiaskin.com
    await prisma.user.update({
      where: {
        organizationId_email: {
          organizationId,
          email: 'admin@laiaskin.com'
        }
      },
      data: { password: hashedPassword }
    })
    console.log('✅ admin@laiaskin.com → Laia2024!Admin')

    // Réinitialiser celia@laiaskin.com
    await prisma.user.update({
      where: {
        organizationId_email: {
          organizationId,
          email: 'celia@laiaskin.com'
        }
      },
      data: { password: hashedPassword }
    })
    console.log('✅ celia@laiaskin.com → Laia2024!Admin')

    // Réinitialiser celia@laiaskin.fr
    await prisma.user.update({
      where: {
        organizationId_email: {
          organizationId,
          email: 'celia@laiaskin.fr'
        }
      },
      data: { password: hashedPassword }
    })
    console.log('✅ celia@laiaskin.fr → Laia2024!Admin')

    console.log('\n═══════════════════════════════════════════')
    console.log('✅ TOUS LES ADMINS LAIA SKIN INSTITUT')
    console.log('═══════════════════════════════════════════\n')
    console.log('Mot de passe pour tous: Laia2024!Admin\n')
    console.log('Utilisez un de ces emails pour vous connecter:')
    console.log('  • admin@laiaskin.com')
    console.log('  • celia@laiaskin.com')
    console.log('  • celia@laiaskin.fr')
    console.log('\n')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetLaiaAdmins()
