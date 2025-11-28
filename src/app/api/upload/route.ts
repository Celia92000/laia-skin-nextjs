import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';
import { getPrismaClient } from '@/lib/prisma';

// Verify user is authenticated and get organizationId
async function verifyAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    // Get user with organizationId from database
    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        organizationId: true,
        organization: {
          select: {
            slug: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    return {
      ...decoded,
      organizationId: user.organizationId,
      organizationSlug: user.organization?.slug
    };
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Verify user has an organization
    if (!user.organizationId) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Types acceptés: JPEG, PNG, GIF, WebP, SVG' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximum: 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename with organization isolation
    // Format: org-{slug}/{folder}/{timestamp}-{random}.{ext}
    const orgPrefix = user.organizationSlug || user.organizationId;
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `org-${orgPrefix}/${folder}/${timestamp}-${randomString}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    log.info(`Image uploaded: ${blob.url}`);

    return NextResponse.json({
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type
    });
  } catch (error: any) {
    log.error('Erreur upload image:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}
