import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { checkStrictRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
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

    const { email, password, rememberMe } = await request.json();

    // Utiliser getPrismaClient pour s'assurer que la connexion est active
    const prisma = await getPrismaClient();

    // Chercher l'utilisateur par email (utiliser findFirst car email n'est plus unique seul)
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        organization: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const token = generateToken(
      {
        userId: user.id,
        role: user.role,
        organizationId: user.organizationId
      },
      rememberMe
    );

    // Créer la réponse
    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Ajouter le cookie HTTPOnly pour plus de sécurité
    // Durée adaptée selon "Se souvenir de moi"
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 jours ou 7 jours
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}