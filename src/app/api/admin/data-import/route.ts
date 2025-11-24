import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * POST /api/admin/data-import
 * Importe des données depuis un fichier CSV/Excel
 */
export async function POST(request: NextRequest) {
  // 🔒 Vérification Admin obligatoire
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Vérifier que l'utilisateur a un rôle admin
  const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN'];
  if (!allowedRoles.includes(decoded.role)) {
    return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    if (!['clients', 'services', 'products', 'appointments', 'formations', 'giftcards', 'packages', 'promocodes', 'reviews', 'newsletter'].includes(type)) {
      return NextResponse.json({ error: 'Type d\'import invalide' }, { status: 400 });
    }

    // Lire le contenu du fichier
    const fileContent = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();

    let rows: any[] = [];

    if (ext === 'csv') {
      // Parser CSV (simple, peut être amélioré avec une lib comme papaparse)
      rows = parseCSV(fileContent);
    } else {
      return NextResponse.json({
        error: 'Format non supporté pour le moment. Utilisez CSV uniquement.'
      }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Fichier vide' }, { status: 400 });
    }

    // Importer selon le type
    let result;
    switch (type) {
      case 'clients':
        result = await importClients(rows, decoded.organizationId);
        break;
      case 'services':
        result = await importServices(rows, decoded.organizationId);
        break;
      case 'products':
        result = await importProducts(rows, decoded.organizationId);
        break;
      case 'appointments':
        result = await importAppointments(rows, decoded.organizationId, decoded.userId);
        break;
      case 'formations':
        result = await importFormations(rows, decoded.organizationId);
        break;
      case 'giftcards':
        result = await importGiftCards(rows, decoded.organizationId);
        break;
      case 'packages':
        result = await importPackages(rows, decoded.organizationId);
        break;
      case 'promocodes':
        result = await importPromoCodes(rows, decoded.organizationId);
        break;
      case 'reviews':
        result = await importReviews(rows, decoded.organizationId);
        break;
      case 'newsletter':
        result = await importNewsletterSubscribers(rows, decoded.organizationId);
        break;
      default:
        return NextResponse.json({ error: 'Type non implémenté' }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    log.error('Erreur import données:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'import', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Parser CSV simple
 */
function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Import clients
 * Colonnes attendues : firstName, lastName, email, phone, address, city, zipCode, notes
 */
async function importClients(rows: any[], organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error('Organization ID manquant');
  }

  const prisma = await getPrismaClient();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const {
        name, email, phone,
        loyaltyPoints, totalSpent,
        birthDate, skinType, allergies,
        medicalNotes, preferences, adminNotes
      } = row;

      // Validation basique
      if (!email || !email.includes('@')) {
        errors.push(`Email invalide : ${email}`);
        failed++;
        continue;
      }

      // Vérifier si le client existe déjà
      const existing = await prisma.user.findFirst({
        where: {
          email,
          organizationId,
          role: 'CLIENT'
        }
      });

      if (existing) {
        errors.push(`Client existe déjà : ${email}`);
        failed++;
        continue;
      }

      // Créer le client
      await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0], // Utiliser le nom ou extraire de l'email
          phone: phone || null,
          role: 'CLIENT',
          organizationId,
          password: '', // Pas de mot de passe, devra être défini par le client
          // Données CRM
          loyaltyPoints: loyaltyPoints ? parseInt(loyaltyPoints) : 0,
          totalSpent: totalSpent ? parseFloat(totalSpent) : 0,
          birthDate: birthDate ? new Date(birthDate) : null,
          skinType: skinType || null,
          allergies: allergies || null,
          medicalNotes: medicalNotes || null,
          preferences: preferences || null,
          adminNotes: adminNotes || null
        }
      });

      imported++;
    } catch (error: any) {
      failed++;
      errors.push(`Erreur ligne ${imported + failed}: ${error.message}`);
      log.error('Erreur import client:', error);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.slice(0, 100) // Limiter à 100 erreurs
  };
}

/**
 * Import services
 * Colonnes attendues : name, description, duration, price, category, active
 */
async function importServices(rows: any[], organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error('Organization ID manquant');
  }

  const prisma = await getPrismaClient();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { name, description, duration, price, category, active } = row;

      if (!name) {
        errors.push('Nom du service manquant');
        failed++;
        continue;
      }

      // Vérifier si le service existe déjà
      const existing = await prisma.service.findFirst({
        where: {
          name,
          organizationId
        }
      });

      if (existing) {
        errors.push(`Service existe déjà : ${name}`);
        failed++;
        continue;
      }

      await prisma.service.create({
        data: {
          name,
          description: description || '',
          duration: parseInt(duration) || 60,
          price: parseFloat(price) || 0,
          category: category || 'Général',
          organizationId,
          active: active === 'true' || active === '1' || active === 'oui',
        }
      });

      imported++;
    } catch (error: any) {
      failed++;
      errors.push(`Erreur service "${row.name}": ${error.message}`);
      log.error('Erreur import service:', error);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.slice(0, 100)
  };
}

/**
 * Import produits
 * Colonnes attendues : name, description, price, stock, supplier, reference, active
 */
async function importProducts(rows: any[], organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error('Organization ID manquant');
  }

  const prisma = await getPrismaClient();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { name, description, price, salePrice, category, brand, featured } = row;

      if (!name) {
        errors.push('Nom du produit manquant');
        failed++;
        continue;
      }

      // Vérifier si le produit existe déjà
      const existing = await prisma.product.findFirst({
        where: {
          name,
          organizationId
        }
      });

      if (existing) {
        errors.push(`Produit existe déjà : ${name}`);
        failed++;
        continue;
      }

      await prisma.product.create({
        data: {
          name,
          description: description || '',
          price: parseFloat(price) || 0,
          salePrice: salePrice ? parseFloat(salePrice) : null,
          category: category || null,
          brand: brand || null,
          featured: featured === 'true' || featured === '1' || featured === 'oui',
          organizationId,
        }
      });

      imported++;
    } catch (error: any) {
      failed++;
      errors.push(`Erreur produit "${row.name}": ${error.message}`);
      log.error('Erreur import produit:', error);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.slice(0, 100)
  };
}

/**
 * Import rendez-vous (historique)
 * Colonnes attendues : clientEmail, serviceName, date, time, status, notes
 */
async function importAppointments(
  rows: any[],
  organizationId: string | null | undefined,
  userId: string
) {
  if (!organizationId) {
    throw new Error('Organization ID manquant');
  }

  const prisma = await getPrismaClient();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { clientEmail, serviceName, date, time, status, notes } = row;

      if (!clientEmail || !serviceName || !date) {
        errors.push('Données manquantes (email, service ou date)');
        failed++;
        continue;
      }

      // Trouver le client
      const client = await prisma.user.findFirst({
        where: {
          email: clientEmail,
          organizationId,
          role: 'CLIENT'
        }
      });

      if (!client) {
        errors.push(`Client non trouvé : ${clientEmail}`);
        failed++;
        continue;
      }

      // Trouver le service
      const service = await prisma.service.findFirst({
        where: {
          name: serviceName,
          organizationId
        }
      });

      if (!service) {
        errors.push(`Service non trouvé : ${serviceName}`);
        failed++;
        continue;
      }

      // Parser la date
      const appointmentDate = new Date(date);
      if (isNaN(appointmentDate.getTime())) {
        errors.push(`Date invalide : ${date}`);
        failed++;
        continue;
      }

      await prisma.reservation.create({
        data: {
          userId: client.id,
          serviceId: service.id,
          organizationId,
          date: appointmentDate,
          status: status || 'completed',
          totalPrice: service.price,
          notes: notes || null,
        }
      });

      imported++;
    } catch (error: any) {
      failed++;
      errors.push(`Erreur rendez-vous: ${error.message}`);
      log.error('Erreur import rendez-vous:', error);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.slice(0, 100)
  };
}

/**
 * Import formations
 * Colonnes attendues : name, description, price, duration, level, maxParticipants, certification, prerequisites, active
 */
async function importFormations(rows: any[], organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error('Organization ID manquant');
  }

  const prisma = await getPrismaClient();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { name, description, price, duration, level, maxParticipants, certification, prerequisites, active } = row;

      if (!name) {
        errors.push('Nom de la formation manquant');
        failed++;
        continue;
      }

      // Vérifier si la formation existe déjà
      const existing = await prisma.formation.findFirst({
        where: {
          name,
          organizationId
        }
      });

      if (existing) {
        errors.push(`Formation existe déjà : ${name}`);
        failed++;
        continue;
      }

      // Générer un slug unique
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      await prisma.formation.create({
        data: {
          name,
          slug: `${slug}-${Date.now()}`,
          description: description || '',
          shortDescription: description?.substring(0, 150) || '',
          price: parseFloat(price) || 0,
          duration: parseInt(duration) || 8, // Durée en heures
          level: level || 'Débutant',
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          certification: certification || null,
          prerequisites: prerequisites || null,
          organizationId,
          active: active === 'true' || active === '1' || active === 'oui',
        }
      });

      imported++;
    } catch (error: any) {
      failed++;
      errors.push(`Erreur formation "${row.name}": ${error.message}`);
      log.error('Erreur import formation:', error);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.slice(0, 100)
  };
}

/**
 * Import cartes cadeaux
 * Colonnes attendues : code, initialAmount, remainingAmount, purchaseDate, expirationDate, buyerEmail, recipientName, recipientEmail, status, notes
 */
async function importGiftCards(rows: any[], organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error('Organization ID manquant');
  }

  const prisma = await getPrismaClient();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { code, initialAmount, remainingAmount, purchaseDate, expirationDate, buyerEmail, recipientName, recipientEmail, status, notes } = row;

      if (!code || !initialAmount) {
        errors.push('Code et montant initial obligatoires');
        failed++;
        continue;
      }

      // Vérifier si la carte cadeau existe déjà
      const existing = await prisma.giftCard.findFirst({
        where: {
          code,
          organizationId
        }
      });

      if (existing) {
        errors.push(`Carte cadeau existe déjà : ${code}`);
        failed++;
        continue;
      }

      // Trouver l'acheteur si email fourni
      let buyerId = null;
      if (buyerEmail) {
        const buyer = await prisma.user.findFirst({
          where: {
            email: buyerEmail,
            organizationId
          }
        });
        buyerId = buyer?.id || null;
      }

      await prisma.giftCard.create({
        data: {
          code,
          amount: parseFloat(initialAmount) || 0,
          initialAmount: parseFloat(initialAmount) || 0,
          balance: parseFloat(remainingAmount) || parseFloat(initialAmount) || 0,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          expiryDate: expirationDate ? new Date(expirationDate) : null,
          purchasedBy: buyerId,
          purchasedFor: recipientName || null,
          recipientEmail: recipientEmail || null,
          status: status || 'active',
          notes: notes || null,
          organizationId,
        }
      });

      imported++;
    } catch (error: any) {
      failed++;
      errors.push(`Erreur carte cadeau "${row.code}": ${error.message}`);
      log.error('Erreur import carte cadeau:', error);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.slice(0, 100)
  };
}

/**
 * Import forfaits/packages
 * Colonnes attendues : name, description, price, services, sessionsCount, validityDays, active
 */
async function importPackages(rows: any[], organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error('Organization ID manquant');
  }

  const prisma = await getPrismaClient();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { name, description, price, services, maxUses, validDays, active } = row;

      if (!name || !price) {
        errors.push('Nom et prix obligatoires');
        failed++;
        continue;
      }

      // Vérifier si le forfait existe déjà
      const existing = await prisma.package.findFirst({
        where: {
          name,
          organizationId
        }
      });

      if (existing) {
        errors.push(`Forfait existe déjà : ${name}`);
        failed++;
        continue;
      }

      // Parser les services (séparés par ;) - convert to JSON string
      const servicesList = services ? services.split(';').map((s: string) => s.trim()) : [];

      await prisma.package.create({
        data: {
          name,
          description: description || '',
          price: parseFloat(price) || 0,
          services: JSON.stringify(servicesList), // Store as JSON string
          maxUses: maxUses ? parseInt(maxUses) : null,
          validDays: parseInt(validDays) || 90,
          organizationId,
          active: active === 'true' || active === '1' || active === 'oui',
        }
      });

      imported++;
    } catch (error: any) {
      failed++;
      errors.push(`Erreur forfait "${row.name}": ${error.message}`);
      log.error('Erreur import forfait:', error);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.slice(0, 100)
  };
}

/**
 * Import codes promo
 * Colonnes attendues : code, type, value, startDate, endDate, maxUses, currentUses, minPurchase, services, active
 */
async function importPromoCodes(rows: any[], organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error('Organization ID manquant');
  }

  const prisma = await getPrismaClient();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { code, type, value, startDate, endDate, maxUses, currentUses, minPurchase, services, active } = row;

      if (!code || !type || !value) {
        errors.push('Code, type et valeur obligatoires');
        failed++;
        continue;
      }

      // Vérifier si le code promo existe déjà
      const existing = await prisma.promoCode.findFirst({
        where: {
          code,
          organizationId
        }
      });

      if (existing) {
        errors.push(`Code promo existe déjà : ${code}`);
        failed++;
        continue;
      }

      // Parser les services applicables (séparés par ;)
      const servicesList = services ? services.split(';').map((s: string) => s.trim()) : [];

      await prisma.promoCode.create({
        data: {
          code,
          type: type === 'percentage' ? 'percentage' : 'fixed',
          value: parseFloat(value) || 0,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          maxUses: maxUses === 'unlimited' ? null : parseInt(maxUses) || null,
          currentUses: parseInt(currentUses) || 0,
          minPurchase: parseFloat(minPurchase) || 0,
          applicableServices: servicesList,
          organizationId,
          active: active === 'true' || active === '1' || active === 'oui',
        }
      });

      imported++;
    } catch (error: any) {
      failed++;
      errors.push(`Erreur code promo "${row.code}": ${error.message}`);
      log.error('Erreur import code promo:', error);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.slice(0, 100)
  };
}

/**
 * Import avis clients
 * Colonnes attendues : clientName, clientEmail, rating, comment, date, service, validated, published, response
 */
async function importReviews(rows: any[], organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error('Organization ID manquant');
  }

  const prisma = await getPrismaClient();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { clientName, clientEmail, rating, comment, date, service, validated, published, response } = row;

      if (!clientName || !rating || !comment) {
        errors.push('Nom client, note et commentaire obligatoires');
        failed++;
        continue;
      }

      // Validation de la note
      const ratingValue = parseInt(rating);
      if (ratingValue < 1 || ratingValue > 5) {
        errors.push(`Note invalide pour ${clientName}: doit être entre 1 et 5`);
        failed++;
        continue;
      }

      // Trouver le client si email fourni
      let userId = null;
      if (clientEmail) {
        const user = await prisma.user.findFirst({
          where: {
            email: clientEmail,
            organizationId
          }
        });
        userId = user?.id || null;
      }

      // Trouver le service si fourni
      let serviceId = null;
      if (service) {
        const serviceRecord = await prisma.service.findFirst({
          where: {
            name: service,
            organizationId
          }
        });
        serviceId = serviceRecord?.id || null;
      }

      await prisma.review.create({
        data: {
          userId,
          serviceId,
          organizationId,
          clientName,
          rating: ratingValue,
          comment,
          date: date ? new Date(date) : new Date(),
          validated: validated === 'true' || validated === '1' || validated === 'oui',
          published: published === 'true' || published === '1' || published === 'oui',
          response: response || null,
        }
      });

      imported++;
    } catch (error: any) {
      failed++;
      errors.push(`Erreur avis "${row.clientName}": ${error.message}`);
      log.error('Erreur import avis:', error);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.slice(0, 100)
  };
}

/**
 * Import abonnés newsletter
 * Colonnes attendues : email, firstName, lastName, subscriptionDate, source, status, tags, phone
 */
async function importNewsletterSubscribers(rows: any[], organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error('Organization ID manquant');
  }

  const prisma = await getPrismaClient();
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const { email, firstName, lastName, subscriptionDate, source, status, tags, phone } = row;

      if (!email || !email.includes('@')) {
        errors.push(`Email invalide : ${email}`);
        failed++;
        continue;
      }

      // Vérifier si l'abonné existe déjà
      const existing = await prisma.newsletterSubscriber.findFirst({
        where: {
          email,
          organizationId
        }
      });

      if (existing) {
        errors.push(`Abonné existe déjà : ${email}`);
        failed++;
        continue;
      }

      // Parser les tags (séparés par ;)
      const tagsList = tags ? tags.split(';').map((t: string) => t.trim()) : [];

      await prisma.newsletterSubscriber.create({
        data: {
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          subscriptionDate: subscriptionDate ? new Date(subscriptionDate) : new Date(),
          source: source || 'import',
          status: status === 'unsubscribed' ? 'unsubscribed' : 'active',
          tags: tagsList,
          phone: phone || null,
          organizationId,
        }
      });

      imported++;
    } catch (error: any) {
      failed++;
      errors.push(`Erreur abonné "${row.email}": ${error.message}`);
      log.error('Erreur import abonné newsletter:', error);
    }
  }

  return {
    success: failed === 0,
    imported,
    failed,
    errors: errors.slice(0, 100)
  };
}
