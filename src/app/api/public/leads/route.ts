import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * POST /api/public/leads
 * Créer un lead depuis le site public (sans authentification)
 */
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const {
      institutName,
      contactName,
      contactEmail,
      contactPhone,
      city,
      address,
      postalCode,
      numberOfLocations,
      selectedPlan,
      source,
      estimatedValue,
      notes
    } = data

    // Validation minimale
    if (!institutName || !contactEmail) {
      return NextResponse.json(
        { error: 'Institut et email requis' },
        { status: 400 }
      )
    }

    // Vérifier si un lead existe déjà pour cet email
    const existingLead = await prisma.lead.findFirst({
      where: {
        contactEmail: contactEmail.toLowerCase(),
        status: { not: 'WON' } // Ne pas créer de doublon si déjà converti
      }
    })

    if (existingLead) {
      // Mettre à jour le lead existant
      const updatedLead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          institutName,
          contactName,
          contactPhone,
          city,
          address,
          postalCode,
          numberOfLocations: numberOfLocations || 1,
          estimatedValue: estimatedValue || null,
          notes: notes || null,
          lastContactDate: new Date(),
          updatedAt: new Date()
        }
      })

      return NextResponse.json(updatedLead)
    }

    // Créer un nouveau lead
    const lead = await prisma.lead.create({
      data: {
        institutName,
        contactName: contactName || contactEmail.split('@')[0],
        contactEmail: contactEmail.toLowerCase(),
        contactPhone,
        city,
        address,
        postalCode,
        numberOfLocations: numberOfLocations || 1,
        status: 'NEW',
        source: source || 'WEBSITE',
        score: 50, // Score par défaut
        probability: 30, // Probabilité par défaut
        estimatedValue: estimatedValue || null,
        notes: notes || null,
        lastContactDate: new Date()
      }
    })

    return NextResponse.json(lead, { status: 201 })

  } catch (error) {
    log.error('Erreur création lead public:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du lead' },
      { status: 500 }
    )
  }
}
