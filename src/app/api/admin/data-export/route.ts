import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { Parser } from '@json2csv/plainjs';
import AdmZip from 'adm-zip';
import { log } from '@/lib/logger';

/**
 * POST /api/admin/data-export
 * Exporte les données de l'organisation au format CSV/ZIP
 * Conformité RGPD Article 20 (Droit à la portabilité des données)
 */
export async function POST(request: NextRequest) {
  // 🔒 Vérification Admin obligatoire
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId || !decoded.organizationId) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier que l'utilisateur a un rôle admin
  const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN'];
  if (!allowedRoles.includes(decoded.role)) {
    return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { dataTypes = [] } = body;

    if (!Array.isArray(dataTypes) || dataTypes.length === 0) {
      return NextResponse.json({ error: 'Aucun type de données sélectionné' }, { status: 400 });
    }

    const prisma = await getPrismaClient();
    const organizationId = decoded.organizationId;

    // Créer un fichier ZIP
    const zip = new AdmZip();
    let totalRecords = 0;

    // Exporter chaque type de données
    for (const type of dataTypes) {
      let data: any[] = [];
      let filename = '';

      try {
        switch (type) {
          case 'clients':
            data = await prisma.user.findMany({
              where: { organizationId, role: 'CLIENT' },
              select: {
                name: true,
                email: true,
                phone: true,
                role: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                emailVerified: true,
                lastLoginAt: true,
                // Données CRM
                loyaltyPoints: true,
                totalSpent: true,
                birthDate: true,
                lastVisit: true,
                skinType: true,
                allergies: true,
                medicalNotes: true,
                preferences: true,
                adminNotes: true,
                // RGPD
                deletionRequestedAt: true,
                scheduledDeletionAt: true
              }
            });
            // Formater les dates
            data = data.map(client => ({
              ...client,
              createdAt: client.createdAt?.toISOString(),
              updatedAt: client.updatedAt?.toISOString(),
              emailVerified: client.emailVerified?.toISOString(),
              lastLoginAt: client.lastLoginAt?.toISOString(),
              birthDate: client.birthDate?.toISOString(),
              lastVisit: client.lastVisit?.toISOString(),
              deletionRequestedAt: client.deletionRequestedAt?.toISOString(),
              scheduledDeletionAt: client.scheduledDeletionAt?.toISOString()
            }));
            filename = 'clients.csv';
            break;

          case 'services':
            data = await prisma.service.findMany({
              where: { organizationId },
              select: {
                slug: true,
                name: true,
                shortDescription: true,
                description: true,
                metaTitle: true,
                metaDescription: true,
                keywords: true,
                price: true,
                launchPrice: true,
                promoPrice: true,
                forfaitPrice: true,
                forfaitPromo: true,
                duration: true,
                benefits: true,
                process: true,
                protocol: true,
                recommendations: true,
                contraindications: true,
                mainImage: true,
                imageSettings: true,
                gallery: true,
                videoUrl: true,
                canBeOption: true,
                category: true,
                categoryId: true,
                subcategoryId: true,
                active: true,
                featured: true,
                order: true,
                templateSourceId: true,
                isCustomized: true,
                createdAt: true,
                updatedAt: true
              }
            });
            // Formater les dates et JSON
            data = data.map(service => ({
              ...service,
              createdAt: service.createdAt?.toISOString(),
              updatedAt: service.updatedAt?.toISOString(),
              benefits: service.benefits || '',
              process: service.process || '',
              protocol: service.protocol || '',
              imageSettings: service.imageSettings || '',
              gallery: service.gallery || ''
            }));
            filename = 'services.csv';
            break;

          case 'products':
            data = await prisma.product.findMany({
              where: { organizationId },
              select: {
                slug: true,
                name: true,
                description: true,
                shortDescription: true,
                metaTitle: true,
                metaDescription: true,
                keywords: true,
                price: true,
                salePrice: true,
                category: true,
                categoryId: true,
                brand: true,
                mainImage: true,
                imageSettings: true,
                gallery: true,
                ingredients: true,
                usage: true,
                benefits: true,
                active: true,
                featured: true,
                order: true,
                templateSourceId: true,
                isCustomized: true,
                createdAt: true,
                updatedAt: true
              }
            });
            // Formater les dates et JSON
            data = data.map(product => ({
              ...product,
              createdAt: product.createdAt?.toISOString(),
              updatedAt: product.updatedAt?.toISOString(),
              imageSettings: product.imageSettings || '',
              gallery: product.gallery || ''
            }));
            filename = 'produits.csv';
            break;

          case 'appointments':
            const appointments = await prisma.reservation.findMany({
              where: { organizationId },
              select: {
                date: true,
                time: true,
                status: true,
                totalPrice: true,
                notes: true,
                source: true,
                services: true,
                packages: true,
                isSubscription: true,
                paymentStatus: true,
                paymentDate: true,
                paymentAmount: true,
                paymentMethod: true,
                stripePaymentId: true,
                invoiceNumber: true,
                reviewEmailSent: true,
                createdAt: true,
                updatedAt: true,
                user: {
                  select: { email: true, name: true, phone: true }
                },
                staff: {
                  select: { name: true, email: true }
                },
                service: {
                  select: { name: true }
                },
                location: {
                  select: { name: true }
                }
              }
            });
            // Aplatir les données
            data = appointments.map(appt => ({
              date: appt.date?.toISOString(),
              time: appt.time,
              clientEmail: appt.user?.email,
              clientName: appt.user?.name,
              clientPhone: appt.user?.phone,
              staffName: appt.staff?.name,
              staffEmail: appt.staff?.email,
              locationName: appt.location?.name,
              serviceName: appt.service?.name,
              services: appt.services,
              packages: appt.packages,
              isSubscription: appt.isSubscription,
              status: appt.status,
              totalPrice: appt.totalPrice,
              source: appt.source,
              paymentStatus: appt.paymentStatus,
              paymentDate: appt.paymentDate?.toISOString(),
              paymentAmount: appt.paymentAmount,
              paymentMethod: appt.paymentMethod,
              stripePaymentId: appt.stripePaymentId,
              invoiceNumber: appt.invoiceNumber,
              reviewEmailSent: appt.reviewEmailSent,
              notes: appt.notes,
              createdAt: appt.createdAt?.toISOString(),
              updatedAt: appt.updatedAt?.toISOString()
            }));
            filename = 'rendez-vous.csv';
            break;

          case 'formations':
            data = await prisma.formation.findMany({
              where: { organizationId },
              select: {
                slug: true,
                name: true,
                shortDescription: true,
                description: true,
                metaTitle: true,
                metaDescription: true,
                keywords: true,
                price: true,
                promoPrice: true,
                duration: true,
                level: true,
                program: true,
                objectives: true,
                prerequisites: true,
                certification: true,
                maxParticipants: true,
                mainImage: true,
                imageSettings: true,
                gallery: true,
                videoUrl: true,
                category: true,
                instructor: true,
                active: true,
                featured: true,
                order: true,
                templateSourceId: true,
                isCustomized: true,
                createdAt: true,
                updatedAt: true
              }
            });
            // Formater les dates et JSON
            data = data.map(formation => ({
              ...formation,
              createdAt: formation.createdAt?.toISOString(),
              updatedAt: formation.updatedAt?.toISOString(),
              program: formation.program || '',
              objectives: formation.objectives || '',
              gallery: formation.gallery || '',
              imageSettings: formation.imageSettings || ''
            }));
            filename = 'formations.csv';
            break;

          case 'giftcards':
            const giftcards = await prisma.giftCard.findMany({
              where: { organizationId },
              select: {
                code: true,
                amount: true,
                initialAmount: true,
                balance: true,
                purchaseDate: true,
                expiryDate: true,
                usedDate: true,
                status: true,
                purchasedFor: true,
                recipientEmail: true,
                recipientPhone: true,
                message: true,
                notes: true,
                paymentMethod: true,
                paymentStatus: true,
                createdAt: true,
                updatedAt: true,
                purchaser: {
                  select: { email: true, name: true, phone: true }
                }
              }
            });
            data = giftcards.map(gc => ({
              code: gc.code,
              amount: gc.amount,
              initialAmount: gc.initialAmount,
              balance: gc.balance,
              purchaseDate: gc.purchaseDate?.toISOString(),
              expiryDate: gc.expiryDate?.toISOString(),
              usedDate: gc.usedDate?.toISOString(),
              buyerEmail: gc.purchaser?.email,
              buyerName: gc.purchaser?.name,
              buyerPhone: gc.purchaser?.phone,
              recipientName: gc.purchasedFor,
              recipientEmail: gc.recipientEmail,
              recipientPhone: gc.recipientPhone,
              message: gc.message,
              status: gc.status,
              paymentMethod: gc.paymentMethod,
              paymentStatus: gc.paymentStatus,
              notes: gc.notes,
              createdAt: gc.createdAt?.toISOString(),
              updatedAt: gc.updatedAt?.toISOString()
            }));
            filename = 'cartes-cadeaux.csv';
            break;

          case 'packages':
            data = await prisma.package.findMany({
              where: { organizationId },
              select: {
                name: true,
                description: true,
                price: true,
                services: true,
                validDays: true,
                maxUses: true,
                active: true,
                createdAt: true,
                updatedAt: true
              }
            });
            // Convertir le tableau services en string et formater les dates
            data = data.map(pkg => ({
              ...pkg,
              services: typeof pkg.services === 'string' ? pkg.services : JSON.stringify(pkg.services),
              createdAt: pkg.createdAt?.toISOString(),
              updatedAt: pkg.updatedAt?.toISOString()
            }));
            filename = 'forfaits.csv';
            break;

          case 'promocodes':
            data = await prisma.promoCode.findMany({
              where: { organizationId },
              select: {
                code: true,
                type: true,
                discount: true,
                validFrom: true,
                validUntil: true,
                maxUses: true,
                usedCount: true,
                userId: true,
                conditions: true,
                active: true,
                createdAt: true,
                updatedAt: true
              }
            });
            // Convertir les dates et conditions
            data = data.map(promo => ({
              ...promo,
              validFrom: promo.validFrom?.toISOString(),
              validUntil: promo.validUntil?.toISOString(),
              maxUses: promo.maxUses === null ? 'unlimited' : promo.maxUses,
              conditions: promo.conditions || '',
              createdAt: promo.createdAt?.toISOString(),
              updatedAt: promo.updatedAt?.toISOString()
            }));
            filename = 'codes-promo.csv';
            break;

          case 'reviews':
            const reviews = await prisma.review.findMany({
              where: { organizationId },
              select: {
                rating: true,
                comment: true,
                satisfaction: true,
                response: true,
                approved: true,
                featured: true,
                source: true,
                serviceName: true,
                itemName: true,
                itemType: true,
                createdAt: true,
                user: {
                  select: { name: true, email: true }
                }
              }
            });
            data = reviews.map(r => ({
              clientName: r.user?.name || 'Anonyme',
              clientEmail: r.user?.email,
              rating: r.rating,
              satisfaction: r.satisfaction,
              comment: r.comment,
              serviceName: r.serviceName || r.itemName,
              itemType: r.itemType,
              date: r.createdAt?.toISOString(),
              approved: r.approved,
              featured: r.featured,
              source: r.source,
              response: r.response
            }));
            filename = 'avis-clients.csv';
            break;

          case 'newsletter':
            data = await prisma.newsletterSubscriber.findMany({
              select: {
                email: true,
                name: true,
                isActive: true,
                subscribedAt: true,
                unsubscribedAt: true,
                createdAt: true
              }
            });
            // Convertir les dates
            data = data.map(sub => ({
              email: sub.email,
              name: sub.name || '',
              status: sub.isActive ? 'active' : 'inactive',
              subscribedAt: sub.subscribedAt?.toISOString(),
              unsubscribedAt: sub.unsubscribedAt?.toISOString(),
              createdAt: sub.createdAt?.toISOString()
            }));
            filename = 'newsletter.csv';
            break;

          default:
            log.warn(`Type de données non reconnu pour l'export: ${type}`);
            continue;
        }

        // Convertir en CSV
        if (data.length > 0) {
          const parser = new Parser();
          const csv = parser.parse(data);
          zip.addFile(filename, Buffer.from(csv, 'utf-8'));
          totalRecords += data.length;
          log.info(`Export ${type}: ${data.length} enregistrements`);
        } else {
          log.warn(`Aucune donnée à exporter pour: ${type}`);
        }
      } catch (error: any) {
        log.error(`Erreur export ${type}:`, error);
        // Continuer avec les autres types même si un échoue
      }
    }

    // Ajouter un fichier README
    const readme = `
Export de données LAIA Connect
================================

Date d'export : ${new Date().toLocaleString('fr-FR')}
Organisation : ${organizationId}
Nombre total d'enregistrements : ${totalRecords}

Fichiers inclus :
${dataTypes.map(t => `- ${t}.csv`).join('\n')}

Format : CSV (UTF-8)
Séparateur : virgule (,)
Encodage : UTF-8

Ces données peuvent être importées dans un autre logiciel de gestion.

CONFORMITÉ RGPD
================
Cet export est réalisé conformément à l'Article 20 du RGPD
(Droit à la portabilité des données).

Vos données vous appartiennent et peuvent être transférées
vers un autre logiciel à tout moment.

Pour toute question : support@laia-connect.com

---
LAIA Connect - https://laia-connect.com
    `.trim();

    zip.addFile('README.txt', Buffer.from(readme, 'utf-8'));

    // Logger l'export dans les audits
    try {
      await prisma.auditLog.create({
        data: {
          action: 'DATA_EXPORT',
          targetType: 'ORGANIZATION',
          targetId: decoded.organizationId,
          userId: decoded.userId,
          organizationId: decoded.organizationId,
          metadata: {
            dataTypes,
            totalRecords,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (auditError) {
      log.error('Erreur création audit log:', auditError);
      // Ne pas bloquer l'export si l'audit échoue
    }

    // Retourner le ZIP
    const zipBuffer = zip.toBuffer();

    log.info(`Export terminé pour ${organizationId}: ${totalRecords} enregistrements`);

    // Convert Buffer to Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=export-laia-${Date.now()}.zip`,
        'Content-Length': zipBuffer.length.toString()
      }
    });

  } catch (error: any) {
    log.error('Erreur lors de l\'export de données:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export', details: error.message },
      { status: 500 }
    );
  }
}
