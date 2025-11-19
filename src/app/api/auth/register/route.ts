import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import { checkStrictRateLimit, getClientIp } from '@/lib/rateLimit';
import { log } from '@/lib/logger';
import { registerSchema, validateRequest } from '@/lib/validation-schemas';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 🔒 Rate limiting : 3 inscriptions max par heure par IP (anti-spam)
    const ip = getClientIp(request);
    const { success, limit, remaining } = await checkStrictRateLimit(`register:${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: `Trop d'inscriptions. Veuillez réessayer plus tard. (${remaining}/${limit} restantes)` },
        { status: 429 }
      );
    }

    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation du site
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      );
    }

    // 🛡️ Validation des données d'entrée avec Zod
    const body = await request.json();
    const validation = validateRequest(registerSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email, password, name, phone, referralCode } = validation.data;

    // 🔒 Vérifier si l'utilisateur existe déjà DANS CETTE ORGANISATION
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        organizationId: organizationId
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // 🔒 Créer l'utilisateur RATTACHÉ À CETTE ORGANISATION
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: "CLIENT",
        organizationId: organizationId, // 🔒 CRITIQUE : Rattacher à l'organisation
        loyaltyPoints: 0,
        totalSpent: 0
      }
    });

    // Créer le profil de fidélité avec code de parrainage unique
    const userReferralCode = `LAIA${name.slice(0, 3).toUpperCase()}${user.id.slice(-4).toUpperCase()}`;
    
    // 🔒 Si un code de parrainage a été fourni, le valider DANS CETTE ORGANISATION
    let referrerProfile = null;
    if (referralCode) {
      referrerProfile = await prisma.loyaltyProfile.findFirst({
        where: {
          referralCode: referralCode,
          organizationId: organizationId,
          userId: { not: user.id }
        },
        include: { user: true }
      });

      if (referrerProfile) {
        // 🔒 Créer la réduction pour le nouveau client (filleul) - 10€ DANS CETTE ORGANISATION
        await prisma.discount.create({
          data: {
            userId: user.id,
            organizationId: organizationId,
            type: 'referral_referred',
            amount: 10,
            status: 'available',
            originalReason: `Bienvenue ! Code parrainage de ${referrerProfile.user.name}`,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 jours
          }
        });

        // 🔒 Créer une réduction en attente pour le parrain - 15€ DANS CETTE ORGANISATION
        await prisma.discount.create({
          data: {
            userId: referrerProfile.userId,
            organizationId: organizationId,
            type: 'referral_sponsor',
            amount: 15,
            status: 'pending',
            originalReason: `Parrainage de ${name}`,
            notes: 'Sera activée après le premier soin du filleul'
          }
        });

        // 🔒 Créer l'entrée de parrainage DANS CETTE ORGANISATION
        await prisma.referral.create({
          data: {
            referrerUserId: referrerProfile.userId,
            organizationId: organizationId,
            referralCode: referralCode,
            referredUserId: user.id,
            status: 'used',
            rewardAmount: 15
          }
        });

        // 🔒 Notification au parrain DANS CETTE ORGANISATION
        await prisma.notification.create({
          data: {
            userId: referrerProfile.userId,
            organizationId: organizationId,
            type: 'referral',
            title: 'Nouveau filleul',
            message: `🎉 ${name} vient de s'inscrire avec votre code ! Vous recevrez 15€ après son premier soin.`,
            read: false
          }
        });
      }
    }

    // 🔒 Créer le profil de fidélité RATTACHÉ À CETTE ORGANISATION
    await prisma.loyaltyProfile.create({
      data: {
        userId: user.id,
        organizationId: organizationId,
        referralCode: userReferralCode,
        referredBy: referralCode || null,
        points: 0,
        individualServicesCount: 0,
        packagesCount: 0,
        totalSpent: 0,
        totalReferrals: 0
      }
    });

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'laia-skin-secret-key-2024',
      { expiresIn: '30d' }
    );

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    log.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
