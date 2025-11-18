import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * API publique pour recevoir les demandes de contact du site vitrine
 * Crée automatiquement un lead dans le CRM
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.institutName || !data.contactName || !data.contactEmail) {
      return NextResponse.json(
        { error: 'Informations manquantes' },
        { status: 400 }
      )
    }

    // Créer le lead dans le CRM
    const lead = await prisma.lead.create({
      data: {
        institutName: data.institutName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        city: data.city || null,
        notes: data.message || null,
        source: 'WEBSITE', // Source = site vitrine
        status: 'NEW',
        score: 50, // Score de base pour contact site web
        probability: 30
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Demande envoyée avec succès'
    }, { status: 201 })

  } catch (error) {
    log.error('Erreur création lead depuis contact:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
