import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { client, email, phone, date, time, services, notes, totalPrice, status, source } = body;

    // Créer ou trouver le client
    let clientUser = await prisma.user.findFirst({
      where: { email: email || `client_${Date.now()}@temp.com` }
    });

    if (!clientUser) {
      clientUser = await prisma.user.create({
        data: {
          name: client,
          email: email || `client_${Date.now()}@temp.com`,
          phone: phone || '',
          password: 'temp_password', // Le client pourra créer son mot de passe plus tard
          role: 'client'
        }
      });
    } else if (phone && !clientUser.phone) {
      // Mettre à jour le téléphone si on l'a et qu'il n'était pas déjà enregistré
      await prisma.user.update({
        where: { id: clientUser.id },
        data: { phone }
      });
    }

    // Créer la réservation
    const reservation = await prisma.reservation.create({
      data: {
        userId: clientUser.id,
        services: JSON.stringify(services),
        packages: JSON.stringify({}),
        date: new Date(date),
        time,
        totalPrice,
        status: status || 'confirmed',
        notes,
        source: source || 'admin'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({
      id: reservation.id,
      userId: reservation.userId,
      userName: reservation.user.name,
      userEmail: reservation.user.email,
      phone: reservation.user.phone,
      services: JSON.parse(reservation.services),
      packages: JSON.parse(reservation.packages),
      date: reservation.date.toISOString(),
      time: reservation.time,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      notes: reservation.notes,
      source: reservation.source,
      createdAt: reservation.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

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

    // Vérifier que c'est un admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer toutes les réservations avec les infos clients
    const reservations = await prisma.reservation.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Formater les données
    const formattedReservations = reservations.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      userEmail: r.user.email,
      phone: r.user.phone, // Changé de userPhone à phone
      services: JSON.parse(r.services),
      packages: JSON.parse(r.packages),
      date: r.date.toISOString(),
      time: r.time,
      totalPrice: r.totalPrice,
      status: r.status,
      notes: r.notes,
      source: r.source || 'site',
      createdAt: r.createdAt.toISOString(),
      paymentStatus: r.paymentStatus,
      paymentDate: r.paymentDate?.toISOString(),
      paymentAmount: r.paymentAmount,
      paymentMethod: r.paymentMethod,
      invoiceNumber: r.invoiceNumber,
      paymentNotes: r.paymentNotes
    }));

    return NextResponse.json(formattedReservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}