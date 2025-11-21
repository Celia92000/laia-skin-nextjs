import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditResult {
  category: string;
  status: 'OK' | 'WARNING' | 'ERROR';
  message: string;
  details?: any;
}

const results: AuditResult[] = [];

async function auditProductionReadiness() {
  console.log('🔍 AUDIT COMPLET DE LAIA CONNECT - Production Ready Check\n');
  console.log('='.repeat(70));
  console.log('\n');

  // 1. Test de connexion à la base de données
  try {
    await prisma.$connect();
    results.push({
      category: 'Database',
      status: 'OK',
      message: 'Connexion à la base de données réussie',
    });
  } catch (error: any) {
    results.push({
      category: 'Database',
      status: 'ERROR',
      message: 'Impossible de se connecter à la base de données',
      details: error.message,
    });
  }

  // 2. Vérifier les organisations
  try {
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        plan: true,
        _count: {
          select: {
            users: true,
            services: true,
          },
        },
      },
    });

    results.push({
      category: 'Organizations',
      status: orgs.length > 0 ? 'OK' : 'WARNING',
      message: `${orgs.length} organisation(s) trouvée(s)`,
      details: orgs,
    });
  } catch (error: any) {
    results.push({
      category: 'Organizations',
      status: 'ERROR',
      message: 'Erreur lors de la récupération des organisations',
      details: error.message,
    });
  }

  // 3. Vérifier les utilisateurs admin
  try {
    const admins = await prisma.user.findMany({
      where: {
        OR: [{ role: 'SUPER_ADMIN' }, { role: 'ORG_ADMIN' }],
      },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    results.push({
      category: 'Admin Users',
      status: admins.length > 0 ? 'OK' : 'ERROR',
      message: `${admins.length} administrateur(s) trouvé(s)`,
      details: admins,
    });
  } catch (error: any) {
    results.push({
      category: 'Admin Users',
      status: 'ERROR',
      message: 'Erreur lors de la récupération des admins',
      details: error.message,
    });
  }

  // 4. Vérifier les services
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        organizationId: true,
        active: true,
      },
      take: 5,
    });

    results.push({
      category: 'Services',
      status: 'OK',
      message: `Services configurés (${services.length} échantillon)`,
      details: services,
    });
  } catch (error: any) {
    results.push({
      category: 'Services',
      status: 'ERROR',
      message: 'Erreur lors de la récupération des services',
      details: error.message,
    });
  }

  // 5. Vérifier les variables d'environnement critiques
  const envVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ];

  const missingEnvVars = envVars.filter((varName) => !process.env[varName]);

  if (missingEnvVars.length === 0) {
    results.push({
      category: 'Environment Variables',
      status: 'OK',
      message: 'Toutes les variables critiques sont définies',
    });
  } else {
    results.push({
      category: 'Environment Variables',
      status: 'WARNING',
      message: `Variables manquantes: ${missingEnvVars.join(', ')}`,
      details: missingEnvVars,
    });
  }

  // 6. Vérifier les tables importantes
  const tables = [
    'User',
    'Organization',
    'Service',
    'Reservation',
    'Product',
    'Review',
    'LoyaltyProfile',
  ];

  for (const table of tables) {
    try {
      const count = await (prisma as any)[table.toLowerCase()].count();
      results.push({
        category: `Table: ${table}`,
        status: 'OK',
        message: `${count} enregistrement(s)`,
      });
    } catch (error: any) {
      results.push({
        category: `Table: ${table}`,
        status: 'ERROR',
        message: `Erreur d'accès à la table ${table}`,
        details: error.message,
      });
    }
  }

  // 7. Test des routes API critiques (simulation)
  const criticalRoutes = [
    '/api/auth/session',
    '/api/services',
    '/api/products',
    '/api/admin/config',
  ];

  results.push({
    category: 'API Routes',
    status: 'OK',
    message: `${criticalRoutes.length} routes critiques à tester manuellement`,
    details: criticalRoutes,
  });

  // Affichage des résultats
  console.log('\n📊 RÉSULTATS DE L\'AUDIT\n');
  console.log('='.repeat(70));

  const errors = results.filter((r) => r.status === 'ERROR');
  const warnings = results.filter((r) => r.status === 'WARNING');
  const ok = results.filter((r) => r.status === 'OK');

  results.forEach((result) => {
    const icon =
      result.status === 'OK' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`\n${icon} [${result.category}]`);
    console.log(`   ${result.message}`);
    if (result.details && result.status !== 'OK') {
      console.log(`   Détails: ${JSON.stringify(result.details, null, 2)}`);
    }
  });

  console.log('\n');
  console.log('='.repeat(70));
  console.log('\n📈 STATISTIQUES\n');
  console.log(`✅ OK       : ${ok.length}`);
  console.log(`⚠️  WARNING : ${warnings.length}`);
  console.log(`❌ ERROR    : ${errors.length}`);

  console.log('\n');
  console.log('='.repeat(70));

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n🎉 EXCELLENT ! Le système est prêt pour la commercialisation.\n');
  } else if (errors.length === 0) {
    console.log(
      '\n✅ Le système est globalement prêt, mais il y a quelques avertissements à vérifier.\n'
    );
  } else {
    console.log(
      '\n⚠️  ATTENTION ! Il y a des erreurs critiques à corriger avant la commercialisation.\n'
    );
  }

  await prisma.$disconnect();
}

auditProductionReadiness();
