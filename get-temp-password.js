/**
 * Script pour récupérer le mot de passe temporaire
 * Note: Le mot de passe est hashé en BDD, impossible à récupérer
 * Il faut soit :
 * 1. Utiliser la fonction "Mot de passe oublié"
 * 2. Réinitialiser le mot de passe manuellement
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetPassword() {
  console.log('🔐 Réinitialisation du mot de passe...\n')

  try {
    // Trouver l'organisation d'abord
    const organization = await prisma.organization.findFirst({
      where: {
        slug: 'institut-beaute-celia'
      }
    })

    if (!organization) {
      console.log('❌ Organisation non trouvée')
      return
    }

    const user = await prisma.user.findFirst({
      where: {
        email: 'celia.ivorra95@hotmail.fr',
        organizationId: organization.id
      },
      include: {
        organization: true
      }
    })

    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return
    }

    console.log('✅ Utilisateur trouvé:')
    console.log('  - Email:', user.email)
    console.log('  - Nom:', user.name)
    console.log('  - Rôle:', user.role)
    console.log('  - Organisation:', user.organization?.name)
    console.log('')

    // Générer un nouveau mot de passe temporaire
    const newPassword = 'Celia2025!'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    console.log('✅ Mot de passe réinitialisé avec succès!')
    console.log('')
    console.log('=' .repeat(60))
    console.log('🔑 Identifiants de connexion:')
    console.log('=' .repeat(60))
    console.log('Email:', user.email)
    console.log('Mot de passe:', newPassword)
    console.log('')
    console.log('🌐 URL de connexion:')
    console.log('http://localhost:3001/admin')
    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
