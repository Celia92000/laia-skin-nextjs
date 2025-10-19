import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  /* Code désactivé temporairement - À RÉACTIVER EN PRODUCTION
  // TEMPORAIREMENT DÉSACTIVÉ - Retourner next() pour tout
  return NextResponse.next();
  */

  // Ne pas appliquer le middleware aux routes API, assets statiques, login, etc.
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/public/') ||
    request.nextUrl.pathname.startsWith('/login')
  ) {
    return NextResponse.next();
  }

  // Détection du tenant (organisation) basée sur le domaine/subdomain
  const host = request.headers.get('host') || 'localhost:3001'
  const cleanHost = host.split(':')[0].toLowerCase()

  // Ajouter le host aux headers pour accès dans les Server Components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-host', cleanHost)

  // Routes protégées
  const protectedPaths = ['/admin', '/espace-client', '/comptable'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Vérifier le token dans les cookies d'abord, puis dans le header
    const cookieToken = request.cookies.get('auth-token')?.value;
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const token = cookieToken || headerToken;

    if (!token) {
      // Rediriger vers la page de login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decoded = verifyToken(token);

      if (!decoded) {
        // Token invalide, rediriger vers login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token');
        return response;
      }

      // Ajouter les informations de l'utilisateur aux headers
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('x-user-role', decoded.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // En cas d'erreur, rediriger vers login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // Pour toutes les autres routes, passer les headers du tenant
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};