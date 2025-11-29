import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Obtenir l'origine depuis la requête
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  // Supprimer le refresh token de la base de données
  const refreshToken = request.cookies.get('refresh-token')?.value;
  if (refreshToken) {
    try {
      const prisma = await getPrismaClient();
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    } catch (error) {
      console.error('Erreur suppression refresh token:', error);
    }
  }

  // Créer la réponse de redirection
  const response = NextResponse.redirect(new URL('/login', origin));

  // Supprimer les cookies d'authentification
  response.cookies.delete('auth-token');
  response.cookies.delete('refresh-token');

  return response;
}

export async function POST(request: NextRequest) {
  // Supprimer le refresh token de la base de données
  const refreshToken = request.cookies.get('refresh-token')?.value;
  if (refreshToken) {
    try {
      const prisma = await getPrismaClient();
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    } catch (error) {
      console.error('Erreur suppression refresh token:', error);
    }
  }

  // Créer la réponse JSON
  const response = NextResponse.json({
    success: true,
    message: 'Déconnexion réussie'
  });

  // Supprimer les cookies d'authentification
  response.cookies.delete('auth-token');
  response.cookies.delete('refresh-token');

  return response;
}
