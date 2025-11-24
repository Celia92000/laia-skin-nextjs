import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const fileType = file.type;
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    const validVideoTypes = ['video/mp4', 'video/webm'];
    const allValidTypes = [...validImageTypes, ...validVideoTypes];

    if (!allValidTypes.includes(fileType)) {
      return NextResponse.json({
        error: 'Invalid file type. Accepted types: JPG, PNG, WebP, SVG, MP4, WebM'
      }, { status: 400 });
    }

    // Validate file size
    const isVideo = validVideoTypes.includes(fileType);
    const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024; // 20MB for video, 5MB for images

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024;
      return NextResponse.json({
        error: `File too large. Maximum size: ${maxSizeMB}MB`
      }, { status: 400 });
    }

    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'public', 'temp');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'bin';
    const filename = `${timestamp}-${randomStr}.${extension}`;
    const filepath = join(tempDir, filename);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/temp/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Upload failed. Please try again.'
    }, { status: 500 });
  }
}

// GET endpoint to check if temp directory exists and create it if needed
export async function GET() {
  try {
    const tempDir = join(process.cwd(), 'public', 'temp');

    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    return NextResponse.json({
      success: true,
      message: 'Temp directory ready',
      path: '/temp'
    });

  } catch (error) {
    console.error('Directory check error:', error);
    return NextResponse.json({
      error: 'Failed to prepare temp directory'
    }, { status: 500 });
  }
}

// DELETE endpoint to remove a specific file
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    // Security: Only allow deletion of files in temp directory
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filepath = join(process.cwd(), 'public', 'temp', filename);

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete the file
    const { unlink } = await import('fs/promises');
    await unlink(filepath);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({
      error: 'Failed to delete file'
    }, { status: 500 });
  }
}
