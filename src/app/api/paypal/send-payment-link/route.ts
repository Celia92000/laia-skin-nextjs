import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { isAdminRole } from '@/lib/admin-roles';
import { sendEmail } from '@/lib/notifications';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    if (!isAdminRole(decoded.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentUrl, reservationId, customerEmail, customerName, amount } = body;

    if (!paymentUrl || !reservationId || !customerEmail || !customerName || !amount) {
      return NextResponse.json({
        error: 'Paramètres manquants'
      }, { status: 400 });
    }

    // Récupérer la réservation et la config du site
    const prisma = await getPrismaClient();

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        service: true
      }
    });

    if (!reservation) {
      return NextResponse.json({
        error: 'Réservation non trouvée'
      }, { status: 404 });
    }

    // Récupérer la config du site directement
    let config = await prisma.siteConfig.findFirst();

    // Si pas de config, utiliser des valeurs par défaut
    const siteName = config?.siteName || 'Mon Institut';
    const email = config?.email || 'contact@institut.fr';
    const primaryColor = config?.primaryColor || '#d4b5a0';
    const phone = config?.phone || '06 XX XX XX XX';
    const website = config?.customDomain || 'https://votre-institut.fr';

    // Formater la date
    const dateFormatted = new Date(reservation.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Composer l'email
    const subject = `${siteName} - Lien de paiement pour votre rendez-vous`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f6f0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- En-tête -->
          <tr>
            <td style="background: linear-gradient(135deg, ${primaryColor} 0%, #c9a084 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${siteName}
              </h1>
            </td>
          </tr>

          <!-- Corps du message -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
                Bonjour ${customerName} 👋
              </h2>

              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Voici votre lien de paiement sécurisé pour votre rendez-vous :
              </p>

              <!-- Détails de la réservation -->
              <div style="background-color: #fdfbf7; border-left: 4px solid ${primaryColor}; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;">
                  <strong>📅 Date :</strong> ${dateFormatted}
                </p>
                <p style="margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;">
                  <strong>🕐 Heure :</strong> ${reservation.time}
                </p>
                <p style="margin: 0 0 10px 0; color: #2c3e50; font-size: 15px;">
                  <strong>💎 Prestation :</strong> ${reservation.service?.name || 'Service'}
                </p>
                <p style="margin: 0; color: #2c3e50; font-size: 18px;">
                  <strong>💰 Montant :</strong> <span style="color: ${primaryColor}; font-size: 20px;">${amount.toFixed(2)}€</span>
                </p>
              </div>

              <!-- Bouton de paiement -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${paymentUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                      💳 Payer maintenant
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #777; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                🔒 Paiement 100% sécurisé via Stripe
              </p>

              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 30px 0 0 0;">
                Si vous avez des questions, n'hésitez pas à nous contacter.
              </p>
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="background-color: #f8f6f0; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #777; font-size: 14px;">
                <strong>${siteName}</strong>
              </p>
              <p style="margin: 0 0 5px 0; color: #999; font-size: 13px;">
                📧 ${email}
              </p>
              <p style="margin: 0 0 5px 0; color: #999; font-size: 13px;">
                📞 ${phone}
              </p>
              <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
                Ce lien de paiement est valable 24 heures.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Envoyer l'email
    try {
      await sendEmail(customerEmail, subject, htmlContent);

      return NextResponse.json({
        success: true,
        message: `Lien de paiement envoyé à ${customerEmail}`
      });
    } catch (emailError: any) {
      log.error('Erreur envoi email:', emailError);
      return NextResponse.json({
        error: 'Erreur lors de l\'envoi de l\'email: ' + emailError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    log.error('Erreur envoi lien de paiement:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
