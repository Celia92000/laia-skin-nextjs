import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { sendEmail } from '@/lib/notifications';
import { getSiteConfig } from '@/lib/config-service';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const config = await getSiteConfig();
  const siteName = config.siteName || 'Mon Institut';
  const phone = config.phone || '06 XX XX XX XX';
  const email = config.email || 'contact@institut.fr';
  const address = config.address || '';
  const city = config.city || '';
  const postalCode = config.postalCode || '';
  const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
  const primaryColor = config.primaryColor || '#8B7355';
  const website = config.customDomain || 'https://votre-institut.fr';

  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { reservationId } = await request.json();

    if (!reservationId) {
      return NextResponse.json({ error: 'ID de réservation requis' }, { status: 400 });
    }

    const prisma = await getPrismaClient();

    // 🔒 Récupérer la réservation SEULEMENT SI elle appartient à cette organisation
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
    
    if (!reservation || !reservation.user) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }
    
    // Formater la date et l'heure
    const date = new Date(reservation.date);
    const formattedDate = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = reservation.time;
    
    // Récupérer les services
    let services = 'Service réservé';
    try {
      if (reservation.services) {
        const servicesList = typeof reservation.services === 'string' 
          ? JSON.parse(reservation.services)
          : reservation.services;
        if (Array.isArray(servicesList) && servicesList.length > 0) {
          services = servicesList.join(', ');
        }
      } else if (reservation.service) {
        services = reservation.service.name;
      }
    } catch (e) {
      // Garder la valeur par défaut
    }
    
    // Créer le message de confirmation
    const confirmationMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #2c3e50; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, ${primaryColor} 0%, #A0826D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
    .info-box { background: #f9f7f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: ${primaryColor}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    h1 { margin: 0; font-size: 28px; }
    h2 { color: ${primaryColor}; font-size: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Réservation Confirmée ✨</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${siteName}</p>
    </div>

    <div class="content">
      <p>Bonjour ${reservation.user.name},</p>

      <p><strong>Votre rendez-vous est confirmé !</strong> Nous avons le plaisir de vous accueillir pour votre soin.</p>

      <div class="info-box">
        <h2>📅 Détails de votre rendez-vous</h2>
        <p><strong>Date :</strong> ${formattedDate}</p>
        <p><strong>Heure :</strong> ${formattedTime}</p>
        <p><strong>Service :</strong> ${services}</p>
        <p><strong>Prix :</strong> ${reservation.totalPrice}€</p>
        ${reservation.notes ? `<p><strong>Notes :</strong> ${reservation.notes}</p>` : ''}
      </div>

      <div class="info-box" style="background: #fff5f5;">
        <h2>📍 Lieu du rendez-vous</h2>
        <p><strong>${siteName}</strong><br>
        ${fullAddress}<br>
        <a href="https://maps.google.com/?q=${encodeURIComponent(siteName + ' ' + fullAddress)}" style="color: ${primaryColor};">Voir sur Google Maps</a></p>
      </div>
      
      <h2>💡 Rappels importants</h2>
      <ul>
        <li>Arrivez 5 minutes avant votre rendez-vous</li>
        <li>Venez démaquillée si possible</li>
        <li>Signalez toute allergie ou traitement en cours</li>
        <li>En cas d'empêchement, prévenez-nous au moins 24h à l'avance</li>
      </ul>
      
      <p><strong>📱 Vous recevrez :</strong></p>
      <ul>
        <li>Un rappel WhatsApp/SMS 24h avant votre rendez-vous</li>
        <li>Un rappel 2h avant votre rendez-vous</li>
      </ul>
      
      <center>
        <a href="${website}/espace-client" class="button">
          Accéder à mon espace client
        </a>
      </center>

      <p>Si vous devez modifier ou annuler votre rendez-vous, contactez-nous :</p>
      <ul>
        <li>📞 Téléphone : ${phone}</li>
        ${config.whatsapp ? `<li>📱 WhatsApp : ${config.whatsapp}</li>` : ''}
        <li>✉️ Email : ${email}</li>
      </ul>

      <p>À très bientôt !<br>
      <strong>L'équipe ${siteName}</strong> 💝</p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${siteName} - Tous droits réservés<br>
      Cet email a été envoyé à ${reservation.user.email}<br>
      <a href="${website}" style="color: ${primaryColor};">${website.replace('https://', '').replace('http://', '')}</a></p>
    </div>
  </div>
</body>
</html>`;

    // Envoyer l'email de confirmation
    await sendEmail(
      reservation.user.email,
      `✨ Confirmation de votre rendez-vous - ${formattedDate}`,
      confirmationMessage
    );
    
    log.info(`📧 Email de confirmation envoyé à ${reservation.user.name}`);
    
    return NextResponse.json({
      success: true,
      message: 'Email de confirmation envoyé avec succès'
    });
    
  } catch (error) {
    log.error('Erreur envoi email confirmation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}