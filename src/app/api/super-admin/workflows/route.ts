import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

/**
 * GET /api/super-admin/workflows
 * Récupère tous les templates de workflows
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const prisma = await getPrismaClient();

    const workflows = await prisma.workflowTemplate.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        executions: {
          take: 5,
          orderBy: {
            executedAt: 'desc'
          }
        },
        _count: {
          select: {
            executions: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      workflows
    });

  } catch (error: any) {
    log.error('Erreur récupération workflows:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}

/**
 * POST /api/super-admin/workflows
 * Crée ou modifie un template de workflow
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
    const {
      id,
      name,
      description,
      trigger,
      status,
      delayDays,
      subject,
      emailTemplate
    } = body;

    // Validation
    if (!name || !trigger || !subject || !emailTemplate) {
      return NextResponse.json({
        error: 'Champs requis manquants'
      }, { status: 400 });
    }

    const prisma = await getPrismaClient();

    let workflow;
    if (id) {
      // Mise à jour
      workflow = await prisma.workflowTemplate.update({
        where: { id },
        data: {
          name,
          description,
          trigger,
          status: status || 'ACTIVE',
          delayDays: delayDays || 0,
          subject,
          emailTemplate
        }
      });
    } else {
      // Création
      workflow = await prisma.workflowTemplate.create({
        data: {
          name,
          description,
          trigger,
          status: status || 'ACTIVE',
          delayDays: delayDays || 0,
          subject,
          emailTemplate
        }
      });
    }

    return NextResponse.json({
      success: true,
      workflow
    });

  } catch (error: any) {
    log.error('Erreur création/modification workflow:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/super-admin/workflows
 * Archive un workflow
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'ID workflow manquant'
      }, { status: 400 });
    }

    const prisma = await getPrismaClient();

    // Archive au lieu de supprimer
    await prisma.workflowTemplate.update({
      where: { id },
      data: {
        status: 'ARCHIVED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Workflow archivé'
    });

  } catch (error: any) {
    log.error('Erreur archivage workflow:', error);
    return NextResponse.json({
      error: error.message || 'Erreur serveur'
    }, { status: 500 });
  }
}
