import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setSuperAdminPassword() {
  const email = 'superadmin@laiaskin.com'
  const newPassword = 'SuperAdmin123!'

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: (await prisma.user.findFirst({ where: { email } }))!.id },
    data: { password: hashedPassword }
  })

  console.log('✅ Mot de passe Super Admin mis à jour')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Email:    ', email)
  console.log('Password: ', newPassword)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n🌐 URL: http://localhost:3001/super-admin')

  await prisma.$disconnect()
}

setSuperAdminPassword()
