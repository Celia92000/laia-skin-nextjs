import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreLaiaOrganization() {
  try {
    console.log('=== Vérification de l\'organisation Laia Skin Institut ===\n');

    // 1. Lister toutes les organisations existantes
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        status: true
      }
    });

    console.log('Organisations existantes:');
    organizations.forEach(org => {
      console.log(`- ${org.name} (${org.slug}) - Plan: ${org.plan}, Status: ${org.status}`);
    });
    console.log('');

    // 2. Vérifier si Laia Skin Institut existe
    const laiaOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { slug: 'laia-skin-institut' },
          { name: { contains: 'Laia Skin' } }
        ]
      }
    });

    if (laiaOrg) {
      console.log('✅ Laia Skin Institut trouvée:');
      console.log(`   ID: ${laiaOrg.id}`);
      console.log(`   Nom: ${laiaOrg.name}`);
      console.log(`   Slug: ${laiaOrg.slug}`);
      console.log(`   Plan: ${laiaOrg.plan}`);
      console.log(`   Status: ${laiaOrg.status}`);

      // Vérifier si elle a les bonnes configurations
      if (laiaOrg.plan !== 'ENTERPRISE' || laiaOrg.status !== 'ACTIVE') {
        console.log('\n⚠️ Mise à jour nécessaire...');
        const updated = await prisma.organization.update({
          where: { id: laiaOrg.id },
          data: {
            plan: 'ENTERPRISE',
            status: 'ACTIVE'
          }
        });
        console.log('✅ Organisation mise à jour avec plan ENTERPRISE et status ACTIVE');
      }
    } else {
      console.log('❌ Laia Skin Institut non trouvée. Création en cours...\n');

      // Créer l'organisation
      const newOrg = await prisma.organization.create({
        data: {
          name: 'Laia Skin Institut',
          slug: 'laia-skin-institut',
          legalName: 'LAIA SKIN INSTITUT SARL',
          siret: '98765432100001',
          vatNumber: 'FR98765432100',
          ownerFirstName: 'Célia',
          ownerLastName: 'Propriétaire',
          ownerEmail: 'celia@laiaskin.com',
          ownerPhone: '+33612345678',
          plan: 'ENTERPRISE',
          status: 'ACTIVE',
          domain: 'laiaskin.fr',
          subdomain: 'laia-skin-institut',
          websiteTemplateId: 'template-beauty-1',
          features: {
            maxLocations: -1,
            maxUsers: -1,
            hasAdvancedReporting: true,
            hasEmailMarketing: true,
            hasSmsMarketing: true,
            hasWhatsappIntegration: true,
            hasSocialMediaManagement: true,
            hasBlogManagement: true,
            hasStockManagement: true,
            hasLoyaltyProgram: true,
            hasMultiLanguage: true,
            hasCustomDomain: true,
            hasApiAccess: true,
            hasCustomIntegrations: true
          }
        }
      });

      console.log('✅ Organisation créée avec succès:');
      console.log(`   ID: ${newOrg.id}`);
      console.log(`   Nom: ${newOrg.name}`);
      console.log(`   Plan: ENTERPRISE avec toutes les fonctionnalités`);

      // Créer un emplacement par défaut
      const location = await prisma.location.create({
        data: {
          organizationId: newOrg.id,
          name: 'Institut Principal',
          address: '123 Rue de la Beauté',
          city: 'Paris',
          postalCode: '75001',
          country: 'France',
          phone: '+33612345678',
          email: 'contact@laiaskin.com',
          isActive: true
        }
      });

      console.log(`   Location créée: ${location.name}`);

      // Créer un utilisateur admin
      const admin = await prisma.user.create({
        data: {
          email: 'celia@laiaskin.com',
          firstName: 'Célia',
          lastName: 'Admin',
          role: 'ORG_ADMIN',
          organizationId: newOrg.id,
          locationId: location.id,
          active: true,
          emailVerified: true,
          password: '$2a$10$5fHxh3R0XhP7uQqV0VZqueEJiB5nX2dVcBzWyY/cB9gWHQzF.3Xna' // Hash for Laia2024!Admin
        }
      });

      console.log(`   Admin créé: ${admin.email}`);
    }

    console.log('\n=== Vérification terminée ===');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreLaiaOrganization();