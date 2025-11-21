import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, checkStrictRateLimit, getClientIp } from '@/lib/rateLimit';

export async function middleware(request: NextRequest) {
  // 🔒 RATE LIMITING sur toutes les routes API
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = getClientIp(request);

    // Routes sensibles avec rate limiting strict (5 req/min)
    const strictRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/stripe/',
      '/api/payment/',
      '/api/admin/api-tokens',
    ];

    const isStrictRoute = strictRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );

    // Appliquer le rate limiting
    const rateLimitResult = isStrictRoute
      ? await checkStrictRateLimit(ip)
      : await checkRateLimit(ip);

    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
          retryAfter: Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  // Protection par mot de passe pour tout le site en production
  if (process.env.NODE_ENV === 'production' && process.env.SITE_PASSWORD) {
    const authCookie = request.cookies.get('site-auth');

    // Si pas de cookie d'authentification et pas sur la page de login
    if (!authCookie && !request.nextUrl.pathname.startsWith('/site-login')) {
      const loginUrl = new URL('/site-login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Vérifier que le cookie correspond au mot de passe
    if (authCookie && authCookie.value !== process.env.SITE_PASSWORD) {
      const loginUrl = new URL('/site-login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('site-auth');
      return response;
    }
  }

  // Protection des routes admin
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') ||
                       request.nextUrl.pathname.startsWith('/api/admin');

  if (isAdminRoute) {
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
      // Pas de redirection - laisser la page gérer l'erreur
      return NextResponse.redirect(new URL('/connexion', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
