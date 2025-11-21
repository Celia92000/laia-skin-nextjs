import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Obtenir l'origine depuis la requête
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  // Créer la réponse de redirection
  const response = NextResponse.redirect(new URL('/login', origin));

  // Supprimer le cookie d'authentification
  response.cookies.delete('auth-token');

  return response;
}

export async function POST() {
  // Créer la réponse JSON
  const response = NextResponse.json({
    success: true,
    message: 'Déconnexion réussie'
  });

  // Supprimer le cookie d'authentification
  response.cookies.delete('auth-token');

  return response;
}
