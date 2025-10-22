import { getPrismaClient } from './src/lib/prisma';

async function checkAdminRole() {
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
    
    console.log('Admin trouvé:');
    console.log('Email:', admin.email);
    console.log('Rôle actuel:', admin.role);
    console.log('ID:', admin.id);
    
    if (admin.role !== 'ADMIN') {
      console.log('\n⚠️ Le rôle doit être "ADMIN" (en majuscules)');
      console.log('Mise à jour du rôle...');
      
      await prisma.user.update({
        where: { id: admin.id },
        data: { role: 'ADMIN' }
      });
      
      console.log('✅ Rôle mis à jour vers ADMIN');
    } else {
      console.log('✅ Le rôle est correct');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminRole();
