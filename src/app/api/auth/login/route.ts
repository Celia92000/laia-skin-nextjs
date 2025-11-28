import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { checkStrictRateLimit, getClientIp } from '@/lib/rateLimit';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import { validateBody, loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation du site
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

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

    // 🔒 Chercher l'utilisateur par email
    // Pour le super-admin : accepter sans organizationId
    // Pour les autres : vérifier l'organizationId pour éviter la connexion cross-tenant
    const user = await prisma.user.findFirst({
      where: {
        email,
        OR: [
          { role: 'SUPER_ADMIN' }, // Super-admin peut se connecter depuis n'importe où
          { organizationId: organizationId } // Utilisateurs normaux doivent être sur le bon site
        ]
      },
      include: {
        organization: true
      }
    });

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