import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

// Fonction pour vérifier l'authentification admin
async function verifyAdmin(request: NextRequest) {
  // Vérifier d'abord les cookies, puis les headers
  const cookieStore = await cookies();
  let token = cookieStore.get('auth-token')?.value;

  if (!token) {
    token = request.headers.get('authorization')?.replace('Bearer ', '');
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const prisma = await getPrismaClient();
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin'].includes(user.role)) {
      return null;
    }

    return user;
  } catch (error) {
    log.error('Erreur vérification admin:', error);
    return null;
  }
}

// GET - Récupérer la configuration du site
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin || !admin.organizationId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const prisma = await getPrismaClient();

    // Récupérer ou créer la configuration de l'organisation
    let config = await prisma.organizationConfig.findUnique({
      where: { organizationId: admin.organizationId ?? undefined }
    });

    if (!config) {
      // Créer une configuration par défaut
      config = await prisma.organizationConfig.create({
        data: {
          organizationId: admin.organizationId ?? undefined,
          siteName: 'LAIA SKIN Institut',
          siteTagline: 'Institut de Beauté & Bien-être',
          email: 'contact@laiaskininstitut.fr',
          phone: '+33 6 31 10 75 31',
          primaryColor: '#d4b5a0',
          secondaryColor: '#2c3e50',
          accentColor: '#20b2aa',
          crispEnabled: false
        }
      });
    }

    // Ajouter un alias websiteTemplate pour compatibilité avec AdminConfigTab
    const configWithAlias = {
      ...config,
      websiteTemplate: config.homeTemplate || 'modern'
    };

    return NextResponse.json(configWithAlias);
  } catch (error) {
    log.error('Erreur lors de la récupération de la configuration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour la configuration
export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin || !admin.organizationId) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const prisma = await getPrismaClient();
    const data = await request.json();

    // Log pour déboguer
    log.info('Données reçues:', { data });

    // Retirer l'id et organizationId du data pour éviter les erreurs
    const { id, organizationId, websiteTemplate, ...rest } = data;

    // Filtrer UNIQUEMENT les champs valides du schéma OrganizationConfig
    const validFields = [
      'siteName', 'siteTagline', 'siteDescription',
      'email', 'contactEmail', 'phone', 'address', 'city', 'postalCode', 'country',
      'facebook', 'instagram', 'tiktok', 'whatsapp', 'linkedin', 'youtube',
      'primaryColor', 'secondaryColor', 'accentColor', 'logoUrl', 'faviconUrl',
      'fontFamily', 'headingFont', 'baseFontSize', 'headingSize',
      'businessHours', 'latitude', 'longitude', 'googleMapsUrl',
      'heroTitle', 'heroSubtitle', 'heroImage', 'heroVideo', 'aboutText',
      'founderName', 'founderTitle', 'founderQuote', 'founderImage',
      'aboutIntro', 'aboutParcours', 'testimonials', 'formations',
      'termsAndConditions', 'privacyPolicy', 'legalNotice',
      'emailSignature', 'welcomeEmailText',
      'legalName', 'siret', 'siren', 'tvaNumber', 'apeCode', 'rcs', 'capital', 'legalForm',
      'insuranceCompany', 'insuranceContract', 'insuranceAddress',
      'bankName', 'bankIban', 'bankBic',
      'legalRepName', 'legalRepTitle',
      'googleAnalyticsId', 'facebookPixelId', 'metaVerificationCode', 'googleVerificationCode',
      'crispWebsiteId', 'crispEnabled',
      'defaultMetaTitle', 'defaultMetaDescription', 'defaultMetaKeywords',
      'homeTemplate', 'homeSections', 'footerConfig', 'extendedColors', 'customizedFields',
      'googlePlaceId', 'googleBusinessUrl', 'googleApiKey', 'lastGoogleSync', 'autoSyncGoogleReviews'
    ];

    // Inclure TOUS les champs valides, même vides (chaînes vides '')
    // Cela permet de synchroniser les suppressions de contenu
    const updateData: any = {};
    for (const field of validFields) {
      if (rest.hasOwnProperty(field) && rest[field] !== undefined) {
        // Accepter tous les types de valeurs, y compris les chaînes vides
        updateData[field] = rest[field];
      }
    }

    // Convertir websiteTemplate en homeTemplate pour compatibilité
    if (websiteTemplate) {
      updateData.homeTemplate = websiteTemplate;
    }

    log.info('Données filtrées:', { updateData });

    // Récupérer la config existante
    let config = await prisma.organizationConfig.findUnique({
      where: { organizationId: admin.organizationId ?? undefined }
    });

    if (config) {
      // Mettre à jour
      config = await prisma.organizationConfig.update({
        where: { organizationId: admin.organizationId ?? undefined },
        data: updateData
      });
      log.info(`✅ Configuration mise à jour pour l'organisation ${admin.organizationId} - Synchronisée sur site vitrine, admin et espace client`);
    } else {
      // Créer
      config = await prisma.organizationConfig.create({
        data: {
          ...updateData,
          organizationId: admin.organizationId ?? undefined
        }
      });
      log.info(`✅ Configuration créée pour l'organisation ${admin.organizationId} - Synchronisée sur site vitrine, admin et espace client`);
    }

    // Ajouter l'alias websiteTemplate pour compatibilité
    const configWithAlias = {
      ...config,
      websiteTemplate: config.homeTemplate || 'modern'
    };

    return NextResponse.json(configWithAlias);
  } catch (error: any) {
    log.error('Erreur lors de la mise à jour de la configuration:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la mise à jour',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
