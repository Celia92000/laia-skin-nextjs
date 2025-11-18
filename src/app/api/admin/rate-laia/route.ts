import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { log } from '@/lib/logger';

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

    // Récupérer les données
    const data = await request.json()
    const { rating, comment, clientName, clientRole, improvements } = data

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Note invalide (1-5 étoiles requises)' },
        { status: 400 }
      )
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Commentaire requis' },
        { status: 400 }
      )
    }

    if (!clientName || clientName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nom requis' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur et son organisation
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Construire le contenu complet
    let fullContent = comment.trim()
    if (improvements && improvements.trim().length > 0) {
      fullContent += `\n\n📝 Suggestions d'amélioration :\n${improvements.trim()}`
    }

    // Créer le témoignage
    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: clientName.trim(),
        clientRole: clientRole?.trim() || null,
        content: fullContent,
        rating: parseInt(rating),
        status: 'PENDING',
        featured: false,
        showOnLanding: false,
        tags: ['platform-feedback', 'laia-connect'],
        organizationId: user.organizationId || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Log pour le super admin
    log.info(`📝 Nouvel avis LAIA Connect reçu de ${clientName} (${rating}★) - Organisation: ${user.organization?.name || 'N/A'}`)

    return NextResponse.json({
      success: true,
      message: 'Merci pour votre avis !',
      testimonialId: testimonial.id
    })

  } catch (error) {
    log.error('Error submitting LAIA rating:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
