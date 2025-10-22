import { getPrismaClient } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function resetAdminPassword() {
  const prisma = await getPrismaClient();
  
  try {
    // Nouveau mot de passe
    const newPassword = 'A9v*hVrWSG9KeqRA';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Trouver l'admin
    const admin = await prisma.user.findFirst({
      where: {
        email: 'admin@laiaskin.com'
      }
    });
    
    if (!admin) {
      console.log('❌ Admin non trouvé');
      return;
    }
    
    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Mot de passe admin réinitialisé avec succès !');
    console.log('Email: admin@laiaskin.com');
    console.log('Mot de passe: A9v*hVrWSG9KeqRA');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
