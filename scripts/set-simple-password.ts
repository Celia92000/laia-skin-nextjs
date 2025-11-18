import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setSimplePassword() {
  const email = 'superadmin@laiaskin.com'
  const newPassword = 'admin123'

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: (await prisma.user.findFirst({ where: { email } }))!.id },
    data: { password: hashedPassword }
  })

  console.log('✅ Mot de passe mis à jour')
  console.log('Email:', email)
  console.log('Password:', newPassword)

  await prisma.$disconnect()
}

setSimplePassword()
