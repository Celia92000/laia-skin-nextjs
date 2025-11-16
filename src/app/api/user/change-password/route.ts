import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token) as { userId: string };
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mot de passe actuel et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // 🔒 Récupérer l'utilisateur avec vérification organizationId
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        organizationId: decoded.organizationId
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a un mot de passe (pas OAuth)
    if (!user.password) {
      return NextResponse.json({ error: 'Impossible de changer le mot de passe pour un compte OAuth' }, { status: 400 });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      );
    }

    // Hasher et mettre à jour le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    log.info(`✅ Mot de passe modifié pour l'utilisateur: ${user.email}`);

    return NextResponse.json({
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    log.error('Erreur changement mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}