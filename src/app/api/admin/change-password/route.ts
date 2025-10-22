import { NextRequest, NextResponse } from 'next/server';
import { isAdminRole } from '@/lib/admin-roles';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { validatePassword } from '@/lib/password-validation';

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const { currentPassword, newPassword } = await request.json();

    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value ||
                 request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
    }

    // Validation du nouveau mot de passe avec politique stricte
    const passwordValidation = validatePassword(newPassword, undefined, {
      name: user.name,
      email: user.email
    });

    if (!passwordValidation.isValid) {
      return NextResponse.json({
        error: 'Le nouveau mot de passe est trop faible',
        details: passwordValidation.errors,
        strength: passwordValidation.strength,
        score: passwordValidation.score
      }, { status: 400 });
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ 
      message: 'Mot de passe modifié avec succès' 
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur lors du changement de mot de passe' },
      { status: 500 }
    );
  }
}