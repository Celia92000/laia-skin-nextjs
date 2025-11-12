import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié', valid: false }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide', valid: false }, { status: 401 });
    }

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Utilisateur non trouvé', valid: false }, { status: 404 });
    }

    // Récupérer le code de la carte cadeau
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code requis', valid: false }, { status: 400 });
    }

    // 🔒 Chercher la carte cadeau DANS CETTE ORGANISATION
    const giftCard = await prisma.giftCard.findFirst({
      where: {
        code: code.toUpperCase(),
        organizationId: user.organizationId
      },
      include: {
        purchaser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!giftCard) {
      return NextResponse.json({
        error: 'Code invalide',
        valid: false
      }, { status: 404 });
    }

    // Vérifier l'expiration
    if (giftCard.expiryDate && new Date(giftCard.expiryDate) < new Date()) {
      return NextResponse.json({
        error: 'Carte cadeau expirée',
        valid: false
      }, { status: 400 });
    }

    // Vérifier le statut
    if (giftCard.status !== 'active') {
      return NextResponse.json({
        error: `Carte cadeau ${giftCard.status === 'used' ? 'déjà utilisée' : 'inactive'}`,
        valid: false
      }, { status: 400 });
    }

    // Vérifier le solde
    if (giftCard.balance <= 0) {
      return NextResponse.json({
        error: 'Solde insuffisant',
        valid: false
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        balance: giftCard.balance,
        initialAmount: giftCard.initialAmount,
        purchasedFor: giftCard.purchasedFor,
        expiryDate: giftCard.expiryDate
      }
    });
  } catch (error) {
    console.error('Erreur vérification carte cadeau:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      valid: false
    }, { status: 500 });
  }
}
