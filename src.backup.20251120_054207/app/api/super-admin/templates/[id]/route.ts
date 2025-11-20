import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

// PUT - Modifier un template
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Vérifier que le template existe
    const existingTemplate = await prisma.websiteTemplate.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le template
    const template = await prisma.websiteTemplate.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        minTier: body.minTier,
        category: body.category,
        config: body.config,
        previewImageUrl: body.previewImageUrl,
        displayOrder: body.displayOrder,
        isActive: body.isActive
      }
    })

    log.info('✅ Template modifié:', template.name)

    return NextResponse.json({ template })

  } catch (error) {
    log.error('Erreur modification template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un template
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = await params

    // Vérifier que le template existe
    const existingTemplate = await prisma.websiteTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            organizations: true
          }
        }
      }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher la suppression si des organisations utilisent ce template
    if (existingTemplate._count.organizations > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer ce template : ${existingTemplate._count.organizations} organisation(s) l'utilisent`
        },
        { status: 400 }
      )
    }

    // Supprimer le template
    await prisma.websiteTemplate.delete({
      where: { id }
    })

    log.info('✅ Template supprimé:', existingTemplate.name)

    return NextResponse.json({ success: true })

  } catch (error) {
    log.error('Erreur suppression template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Activer/Désactiver un template
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = await params
    const { isActive } = await request.json()

    // Mettre à jour uniquement le statut
    const template = await prisma.websiteTemplate.update({
      where: { id },
      data: { isActive }
    })

    log.info(`✅ Template ${isActive ? 'activé' : 'désactivé'}:`, template.name)

    return NextResponse.json({ template })

  } catch (error) {
    log.error('Erreur activation/désactivation template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
