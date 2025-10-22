import { PrismaClient } from '@prisma/client';
import { encryptConfig } from './src/lib/encryption';

const prisma = new PrismaClient();

async function setupStripe() {
  try {
    console.log('🔄 Configuration de Stripe...');

    // Vérifier si l'intégration Stripe existe déjà
    let stripeIntegration = await prisma.integration.findFirst({
      where: { type: 'stripe' }
    });

    const stripeConfig = {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    };

    if (!stripeConfig.secretKey || !stripeConfig.publishableKey) {
      console.error('❌ Clés Stripe manquantes dans .env.local');
      console.log('Vérifiez que ces variables sont définies :');
      console.log('- STRIPE_SECRET_KEY');
      console.log('- STRIPE_PUBLISHABLE_KEY (ou NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)');
      return;
    }

    // Chiffrer la configuration
    const encryptedConfig = encryptConfig(stripeConfig);

    if (stripeIntegration) {
      // Mettre à jour
      await prisma.integration.update({
        where: { id: stripeIntegration.id },
        data: {
          enabled: true,
          status: 'connected',
          config: encryptedConfig,
          lastSync: new Date()
        }
      });
      console.log('✅ Stripe mis à jour et activé');
    } else {
      // Créer
      await prisma.integration.create({
        data: {
          type: 'stripe',
          enabled: true,
          status: 'connected',
          config: encryptedConfig,
          lastSync: new Date()
        }
      });
      console.log('✅ Stripe configuré et activé');
    }

    console.log('\n📝 Configuration :');
    console.log('- Publishable Key:', stripeConfig.publishableKey?.substring(0, 20) + '...');
    console.log('- Secret Key:', stripeConfig.secretKey?.substring(0, 20) + '...');
    console.log('- Mode:', stripeConfig.secretKey?.startsWith('sk_live') ? '🔴 LIVE (paiements réels)' : '🟢 TEST');

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupStripe();
