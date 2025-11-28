import { NextResponse } from 'next/server';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import { log } from '@/lib/logger';
import { getPrismaClient } from '@/lib/prisma';
import { validateBody, newsletterSubscribeSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // 🔒 Validation Zod des données d'entrée
    const validation = await validateBody(request, newsletterSubscribeSchema);
    if (!validation.success) {
      return validation.error;
    }
    const { email, name } = validation.data;

    // Utiliser getPrismaClient pour s'assurer que la connexion est active
    const prisma = await getPrismaClient();

    // 🔒 Vérifier si l'email existe déjà dans la newsletter DE CETTE ORGANISATION
    const existingSubscriber = await prisma.newsletterSubscriber.findFirst({
      where: {
        email,
        organizationId: organizationId
      }
    });

    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        // Réactiver l'inscription
        await prisma.newsletterSubscriber.update({
          where: { id: existingSubscriber.id },
          data: {
            isActive: true,
            unsubscribedAt: null,
            subscribedAt: new Date()
          }
        });

        // 🔒 Mettre à jour les notes admin de l'utilisateur DANS CETTE ORGANISATION
        const user = await prisma.user.findFirst({
          where: {
            email,
            organizationId: organizationId
          }
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              adminNotes: `${user.adminNotes || ''}\n[${new Date().toLocaleDateString('fr-FR')}] Réinscrit à la newsletter`
            }
          });
        }
      }
      return NextResponse.json({
        message: 'Déjà inscrit à la newsletter',
        isReactivated: !existingSubscriber.isActive
      });
    }

    // 🔒 Créer l'inscription newsletter POUR CETTE ORGANISATION
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        name,
        organizationId: organizationId
      }
    });

    // 🔒 Vérifier si l'utilisateur existe dans le CRM DE CETTE ORGANISATION
    let user = await prisma.user.findFirst({
      where: {
        email,
        organizationId: organizationId
      }
    });

    if (!user) {
      // 🔒 Créer automatiquement un compte client dans le CRM DE CETTE ORGANISATION
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0], // Utiliser la partie avant @ si pas de nom
          password: 'NEWSLETTER_ONLY', // Compte non connecté
          role: "CLIENT",
          organizationId: organizationId,
          adminNotes: 'Inscrit via newsletter'
        }
      });

      // 🔒 Créer aussi un profil de fidélité POUR CETTE ORGANISATION
      await prisma.loyaltyProfile.create({
        data: {
          userId: user.id,
          organizationId: organizationId,
          points: 0,
          tier: 'BRONZE'
        }
      });
    } else {
      // Mettre à jour les notes admin si l'utilisateur existe
      await prisma.user.update({
        where: { id: user.id },
        data: {
          adminNotes: `${user.adminNotes || ''}\n[${new Date().toLocaleDateString('fr-FR')}] Inscrit à la newsletter`
        }
      });
    }

    // 🔒 Enregistrer l'action dans l'historique des emails DE CETTE ORGANISATION
    await prisma.emailHistory.create({
      data: {
        to: email,
        subject: 'Inscription à la newsletter',
        content: 'Bienvenue dans notre newsletter !',
        status: 'sent',
        direction: 'outgoing',
        organizationId: organizationId,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie !',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email
      },
      addedToCRM: true,
      userId: user.id
    }, { status: 201 });

  } catch (error) {
    log.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}

// 🔒 Récupérer tous les inscrits DE CETTE ORGANISATION
export async function GET() {
  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const prisma = await getPrismaClient();

    // 🔒 Récupérer les inscrits DE CETTE ORGANISATION
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: {
        isActive: true,
        organizationId: organizationId
      },
      orderBy: { subscribedAt: 'desc' }
    });

    // 🔒 Compter le total et les actifs DE CETTE ORGANISATION
    const total = await prisma.newsletterSubscriber.count({
      where: { organizationId: organizationId }
    });
    const active = await prisma.newsletterSubscriber.count({
      where: {
        isActive: true,
        organizationId: organizationId
      }
    });

    return NextResponse.json({
      subscribers,
      stats: {
        total,
        active,
        inactive: total - active
      }
    });

  } catch (error) {
    log.error('Erreur lors de la récupération des inscrits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}