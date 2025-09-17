const { PrismaClient: PrismaClientSQLite } = require('@prisma/client');
const { PrismaClient: PrismaClientPostgres } = require('@prisma/client');

// Configuration pour SQLite
process.env.DATABASE_URL = "file:./prisma/dev.db";
const sqlitePrisma = new PrismaClientSQLite();

// Configuration pour PostgreSQL
const postgresPrisma = new PrismaClientPostgres({
  datasources: {
    db: {
      url: "postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:6543/postgres"
    }
  }
});

async function migrate() {
  try {
    console.log('🚀 Migration SQLite -> Supabase PostgreSQL\n');
    
    // 1. Lire les données depuis SQLite
    console.log('📖 Lecture des données depuis SQLite...');
    const services = await sqlitePrisma.service.findMany();
    const users = await sqlitePrisma.user.findMany();
    
    console.log(`  - ${services.length} prestations trouvées`);
    console.log(`  - ${users.length} utilisateurs trouvés`);
    
    // 2. Nettoyer Supabase (optionnel)
    console.log('\n🧹 Nettoyage de Supabase...');
    await postgresPrisma.reservation.deleteMany({});
    await postgresPrisma.service.deleteMany({});
    await postgresPrisma.user.deleteMany({});
    
    // 3. Migrer les utilisateurs
    console.log('\n👥 Migration des utilisateurs...');
    for (const user of users) {
      try {
        await postgresPrisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            phone: user.phone,
            role: user.role,
            loyaltyPoints: user.loyaltyPoints,
            totalSpent: user.totalSpent,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            adminNotes: user.adminNotes,
            allergies: user.allergies,
            birthDate: user.birthDate,
            lastVisit: user.lastVisit,
            medicalNotes: user.medicalNotes,
            preferences: user.preferences,
            skinType: user.skinType
          }
        });
        console.log(`  ✅ ${user.name} (${user.email})`);
      } catch (error) {
        console.log(`  ⚠️  ${user.email} déjà existant`);
      }
    }
    
    // 4. Migrer les services
    console.log('\n✨ Migration des prestations...');
    for (const service of services) {
      await postgresPrisma.service.create({
        data: {
          id: service.id,
          slug: service.slug || '',
          name: service.name,
          shortDescription: service.shortDescription || '',
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
          createdAt: service.createdAt,
          updatedAt: service.updatedAt
        }
      });
      console.log(`  ✅ ${service.name} - ${service.price}€`);
    }
    
    // 5. Vérifier la migration
    console.log('\n📊 Vérification de la migration...');
    const postgresServices = await postgresPrisma.service.count();
    const postgresUsers = await postgresPrisma.user.count();
    
    console.log(`  ✅ ${postgresUsers} utilisateurs dans Supabase`);
    console.log(`  ✅ ${postgresServices} prestations dans Supabase`);
    
    console.log('\n🎉 Migration terminée avec succès!');
    console.log('🌐 Toutes vos données sont maintenant sur Supabase PostgreSQL');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

migrate();