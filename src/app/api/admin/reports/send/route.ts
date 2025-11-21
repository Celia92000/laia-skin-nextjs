import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { getResend } from '@/lib/resend';
import jsPDF from 'jspdf';
import { log } from '@/lib/logger';

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

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        organizationId: true,
        role: true,
        name: true,
        email: true
      }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { name: true }
    });

    const body = await request.json();
    const { reportId, metrics, period, recipientEmail } = body;

    let reportConfig: { metrics: string[], period: string, name?: string };

    // Si un reportId est fourni, charger la configuration du rapport sauvegardé
    if (reportId) {
      const savedReport = await prisma.savedReport.findFirst({
        where: {
          id: reportId,
          organizationId: user.organizationId ?? undefined
        }
      });

      if (!savedReport) {
        return NextResponse.json({ error: 'Rapport non trouvé' }, { status: 404 });
      }

      reportConfig = {
        metrics: savedReport.metrics as string[],
        period: savedReport.period,
        name: savedReport.name
      };
    } else {
      // Sinon, utiliser la configuration fournie
      if (!metrics || !period) {
        return NextResponse.json({ error: 'Métriques et période requis' }, { status: 400 });
      }
      reportConfig = { metrics, period };
    }

    // Calculer les dates selon la période
    const now = new Date();
    let startDate = new Date();
    let periodLabel = '';

    switch (reportConfig.period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        periodLabel = '7 derniers jours';
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        periodLabel = '30 derniers jours';
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        periodLabel = '90 derniers jours';
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        periodLabel = '1 an';
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        periodLabel = '30 derniers jours';
    }

    const orgFilter = { user: { organizationId: user.organizationId ?? undefined } };
    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    };

    // Récupérer les données selon les métriques sélectionnées
    const data: any = {};

    if (reportConfig.metrics.includes('revenue')) {
      const revenue = await prisma.reservation.findMany({
        where: {
          ...orgFilter,
          status: 'CONFIRMED',
          ...dateFilter
        },
        include: { service: true }
      });
      data.revenue = revenue.reduce((sum, r) => sum + (r.service?.price || r.totalPrice || 0), 0);
    }

    if (reportConfig.metrics.includes('clients_count')) {
      data.clientsCount = await prisma.user.count({
        where: {
          organizationId: user.organizationId ?? undefined,
          role: 'CLIENT'
        }
      });
    }

    if (reportConfig.metrics.includes('new_clients')) {
      data.newClients = await prisma.user.count({
        where: {
          organizationId: user.organizationId ?? undefined,
          role: 'CLIENT',
          ...dateFilter
        }
      });
    }

    if (reportConfig.metrics.includes('appointments')) {
      data.appointments = await prisma.reservation.count({
        where: {
          ...orgFilter,
          ...dateFilter
        }
      });
    }

    if (reportConfig.metrics.includes('completed_appointments')) {
      data.completedAppointments = await prisma.reservation.count({
        where: {
          ...orgFilter,
          status: 'CONFIRMED',
          ...dateFilter
        }
      });
    }

    if (reportConfig.metrics.includes('avg_ticket')) {
      const reservations = await prisma.reservation.findMany({
        where: {
          ...orgFilter,
          status: 'CONFIRMED',
          ...dateFilter
        },
        include: { service: true }
      });
      const total = reservations.reduce((sum, r) => sum + (r.service?.price || r.totalPrice || 0), 0);
      data.avgTicket = reservations.length > 0 ? total / reservations.length : 0;
    }

    if (reportConfig.metrics.includes('products_sold')) {
      data.productsSold = 0; // TODO: Implémenter quand le système de produits sera prêt
    }

    if (reportConfig.metrics.includes('top_services')) {
      const services = await (prisma.reservation.groupBy as any)({
        by: ['serviceId'],
        where: {
          user: { organizationId: user.organizationId ?? undefined },
          createdAt: {
            gte: startDate,
            lte: now
          },
          serviceId: { not: null }
        },
        _count: {
          _all: true
        }
      });

      const topServices = await Promise.all(
        services.slice(0, 5).map(async (s: any) => {
          const service = await prisma.service.findUnique({
            where: { id: s.serviceId! }
          });
          return {
            name: service?.name || 'N/A',
            count: s._count._all
          };
        })
      );
      data.topServices = topServices;
    }

    if (reportConfig.metrics.includes('client_retention')) {
      const totalClients = await prisma.user.count({
        where: {
          organizationId: user.organizationId ?? undefined,
          role: 'CLIENT',
          createdAt: { lt: startDate }
        }
      });

      const returningClients = await prisma.user.count({
        where: {
          organizationId: user.organizationId ?? undefined,
          role: 'CLIENT',
          createdAt: { lt: startDate },
          reservations: {
            some: {
              createdAt: dateFilter.createdAt
            }
          }
        }
      });

      data.clientRetention = totalClients > 0 ? (returningClients / totalClients) * 100 : 0;
    }

    if (reportConfig.metrics.includes('conversion_rate')) {
      data.conversionRate = 0; // TODO: Implémenter un système de leads
    }

    // Générer le PDF
    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(126, 58, 237); // Purple
    doc.text(reportConfig.name || 'Rapport d\'activité', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(periodLabel, 105, 28, { align: 'center' });
    doc.text(`Généré le ${now.toLocaleDateString('fr-FR')}`, 105, 35, { align: 'center' });

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 40, 190, 40);

    let y = 50;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);

    // Afficher les métriques
    if (data.revenue !== undefined) {
      doc.setFont('helvetica', 'bold');
      doc.text('Revenus totaux', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(34, 197, 94); // Green
      doc.text(`${data.revenue.toFixed(2)} €`, 190, y, { align: 'right' });
      y += 10;
      doc.setTextColor(0, 0, 0);
    }

    if (data.clientsCount !== undefined) {
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre de clients', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(data.clientsCount), 190, y, { align: 'right' });
      y += 10;
    }

    if (data.newClients !== undefined) {
      doc.setFont('helvetica', 'bold');
      doc.text('Nouveaux clients', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(59, 130, 246); // Blue
      doc.text(String(data.newClients), 190, y, { align: 'right' });
      y += 10;
      doc.setTextColor(0, 0, 0);
    }

    if (data.appointments !== undefined) {
      doc.setFont('helvetica', 'bold');
      doc.text('Rendez-vous', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(data.appointments), 190, y, { align: 'right' });
      y += 10;
    }

    if (data.completedAppointments !== undefined) {
      doc.setFont('helvetica', 'bold');
      doc.text('RDV complétés', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(data.completedAppointments), 190, y, { align: 'right' });
      y += 10;
    }

    if (data.avgTicket !== undefined) {
      doc.setFont('helvetica', 'bold');
      doc.text('Panier moyen', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.avgTicket.toFixed(2)} €`, 190, y, { align: 'right' });
      y += 10;
    }

    if (data.topServices && data.topServices.length > 0) {
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Services les plus populaires', 20, y);
      y += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      data.topServices.forEach((service: any, index: number) => {
        doc.text(`${index + 1}. ${service.name}`, 25, y);
        doc.text(`${service.count} réservations`, 190, y, { align: 'right' });
        y += 7;
      });
    }

    if (data.clientRetention !== undefined) {
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Taux de rétention', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.clientRetention.toFixed(1)}%`, 190, y, { align: 'right' });
      y += 10;
    }

    // Pied de page
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Généré par LAIA Connect pour ${organization?.name || 'votre institut'}`, 105, pageHeight - 10, { align: 'center' });

    // Générer le buffer PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const pdfBase64 = pdfBuffer.toString('base64');

    // Email du destinataire
    const emailTo = recipientEmail || user.email;

    if (!emailTo) {
      return NextResponse.json({ error: 'Adresse email non trouvée' }, { status: 400 });
    }

    // Construire l'email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rapport d'activité - LAIA Connect</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f6f0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f0; padding: 40px 20px;">
              <tr>
                  <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                          <!-- Header -->
                          <tr>
                              <td style="background: linear-gradient(135deg, #9333ea, #ec4899); padding: 40px; text-align: center;">
                                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px;">📊 LAIA Connect</h1>
                                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Rapport d'activité</p>
                              </td>
                          </tr>

                          <!-- Content -->
                          <tr>
                              <td style="padding: 40px;">
                                  <h2 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px 0;">
                                      ${reportConfig.name || 'Votre rapport d\'activité'}
                                  </h2>

                                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                      Bonjour ${user.name || 'Cher client'},
                                  </p>

                                  <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                      Veuillez trouver ci-joint votre rapport d'activité pour la période : <strong>${periodLabel}</strong>.
                                  </p>

                                  <div style="background-color: #fdfbf7; padding: 25px; border-radius: 8px; margin: 0 0 30px 0;">
                                      <h3 style="color: #9333ea; font-size: 18px; margin: 0 0 15px 0;">📈 Résumé du rapport</h3>
                                      <ul style="color: #666; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                          ${data.revenue !== undefined ? `<li><strong>Revenus :</strong> ${data.revenue.toFixed(2)} €</li>` : ''}
                                          ${data.clientsCount !== undefined ? `<li><strong>Nombre de clients :</strong> ${data.clientsCount}</li>` : ''}
                                          ${data.newClients !== undefined ? `<li><strong>Nouveaux clients :</strong> ${data.newClients}</li>` : ''}
                                          ${data.appointments !== undefined ? `<li><strong>Rendez-vous :</strong> ${data.appointments}</li>` : ''}
                                          ${data.avgTicket !== undefined ? `<li><strong>Panier moyen :</strong> ${data.avgTicket.toFixed(2)} €</li>` : ''}
                                      </ul>
                                  </div>

                                  <div style="background-color: #eff6ff; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 8px; margin: 0 0 30px 0;">
                                      <p style="color: #1e40af; font-size: 14px; margin: 0;">
                                          📎 Le rapport détaillé au format PDF est joint à cet email.
                                      </p>
                                  </div>

                                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                                      Pour toute question concernant ce rapport, n'hésitez pas à nous contacter à <a href="mailto:support@laia-connect.com" style="color: #9333ea;">support@laia-connect.com</a>
                                  </p>
                              </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                              <td style="background-color: #2c3e50; padding: 30px; text-align: center;">
                                  <p style="color: #fff; font-size: 14px; margin: 0 0 10px 0;">
                                      À votre service !
                                  </p>
                                  <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 15px 0;">
                                      L'équipe LAIA Connect
                                  </p>
                                  <div style="margin-top: 20px;">
                                      <a href="https://laia-connect.com" style="color: #9333ea; text-decoration: none; margin: 0 10px;">
                                          Site web
                                      </a>
                                      <span style="color: rgba(255,255,255,0.3);">|</span>
                                      <a href="mailto:support@laia-connect.com" style="color: #9333ea; text-decoration: none; margin: 0 10px;">
                                          Support
                                      </a>
                                  </div>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;

    // Vérifier que Resend est configuré
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'demo_key') {
      log.info('\n📧 SIMULATION D\'ENVOI DE RAPPORT PAR EMAIL');
      log.info('Destinataire:', emailTo);
      log.info('Période:', periodLabel);
      log.info('Métriques:', reportConfig.metrics.join(', '));
      log.info('\n');
      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'Email simulé (configurez RESEND_API_KEY pour activer l\'envoi réel)'
      });
    }

    // Envoyer l'email avec le PDF en pièce jointe
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'LAIA Connect <rapports@laia-connect.com>';
    const reportFilename = `rapport-${now.toISOString().split('T')[0]}.pdf`;

    const { data: emailData, error } = await getResend().emails.send({
      from: fromEmail,
      to: emailTo,
      subject: `📊 ${reportConfig.name || 'Rapport d\'activité'} - ${periodLabel}`,
      html: emailHtml,
      attachments: [
        {
          filename: reportFilename,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      log.error('Erreur Resend:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 });
    }

    // Mettre à jour lastSent si c'est un rapport sauvegardé
    if (reportId) {
      await prisma.savedReport.update({
        where: { id: reportId },
        data: { lastSent: now }
      });
    }

    log.info('✅ Rapport envoyé par email:', emailTo);
    return NextResponse.json({
      success: true,
      message: 'Rapport envoyé avec succès',
      emailId: emailData?.id
    });

  } catch (error) {
    log.error('Erreur lors de l\'envoi du rapport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du rapport' },
      { status: 500 }
    );
  }
}
