import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function checkAdminRole() {
  console.log('🔍 Vérification du rôle admin...\n');
  
  try {
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@laiaskin.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true
      }
    });

    if (admin) {
      console.log('✅ Utilisateur trouvé:');
      console.log('   Email:', admin.email);
      console.log('   Nom:', admin.name);
      console.log('   Rôle:', admin.role);
      console.log('   Organization ID:', admin.organizationId);
    } else {
      console.log('❌ Utilisateur admin@laiaskin.com non trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminRole();
