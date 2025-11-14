import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function GET() {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { id: true, role: true, name: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer toutes les nouveautés LAIA Connect
    const posts = await prisma.platformNews.findMany({
      include: {
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Ajouter le nom de l'auteur
    const postsWithAuthor = posts.map(post => ({
      ...post,
      author: post.author?.name || 'LAIA Team'
    }))

    return NextResponse.json(postsWithAuthor)

  } catch (error) {
    log.error('Erreur récupération posts:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { id: true, role: true, name: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { title, excerpt, content, category, featuredImage, tags, seoTitle, seoDescription } = body

    // Générer le slug à partir du titre
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Créer l'article
    const post = await prisma.platformNews.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
        status: 'DRAFT',
        featuredImage: featuredImage || undefined,
        authorId: user.id,
        tags: tags || [],
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined
      }
    })

    return NextResponse.json({
      ...post,
      author: user.name || 'LAIA Team'
    })

  } catch (error) {
    log.error('Erreur création post:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
