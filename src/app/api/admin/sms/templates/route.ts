import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

// GET - Liste des templates SMS
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const templates = await prisma.sMSTemplate.findMany({
      where: {
        organizationId: decoded.organizationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    log.error('Error fetching SMS templates:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau template SMS
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, message, active = true } = body;

    if (!name || !type || !message) {
      return NextResponse.json({ error: 'Nom, type et message requis' }, { status: 400 });
    }

    const template = await prisma.sMSTemplate.create({
      data: {
        organizationId: decoded.organizationId,
        name,
        type,
        message,
        active
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    log.error('Error creating SMS template:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
