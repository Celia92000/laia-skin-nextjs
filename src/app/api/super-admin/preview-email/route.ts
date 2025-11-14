import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEmailTemplate } from '@/lib/email-templates'
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
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

    // Récupérer les données de la requête
    const body = await request.json()
    const { organizationId, templateType, subject, data } = body

    if (!templateType) {
      return NextResponse.json(
        { error: 'Template requis' },
        { status: 400 }
      )
    }

    // Récupérer une organisation pour la config (si spécifiée, sinon utiliser la première)
    let orgConfig = null
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          config: {
            select: {
              siteName: true,
              founderName: true,
              legalRepName: true,
              phone: true,
              address: true,
              city: true,
              postalCode: true,
              primaryColor: true,
              secondaryColor: true,
              instagram: true,
              baseUrl: true
            }
          }
        }
      })
      orgConfig = org?.config
    } else {
      // Utiliser la première organisation
      const firstOrg = await prisma.organization.findFirst({
        select: {
          config: {
            select: {
              siteName: true,
              founderName: true,
              legalRepName: true,
              phone: true,
              address: true,
              city: true,
              postalCode: true,
              primaryColor: true,
              secondaryColor: true,
              instagram: true,
              baseUrl: true
            }
          }
        }
      })
      orgConfig = firstOrg?.config
    }

    // Préparer les données du template avec des exemples
    const templateData = {
      name: 'Marie Dupont',
      email: 'marie.dupont@example.com',
      ...data
    }

    // Générer le contenu de l'email
    const { html, text } = await getEmailTemplate(templateType, templateData)

    return NextResponse.json({
      success: true,
      html,
      text,
      subject: subject || `Prévisualisation ${templateType}`,
      config: orgConfig
    })

  } catch (error) {
    log.error('Erreur prévisualisation email:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
