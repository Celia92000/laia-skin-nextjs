import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateJitsiMeetingUrl } from '@/lib/jitsi/generateMeetingUrl'
import { sendDemoConfirmationEmail } from '@/lib/email-service'
import { log } from '@/lib/logger';

/**
 * API publique pour réserver une démo depuis le site vitrine
 */

/**
 * GET: Récupérer les créneaux disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date().toISOString()

    // Récupérer TOUS les créneaux à partir d'aujourd'hui
    const slots = await prisma.demoSlot.findMany({
      where: {
        date: {
          gte: new Date(startDate)
        },
        isAvailable: true
      },
      include: {
        bookings: true
      },
      orderBy: { date: 'asc' },
      take: 100
    })

    // Retourner tous les créneaux avec leur statut
    const publicSlots = slots.map(slot => ({
      id: slot.id,
      date: slot.date,
      duration: slot.duration,
      isBooked: slot.bookings.length > 0 // Indiquer si le créneau est déjà réservé
    }))

    return NextResponse.json({ slots: publicSlots })

  } catch (error) {
    log.error('Erreur récupération créneaux publics:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST: Réserver une démo
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.slotId || !data.institutName || !data.contactName || !data.contactEmail) {
      return NextResponse.json(
        { error: 'Informations manquantes' },
        { status: 400 }
      )
    }

    // Vérifier que le créneau existe et est disponible (avec verrouillage)
    const slot = await prisma.demoSlot.findUnique({
      where: { id: data.slotId },
      include: {
        bookings: {
          where: {
            cancelledAt: null // Ne compter que les réservations non annulées
          }
        }
      }
    })

    if (!slot) {
      return NextResponse.json(
        { error: 'Créneau introuvable' },
        { status: 404 }
      )
    }

    // Vérification stricte : créneau disponible ET aucune réservation active
    if (!slot.isAvailable || slot.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Créneau déjà réservé. Veuillez choisir un autre horaire.' },
        { status: 409 } // 409 Conflict
      )
    }

    const type = data.type || 'ONLINE' // Par défaut ONLINE

    // Si RDV PHYSIQUE → créer uniquement un Lead (pas de DemoBooking)
    if (type === 'PHYSICAL') {
      const lead = await prisma.lead.create({
        data: {
          institutName: data.institutName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone || null,
          city: data.city || null,
          address: data.location || null,
          notes: data.message || null,
          source: 'WEBSITE',
          status: 'CONTACTED', // Lead à contacter
          score: 60,
          probability: 30
        }
      })

      return NextResponse.json({
        success: true,
        lead: {
          id: lead.id
        },
        message: 'Votre demande a été enregistrée ! Nous vous contacterons rapidement pour organiser un rendez-vous physique.'
      }, { status: 201 })
    }

    // Si RDV VISIO → créer Lead + DemoBooking + lien Jitsi dans une transaction
    // Générer le lien de visioconférence Jitsi
    const meetingUrl = generateJitsiMeetingUrl(`${data.institutName}-${Date.now()}`, data.institutName)

    // Transaction pour garantir l'atomicité et éviter les doubles réservations
    const result = await (prisma as any).$transaction(async (tx: any) => {
      // Re-vérifier la disponibilité dans la transaction (protection contre race condition)
      const slotCheck = await tx.demoSlot.findUnique({
        where: { id: data.slotId },
        include: {
          bookings: {
            where: { cancelledAt: null }
          }
        }
      })

      if (!slotCheck || !slotCheck.isAvailable || slotCheck.bookings.length > 0) {
        throw new Error('SLOT_ALREADY_BOOKED')
      }

      // Créer le Lead
      const lead = await tx.lead.create({
        data: {
          institutName: data.institutName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone || null,
          city: data.city || null,
          notes: data.message || null,
          source: 'WEBSITE',
          status: 'DEMO_SCHEDULED',
          score: 70,
          probability: 50,
          nextFollowUpDate: slot.date
        }
      })

      // Créer la réservation
      const booking = await tx.demoBooking.create({
        data: {
          slotId: data.slotId,
          institutName: data.institutName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone || null,
          message: data.message || null,
          leadId: lead.id,
          status: 'CONFIRMED',
          meetingUrl: meetingUrl
          // type est géré par défaut dans le schéma Prisma
        }
      })

      // Marquer le créneau comme indisponible (optionnel mais recommandé)
      await tx.demoSlot.update({
        where: { id: data.slotId },
        data: { isAvailable: false }
      })

      return { lead, booking }
    })

    const { booking } = result

    // Envoyer l'email de confirmation automatiquement
    await sendDemoConfirmationEmail({
      email: data.contactEmail,
      contactName: data.contactName,
      institutName: data.institutName,
      meetingUrl: meetingUrl,
      date: slot.date,
      duration: slot.duration
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        date: slot.date,
        duration: slot.duration,
        meetingUrl: meetingUrl
      },
      message: 'Démo réservée avec succès ! Vous recevrez un email avec le lien de visioconférence.'
    }, { status: 201 })

  } catch (error) {
    log.error('Erreur réservation démo:', error)

    // Gérer l'erreur de créneau déjà réservé
    if (error instanceof Error && error.message === 'SLOT_ALREADY_BOOKED') {
      return NextResponse.json(
        { error: 'Ce créneau vient d\'être réservé par quelqu\'un d\'autre. Veuillez choisir un autre horaire.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
