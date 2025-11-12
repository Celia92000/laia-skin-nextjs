import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { email, token } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // 🔒 Vérifier si l'email existe dans la newsletter DE CETTE ORGANISATION
    let subscriber = await prisma.newsletterSubscriber.findFirst({
      where: {
        email,
        organizationId: organizationId
      }
    });

    if (!subscriber) {
      // 🔒 Si l'email n'existe pas, créer une entrée avec isActive=false POUR CETTE ORGANISATION
      subscriber = await prisma.newsletterSubscriber.create({
        data: {
          email,
          organizationId: organizationId,
          isActive: false,
          unsubscribedAt: new Date()
        }
      });
    } else {
      // Désinscrire l'abonné existant
      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          isActive: false,
          unsubscribedAt: new Date()
        }
      });
    }

    // 🔒 Optionnel : marquer dans le CRM DE CETTE ORGANISATION
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
          adminNotes: `${user.adminNotes || ''}\n[${new Date().toLocaleDateString('fr-FR')}] Désinscrit de la newsletter`
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Désinscription réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la désinscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la désinscription' },
      { status: 500 }
    );
  }
}

// GET pour afficher la page de désinscription via lien email
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Rediriger vers la page de désinscription avec l'email
  return NextResponse.redirect(new URL(`/unsubscribe?email=${encodeURIComponent(email)}`, request.url));
}
