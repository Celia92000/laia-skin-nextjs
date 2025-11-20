import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request)

    if (!session.isValid || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      user: {
        userId: session.user.userId,
        role: session.user.role,
        organizationId: session.user.organizationId
      }
    })
  } catch (error) {
    console.error('Erreur vérification token:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
