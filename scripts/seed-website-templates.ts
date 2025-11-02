/**
 * Script pour insérer les templates de sites web dans la base de données
 * Usage: npx tsx scripts/seed-website-templates.ts
 */

import { PrismaClient } from '@prisma/client';
import { websiteTemplates } from '../src/lib/website-templates';

const prisma = new PrismaClient();

async function seedWebsiteTemplates() {
  console.log('🌱 Début de l\'insertion des templates de sites web...\n');

  try {
    // Supprimer les anciens templates (optionnel)
    const deletedCount = await prisma.websiteTemplate.deleteMany({});
    console.log(`🗑️  ${deletedCount.count} anciens templates supprimés\n`);

    // Insérer les nouveaux templates
    for (const template of websiteTemplates) {
      const created = await prisma.websiteTemplate.create({
        data: {
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          minTier: template.minTier,
          config: template.config as any, // JSON field
          displayOrder: template.displayOrder,
          isActive: true,
          previewImageUrl: template.previewImageUrl || null,
        },
      });

      console.log(`✅ Template créé: ${created.name} (${created.minTier})`);
    }

    console.log(`\n🎉 ${websiteTemplates.length} templates insérés avec succès !`);
    console.log('\n📊 Résumé:');
    console.log(`   - Templates DUO: ${websiteTemplates.filter(t => t.minTier === 'DUO').length}`);
    console.log(`   - Templates TEAM: ${websiteTemplates.filter(t => t.minTier === 'TEAM').length}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
seedWebsiteTemplates()
  .then(() => {
    console.log('\n✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });
