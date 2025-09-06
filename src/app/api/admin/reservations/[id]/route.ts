import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Fonction pour vérifier l'authentification admin
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'admin') {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// PATCH - Mettre à jour le statut d'une réservation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { status } = body;
    const reservationId = params.id;

    // Récupérer la réservation actuelle
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      );
    }

    // Si on passe au statut "completed" et que ce n'était pas déjà le cas
    if (status === 'completed' && reservation.status !== 'completed') {
      // Déterminer si c'est un soin individuel ou un forfait
      const isPackage = reservation.services.some((service: string) => 
        service.includes('forfait') || service.includes('package')
      );

      // Récupérer ou créer le profil de fidélité du client
      let loyaltyProfile = await prisma.loyaltyProfile.findUnique({
        where: { userId: reservation.userId }
      });

      if (!loyaltyProfile) {
        loyaltyProfile = await prisma.loyaltyProfile.create({
          data: {
            userId: reservation.userId,
            individualServicesCount: 0,
            packagesCount: 0,
            totalSpent: 0,
            availableDiscounts: []
          }
        });
      }

      // Calculer les nouvelles valeurs
      const newIndividualCount = isPackage 
        ? loyaltyProfile.individualServicesCount 
        : loyaltyProfile.individualServicesCount + 1;
      
      const newPackagesCount = isPackage 
        ? loyaltyProfile.packagesCount + 1 
        : loyaltyProfile.packagesCount;

      const newTotalSpent = loyaltyProfile.totalSpent + (reservation.totalPrice || 0);

      // Vérifier si des réductions sont débloquées
      const availableDiscounts = [];
      
      // 5 soins individuels = -30€
      if (newIndividualCount >= 5) {
        const discountCount = Math.floor(newIndividualCount / 5);
        for (let i = 0; i < discountCount; i++) {
          availableDiscounts.push({
            type: 'individual',
            amount: 30,
            reason: '5 soins individuels effectués'
          });
        }
      }

      // 3 forfaits = -50€
      if (newPackagesCount >= 3) {
        const discountCount = Math.floor(newPackagesCount / 3);
        for (let i = 0; i < discountCount; i++) {
          availableDiscounts.push({
            type: 'package',
            amount: 50,
            reason: '3 forfaits effectués'
          });
        }
      }

      // Mettre à jour le profil de fidélité
      await prisma.loyaltyProfile.update({
        where: { userId: reservation.userId },
        data: {
          individualServicesCount: newIndividualCount,
          packagesCount: newPackagesCount,
          totalSpent: newTotalSpent,
          availableDiscounts: availableDiscounts,
          lastVisit: new Date()
        }
      });

      // Créer une entrée dans l'historique de fidélité
      await prisma.loyaltyHistory.create({
        data: {
          userId: reservation.userId,
          action: isPackage ? 'PACKAGE_COMPLETED' : 'SERVICE_COMPLETED',
          points: isPackage ? 1 : 1,
          description: `${isPackage ? 'Forfait' : 'Soin'} complété: ${reservation.services.join(', ')}`,
          reservationId: reservationId
        }
      });
    }

    // Mettre à jour le statut de la réservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une réservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    await prisma.reservation.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}