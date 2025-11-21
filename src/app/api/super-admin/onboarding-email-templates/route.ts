import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'

/**
 * GET /api/super-admin/onboarding-email-templates
 * Récupère tous les templates d'onboarding
 */
export async function GET(request: Request) {
  try {
    const templates = await prisma.onboardingEmailTemplate.findMany({
      orderBy: [
        { isActive: 'desc' },
        { templateKey: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      templates
    })
  } catch (error) {
    log.error('[Onboarding Templates API] Erreur GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/super-admin/onboarding-email-templates
 * Crée ou met à jour un template
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, description, templateKey, subject, content, isActive, usage } = body

    // Validation
    if (!name || !templateKey || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    // Si on active ce template, désactiver les autres avec la même clé
    if (isActive) {
      await prisma.onboardingEmailTemplate.updateMany({
        where: {
          templateKey,
          NOT: { id: id || '' }
        },
        data: { isActive: false }
      })
    }

    let template

    if (id) {
      // Mise à jour
      template = await prisma.onboardingEmailTemplate.update({
        where: { id },
        data: {
          name,
          description,
          subject,
          content,
          isActive,
          usage
        }
      })
      log.info(`[Onboarding Templates] Template mis à jour: ${template.name}`)
    } else {
      // Création
      template = await prisma.onboardingEmailTemplate.create({
        data: {
          name,
          description,
          templateKey,
          subject,
          content,
          isActive: isActive || false,
          usage
        }
      })
      log.info(`[Onboarding Templates] Template créé: ${template.name}`)
    }

    return NextResponse.json({
      success: true,
      template
    })
  } catch (error: any) {
    log.error('[Onboarding Templates API] Erreur POST:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Un template avec cette clé existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/super-admin/onboarding-email-templates?id=xxx
 * Supprime un template
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID manquant' },
        { status: 400 }
      )
    }

    const template = await prisma.onboardingEmailTemplate.delete({
      where: { id }
    })

    log.info(`[Onboarding Templates] Template supprimé: ${template.name}`)

    return NextResponse.json({
      success: true,
      message: 'Template supprimé'
    })
  } catch (error) {
    log.error('[Onboarding Templates API] Erreur DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/super-admin/onboarding-email-templates/toggle-active
 * Active/désactive un template
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, isActive } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID manquant' },
        { status: 400 }
      )
    }

    // Récupérer le template
    const template = await prisma.onboardingEmailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template non trouvé' },
        { status: 404 }
      )
    }

    // Si on active, désactiver les autres avec la même clé
    if (isActive) {
      await prisma.onboardingEmailTemplate.updateMany({
        where: {
          templateKey: template.templateKey,
          NOT: { id }
        },
        data: { isActive: false }
      })
    }

    // Mettre à jour le template
    const updatedTemplate = await prisma.onboardingEmailTemplate.update({
      where: { id },
      data: { isActive }
    })

    log.info(`[Onboarding Templates] Template ${isActive ? 'activé' : 'désactivé'}: ${updatedTemplate.name}`)

    return NextResponse.json({
      success: true,
      template: updatedTemplate
    })
  } catch (error) {
    log.error('[Onboarding Templates API] Erreur PATCH:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
