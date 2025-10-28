import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { endpoint } = await request.json();
    const prisma = await getPrismaClient();

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: decoded.userId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Push Unsubscribe] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors du désabonnement' },
      { status: 500 }
    );
  }
}
