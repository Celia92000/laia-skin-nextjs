import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("🔐 Création/Réinitialisation du compte admin...")

  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Supprimer l'ancien admin s'il existe
  await prisma.user.deleteMany({
    where: { email: 'admin@laiaskin.com' }
  })

  // Créer le nouveau compte admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@laiaskin.com',
      password: hashedPassword,
      name: 'Admin LAIA SKIN',
      phone: '0600000000',
      role: 'admin'
    }
  })

  console.log("✅ Compte admin créé avec succès !")
  console.log("📧 Email : admin@laiaskin.com")
  console.log("🔑 Mot de passe : admin123")
  console.log("\n🌐 Connectez-vous sur : http://localhost:3000/login")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())