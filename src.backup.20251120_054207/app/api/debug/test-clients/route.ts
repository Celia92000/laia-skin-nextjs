import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function GET() {
  try {
    // Récupérer tous les clients directement sans auth pour debug
    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        lastVisit: true,
        totalSpent: true,
        birthDate: true,
        skinType: true,
        allergies: true,
        medicalNotes: true,
        preferences: true,
        adminNotes: true,
        reservations: {
          orderBy: {
            date: 'desc'
          },
          take: 5,
          select: {
            id: true,
            date: true,
            time: true,
            status: true,
            service: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      },
      take: 10
    });

    log.info(`\n🔍 DEBUG Clients WhatsApp:`);
    log.info(`Total clients: ${clients.length}`);
    
    clients.forEach(client => {
      log.info(`\n👤 ${client.name}:`);
      log.info(`  - Email: ${client.email}`);
      log.info(`  - Phone: ${client.phone || 'NON RENSEIGNÉ'}`);
      log.info(`  - Réservations: ${client.reservations.length}`);
      log.info(`  - Total dépensé: ${client.totalSpent || 0}€`);
      if (client.birthDate) {
        log.info(`  - Date naissance: ${new Date(client.birthDate).toLocaleDateString('fr-FR')}`);
      }
      if (client.skinType) {
        log.info(`  - Type de peau: ${client.skinType}`);
      }
      if (client.allergies) {
        log.info(`  - ⚠️ Allergies: ${client.allergies}`);
      }
    });

    return NextResponse.json({
      success: true,
      count: clients.length,
      clients: clients.map(c => ({
        name: c.name,
        email: c.email,
        phone: c.phone || 'Non renseigné',
        reservations: c.reservations.length,
        totalSpent: c.totalSpent || 0,
        birthDate: c.birthDate,
        skinType: c.skinType,
        allergies: c.allergies
      }))
    });

  } catch (error) {
    log.error('Erreur debug clients:', error);
    return NextResponse.json({ 
      error: 'Erreur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}