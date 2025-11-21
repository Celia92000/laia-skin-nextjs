import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement (.env d'abord, puis .env.local pour surcharger)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

import { generateToken } from '../src/lib/auth';

const prisma = new PrismaClient();

async function testSuperAdminAPI() {
  try {
    console.log('=== Test API Super-Admin ===\n');
    console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes (' + process.env.JWT_SECRET.substring(0, 10) + '...)' : 'No');

    // 1. Trouver ou créer un super-admin
    let superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!superAdmin) {
      console.log('Création d\'un super-admin de test...');
      const hashedPassword = await bcrypt.hash('SuperAdmin2024!', 10);
      superAdmin = await prisma.user.create({
        data: {
          email: 'superadmin@laia.com',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPER_ADMIN',
          password: hashedPassword,
          active: true,
          emailVerified: true
        }
      });
      console.log('Super-admin créé:', superAdmin.email);
    } else {
      console.log('Super-admin existant:', superAdmin.email);
    }

    // 2. Générer un token JWT
    const token = generateToken({
      userId: superAdmin.id,
      role: 'SUPER_ADMIN',
      organizationId: null
    });
    console.log('Token JWT généré\n');

    // Debug: vérifier ce que contient le token
    const { verifyToken } = await import('../src/lib/auth');
    const decoded = verifyToken(token);
    console.log('Token décodé:', decoded);

    // 3. Tester l'API organizations-list
    console.log('\nTest de /api/super-admin/organizations-list...');
    console.log('Token envoyé (length:', token.length, ')');
    const response = await fetch('http://localhost:3001/api/super-admin/organizations-list', {
      headers: {
        'Cookie': `auth-token=${token}`
      }
    });

    console.log('Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ API fonctionnelle');
      console.log('Organisations trouvées:', data.organizations?.length || 0);

      if (data.organizations && data.organizations.length > 0) {
        data.organizations.forEach((org: any) => {
          console.log(`  - ${org.name} (${org.slug}) - Plan: ${org.plan}`);
        });
      }
    }

  } catch (error) {
    console.error('Erreur test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSuperAdminAPI();