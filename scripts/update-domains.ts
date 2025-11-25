import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  console.log('🔍 Vérification des organisations...')
  
  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true, slug: true, domain: true, subdomain: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  console.table(orgs)
  
  console.log('\n📝 Mise à jour LAIA Connect...')
  const laiaConnect = await prisma.organization.updateMany({
    where: {
      OR: [
        { slug: 'laia-connect' },
        { name: { contains: 'LAIA Connect', mode: 'insensitive' } }
      ]
    },
    data: {
      domain: 'laiaconnect.fr',
      subdomain: 'laia-connect'
    }
  })
  console.log(`✅ ${laiaConnect.count} organisation(s) mise(s) à jour`)
  
  console.log('\n📝 Mise à jour Laia Skin Institut...')
  const laiaSkin = await prisma.organization.updateMany({
    where: { slug: 'laia-skin-institut' },
    data: {
      domain: 'laiaskininstitut.fr',
      subdomain: 'laia-skin-institut'
    }
  })
  console.log(`✅ ${laiaSkin.count} organisation(s) mise(s) à jour`)
  
  console.log('\n🔍 Vérification finale...')
  const updated = await prisma.organization.findMany({
    where: {
      slug: { in: ['laia-connect', 'laia-skin-institut'] }
    },
    select: { name: true, slug: true, domain: true, subdomain: true }
  })
  
  console.table(updated)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
