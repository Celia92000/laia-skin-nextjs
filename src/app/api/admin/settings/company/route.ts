import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { getSiteConfig } from '@/lib/config-service';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const config = await getSiteConfig();
  const siteName = config.siteName || 'Mon Institut';
  const email = config.email || 'contact@institut.fr';
  const primaryColor = config.primaryColor || '#d4b5a0';
  const phone = config.phone || '06 XX XX XX XX';
  const address = config.address || '';
  const city = config.city || '';
  const postalCode = config.postalCode || '';
  const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
  const website = config.customDomain || 'https://votre-institut.fr';
  const ownerName = config.legalRepName?.split(' ')[0] || 'Votre esthéticienne';


  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || (user.role as string) !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les paramètres depuis la base de données
    const settings = await prisma.setting.findFirst({
      where: { key: 'company_info' }
    });

    if (!settings) {
      // Retourner les valeurs par défaut
      return NextResponse.json({
        name: `${siteName}`,
        legalName: "${siteName} SARL",
        address: {
          street: "123 Avenue de la Beauté",
          zipCode: "75001",
          city: "Paris",
          country: "France"
        },
        phone: "${phone}",
        email: "contact@laiaskin.fr",
        website: "www.laiaskin.fr",
        siret: "123 456 789 00012",
        siren: "123 456 789",
        tva: "FR 12 123456789",
        ape: "9602B",
        rcs: "Paris 123 456 789",
        capital: "10 000 €",
        legalForm: "SARL",
        insuranceCompany: "AXA France",
        insuranceContract: "1234567",
        legalRepName: "Laïa [Nom]",
        legalRepTitle: "Gérante",
        bankName: "BNP Paribas",
        iban: "FR76 1234 5678 9012 3456 7890 123",
        bic: "BNPAFRPPXXX",
        vatRegime: "franchise",
        vatRate: "20"
      });
    }

    return NextResponse.json(JSON.parse(settings.value));
  } catch (error) {
    log.error('Erreur GET company settings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || (user.role as string) !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const companyData = await request.json();

    // Sauvegarder ou mettre à jour dans la base de données
    await prisma.setting.upsert({
      where: { key: 'company_info' },
      update: {
        value: JSON.stringify(companyData),
        updatedAt: new Date()
      },
      create: {
        key: 'company_info',
        value: JSON.stringify(companyData),
        description: 'Informations légales de l\'entreprise pour les factures'
      }
    });

    return NextResponse.json({ success: true, data: companyData });
  } catch (error) {
    log.error('Erreur POST company settings:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des paramètres' },
      { status: 500 }
    );
  }
}