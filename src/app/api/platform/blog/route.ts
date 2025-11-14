import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function GET() {
  try {
    // Récupérer uniquement les articles publiés des nouveautés LAIA Connect
    const posts = await prisma.platformNews.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })

    const postsWithAuthor = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      status: post.status,
      featuredImage: post.featuredImage,
      tags: post.tags,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      author: post.author?.name || 'LAIA Team'
    }))

    return NextResponse.json({ posts: postsWithAuthor })

  } catch (error) {
    log.error('Erreur récupération posts publics:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
