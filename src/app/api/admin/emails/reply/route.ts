import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { getResend } from '@/lib/resend';
import { getSiteConfig } from '@/lib/config-service';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const config = await getSiteConfig();
  const siteName = config.siteName || 'Mon Institut';
  const email = config.email || 'contact@institut.fr';
  const primaryColor = config.primaryColor || '#d4b5a0';
  const phone = config.phone || '06 XX XX XX XX';
  const address = config.address || '';
  const city = config.city || '';
  const postalCode = config.postalCode || '';
  const fullAddress = address && city ? `${address}, ${postalCode} ${city}` : 'Votre institut';
  const website = config.customDomain || 'https://votre-institut.fr';
  const ownerName = config.legalRepName?.split(' ')[0] || 'Votre esthéticienne';


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

    // Vérifier que c'est un admin
    const admin = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (admin?.role && !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(admin.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { emailId, replyContent, to, subject, message } = await request.json();

    // Validation
    if (!replyContent && !message) {
      return NextResponse.json({
        error: 'Le contenu de la réponse est requis (replyContent ou message)'
      }, { status: 400 });
    }

    const finalContent = replyContent || message;

    let originalEmail = null;
    let replySubject = subject;
    let replyTo = to;
    let originalUserId = null;

    // Si on répond à un email existant
    if (emailId) {
      originalEmail = await prisma.emailHistory.findUnique({
        where: { id: emailId }
      });

      if (!originalEmail) {
        return NextResponse.json({ error: 'Email original non trouvé' }, { status: 404 });
      }

      replySubject = replySubject || `Re: ${originalEmail.subject}`;
      replyTo = replyTo || originalEmail.to;
      originalUserId = originalEmail.userId;
    } else {
      // Si pas de emailId, to et subject sont obligatoires
      if (!to || !subject) {
        return NextResponse.json({
          error: 'Les champs to et subject sont requis si emailId n\'est pas fourni'
        }, { status: 400 });
      }
    }

    // Envoyer l'email de réponse
    const { data, error } = await getResend().emails.send({
      from: `${siteName} <${email}>`,
      to: replyTo,
      subject: replySubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${primaryColor}, #c9a084); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">${siteName}</h2>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            ${finalContent}
          </div>
          ${originalEmail ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em;">
              <p><strong>Message original :</strong></p>
              <p><strong>De:</strong> ${originalEmail.from}</p>
              <p><strong>Date:</strong> ${new Date(originalEmail.createdAt).toLocaleString('fr-FR')}</p>
              <p><strong>Sujet:</strong> ${originalEmail.subject}</p>
            </div>
          ` : ''}
        </div>
      `,
      replyTo: `${email}`
    });

    if (error) {
      // Sauvegarder l'échec dans l'historique
      await prisma.emailHistory.create({
        data: {
          to: replyTo,
          from: `${email}`,
          subject: replySubject,
          content: finalContent,
          template: 'reply',
          status: 'failed',
          errorMessage: error.message,
          userId: originalUserId,
          direction: 'outgoing'
        }
      });

      return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 });
    }

    // Sauvegarder le succès dans l'historique
    await prisma.emailHistory.create({
      data: {
        to: replyTo,
        from: `${email}`,
        subject: replySubject,
        content: finalContent,
        template: 'reply',
        status: 'sent',
        userId: originalUserId,
        direction: 'outgoing'
      }
    });

    return NextResponse.json({
      success: true,
      resendId: data?.id,
      message: 'Email envoyé avec succès'
    });

  } catch (error) {
    log.error('Erreur réponse email:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}