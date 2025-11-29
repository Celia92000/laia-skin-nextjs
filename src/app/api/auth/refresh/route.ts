import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { log } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m'; // Token d'accès court (15 minutes)
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // Refresh token long (30 jours)

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    // Lire le refresh token depuis le cookie httpOnly
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token manquant' },
        { status: 401 }
      );
    }

    // Vérifier le refresh token en base de données
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            organizationId: true,
            loyaltyPoints: true,
            totalSpent: true
          }
        }
      }
    });

    if (!storedToken) {
      // Token non trouvé - possiblement volé ou révoqué
      log.warn('Refresh token non trouvé en base');
      return NextResponse.json(
        { error: 'Session invalide. Veuillez vous reconnecter.' },
        { status: 401 }
      );
    }

    // Vérifier l'expiration
    if (new Date() > storedToken.expiresAt) {
      // Supprimer le token expiré
      await prisma.refreshToken.delete({
        where: { id: storedToken.id }
      });

      return NextResponse.json(
        { error: 'Session expirée. Veuillez vous reconnecter.' },
        { status: 401 }
      );
    }

    const user = storedToken.user;

    // Générer un nouveau access token (JWT court)
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        organizationId: user.organizationId
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Rotation du refresh token (plus sécurisé - empêche la réutilisation)
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    // Mettre à jour le refresh token en base (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt
      }
    });

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        totalSpent: user.totalSpent
      }
    });

    // Définir le nouveau access token (cookie httpOnly court)
    response.cookies.set('auth-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    });

    // Définir le nouveau refresh token (cookie httpOnly long)
    response.cookies.set('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60, // 30 jours
      path: '/'
    });

    return response;
  } catch (error) {
    log.error('Erreur refresh token:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
