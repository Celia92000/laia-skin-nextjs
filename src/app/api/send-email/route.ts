import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { getPrismaClient } from '@/lib/prisma';
import { getSiteConfig } from '@/lib/config-service';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const prisma = await getPrismaClient();
    const config = await getSiteConfig();
    const siteName = config.siteName || 'Mon Institut';
    const ownerName = config.legalRepName?.split(' ')[0] || 'Votre esthéticienne';
    const phone = config.phone || '06 XX XX XX XX';
    const email = config.email || 'contact@institut.fr';
    const address = config.address || '';
    const city = config.city || '';
    const postalCode = config.postalCode || '';
    const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
    const instagram = config.instagram || '';
    const primaryColor = config.primaryColor || '#667eea';

    const { to, subject, message, clientName } = await request.json();

    // Template HTML professionnel
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .wrapper { padding: 20px; }
    .container { 
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, ${primaryColor} 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 { 
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content { 
      padding: 30px;
    }
    .content p {
      margin: 0 0 15px 0;
    }
    .message {
      white-space: pre-wrap;
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .footer { 
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer a {
      color: ${primaryColor};
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${siteName.toUpperCase()}</h1>
      </div>
      <div class="content">
        <p>Bonjour ${clientName || 'Cliente'},</p>
        <div class="message">${message ? message.replace(/\n/g, '<br>') : 'Votre réservation a été confirmée.'}</div>
        <div class="signature">
          <p>À très bientôt,<br>
          <strong>${ownerName}</strong><br>
          ${siteName}</p>
        </div>
      </div>
      <div class="footer">
        <p>
          📍 ${fullAddress}<br>
          📞 ${phone}<br>
          ✉️ <a href="mailto:${email}">${email}</a><br>
          ${instagram ? `📸 <a href="${instagram}">${instagram.split('/').pop() ? '@' + instagram.split('/').pop() : instagram}</a>` : ''}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Vérifier si Resend est configuré
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_123456789') {
      return NextResponse.json({ 
        success: false,
        message: 'Resend non configuré. Suivez les instructions ci-dessous.',
        instructions: [
          '1. Allez sur https://resend.com et créez un compte gratuit',
          '2. Dans le dashboard, obtenez votre clé API',
          '3. Ajoutez dans .env.local : RESEND_API_KEY=re_votreclé',
          '4. Redémarrez le serveur avec npm run dev',
          'Resend offre 100 emails gratuits par jour !'
        ]
      }, { status: 400 });
    }

    try {
      // Envoyer l'email avec Resend
      const fromEmail = `${siteName} <${email}>`;
      const data = await getResend().emails.send({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: htmlContent,
        text: `Bonjour ${clientName},\n\n${message}\n\nÀ très bientôt,\n${ownerName}\n${siteName}`
      });

      // 🔒 Enregistrer dans l'historique DE CETTE ORGANISATION
      try {
        await prisma.emailHistory.create({
          data: {
            from: email,
            to: to,
            subject: subject,
            content: message || '',
            template: 'custom',
            status: 'sent',
            direction: 'outgoing',
            organizationId: organizationId
          }
        });
      } catch (dbError) {
        log.info('Erreur enregistrement historique:', dbError);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Email envoyé avec succès !',
        data 
      });

    } catch (resendError: any) {
      log.error('Erreur Resend:', resendError);
      
      // 🔒 Enregistrer l'échec dans l'historique DE CETTE ORGANISATION
      try {
        await prisma.emailHistory.create({
          data: {
            from: email,
            to: to,
            subject: subject,
            content: message || '',
            template: 'custom',
            status: 'failed',
            direction: 'outgoing',
            organizationId: organizationId,
            errorMessage: resendError.message
          }
        });
      } catch (dbError) {
        log.info('Erreur enregistrement historique:', dbError);
      }

      return NextResponse.json({ 
        success: false,
        message: 'Erreur lors de l\'envoi',
        error: resendError.message
      }, { status: 500 });
    }

  } catch (error) {
    log.error('Erreur générale:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}