import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req: NextRequest) {
  // 🔒 Vérification Admin obligatoire
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier que l'utilisateur a un rôle admin
  const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT'];
  if (!allowedRoles.includes(decoded.role)) {
    return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const validTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/webp',
      // Vidéos
      'video/mp4',           // MP4
      'video/quicktime',     // MOV
      'video/x-msvideo',     // AVI
      'video/webm',          // WebM
      'video/x-matroska',    // MKV
      'video/avi',           // AVI (alternative)
      'video/x-flv',         // FLV
      'video/mpeg',          // MPEG
      'video/3gpp',          // 3GP
      'video/x-ms-wmv'       // WMV
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Images: JPG, PNG, GIF, WEBP. Vidéos: MP4, MOV, AVI, WebM, MKV, FLV, MPEG, 3GP, WMV' },
        { status: 400 }
      );
    }

    // Limiter la taille du fichier (50MB pour vidéos, 10MB pour images)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Maximum: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'laia-skin/social-media',
          resource_type: file.type.startsWith('video/') ? 'video' : 'image',
          // Préserver les dimensions originales sans transformation
          quality: 'auto:best',
          flags: 'preserve_transparency'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    const uploadResult = result as any;

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format
    });

  } catch (error) {
    log.error('Erreur upload Cloudinary:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
}

// DELETE endpoint pour supprimer un média
export async function DELETE(req: NextRequest) {
  // 🔒 Vérification Admin obligatoire
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier que l'utilisateur a un rôle admin
  const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT'];
  if (!allowedRoles.includes(decoded.role)) {
    return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { error: 'publicId manquant' },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      message: 'Média supprimé'
    });

  } catch (error) {
    log.error('Erreur suppression Cloudinary:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
