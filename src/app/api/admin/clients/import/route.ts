import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // 🔒 Vérification Admin obligatoire
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier que l'utilisateur a un rôle admin
  const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT'];
  if (!allowedRoles.includes(decoded.role)) {
    return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
  }

  try {
    const { clients } = await request.json();

    if (!clients || !Array.isArray(clients)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    for (const client of clients) {
      try {
        // Vérifier si le client existe déjà
        const existingUser = await prisma.user.findFirst({
          where: { email: client.email }
        });

        if (existingUser) {
          duplicateCount++;
          continue;
        }

        // Créer un mot de passe temporaire
        const tempPassword = `Laia${Math.random().toString(36).substring(7)}`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Créer le nouveau client
        await prisma.user.create({
          data: {
            name: client.name,
            email: client.email,
            phone: client.phone || null,
            password: hashedPassword,
            role: 'CLIENT',
            birthDate: client.birthDate ? new Date(client.birthDate) : null,
            skinType: client.skinType || null,
            allergies: client.allergies || null,
            medicalNotes: client.medicalNotes || null,
            preferences: client.preferences || null,
            adminNotes: client.adminNotes || null,
            loyaltyPoints: client.loyaltyPoints || 0,
            totalSpent: client.totalSpent || 0
          }
        });

        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Erreur pour ${client.email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        imported: successCount,
        duplicates: duplicateCount,
        errors: errorCount,
        details: errors
      }
    });
  } catch (error) {
    log.error('Erreur lors de l\'import:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import des clients' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}