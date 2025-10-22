import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validatePassword } from '@/lib/password-validation';
import { sendVerificationEmail } from '@/lib/email-verification';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, referralCode } = await request.json();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Valider la force du mot de passe
    const passwordValidation = validatePassword(password, undefined, { name, email });

    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Mot de passe trop faible',
          details: passwordValidation.errors,
          strength: passwordValidation.strength,
          score: passwordValidation.score
        },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'client',
        loyaltyPoints: 0,
        totalSpent: 0
      }
    });

    // Créer le profil de fidélité avec code de parrainage unique
    const userReferralCode = `LAIA${name.slice(0, 3).toUpperCase()}${user.id.slice(-4).toUpperCase()}`;
    
    // Si un code de parrainage a été fourni, le valider
    let referrerProfile = null;
    if (referralCode) {
      referrerProfile = await prisma.loyaltyProfile.findFirst({
        where: { 
          referralCode: referralCode,
          userId: { not: user.id }
        },
        include: { user: true }
      });

      if (referrerProfile) {
        // Créer la réduction pour le nouveau client (filleul) - 10€
        await prisma.discount.create({
          data: {
            userId: user.id,
            type: 'referral_referred',
            amount: 10,
            status: 'available',
            originalReason: `Bienvenue ! Code parrainage de ${referrerProfile.user.name}`,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 jours
          }
        });

        // Créer une réduction en attente pour le parrain - 15€
        await prisma.discount.create({
          data: {
            userId: referrerProfile.userId,
            type: 'referral_sponsor',
            amount: 15,
            status: 'pending',
            originalReason: `Parrainage de ${name}`,
            notes: 'Sera activée après le premier soin du filleul'
          }
        });

        // Créer l'entrée de parrainage
        await prisma.referral.create({
          data: {
            referrerUserId: referrerProfile.userId,
            referralCode: referralCode,
            referredUserId: user.id,
            status: 'used',
            rewardAmount: 15
          }
        });

        // Notification au parrain
        await prisma.notification.create({
          data: {
            userId: referrerProfile.userId,
            type: 'referral',
            title: 'Nouveau filleul',
            message: `🎉 ${name} vient de s'inscrire avec votre code ! Vous recevrez 15€ après son premier soin.`,
            read: false
          }
        });
      }
    }

    // Créer le profil de fidélité
    await prisma.loyaltyProfile.create({
      data: {
        userId: user.id,
        referralCode: userReferralCode,
        referredBy: referralCode || null,
        points: 0,
        individualServicesCount: 0,
        packagesCount: 0,
        totalSpent: 0,
        totalReferrals: 0
      }
    });

    // Envoyer l'email de vérification
    await sendVerificationEmail(user.id, user.email, user.name);

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
      user: userWithoutPassword,
      message: 'Inscription réussie ! Un email de vérification a été envoyé à votre adresse.'
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
