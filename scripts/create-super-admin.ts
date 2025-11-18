// Script pour créer ou promouvoir un utilisateur en SUPER_ADMIN
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  const email = 'superadmin@laiaskin.com'
  const password = 'SuperAdmin2024!' // À CHANGER immédiatement après première connexion
  const name = 'Super Administrateur'

  console.log('🚀 Création du compte Super Admin...\n')

  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await prisma.user.findFirst({
      where: { email }
    })

    const hashedPassword = await bcrypt.hash(password, 10)

    if (user) {
      // Mettre à jour l'utilisateur existant
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'SUPER_ADMIN',
          organizationId: null, // SUPER_ADMIN n'est lié à aucune organisation
          password: hashedPassword
        }
      })
      console.log('✅ Utilisateur existant promu en SUPER_ADMIN')
    } else {
      // Créer un nouvel utilisateur
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'SUPER_ADMIN',
          organizationId: null, // SUPER_ADMIN n'est lié à aucune organisation
        }
      })
      console.log('✅ Nouveau compte SUPER_ADMIN créé')
    }

    console.log('\n📋 Informations de connexion:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email:    ${email}`)
    console.log(`Password: ${password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n🔐 IMPORTANT: Changez ce mot de passe après la première connexion !')
    console.log('\n🌐 Connectez-vous à: http://localhost:3001/login')
    console.log('   Puis accédez à: http://localhost:3001/super-admin')

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
