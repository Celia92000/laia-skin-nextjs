import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { log } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
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

    // Récupérer le chemin du fichier
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json({ error: 'Chemin du fichier manquant' }, { status: 400 })
    }

    // Sécurité : Vérifier que le chemin ne sort pas du dossier autorisé
    const allowedDir = join(process.cwd(), 'uploads', 'documents')
    const fullPath = join(process.cwd(), filePath)

    if (!fullPath.startsWith(allowedDir)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Lire le fichier
    const fileBuffer = await readFile(fullPath)

    // Déterminer le type MIME
    const fileName = filePath.split('/').pop() || 'document.pdf'
    const mimeType = 'application/pdf'

    // Retourner le fichier
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })

  } catch (error) {
    log.error('Erreur téléchargement document:', error)
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
      { status: 500 }
    )
  }
}
