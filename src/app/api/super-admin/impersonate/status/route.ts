import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function GET() {
  try {
    const cookieStore = await cookies()
    const impersonatingAs = cookieStore.get('impersonating-as')?.value
    const token = cookieStore.get('auth-token')?.value

    if (!impersonatingAs || !token) {
      return NextResponse.json({
        isImpersonating: false,
        user: null
      })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({
        isImpersonating: false,
        user: null
      })
    }

    // Récupérer l'utilisateur impersonné
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      isImpersonating: true,
      user
    })

  } catch (error) {
    log.error('Error checking impersonation status:', error)
    return NextResponse.json({
      isImpersonating: false,
      user: null
    })
  }
}
