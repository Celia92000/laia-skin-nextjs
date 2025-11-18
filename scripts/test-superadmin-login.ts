import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  const email = 'superadmin@laiaskin.com'
  const password = 'SuperAdmin2024!'

  console.log('🔍 Recherche de l\'utilisateur...')
  const user = await prisma.user.findFirst({
    where: { email }
  })

  if (!user) {
    console.log('❌ Utilisateur non trouvé')
    return
  }

  console.log('✅ Utilisateur trouvé:')
  console.log('  ID:', user.id)
  console.log('  Email:', user.email)
  console.log('  Name:', user.name)
  console.log('  Role:', user.role)
  console.log('  Password hash:', user.password.substring(0, 30) + '...')

  console.log('\n🔐 Test du mot de passe...')
  const isValid = await bcrypt.compare(password, user.password)

  if (isValid) {
    console.log('✅ Mot de passe VALIDE')
  } else {
    console.log('❌ Mot de passe INVALIDE')

    // Essayons avec d'autres variantes
    const variants = [
      'superadmin2024!',
      'SuperAdmin2024',
      'superAdmin2024!',
      'admin123'
    ]

    console.log('\n🔍 Test de variantes...')
    for (const variant of variants) {
      const valid = await bcrypt.compare(variant, user.password)
      console.log(`  "${variant}": ${valid ? '✅ VALIDE' : '❌ invalide'}`)
    }
  }

  await prisma.$disconnect()
}

testLogin()
