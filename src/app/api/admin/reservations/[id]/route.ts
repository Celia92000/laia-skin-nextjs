import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Fonction pour vérifier l'authentification admin
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const prisma = await getPrismaClient();
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(user.role)) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    return null;
  }
}

// GET - Récupérer une réservation spécifique par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const prisma = await getPrismaClient();
    const reservation = await prisma.reservation.findUnique({
      where: { id },
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

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      );
    }

    // Formatter la réponse
    return NextResponse.json({
      id: reservation.id,
      userId: reservation.userId,
      userName: reservation.user.name,
      userEmail: reservation.user.email,
      phone: reservation.user.phone,
      services: typeof reservation.services === 'string'
        ? (reservation.services.startsWith('[') || reservation.services.startsWith('{')
            ? JSON.parse(reservation.services)
            : [reservation.services])
        : reservation.services,
      packages: typeof reservation.packages === 'string'
        ? (reservation.packages.startsWith('{')
            ? JSON.parse(reservation.packages)
            : {})
        : reservation.packages || {},
      date: reservation.date.toISOString(),
      time: reservation.time,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      paymentStatus: reservation.paymentStatus,
      paymentAmount: reservation.paymentAmount,
      paymentMethod: reservation.paymentMethod,
      paymentDate: reservation.paymentDate?.toISOString(),
      paymentNotes: reservation.paymentNotes,
      invoiceNumber: reservation.invoiceNumber,
      notes: reservation.notes,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut d'une réservation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const prisma = await getPrismaClient();
    const body = await request.json();
    const { status, paymentStatus, paymentAmount, paymentMethod, paymentDate, paymentNotes, giftCardId, giftCardUsedAmount } = body;
    const reservationId = id;

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
    // On incrémente les compteurs de fidélité car le client a bien reçu le soin
    // (qu'il ait payé ou non - cas des modèles, proches, etc.)
    if (status === 'completed' && reservation.status !== 'completed') {
      // Vérifier qu'on n'a pas déjà compté ce soin
      const existingHistory = await prisma.loyaltyHistory.findFirst({
        where: {
          reservationId: reservationId,
          action: { in: ['SERVICE_COMPLETED', 'PACKAGE_COMPLETED'] }
        }
      });

      // Si pas déjà compté, on incrémente
      if (!existingHistory) {
        // Déterminer si c'est un soin individuel ou un forfait
        let services;
        try {
          services = typeof reservation.services === 'string'
            ? (reservation.services.startsWith('[') || reservation.services.startsWith('{')
                ? JSON.parse(reservation.services)
                : [reservation.services])
            : reservation.services;
        } catch (e) {
          // Si le parsing échoue, traiter comme un simple string
          services = [reservation.services];
        }

        let packages;
        try {
          packages = typeof reservation.packages === 'string'
            ? (reservation.packages.startsWith('{')
                ? JSON.parse(reservation.packages)
                : {})
            : reservation.packages || {};
        } catch (e) {
          packages = {};
        }
        
        // Vérifier si c'est un forfait :
        // 1. Soit le champ packages est rempli
        // 2. Soit le nom du service contient "Forfait"
        let isPackage = packages && Object.keys(packages).length > 0;
        
        // Si pas de packages mais "Forfait" dans le nom, c'est quand même un forfait
        if (!isPackage && Array.isArray(services)) {
          for (const service of services) {
            if (typeof service === 'string' && service.toLowerCase().includes('forfait')) {
              isPackage = true;
              console.log(`📦 Détecté comme forfait par le nom: ${service}`);
              break;
            }
          }
        }

        // Récupérer ou créer le profil de fidélité
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
              availableDiscounts: '[]',
              lastVisit: new Date()
            }
          });
        }

        // Incrémenter le compteur approprié
        if (isPackage) {
          await prisma.loyaltyProfile.update({
            where: { userId: reservation.userId },
            data: {
              packagesCount: loyaltyProfile.packagesCount + 1,
              lastVisit: new Date()
            }
          });

          await prisma.loyaltyHistory.create({
            data: {
              userId: reservation.userId,
              action: 'PACKAGE_COMPLETED',
              points: 1,
              description: `Forfait terminé (${Object.keys(packages).join(', ')})`,
              reservationId: reservationId
            }
          });

          console.log(`🎁 Forfait compté pour fidélité: ${loyaltyProfile.packagesCount + 1}/3`);
        } else {
          await prisma.loyaltyProfile.update({
            where: { userId: reservation.userId },
            data: {
              individualServicesCount: loyaltyProfile.individualServicesCount + 1,
              lastVisit: new Date()
            }
          });

          await prisma.loyaltyHistory.create({
            data: {
              userId: reservation.userId,
              action: 'SERVICE_COMPLETED',
              points: 1,
              description: `Soin individuel terminé (${services.join(', ')})`,
              reservationId: reservationId
            }
          });

          console.log(`✨ Soin compté pour fidélité: ${loyaltyProfile.individualServicesCount + 1}/5`);
        }
      }

      // Si une carte cadeau est utilisée pour cette validation, débiter son solde
      if (giftCardId && giftCardUsedAmount && giftCardUsedAmount > 0) {
        try {
          const giftCard = await prisma.giftCard.findUnique({
            where: { id: giftCardId }
          });

          if (giftCard && giftCard.status === 'active' && giftCard.balance >= giftCardUsedAmount) {
            const newBalance = giftCard.balance - giftCardUsedAmount;

            await prisma.giftCard.update({
              where: { id: giftCardId },
              data: {
                balance: newBalance,
                status: newBalance <= 0 ? 'used' : 'active',
                usedDate: newBalance <= 0 ? new Date() : giftCard.usedDate
              }
            });

            console.log(`💳 Carte cadeau ${giftCard.code} débitée de ${giftCardUsedAmount}€ (nouveau solde: ${newBalance}€)`);
          } else {
            console.error('⚠️ Carte cadeau invalide ou solde insuffisant');
          }
        } catch (giftCardError) {
          console.error('Erreur lors du débit de la carte cadeau:', giftCardError);
          // On ne bloque pas la validation si le débit échoue
        }
      }

      // Déduire automatiquement les quantités de stock
      try {
        // Récupérer les services de la réservation
        let services;
        try {
          services = typeof reservation.services === 'string'
            ? (reservation.services.startsWith('[') || reservation.services.startsWith('{')
                ? JSON.parse(reservation.services)
                : [reservation.services])
            : reservation.services;
        } catch (e) {
          services = [reservation.services];
        }

        // Pour chaque service, récupérer et déduire les consommables
        for (const serviceName of services) {
          if (typeof serviceName !== 'string') continue;

          // Trouver le service par son nom
          const service = await prisma.service.findFirst({
            where: { name: serviceName },
            include: {
              stockLinks: {
                include: {
                  stock: true
                }
              }
            }
          });

          if (service && service.stockLinks) {
            for (const link of service.stockLinks) {
              // Vérifier qu'il y a assez de stock
              if (link.stock.quantity >= link.quantityPerUse) {
                // Déduire la quantité
                await prisma.stock.update({
                  where: { id: link.stockId },
                  data: {
                    quantity: {
                      decrement: link.quantityPerUse
                    }
                  }
                });

                // Enregistrer le mouvement dans l'historique
                await prisma.stockMovement.create({
                  data: {
                    stockId: link.stockId,
                    type: 'OUT',
                    quantity: -link.quantityPerUse,
                    reason: `Utilisation pour prestation: ${serviceName}`,
                    reservationId: reservationId
                  }
                });

                console.log(`📦 Stock déduit: ${link.stock.name} -${link.quantityPerUse} ${link.stock.unit || 'unités'} (Service: ${serviceName})`);
              } else {
                console.warn(`⚠️ Stock insuffisant pour ${link.stock.name}: ${link.stock.quantity} < ${link.quantityPerUse}`);
              }
            }
          }
        }
      } catch (stockError) {
        console.error('Erreur lors de la déduction du stock:', stockError);
        // On ne bloque pas la mise à jour de la réservation si la déduction échoue
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = { 
      status,
      updatedAt: new Date()
    };

    // Ajouter les données de paiement si elles sont fournies
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    if (paymentAmount !== undefined) {
      updateData.paymentAmount = paymentAmount;
    }
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }
    if (paymentDate) {
      updateData.paymentDate = paymentDate;
    }
    if (paymentNotes !== undefined) {
      updateData.paymentNotes = paymentNotes;
    }

    // Mettre à jour le statut de la réservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: updateData
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

// PUT - Modifier une réservation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const prisma = await getPrismaClient();
    const body = await request.json();
    const { date, time, status, totalPrice, services } = body;

    // Normaliser la date si fournie
    let normalizedDate;
    if (date) {
      normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
    }

    // Vérifier la disponibilité du nouveau créneau (sauf si on annule)
    if (status !== 'cancelled' && normalizedDate && time) {
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          date: normalizedDate,
          time: time,
          status: {
            in: ['confirmed', 'pending']
          },
          NOT: {
            id: id // Exclure la réservation actuelle
          }
        }
      });

      if (existingReservation) {
        return NextResponse.json(
          { error: `Ce créneau est déjà réservé. Veuillez choisir un autre horaire.` },
          { status: 409 }
        );
      }
    }

    // Mettre à jour la réservation
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        ...(normalizedDate && { date: normalizedDate }),
        ...(time && { time }),
        ...(status && { status }),
        ...(totalPrice !== undefined && { totalPrice }),
        ...(services && { services: JSON.stringify(services) })
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
      id: updatedReservation.id,
      userId: updatedReservation.userId,
      userName: updatedReservation.user.name,
      userEmail: updatedReservation.user.email,
      phone: updatedReservation.user.phone,
      services: JSON.parse(updatedReservation.services),
      date: updatedReservation.date.toISOString(),
      time: updatedReservation.time,
      totalPrice: updatedReservation.totalPrice,
      status: updatedReservation.status,
      notes: updatedReservation.notes,
      createdAt: updatedReservation.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une réservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const prisma = await getPrismaClient();
    await prisma.reservation.delete({
      where: { id }
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