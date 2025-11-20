import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@laiaskin.com'
  const newPassword = 'Admin2024!' // Mot de passe temporaire

  console.log('=== RÉINITIALISATION DU MOT DE PASSE ===\n')

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, email: true, role: true }
  })

  if (!user) {
    console.log(`❌ Utilisateur ${email} introuvable`)
    return
  }

  console.log(`✅ Utilisateur trouvé:`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Role: ${user.role}`)
  console.log('')

  // Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // Mettre à jour le mot de passe
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  })

  console.log('✅ Mot de passe réinitialisé avec succès!\n')
  console.log('📧 Email: admin@laiaskin.com')
  console.log('🔑 Mot de passe: Admin2024!')
  console.log('\n⚠️  Changez ce mot de passe après votre première connexion!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
