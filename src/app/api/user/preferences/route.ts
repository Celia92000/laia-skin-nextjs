import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const prisma = await getPrismaClient();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 Récupérer user avec vérification organizationId
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        organizationId: decoded.organizationId
      },
      select: {
        preferences: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Parse preferences from JSON string
    let userPreferences = {
      emailNotifications: true,
      whatsappNotifications: true
    };

    if (user.preferences) {
      try {
        const parsed = JSON.parse(user.preferences);
        userPreferences = { ...userPreferences, ...parsed };
      } catch (e) {
        log.error('Error parsing user preferences:', e);
      }
    }

    return NextResponse.json(userPreferences);

  } catch (error) {
    log.error('Erreur récupération préférences:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const prisma = await getPrismaClient();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications, whatsappNotifications } = body;

    // 🔒 Get current preferences avec vérification organizationId
    const currentUser = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        organizationId: decoded.organizationId
      },
      select: { preferences: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    let currentPreferences = {};
    if (currentUser?.preferences) {
      try {
        currentPreferences = JSON.parse(currentUser.preferences);
      } catch (e) {
        log.error('Error parsing current preferences:', e);
      }
    }

    // Update preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...(emailNotifications !== undefined && { emailNotifications }),
      ...(whatsappNotifications !== undefined && { whatsappNotifications })
    };

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        preferences: JSON.stringify(updatedPreferences)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Préférences mises à jour',
      preferences: updatedPreferences
    });

  } catch (error) {
    log.error('Erreur mise à jour préférences:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}