import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { log } from '@/lib/logger';

// GET - Récupérer tous les utilisateurs
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    // Seuls SUPER_ADMIN et ORG_OWNER peuvent gérer les utilisateurs
    if (admin?.role && !['SUPER_ADMIN', 'ORG_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé - Seuls les administrateurs peuvent gérer les utilisateurs' }, { status: 403 });
    }

    // Récupérer uniquement les utilisateurs de l'organisation de l'admin
    const users = await prisma.user.findMany({
      where: {
        organizationId: decoded.organizationId || admin?.organizationId
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        // plainPassword removed for security
        createdAt: true,
        _count: {
          select: {
            reservations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    log.error('Erreur récupération utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel utilisateur (employé)
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    // Seuls SUPER_ADMIN et ORG_OWNER peuvent gérer les utilisateurs
    if (admin?.role && !['SUPER_ADMIN', 'ORG_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé - Seuls les administrateurs peuvent gérer les utilisateurs' }, { status: 403 });
    }

    const { email, name, phone, role, password } = await request.json();

    // Validation
    if (!email || !name || !role || !password) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    const organizationId = decoded.organizationId || admin?.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID manquant' },
        { status: 400 }
      );
    }

    // Récupérer l'organisation et vérifier la limite d'utilisateurs selon la formule
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        plan: true,
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    // Limites d'utilisateurs par formule
    const USER_LIMITS: Record<string, number | null> = {
      SOLO: 1,           // 1 seul utilisateur
      DUO: 3,            // 3 utilisateurs max
      TEAM: 10,          // 10 utilisateurs max
      PREMIUM: null,     // Illimité
      // Anciens plans (compatibilité)
      STARTER: 1,
      ESSENTIAL: 3,
      PROFESSIONAL: 10,
      ENTERPRISE: null,
    };

    // Compter le nombre d'utilisateurs actuels (excluant les clients)
    const currentUserCount = await prisma.user.count({
      where: {
        organizationId,
        role: { not: 'CLIENT' } // Les clients ne comptent pas dans la limite
      }
    });

    const limit = USER_LIMITS[organization.plan];

    // Vérifier si la limite est atteinte
    if (limit !== null && currentUserCount >= limit) {
      const planNames: Record<string, string> = {
        'SOLO': 'Solo',
        'DUO': 'Duo',
        'TEAM': 'Team',
        'PREMIUM': 'Premium',
        'STARTER': 'Solo',
        'ESSENTIAL': 'Duo',
        'PROFESSIONAL': 'Team',
        'ENTERPRISE': 'Premium',
      };

      return NextResponse.json(
        {
          error: `Limite d'utilisateurs atteinte pour votre formule ${planNames[organization.plan] || organization.plan} (${limit} utilisateur${limit > 1 ? 's' : ''} max). Vous avez actuellement ${currentUserCount} utilisateur${currentUserCount > 1 ? 's' : ''}. Passez à une formule supérieure pour ajouter plus d'utilisateurs.`
        },
        { status: 403 }
      );
    }

    // Vérifier si l'email existe déjà dans cette organisation
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        organizationId
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé dans votre organisation' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur avec l'organizationId
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        role,
        password: hashedPassword,
        organizationId,
        // plainPassword removed for security
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Utilisateur créé avec succès',
      user: newUser
    }, { status: 201 });

  } catch (error) {
    log.error('Erreur création utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PATCH - Modifier le rôle d'un utilisateur
export async function PATCH(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    // Seuls SUPER_ADMIN et ORG_OWNER peuvent gérer les utilisateurs
    if (admin?.role && !['SUPER_ADMIN', 'ORG_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé - Seuls les administrateurs peuvent gérer les utilisateurs' }, { status: 403 });
    }

    const { userId, role, name, phone, email, password } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    const organizationId = decoded.organizationId || admin?.organizationId;

    // Vérifier que l'utilisateur à modifier appartient à la même organisation
    const userToUpdate = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId
      }
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou n\'appartient pas à votre organisation' },
        { status: 404 }
      );
    }

    // Empêcher de se modifier soi-même (sauf pour les super admins)
    const superAdminRoles = ['SUPER_ADMIN'];
    if (userId === decoded.userId && role && !superAdminRoles.includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur
    const updateData: any = {};
    if (role) updateData.role = role;
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email) updateData.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
      // plainPassword removed for security
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Utilisateur modifié avec succès',
      user: updatedUser
    });

  } catch (error) {
    log.error('Erreur modification utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que c'est un admin
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true, organizationId: true }
    });

    // Seuls SUPER_ADMIN et ORG_OWNER peuvent gérer les utilisateurs
    if (admin?.role && !['SUPER_ADMIN', 'ORG_ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé - Seuls les administrateurs peuvent gérer les utilisateurs' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    // Empêcher de se supprimer soi-même
    if (userId === decoded.userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    const organizationId = decoded.organizationId || admin?.organizationId;

    // Vérifier que l'utilisateur existe ET appartient à la même organisation
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId
      },
      include: {
        _count: {
          select: {
            reservations: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé ou n\'appartient pas à votre organisation' },
        { status: 404 }
      );
    }

    // Si l'utilisateur a des réservations, désactiver plutôt que supprimer
    if (user._count.reservations > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { isVisible: false, isAvailable: false }
      });
      
      return NextResponse.json({
        message: 'Utilisateur désactivé (a des réservations)'
      });
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    log.error('Erreur suppression utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}