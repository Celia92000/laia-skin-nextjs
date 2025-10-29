import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateJitsiMeetingUrl } from '@/lib/jitsi/generateMeetingUrl'

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

    // Créer la réservation
    const booking = await prisma.demoBooking.create({
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
        meetingUrl: meetingUrl
      },
      include: {
        slot: true,
        lead: true
      }
    })

    // TODO: Envoyer email de confirmation avec le lien de visio

    return NextResponse.json(booking, { status: 201 })

  } catch (error) {
    console.error('Erreur création réservation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
