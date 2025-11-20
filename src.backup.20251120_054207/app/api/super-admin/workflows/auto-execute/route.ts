import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { Resend } from 'resend';
import { log } from '@/lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/super-admin/workflows/auto-execute
 * Exécute automatiquement les workflows selon leurs triggers (cron job)
 * À appeler quotidiennement via un cron
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier le secret du cron
    const cronSecret = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const prisma = await getPrismaClient();
    const now = new Date();
    const results: any[] = [];

    // Récupérer tous les workflows actifs
    const workflows = await prisma.workflowTemplate.findMany({
      where: {
        status: 'ACTIVE'
      }
    });

    // Récupérer toutes les organisations actives ou en trial
    const organizations = await prisma.organization.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] }
      },
      include: {
        users: {
          select: {
            lastLoginAt: true
          },
          orderBy: {
            lastLoginAt: 'desc'
          },
          take: 1
        }
      }
    });

    for (const workflow of workflows) {
      for (const org of organizations) {
        let shouldTrigger = false;
        const daysSinceCreation = Math.floor((now.getTime() - org.createdAt.getTime()) / (1000 * 60 * 60 * 24));

        // Vérifier si le workflow a déjà été exécuté pour cette org
        const existingExecution = await prisma.workflowExecution.findFirst({
          where: {
            workflowTemplateId: workflow.id,
            organizationId: org.id
          }
        });

        // Logique de déclenchement selon le trigger
        switch (workflow.trigger) {
          case 'ONBOARDING_DAY_1':
            shouldTrigger = !existingExecution && daysSinceCreation === 1;
            break;

          case 'ONBOARDING_DAY_7':
            shouldTrigger = !existingExecution && daysSinceCreation === 7;
            break;

          case 'ONBOARDING_DAY_15':
            shouldTrigger = !existingExecution && daysSinceCreation === 15;
            break;

          case 'ONBOARDING_DAY_25':
            shouldTrigger = !existingExecution && daysSinceCreation === 25;
            break;

          case 'TRIAL_ENDING_SOON':
            if (org.status === 'TRIAL' && org.trialEndsAt) {
              const daysUntilEnd = Math.floor((org.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              shouldTrigger = !existingExecution && daysUntilEnd === 5;
            }
            break;

          case 'TRIAL_ENDED':
            if (org.status === 'TRIAL' && org.trialEndsAt) {
              const trialEnded = org.trialEndsAt < now;
              shouldTrigger = !existingExecution && trialEnded;
            }
            break;

          case 'NO_LOGIN_7_DAYS':
            const lastLogin = org.users[0]?.lastLoginAt;
            if (lastLogin) {
              const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
              shouldTrigger = daysSinceLogin >= 7;
            }
            break;

          case 'SUBSCRIPTION_ACTIVE_60_DAYS':
            shouldTrigger = !existingExecution && org.status === 'ACTIVE' && daysSinceCreation === 60;
            break;
        }

        // Exécuter le workflow si nécessaire
        if (shouldTrigger) {
          try {
            // Remplacer les variables
            let emailContent = workflow.emailTemplate;
            let emailSubject = workflow.subject;

            const variables: Record<string, string> = {
              '{organizationName}': org.name,
              '{ownerFirstName}': org.ownerFirstName || '',
              '{ownerLastName}': org.ownerLastName || '',
              '{ownerEmail}': org.ownerEmail,
              '{plan}': org.plan,
              '{subdomain}': org.subdomain,
              '{demoLink}': process.env.NEXT_PUBLIC_DEMO_LINK || 'https://calendly.com/laia-connect/demo',
              '{supportEmail}': process.env.SUPER_ADMIN_EMAIL || 'contact@laiaconnect.fr',
              '{dashboardUrl}': `https://${org.subdomain}.laiaconnect.fr/admin`
            };

            Object.entries(variables).forEach(([key, value]) => {
              emailContent = emailContent.replace(new RegExp(key, 'g'), value);
              emailSubject = emailSubject.replace(new RegExp(key, 'g'), value);
            });

            // Envoyer l'email
            await resend.emails.send({
              from: 'LAIA Connect <contact@laiaconnect.fr>',
              to: org.ownerEmail,
              subject: emailSubject,
              html: emailContent
            });

            // Enregistrer l'exécution
            await prisma.workflowExecution.create({
              data: {
                workflowTemplateId: workflow.id,
                organizationId: org.id,
                status: 'SUCCESS'
              }
            });

            // Mettre à jour les stats
            await prisma.workflowTemplate.update({
              where: { id: workflow.id },
              data: {
                sentCount: { increment: 1 }
              }
            });

            results.push({
              workflow: workflow.name,
              organization: org.name,
              status: 'success'
            });

          } catch (error: any) {
            // Enregistrer l'échec
            await prisma.workflowExecution.create({
              data: {
                workflowTemplateId: workflow.id,
                organizationId: org.id,
                status: 'FAILED',
                error: error.message
              }
            });

            results.push({
              workflow: workflow.name,
              organization: org.name,
              status: 'failed',
              error: error.message
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      executedCount: results.length,
      results
    });

  } catch (error: any) {
    log.error('Erreur auto-exécution workflows:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
