import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getResend } from '@/lib/resend';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 🔒 Récupérer l'admin avec son organizationId
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!admin || !admin.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { to, subject, content, message, clientId, recipients } = await request.json();

    // Si c'est un envoi groupé avec plusieurs destinataires
    if (recipients && Array.isArray(recipients)) {
      const results = [];

      for (const recipient of recipients) {
        try {
          const emailContent = content || message;
          const fromEmail = process.env.RESEND_FROM_EMAIL || '${siteName} <${email}>';

          const { data: emailData, error } = await getResend().emails.send({
            from: fromEmail,
            to: [recipient.email],
            subject: subject,
            html: emailContent,
            text: emailContent.replace(/<[^>]*>/g, '') // Enlève les balises HTML pour le texte
          });

          if (error) {
            log.error(`❌ Erreur envoi à ${recipient.email}:`, error);
            results.push({ email: recipient.email, success: false, error: error.message });
          } else {
            log.info(`✅ Email envoyé à ${recipient.email}`);

            // 🔒 Enregistrer dans l'historique avec organizationId
            await prisma.emailHistory.create({
              data: {
                from: '${email}',
                to: recipient.email,
                subject: subject,
                content: emailContent,
                template: 'campaign',
                status: 'sent',
                direction: 'outgoing',
                userId: recipient.userId,
                organizationId: admin.organizationId
              }
            });

            results.push({ email: recipient.email, success: true, id: emailData?.id });
          }
        } catch (err) {
          log.error(`❌ Erreur pour ${recipient.email}:`, err);
          results.push({ email: recipient.email, success: false, error: 'Erreur serveur' });
        }
      }

      const successCount = results.filter(r => r.success).length;
      return NextResponse.json({
        success: true,
        results,
        summary: {
          total: recipients.length,
          sent: successCount,
          failed: recipients.length - successCount
        }
      });
    }

    // Envoi simple à un destinataire
    if (!to || !subject || (!content && !message)) {
      return NextResponse.json({
        error: 'Champs obligatoires manquants: to, subject, content/message'
      }, { status: 400 });
    }

    const emailContent = content || message;
    const fromEmail = process.env.RESEND_FROM_EMAIL || '${siteName} <${email}>';

    // Envoyer via Resend
    const { data: emailData, error } = await getResend().emails.send({
      from: fromEmail,
      to: [to],
      subject: subject,
      html: emailContent,
      text: emailContent.replace(/<[^>]*>/g, '') // Enlève les balises HTML pour le texte
    });

    if (error) {
      log.error('❌ Erreur Resend:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Erreur envoi email'
      }, { status: 500 });
    }

    log.info('✅ Email de campagne envoyé à:', to);
    log.info('   ID Resend:', emailData?.id);

    // 🔒 Enregistrer dans l'historique avec organizationId
    await prisma.emailHistory.create({
      data: {
        from: '${email}',
        to: to,
        subject: subject,
        content: emailContent,
        template: 'campaign',
        status: 'sent',
        direction: 'outgoing',
        userId: clientId,
        organizationId: admin.organizationId
      }
    });

    return NextResponse.json({
      success: true,
      id: emailData?.id
    });

  } catch (error) {
    log.error('Erreur envoi email campagne:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}