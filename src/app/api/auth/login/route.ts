import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { checkStrictRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import { validateBody, loginSchema } from '@/lib/validations';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m'; // Token d'accès court (15 minutes)
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // Refresh token standard (30 jours)
const REFRESH_TOKEN_EXPIRY_REMEMBER_DAYS = 90; // Avec "Se souvenir de moi" (90 jours)

export async function POST(request: NextRequest) {
  try {
    // 🔒 Rate limiting : 5 tentatives de connexion max par minute
    const ip = getClientIp(request);
    const { success, limit, remaining } = await checkStrictRateLimit(`login:${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: `Trop de tentatives. Veuillez réessayer dans 1 minute. (${remaining}/${limit} restantes)` },
        { status: 429 }
      );
    }

    // 🔒 Validation Zod des données d'entrée
    const validation = await validateBody(request, loginSchema);
    if (!validation.success) {
      return validation.error;
    }
    const { email, password, rememberMe } = validation.data;

    // Utiliser getPrismaClient pour s'assurer que la connexion est active
    const prisma = await getPrismaClient();

    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation du site (optionnel pour super-admin)
    const organizationId = await getCurrentOrganizationId();

    // 🔒 Chercher l'utilisateur par email
    // Pour le super-admin : accepter sans organizationId
    // Pour les autres : vérifier l'organizationId pour éviter la connexion cross-tenant
    let user;

    // D'abord chercher un super-admin avec cet email
    user = await prisma.user.findFirst({
      where: {
        email,
        role: 'SUPER_ADMIN'
      },
      include: {
        organization: true
      }
    });

    // Si pas de super-admin trouvé, chercher un utilisateur normal dans l'organisation
    if (!user && organizationId) {
      user = await prisma.user.findFirst({
        where: {
          email,
          organizationId: organizationId
        },
        include: {
          organization: true
        }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    // Vérifier que l'utilisateur a un mot de passe (pas OAuth)
    if (!user.password) {
      return NextResponse.json({ error: 'Impossible de se connecter avec un compte OAuth' }, { status: 400 });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    // Générer l'access token (JWT court - 15 minutes)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        organizationId: user.organizationId
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Générer le refresh token (token opaque stocké en base)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiryDays = rememberMe ? REFRESH_TOKEN_EXPIRY_REMEMBER_DAYS : REFRESH_TOKEN_EXPIRY_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiryDays);

    // Récupérer les infos de l'appareil pour le tracking
    const userAgent = request.headers.get('user-agent') || undefined;

    // Stocker le refresh token en base de données
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
        userAgent,
        ipAddress: ip
      }
    });

    // Mettre à jour la date de dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Définir l'access token (cookie httpOnly court - 15 min)
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    });

    // Définir le refresh token (cookie httpOnly long - 30 ou 90 jours)
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshTokenExpiryDays * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Erreur login:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
