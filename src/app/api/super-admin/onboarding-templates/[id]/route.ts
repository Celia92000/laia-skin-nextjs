import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET - Récupérer un template par ID
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1] || cookieStore.get('auth-token')?.value || cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = await context.params

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    return NextResponse.json(template)

  } catch (error) {
    log.error('Erreur récupération template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Mettre à jour un template
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1] || cookieStore.get('auth-token')?.value || cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = await context.params
    const data = await request.json()

    // Vérifier que le template existe
    const existing = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    // Empêcher la modification de templates système sauf pour activer/désactiver
    if (existing.isSystem && Object.keys(data).length > 0 && !(Object.keys(data).length === 1 && 'isActive' in data)) {
      return NextResponse.json(
        { error: 'Les templates système ne peuvent être modifiés (sauf activation/désactivation)' },
        { status: 403 }
      )
    }

    const {
      slug,
      name,
      description,
      subject,
      content,
      textContent,
      availableVariables,
      category,
      isActive,
      fromName,
      fromEmail,
      language
    } = data

    // Si modification du slug, vérifier l'unicité
    if (slug && slug !== existing.slug) {
      const duplicateSlug = await prisma.emailTemplate.findFirst({
        where: {
          slug,
          organizationId: null,
          id: { not: id }
        }
      })

      if (duplicateSlug) {
        return NextResponse.json(
          { error: 'Un template avec ce slug existe déjà' },
          { status: 400 }
        )
      }
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(subject !== undefined && { subject }),
        ...(content !== undefined && { content }),
        ...(textContent !== undefined && { textContent }),
        ...(availableVariables !== undefined && { availableVariables }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(fromName !== undefined && { fromName }),
        ...(fromEmail !== undefined && { fromEmail }),
        ...(language !== undefined && { language })
      }
    })

    return NextResponse.json(template)

  } catch (error: any) {
    log.error('Erreur mise à jour template:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Supprimer un template
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1] || cookieStore.get('auth-token')?.value || cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = await context.params

    // Vérifier que le template existe
    const existing = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    // Empêcher la suppression de templates système
    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'Les templates système ne peuvent pas être supprimés' },
        { status: 403 }
      )
    }

    await prisma.emailTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    log.error('Erreur suppression template:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
