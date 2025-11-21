import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

// Fonction pour envoyer automatiquement une demande d'avis après un soin
export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    const { reservationId, organizationId } = await request.json();

    if (!reservationId) {
      return NextResponse.json({ error: 'reservationId est requis' }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId est requis' }, { status: 400 });
    }

    // 🔒 Récupérer la réservation DANS CETTE ORGANISATION
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        organizationId: organizationId
      },
      include: {
        user: true,
        service: true
      }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Vérifier si l'email a déjà été envoyé
    if (reservation.reviewEmailSent) {
      return NextResponse.json({ message: 'Email déjà envoyé' }, { status: 200 });
    }

    // Déterminer le nom du service
    let serviceName = '';
    if (reservation.service) {
      serviceName = reservation.service.name;
    } else if (reservation.services) {
      const services = JSON.parse(reservation.services);
      if (services.length > 0) {
        // 🔒 Récupérer le service DANS CETTE ORGANISATION
        const firstService = await prisma.service.findFirst({
          where: {
            slug: services[0],
            organizationId: reservation.organizationId
          }
        });
        serviceName = firstService?.name || services[0];
      }
    }

    // Créer le lien pour laisser un avis
    const reviewLink = `${process.env.NEXT_PUBLIC_BASE_URL}/avis/nouveau?reservation=${reservationId}&service=${encodeURIComponent(serviceName)}`;

    // Envoyer l'email (utiliser votre service d'email préféré)
    const emailContent = `
      <h2>Merci pour votre visite !</h2>
      <p>Bonjour ${reservation.user.name},</p>
      <p>J'espère que vous avez apprécié votre soin ${serviceName}.</p>
      <p>Votre avis compte énormément pour moi ! Cela m'aide à améliorer mes services et permet à d'autres clients de découvrir l'institut.</p>
      <p><a href="${reviewLink}" style="background: #d4b5a0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Laisser un avis</a></p>
      <p>Cela ne prendra que 2 minutes !</p>
      <p>À très bientôt,<br>Laïa</p>
    `;

    // Ici, intégrer avec votre service d'email (Resend, SendGrid, etc.)
    // await sendEmail({
    //   to: reservation.user.email,
    //   subject: `Comment s'est passé votre ${serviceName} ?`,
    //   html: emailContent
    // });

    // Marquer l'email comme envoyé
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { reviewEmailSent: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email d\'avis envoyé',
      reviewLink 
    });

  } catch (error) {
    log.error('Erreur lors de l\'envoi de la demande d\'avis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la demande d\'avis' },
      { status: 500 }
    );
  }
}

// Fonction pour envoyer automatiquement les emails 24h après le soin
export async function GET() {
  const prisma = await getPrismaClient();
  try {
    // Trouver les réservations terminées d'hier qui n'ont pas reçu d'email d'avis
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // 🔒 Récupérer toutes les organisations actives
    const organizations = await prisma.organization.findMany({
      where: { status: 'ACTIVE' }
    });

    const allResults = [];

    // 🔒 Traiter chaque organisation séparément
    for (const organization of organizations) {
      const reservations = await prisma.reservation.findMany({
        where: {
          organizationId: organization.id,
          status: 'completed',
          date: {
            gte: yesterday,
            lte: yesterdayEnd
          },
          reviewEmailSent: false
        },
        include: {
          user: true,
          service: true
        }
      });

      const results = [];
      for (const reservation of reservations) {
        try {
          // Envoyer l'email pour chaque réservation
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews/send-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reservationId: reservation.id,
              organizationId: organization.id
            })
          });

          const result = await response.json();
          results.push({ reservationId: reservation.id, ...result });
        } catch (error) {
          log.error(`[${organization.name}] Erreur pour la réservation ${reservation.id}:`, error);
          results.push({ reservationId: reservation.id, error: true });
        }
      }

      allResults.push(...results);
    }

    return NextResponse.json({
      message: `${allResults.length} emails d'avis envoyés sur ${organizations.length} organisation(s)`,
      results: allResults
    });

  } catch (error) {
    log.error('Erreur lors de l\'envoi automatique des avis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi automatique' },
      { status: 500 }
    );
  }
}