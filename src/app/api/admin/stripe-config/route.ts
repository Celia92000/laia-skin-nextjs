import { NextRequest, NextResponse } from 'next/server';
import { isAdminRole } from '@/lib/admin-roles';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// GET - Récupérer la configuration Stripe
export async function GET(req: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!isAdminRole(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer la configuration Stripe depuis la base de données
    const stripeConfig = await prisma.setting.findUnique({
      where: { key: 'stripe_config' }
    });

    if (stripeConfig) {
      const config = JSON.parse(stripeConfig.value);
      // Ne jamais renvoyer la clé secrète complète, juste un aperçu
      return NextResponse.json({
        hasPublishableKey: !!config.publishableKey,
        hasSecretKey: !!config.secretKey,
        hasWebhookSecret: !!config.webhookSecret,
        publishableKey: config.publishableKey,
        secretKeyPreview: config.secretKey ? `${config.secretKey.substring(0, 7)}...${config.secretKey.substring(config.secretKey.length - 4)}` : null,
        webhookSecretPreview: config.webhookSecret ? `${config.webhookSecret.substring(0, 8)}...` : null,
        isConfigured: !!(config.publishableKey && config.secretKey)
      });
    }

    return NextResponse.json({
      hasPublishableKey: false,
      hasSecretKey: false,
      hasWebhookSecret: false,
      isConfigured: false
    });

  } catch (error) {
    console.error('Erreur récupération configuration Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour la configuration Stripe
export async function PUT(req: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!isAdminRole(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { publishableKey, secretKey, webhookSecret } = await req.json();

    // Valider le format des clés
    if (publishableKey && !publishableKey.startsWith('pk_')) {
      return NextResponse.json(
        { error: 'La clé publique doit commencer par pk_' },
        { status: 400 }
      );
    }

    if (secretKey && !secretKey.startsWith('sk_')) {
      return NextResponse.json(
        { error: 'La clé secrète doit commencer par sk_' },
        { status: 400 }
      );
    }

    if (webhookSecret && !webhookSecret.startsWith('whsec_')) {
      return NextResponse.json(
        { error: 'Le secret webhook doit commencer par whsec_' },
        { status: 400 }
      );
    }

    // Sauvegarder la configuration
    await prisma.setting.upsert({
      where: { key: 'stripe_config' },
      update: {
        value: JSON.stringify({
          publishableKey,
          secretKey,
          webhookSecret
        }),
        updatedAt: new Date()
      },
      create: {
        key: 'stripe_config',
        value: JSON.stringify({
          publishableKey,
          secretKey,
          webhookSecret
        })
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration Stripe mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour configuration Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la configuration' },
      { status: 500 }
    );
  }
}
