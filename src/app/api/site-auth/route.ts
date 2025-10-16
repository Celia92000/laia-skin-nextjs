import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Vérifier le mot de passe avec la variable d'environnement
    if (password === process.env.SITE_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // Définir un cookie qui expire dans 7 jours
      response.cookies.set('site-auth', password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Mot de passe incorrect' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
