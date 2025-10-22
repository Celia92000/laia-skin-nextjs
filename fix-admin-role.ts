import { getPrismaClient } from './src/lib/prisma';

async function fixAdminRole() {
  const prisma = await getPrismaClient();
  
  try {
    // Utiliser l'ID trouvé précédemment
    const admin = await prisma.user.update({
      where: {
        id: 'cmfxe1syv0002blz8wz4p28w2'
      },
      data: {
        role: 'ORG_OWNER' // Propriétaire de l'institut
      }
    });
    
    console.log('✅ Rôle admin mis à jour avec succès !');
    console.log('Email:', admin.email);
    console.log('Nouveau rôle:', admin.role);
    console.log('\nVous pouvez maintenant vous connecter à http://localhost:3001/login avec :');
    console.log('Email: admin@laiaskin.com');
    console.log('Mot de passe: A9v*hVrWSG9KeqRA');
    console.log('\nVous serez automatiquement redirigé vers /admin');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminRole();
