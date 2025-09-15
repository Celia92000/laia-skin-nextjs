import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'

// IMPORTANT : Ce script utilise les variables d'environnement
// Assurez-vous que DATABASE_URL pointe vers Supabase
const prisma = new PrismaClient()

async function main() {
  console.log("📥 Import des données vers Supabase...")
  
  try {
    // Lire le fichier d'export
    const exportFile = await fs.readFile('prisma/export-backup.json', 'utf-8')
    const exportData = JSON.parse(exportFile)
    
    console.log(`\n📊 Données à importer :`)
    console.log(`- ${exportData.counts.services} services`)
    console.log(`- ${exportData.counts.users} utilisateurs`)
    console.log(`- ${exportData.counts.blogPosts} articles`)
    
    // 1. Importer les utilisateurs
    console.log("\n👥 Import des utilisateurs...")
    for (const user of exportData.data.users) {
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            phone: user.phone,
            role: user.role,
            loyaltyPoints: user.loyaltyPoints,
            totalSpent: user.totalSpent,
            adminNotes: user.adminNotes,
            allergies: user.allergies,
            birthDate: user.birthDate ? new Date(user.birthDate) : null,
            lastVisit: user.lastVisit ? new Date(user.lastVisit) : null,
            medicalNotes: user.medicalNotes,
            preferences: user.preferences,
            skinType: user.skinType,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        })
        console.log(`  ✓ ${user.email}`)
      } catch (e) {
        console.log(`  ⚠️  ${user.email} existe déjà`)
      }
    }
    
    // 2. Importer les services
    console.log("\n🎨 Import des services...")
    for (const service of exportData.data.services) {
      try {
        await prisma.service.create({
          data: {
            id: service.id,
            slug: service.slug,
            name: service.name,
            shortDescription: service.shortDescription,
            description: service.description,
            metaTitle: service.metaTitle,
            metaDescription: service.metaDescription,
            keywords: service.keywords,
            price: service.price,
            launchPrice: service.launchPrice,
            promoPrice: service.promoPrice,
            forfaitPrice: service.forfaitPrice,
            forfaitPromo: service.forfaitPromo,
            duration: service.duration,
            benefits: service.benefits,
            process: service.process,
            recommendations: service.recommendations,
            contraindications: service.contraindications,
            mainImage: service.mainImage,
            gallery: service.gallery,
            videoUrl: service.videoUrl,
            canBeOption: service.canBeOption,
            category: service.category,
            order: service.order,
            active: service.active,
            featured: service.featured,
            createdAt: new Date(service.createdAt),
            updatedAt: new Date(service.updatedAt)
          }
        })
        console.log(`  ✓ ${service.name}`)
      } catch (e) {
        console.log(`  ⚠️  ${service.name} existe déjà`)
      }
    }
    
    // 3. Importer les articles de blog
    console.log("\n📝 Import des articles...")
    for (const post of exportData.data.blogPosts) {
      try {
        await prisma.blogPost.create({
          data: {
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            author: post.author,
            readTime: post.readTime,
            featured: post.featured,
            published: post.published,
            mainImage: post.mainImage,
            gallery: post.gallery,
            tags: post.tags,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            publishedAt: new Date(post.publishedAt),
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt)
          }
        })
        console.log(`  ✓ ${post.title}`)
      } catch (e) {
        console.log(`  ⚠️  ${post.title} existe déjà`)
      }
    }
    
    console.log("\n✅ Import terminé avec succès !")
    console.log("\n🎉 Votre base Supabase est maintenant configurée avec toutes vos données !")
    
  } catch (error) {
    console.error("❌ Erreur lors de l'import :", error)
    console.log("\n💡 Vérifiez que :")
    console.log("1. DATABASE_URL pointe vers Supabase")
    console.log("2. Le schéma a été migré (npx prisma db push)")
    console.log("3. Le fichier export-backup.json existe")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })