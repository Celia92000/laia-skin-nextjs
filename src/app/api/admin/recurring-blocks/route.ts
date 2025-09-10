import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Stockage des récurrences (en production, utiliser une base de données)
let recurringBlocks: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    return NextResponse.json(recurringBlocks);
  } catch (error) {
    console.error('Erreur lors de la récupération des récurrences:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    
    const newBlock = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };

    recurringBlocks.push(newBlock);

    return NextResponse.json(newBlock);
  } catch (error) {
    console.error('Erreur lors de la création de la récurrence:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    recurringBlocks = recurringBlocks.filter(block => block.id !== id);

    return NextResponse.json({ message: 'Récurrence supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la récurrence:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}