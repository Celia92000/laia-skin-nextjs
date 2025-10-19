import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // V�rifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifi�' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // V�rifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, name: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acc�s refus�' }, { status: 403 })
    }

    // R�cup�rer tous les articles de blog
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Ajouter le nom de l'auteur
    const postsWithAuthor = posts.map(post => ({
      ...post,
      author: user.name || 'LAIA Team'
    }))

    return NextResponse.json(postsWithAuthor)

  } catch (error) {
    console.error('Erreur r�cup�ration posts:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // V�rifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifi�' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // V�rifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, name: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acc�s refus�' }, { status: 403 })
    }

    const body = await request.json()
    const { title, excerpt, content, category, featuredImage, tags, seoTitle, seoDescription } = body

    // G�n�rer le slug � partir du titre
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Cr�er l'article
    const post = await prisma.blogPost.create({
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
    console.error('Erreur cr�ation post:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
