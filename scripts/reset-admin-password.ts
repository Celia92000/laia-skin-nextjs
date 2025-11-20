import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPassword() {
  const email = 'celia.ivorra95@hotmail.fr' // Compte SUPER_ADMIN
  const organizationId = '9739c909-c945-4548-bf53-4d226457f630' // LAIA Skin Institut
  const newPassword = 'Laia2024!Admin' // Mot de passe temporaire

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const user = await prisma.user.update({
      where: {
        organizationId_email: {
          organizationId,
          email
        }
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true
      }
    })

    console.log('\n✅ Mot de passe réinitialisé avec succès!\n')
    console.log('=== INFORMATIONS DE CONNEXION ===')
    console.log(`Email: ${user.email}`)
    console.log(`Mot de passe: ${newPassword}`)
    console.log(`Rôle: ${user.role}`)
    console.log(`Organisation ID: ${user.organizationId}`)
    console.log('\n⚠️  Changez ce mot de passe après votre première connexion!')
    console.log('\nURL de connexion: http://localhost:3001/login')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
