import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrismaClient();

    // Lire le token d'accès depuis le cookie httpOnly
    const accessToken = request.cookies.get('auth-token')?.value;
    const refreshToken = request.cookies.get('refresh-token')?.value;

    // Essayer de vérifier l'access token
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, JWT_SECRET) as {
          userId: string;
          role: string;
          organizationId: string;
        };

        // Access token valide - récupérer les infos utilisateur
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            organizationId: true,
            organization: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        });

        if (!user) {
          return NextResponse.json(
            { authenticated: false, user: null },
            { status: 401 }
          );
        }

        return NextResponse.json({
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
            organizationName: user.organization?.name
          }
        });
      } catch (tokenError) {
        // Access token expiré ou invalide - essayer de refresh
      }
    }

    // Access token absent ou expiré - essayer avec le refresh token
    if (!refreshToken) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    // Vérifier le refresh token en base
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
            organization: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!storedToken || new Date() > storedToken.expiresAt) {
      // Refresh token invalide ou expiré
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    const user = storedToken.user;

    // Générer un nouveau access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        organizationId: user.organizationId
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Rotation du refresh token (sécurité renforcée)
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt
      }
    });

    // Créer la réponse avec les nouveaux cookies
    const response = NextResponse.json({
      authenticated: true,
      refreshed: true, // Indique qu'un refresh a eu lieu
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name
      }
    });

    // Définir les nouveaux cookies
    response.cookies.set('auth-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    });

    response.cookies.set('refresh-token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Erreur /api/auth/me:', error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    );
  }
}
