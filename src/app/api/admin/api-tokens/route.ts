import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';
import { listApiTokens, storeApiToken } from '@/lib/api-token-manager';

const prisma = new PrismaClient();

// GET - Liste tous les tokens (sans les déchiffrer)
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const auth = await verifyAuth(request);
    if (!auth.isValid || auth.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tokens = await listApiTokens();

    // Ne jamais renvoyer les tokens déchiffrés
    const sanitizedTokens = tokens.map(token => ({
      id: token.id,
      service: token.service,
      name: token.name,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
      metadata: token.metadata,
    }));

    return NextResponse.json(sanitizedTokens);
  } catch (error) {
    console.error('Erreur récupération tokens:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour un token
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.isValid || auth.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { service, name, token, expiresAt, metadata } = body;

    if (!service || !name || !token) {
      return NextResponse.json(
        { error: 'Service, name et token requis' },
        { status: 400 }
      );
    }

    // Valider le service
    const validServices = ['WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'STRIPE', 'RESEND', 'OTHER'];
    if (!validServices.includes(service)) {
      return NextResponse.json(
        { error: 'Service invalide' },
        { status: 400 }
      );
    }

    // Stocker le token (sera chiffré automatiquement)
    const storedToken = await storeApiToken({
      service,
      name,
      token,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      metadata,
    });

    return NextResponse.json({
      success: true,
      tokenId: storedToken.id,
      message: 'Token enregistré avec succès',
    });
  } catch (error) {
    console.error('Erreur enregistrement token:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
