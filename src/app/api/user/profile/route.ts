import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // 🔒 Récupérer les infos utilisateur ET vérifier l'organizationId
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          organizationId: decoded.organizationId
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          loyaltyPoints: true,
          totalSpent: true,
          preferences: true,
          allergies: true,
          skinType: true,
          birthDate: true,
          lastVisit: true
        }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      
      // Pour l'espace client, on affiche juste le prénom
      let displayName = user.name;
      
      // Extraire le prénom (premier mot du nom complet)
      if (displayName) {
        const firstName = displayName.split(' ')[0];
        displayName = firstName;
      }
      
      return NextResponse.json({
        ...user,
        name: displayName
      });
      
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
  } catch (error) {
    log.error('Erreur récupération profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const body = await request.json();

      // 🔒 Vérifier que l'utilisateur appartient à l'organisation
      const existingUser = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          organizationId: decoded.organizationId
        }
      });

      if (!existingUser) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }

      // Mettre à jour les infos utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          phone: body.phone,
          allergies: body.allergies,
          skinType: body.skinType,
          preferences: body.preferences
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          loyaltyPoints: true,
          totalSpent: true,
          preferences: true,
          allergies: true,
          skinType: true
        }
      });
      
      return NextResponse.json({
        success: true,
        user: updatedUser
      });
      
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
  } catch (error) {
    log.error('Erreur mise à jour profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}