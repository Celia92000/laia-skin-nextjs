import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
