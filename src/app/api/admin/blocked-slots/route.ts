import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Stockage des créneaux bloqués (en production, utiliser une base de données)
let blockedSlots: any[] = [];

export async function GET(request: NextRequest) {
  try {
    // Retourner les créneaux bloqués publiquement pour que les clients puissent les voir
    return NextResponse.json(blockedSlots);
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux bloqués:', error);
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
    const { date, time, allDay, reason } = body;

    // Vérifier si la date est déjà bloquée (pour les blocages journée complète)
    if (allDay) {
      const existingBlock = blockedSlots.find(slot => slot.date === date && slot.allDay);
      if (existingBlock) {
        return NextResponse.json({ error: 'Cette date est déjà bloquée' }, { status: 400 });
      }
    }

    // Ajouter le créneau bloqué
    const newBlock = {
      id: Date.now().toString(),
      date,
      time,
      allDay,
      reason: reason || 'Indisponible',
      createdAt: new Date().toISOString()
    };

    blockedSlots.push(newBlock);

    return NextResponse.json(newBlock);
  } catch (error) {
    console.error('Erreur lors du blocage du créneau:', error);
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

    // Supprimer le créneau bloqué
    blockedSlots = blockedSlots.filter(slot => slot.id !== id);

    return NextResponse.json({ message: 'Créneau débloqué avec succès' });
  } catch (error) {
    console.error('Erreur lors du déblocage du créneau:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}