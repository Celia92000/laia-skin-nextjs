import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { email: true, name: true, organizationId: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // 🔒 Récupérer les cartes cadeaux achetées DANS CETTE ORGANISATION
    const purchasedGiftCards = await prisma.giftCard.findMany({
      where: {
        purchasedBy: decoded.userId,
        organizationId: user.organizationId
      },
      include: {
        reservations: {
          select: {
            id: true,
            date: true,
            time: true,
            giftCardUsedAmount: true,
            status: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 🔒 Récupérer les cartes cadeaux reçues DANS CETTE ORGANISATION
    const receivedGiftCards = await prisma.giftCard.findMany({
      where: {
        purchasedFor: user.email,
        organizationId: user.organizationId
      },
      include: {
        purchaser: {
          select: {
            name: true,
            email: true
          }
        },
        reservations: {
          select: {
            id: true,
            date: true,
            time: true,
            giftCardUsedAmount: true,
            status: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      purchased: purchasedGiftCards.map(card => ({
        id: card.id,
        code: card.code,
        initialAmount: card.initialAmount,
        balance: card.balance,
        purchasedFor: card.purchasedFor,
        status: card.status,
        createdAt: card.createdAt.toISOString(),
        expiryDate: card.expiryDate?.toISOString(),
        usedDate: card.usedDate?.toISOString(),
        reservations: (card.reservations as any[]).map((res: any) => ({
          id: res.id,
          date: res.date.toISOString(),
          time: res.time,
          amount: res.giftCardUsedAmount,
          status: res.status
        }))
      })),
      received: receivedGiftCards.map(card => ({
        id: card.id,
        code: card.code,
        initialAmount: card.initialAmount,
        balance: card.balance,
        purchasedBy: card.purchaser?.name,
        status: card.status,
        createdAt: card.createdAt.toISOString(),
        expiryDate: card.expiryDate?.toISOString(),
        usedDate: card.usedDate?.toISOString(),
        reservations: (card.reservations as any[]).map((res: any) => ({
          id: res.id,
          date: res.date.toISOString(),
          time: res.time,
          amount: res.giftCardUsedAmount,
          status: res.status
        }))
      }))
    });
  } catch (error) {
    log.error('Erreur lors de la récupération des cartes cadeaux:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
