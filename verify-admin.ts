import { getPrismaClient } from './src/lib/prisma';

async function verifyAdmin() {
  const prisma = await getPrismaClient();
  
  try {
    const admin = await prisma.user.findFirst({
      where: {
        email: 'admin@laiaskin.com'
      }
    });
    
    if (!admin) {
      console.log('❌ Admin non trouvé');
      return;
    }
    
    console.log('✅ Admin trouvé:');
    console.log('Email:', admin.email);
    console.log('Rôle:', admin.role);
    console.log('Organization ID:', admin.organizationId);
    console.log('ID:', admin.id);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();
