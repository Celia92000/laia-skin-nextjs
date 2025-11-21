import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateJitsiMeetingUrl } from '@/lib/jitsi/generateMeetingUrl'
import { log } from '@/lib/logger';

/**
 * POST: Créer une nouvelle réservation (pour RDV de suivi)
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

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

    const data = await request.json()

    if (!data.slotId || !data.institutName || !data.contactName || !data.contactEmail) {
      return NextResponse.json(
        { error: 'Informations manquantes' },
        { status: 400 }
      )
    }

    // Générer le lien de visioconférence Jitsi
    const meetingUrl = generateJitsiMeetingUrl(`${data.institutName}-${Date.now()}`, data.institutName)

    // Créer la réservation principale avec transaction pour bloquer tous les créneaux
    const booking = await prisma.$transaction(async (tx) => {
      // Créer le booking principal
      const mainBooking = await tx.demoBooking.create({
        data: {
          slotId: data.slotId,
          institutName: data.institutName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone || null,
          message: data.message || null,
          leadId: data.leadId || null,
          type: data.type || 'ONLINE',
          status: 'CONFIRMED',
          meetingUrl: meetingUrl,
          customDuration: data.customDuration || null
        },
        include: {
          slot: true,
          lead: true
        }
      })

      // Si plusieurs créneaux doivent être bloqués, créer des bookings de blocage pour les autres
      if (data.slotsToBlock && data.slotsToBlock.length > 1) {
        const additionalSlots = data.slotsToBlock.filter((id: string) => id !== data.slotId)

        for (const slotId of additionalSlots) {
          await tx.demoBooking.create({
            data: {
              slotId: slotId,
              institutName: `[BLOQUÉ] ${data.institutName}`,
              contactName: `Continuation de la démo de ${data.contactName}`,
              contactEmail: data.contactEmail,
              contactPhone: data.contactPhone || null,
              message: `Créneau bloqué automatiquement pour la démo de ${data.customDuration || 30} minutes`,
              type: data.type || 'ONLINE',
              status: 'CONFIRMED',
              meetingUrl: meetingUrl,
              notes: `Créneau de continuation automatique. Réservation principale: ${mainBooking.id}`
            }
          })
        }
      }

      return mainBooking
    })

    // TODO: Envoyer email de confirmation avec le lien de visio

    return NextResponse.json(booking, { status: 201 })

  } catch (error) {
    log.error('Erreur création réservation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
