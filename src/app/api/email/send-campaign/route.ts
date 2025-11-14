import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { getPrismaClient } from '@/lib/prisma';
import { getSiteConfig } from '@/lib/config-service';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import { log } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const prisma = await getPrismaClient();
    const config = await getSiteConfig();
    const siteName = config.siteName || 'Mon Institut';
    const email = config.email || 'contact@institut.fr';
    const {
      recipients,
      subject,
      content,
      templateType,
      segment
    } = await req.json();

    // Récupérer les emails des destinataires
    let recipientEmails: string[] = [];

    if (segment) {
      // 🔒 Si c'est une campagne par segment DE CETTE ORGANISATION
      const users = await getSegmentUsers(segment, organizationId);
      recipientEmails = users.map(u => u.email);
    } else if (recipients && recipients.length > 0) {
      // 🔒 Si des destinataires spécifiques sont sélectionnés DE CETTE ORGANISATION
      const users = await prisma.user.findMany({
        where: {
          id: { in: recipients },
          organizationId: organizationId
        },
        select: { email: true, name: true }
      });
      recipientEmails = users.map(u => u.email);
    }

    if (recipientEmails.length === 0) {
      return NextResponse.json(
        { error: 'Aucun destinataire trouvé' },
        { status: 400 }
      );
    }

    // Envoyer les emails
    const results = await Promise.allSettled(
      recipientEmails.map(recipientEmail =>
        getResend().emails.send({
          from: `${siteName} <${email}>`,
          to: recipientEmail,
          subject: subject,
          html: getEmailTemplate(templateType, content, config)
        })
      )
    );

    // 🔒 Enregistrer la campagne dans la base de données DE CETTE ORGANISATION
    await prisma.emailCampaign.create({
      data: {
        name: subject,
        subject: subject,
        content: content,
        recipients: JSON.stringify(recipientEmails),
        recipientCount: recipientEmails.length,
        status: 'sent',
        sentAt: new Date(),
        organizationId: organizationId
      }
    });

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      total: recipientEmails.length
    });
  } catch (error) {
    log.error('Erreur envoi campagne:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la campagne' },
      { status: 500 }
    );
  }
}

// 🔒 Récupérer les utilisateurs d'un segment POUR UNE ORGANISATION SPÉCIFIQUE
async function getSegmentUsers(segment: string, organizationId: string) {
  const prisma = await getPrismaClient();
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

  switch (segment) {
    case 'new':
      // 🔒 Nouvelles clientes (inscrites ce mois) DE CETTE ORGANISATION
      return await prisma.user.findMany({
        where: {
          role: "CLIENT",
          organizationId: organizationId,
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1)
          }
        },
        select: { id: true, email: true, name: true }
      });

    case 'loyal':
      // 🔒 Clientes fidèles (6+ visites) DE CETTE ORGANISATION
      return await prisma.user.findMany({
        where: {
          role: "CLIENT",
          organizationId: organizationId,
          loyaltyProfile: {
            individualServicesCount: { gte: 6 }
          }
        },
        select: { id: true, email: true, name: true }
      });

    case 'inactive':
      // 🔒 Clientes inactives (60+ jours sans visite) DE CETTE ORGANISATION
      return await prisma.user.findMany({
        where: {
          role: "CLIENT",
          organizationId: organizationId,
          lastVisit: {
            lte: sixtyDaysAgo
          }
        },
        select: { id: true, email: true, name: true }
      });

    case 'birthday':
      // 🔒 Anniversaires ce mois DE CETTE ORGANISATION
      const currentMonth = today.getMonth() + 1;
      return await prisma.user.findMany({
        where: {
          role: "CLIENT",
          organizationId: organizationId,
          birthDate: {
            not: null
          }
        },
        select: { id: true, email: true, name: true, birthDate: true }
      }).then(users =>
        users.filter(user => {
          if (user.birthDate) {
            const birthMonth = new Date(user.birthDate).getMonth() + 1;
            return birthMonth === currentMonth;
          }
          return false;
        })
      );

    default:
      return [];
  }
}

function getEmailTemplate(templateType: string, content: string, config: any): string {
  const siteName = config.siteName || 'Mon Institut';
  const address = config.address || '';
  const city = config.city || '';
  const postalCode = config.postalCode || '';
  const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
  const phone = config.phone || '06 XX XX XX XX';
  const primaryColor = config.primaryColor || '#d4b5a0';
  const website = config.customDomain || 'https://votre-institut.fr';

  const baseStyles = `
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, ${primaryColor} 0%, #c9a084 100%); color: white; padding: 40px 30px; text-align: center; }
      .content { padding: 30px; }
      .button { display: inline-block; padding: 14px 30px; margin: 20px 0; background: ${primaryColor}; color: white; text-decoration: none; border-radius: 25px; font-weight: 500; }
      .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${siteName.toUpperCase()}</h1>
        </div>
        <div class="content">
          ${content}
          <div style="text-align: center; margin-top: 30px;">
            <a href="${website}/reservation" class="button">
              Prendre rendez-vous
            </a>
          </div>
        </div>
        <div class="footer">
          <p>${siteName}</p>
          <p>${fullAddress}</p>
          <p>${phone}</p>
          <p style="margin-top: 20px; font-size: 12px;">
            <a href="${website}/unsubscribe" style="color: ${primaryColor};">Se désinscrire</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}