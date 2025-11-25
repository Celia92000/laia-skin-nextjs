import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Resend } from 'resend';
import { log } from '@/lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/super-admin/workflows/execute
 * Exécute manuellement un workflow pour une organisation
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { workflowId, organizationId } = body;

    if (!workflowId || !organizationId) {
      return NextResponse.json({
        error: 'workflowId et organizationId requis'
      }, { status: 400 });
    }

    const prisma = await getPrismaClient();

    // Récupérer le workflow
    const workflow = await prisma.workflowTemplate.findUnique({
      where: { id: workflowId }
    });

    if (!workflow) {
      return NextResponse.json({
        error: 'Workflow introuvable'
      }, { status: 404 });
    }

    // Récupérer l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return NextResponse.json({
        error: 'Organisation introuvable'
      }, { status: 404 });
    }

    // Remplacer les variables dans le template
    let emailContent = workflow.emailTemplate;
    let emailSubject = workflow.subject;

    const variables: Record<string, string> = {
      '{organizationName}': organization.name,
      '{ownerFirstName}': organization.ownerFirstName || '',
      '{ownerLastName}': organization.ownerLastName || '',
      '{ownerEmail}': organization.ownerEmail,
      '{plan}': organization.plan,
      '{subdomain}': organization.subdomain,
      '{demoLink}': process.env.NEXT_PUBLIC_DEMO_LINK || 'https://calendly.com/laia-connect/demo',
      '{supportEmail}': process.env.SUPER_ADMIN_EMAIL || 'support@laiaconnect.fr',
      '{dashboardUrl}': `https://${organization.subdomain}.laiaconnect.fr/admin`
    };

    // Remplacer toutes les variables
    Object.entries(variables).forEach(([key, value]) => {
      emailContent = emailContent.replace(new RegExp(key, 'g'), value);
      emailSubject = emailSubject.replace(new RegExp(key, 'g'), value);
    });

    // Envoyer l'email
    try {
      await resend.emails.send({
        from: 'LAIA Connect <support@laiaconnect.fr>',
        to: organization.ownerEmail,
        subject: emailSubject,
        html: emailContent
      });

      // Enregistrer l'exécution
      await prisma.workflowExecution.create({
        data: {
          workflowId: workflow.id,
          organizationId: organization.id,
          status: 'SUCCESS'
        }
      });

      // Mettre à jour les stats du workflow
      await prisma.workflowTemplate.update({
        where: { id: workflow.id },
        data: {
          sentCount: {
            increment: 1
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Workflow exécuté avec succès'
      });

    } catch (emailError: any) {
      // Enregistrer l'échec
      await prisma.workflowExecution.create({
        data: {
          workflowId: workflow.id,
          organizationId: organization.id,
          status: 'FAILED',
          error: emailError.message
        }
      });

      log.error('Erreur envoi email workflow:', emailError);
      return NextResponse.json({
        error: 'Échec envoi email: ' + emailError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    log.error('Erreur exécution workflow:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
