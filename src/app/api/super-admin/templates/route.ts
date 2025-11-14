import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

// GET - Récupérer tous les templates
export async function GET() {
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

    // Récupérer tous les templates
    const templates = await prisma.websiteTemplate.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        _count: {
          select: {
            organizations: true
          }
        }
      }
    })

    return NextResponse.json({ templates })

  } catch (error) {
    log.error('Erreur récupération templates:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau template
export async function POST(request: Request) {
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

    const body = await request.json()
    const {
      name,
      description,
      minTier,
      category,
      config,
      previewImageUrl,
      displayOrder,
      isActive
    } = body

    // Validation
    if (!name || !description || !minTier || !category) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Créer le template
    const template = await prisma.websiteTemplate.create({
      data: {
        name,
        description,
        minTier,
        category,
        config: config || {},
        previewImageUrl: previewImageUrl || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    log.info('✅ Template créé:', template.name)

    return NextResponse.json({ template })

  } catch (error) {
    log.error('Erreur création template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
