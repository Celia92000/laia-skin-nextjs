import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { getClientCommunicationHistory } from '@/lib/communication-logger'

/**
 * API pour récupérer l'historique de communication d'un client
 * GET /api/crm/communications?clientEmail=xxx&clientPhone=xxx&clientId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    if (!session.isValid || !session.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientEmail = searchParams.get('clientEmail')
    const clientPhone = searchParams.get('clientPhone')
    const clientId = searchParams.get('clientId')

    if (!clientEmail && !clientPhone && !clientId) {
      return NextResponse.json(
        { error: 'Au moins un identifiant client requis' },
        { status: 400 }
      )
    }

    const history = await getClientCommunicationHistory(
      session.user.organizationId,
      clientEmail || undefined,
      clientPhone || undefined,
      clientId || undefined
    )

    return NextResponse.json({ history })
  } catch (error) {
    console.error('❌ Erreur récupération historique communications:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
