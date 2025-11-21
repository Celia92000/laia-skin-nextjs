import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

interface SearchFilter {
  type: string;
  field: string;
  operator: string;
  value: any;
}

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    // 🔒 AUTHENTIFICATION OBLIGATOIRE
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    // Note: Il faudrait importer verifyToken ou jwt.verify ici
    // Pour l'instant, on suppose que le token est valide si présent

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const decoded: any = { userId: 'temp' }; // TODO: Remplacer par verifyToken(token)
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true, role: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const filterParam = searchParams.get('filters');

    let filters: SearchFilter[] = [];
    if (filterParam) {
      try {
        filters = JSON.parse(filterParam);
      } catch (e) {
        log.error('Erreur parsing filters:', e);
      }
    }

    const results: any[] = [];

    // Recherche globale si query présent
    if (query) {
      // 🔒 Recherche dans les clients DE CETTE ORGANISATION
      const clients = await prisma.user.findMany({
        where: {
          organizationId: user.organizationId ?? undefined,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } }
          ],
          AND: [
            {
              OR: [
                { role: 'CLIENT' },
                { role: 'CLIENT' }
              ]
            }
          ]
        },
        take: 10
      });

      clients.forEach(client => {
        results.push({
          type: 'client',
          id: client.id,
          title: client.name,
          subtitle: `${client.email} • ${client.loyaltyPoints || 0} points`,
          metadata: {
            phone: client.phone,
            lastVisit: client.lastVisit,
            totalSpent: client.totalSpent
          }
        });
      });

      // 🔒 Recherche dans les réservations DE CETTE ORGANISATION
      const reservations = await prisma.reservation.findMany({
        where: {
          organizationId: user.organizationId ?? undefined,
          OR: [
            { services: { contains: query, mode: 'insensitive' } },
            { user: { name: { contains: query, mode: 'insensitive' } } },
            { notes: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: { user: true },
        take: 10
      });

      reservations.forEach(reservation => {
        let services = [];
        if (typeof reservation.services === 'string') {
          try {
            services = JSON.parse(reservation.services);
          } catch {
            services = [reservation.services];
          }
        } else if (Array.isArray(reservation.services)) {
          services = reservation.services;
        }

        results.push({
          type: 'reservation',
          id: reservation.id,
          title: reservation.user?.name || 'Client anonyme',
          subtitle: `${new Date(reservation.date).toLocaleDateString('fr-FR')} ${reservation.time} • ${reservation.totalPrice}€`,
          metadata: {
            services: services.join(', ') || 'Aucun service',
            status: reservation.status,
            paymentStatus: reservation.paymentStatus
          }
        });
      });

      // 🔒 Recherche dans les services DE CETTE ORGANISATION
      const services = await prisma.service.findMany({
        where: {
          organizationId: user.organizationId ?? undefined,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      });

      services.forEach(service => {
        results.push({
          type: 'service',
          id: service.id,
          title: service.name,
          subtitle: `${service.category} • ${service.price}€`,
          metadata: {
            duration: service.duration,
            category: service.category
          }
        });
      });

      // 🔒 Recherche dans les produits DE CETTE ORGANISATION
      const products = await prisma.product.findMany({
        where: {
          organizationId: user.organizationId ?? undefined,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      });

      products.forEach(product => {
        results.push({
          type: 'product',
          id: product.id,
          title: product.name,
          subtitle: `${product.brand || 'Sans marque'} • ${product.price}€`,
          metadata: {
            category: product.category || 'Général'
          }
        });
      });
    }

    // Application des filtres avancés
    if (filters && filters.length > 0) {
      for (const filter of filters) {
        let filteredResults: any[] = [];

        switch (filter.type) {
          case 'clients':
            const clientWhere = buildWhereClause(filter);
            const filteredClients = await prisma.user.findMany({
              where: {
                organizationId: user.organizationId ?? undefined,
                ...clientWhere,
                OR: [
                  { role: 'CLIENT' },
                  { role: 'CLIENT' }
                ]
              },
              take: 20
            });

            filteredClients.forEach(client => {
              filteredResults.push({
                type: 'client',
                id: client.id,
                title: client.name,
                subtitle: `${client.email} • ${client.loyaltyPoints || 0} points`,
                metadata: {
                  phone: client.phone,
                  totalSpent: client.totalSpent
                }
              });
            });
            break;

          case 'reservations':
            const reservationWhere = buildWhereClause(filter);
            const filteredReservations = await prisma.reservation.findMany({
              where: {
                organizationId: user.organizationId ?? undefined,
                ...reservationWhere
              },
              include: { user: true },
              take: 20
            });

            filteredReservations.forEach(reservation => {
              let services = [];
              if (typeof reservation.services === 'string') {
                try {
                  services = JSON.parse(reservation.services);
                } catch {
                  services = [reservation.services];
                }
              } else if (Array.isArray(reservation.services)) {
                services = reservation.services;
              }

              filteredResults.push({
                type: 'reservation',
                id: reservation.id,
                title: reservation.user?.name || 'Client anonyme',
                subtitle: `${new Date(reservation.date).toLocaleDateString('fr-FR')} ${reservation.time} • ${reservation.totalPrice}€`,
                metadata: {
                  services: services.join(', ') || 'Aucun service',
                  status: reservation.status,
                  paymentStatus: reservation.paymentStatus
                }
              });
            });
            break;

          case 'services':
            const serviceWhere = buildWhereClause(filter);
            const filteredServices = await prisma.service.findMany({
              where: {
                organizationId: user.organizationId ?? undefined,
                ...serviceWhere
              },
              take: 20
            });

            filteredServices.forEach(service => {
              filteredResults.push({
                type: 'service',
                id: service.id,
                title: service.name,
                subtitle: `${service.category} • ${service.price}€`,
                metadata: {
                  duration: service.duration
                }
              });
            });
            break;

          case 'products':
            const productWhere = buildWhereClause(filter);
            const filteredProducts = await prisma.product.findMany({
              where: {
                organizationId: user.organizationId ?? undefined,
                ...productWhere
              },
              take: 20
            });

            filteredProducts.forEach(product => {
              filteredResults.push({
                type: 'product',
                id: product.id,
                title: product.name,
                subtitle: `${product.brand || 'Sans marque'} • ${product.price}€`,
                metadata: {
                  category: product.category
                }
              });
            });
            break;
        }

        // Fusionner avec les résultats existants
        if (!query) {
          results.push(...filteredResults);
        } else {
          // Filtrer les résultats existants
          const filteredIds = new Set(filteredResults.map(r => r.id));
          results.filter(r => filteredIds.has(r.id));
        }
      }
    }

    // Dédupliquer et limiter les résultats
    const uniqueResults = Array.from(
      new Map(results.map(r => [`${r.type}-${r.id}`, r])).values()
    ).slice(0, 50);

    return NextResponse.json({ results: uniqueResults });
  } catch (error) {
    log.error('Erreur de recherche:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    // 🔒 AUTHENTIFICATION OBLIGATOIRE
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    // Note: Utiliser verifyToken ici (TODO: importer verifyToken)
    const decoded: any = { userId: 'temp' }; // TODO: Remplacer par verifyToken(token)

    // 🔒 Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true, role: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { query, filters } = await request.json();
    const results: any[] = [];

    // Recherche globale si query présent
    if (query) {
      // 🔒 Recherche dans les clients DE CETTE ORGANISATION
      const clients = await prisma.user.findMany({
        where: {
          organizationId: user.organizationId ?? undefined,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } }
          ],
          AND: [
            {
              OR: [
                { role: 'CLIENT' },
                { role: 'CLIENT' }
              ]
            }
          ]
        },
        take: 10
      });

      clients.forEach(client => {
        results.push({
          type: 'client',
          id: client.id,
          title: client.name,
          subtitle: `${client.email} • ${client.loyaltyPoints || 0} points`,
          metadata: {
            phone: client.phone,
            lastVisit: client.lastVisit,
            totalSpent: client.totalSpent
          }
        });
      });

      // 🔒 Recherche dans les réservations DE CETTE ORGANISATION
      const reservations = await prisma.reservation.findMany({
        where: {
          organizationId: user.organizationId ?? undefined,
          OR: [
            { services: { contains: query, mode: 'insensitive' } },
            { user: { name: { contains: query, mode: 'insensitive' } } },
            { notes: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: { user: true },
        take: 10
      });

      reservations.forEach(reservation => {
        let services = [];
        // Gérer différents formats de stockage des services
        if (typeof reservation.services === 'string') {
          try {
            services = JSON.parse(reservation.services);
          } catch {
            services = [reservation.services];
          }
        } else if (Array.isArray(reservation.services)) {
          services = reservation.services;
        }
        
        results.push({
          type: 'reservation',
          id: reservation.id,
          title: reservation.user?.name || 'Client anonyme',
          subtitle: `${new Date(reservation.date).toLocaleDateString('fr-FR')} ${reservation.time} • ${reservation.totalPrice}€`,
          metadata: {
            services: services.join(', ') || 'Aucun service',
            status: reservation.status,
            paymentStatus: reservation.paymentStatus
          }
        });
      });

      // 🔒 Recherche dans les services DE CETTE ORGANISATION
      const services = await prisma.service.findMany({
        where: {
          organizationId: user.organizationId ?? undefined,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      });

      services.forEach(service => {
        results.push({
          type: 'service',
          id: service.id,
          title: service.name,
          subtitle: `${service.category} • ${service.price}€`,
          metadata: {
            duration: service.duration,
            category: service.category
          }
        });
      });

      // 🔒 Recherche dans les produits DE CETTE ORGANISATION
      const products = await prisma.product.findMany({
        where: {
          organizationId: user.organizationId ?? undefined,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      });

      products.forEach(product => {
        results.push({
          type: 'product',
          id: product.id,
          title: product.name,
          subtitle: `${product.brand || 'Sans marque'} • ${product.price}€`,
          metadata: {
            category: product.category || 'Général'
          }
        });
      });
    }

    // Application des filtres avancés
    if (filters && filters.length > 0) {
      for (const filter of filters) {
        let filteredResults: any[] = [];

        switch (filter.type) {
          case 'clients':
            const clientWhere = buildWhereClause(filter);
            const filteredClients = await prisma.user.findMany({
              where: {
                organizationId: user.organizationId ?? undefined,
                ...clientWhere,
                OR: [
                  { role: 'CLIENT' },
                  { role: 'CLIENT' }
                ]
              },
              take: 20
            });

            filteredClients.forEach(client => {
              filteredResults.push({
                type: 'client',
                id: client.id,
                title: client.name,
                subtitle: `${client.email} • ${client.loyaltyPoints || 0} points`,
                metadata: {
                  phone: client.phone,
                  totalSpent: client.totalSpent
                }
              });
            });
            break;

          case 'reservations':
            const reservationWhere = buildWhereClause(filter);
            const filteredReservations = await prisma.reservation.findMany({
              where: {
                organizationId: user.organizationId ?? undefined,
                ...reservationWhere
              },
              include: { user: true },
              take: 20
            });

            filteredReservations.forEach(reservation => {
              let services = [];
              // Gérer différents formats de stockage des services
              if (typeof reservation.services === 'string') {
                try {
                  services = JSON.parse(reservation.services);
                } catch {
                  services = [reservation.services];
                }
              } else if (Array.isArray(reservation.services)) {
                services = reservation.services;
              }
              
              filteredResults.push({
                type: 'reservation',
                id: reservation.id,
                title: reservation.user?.name || 'Client anonyme',
                subtitle: `${new Date(reservation.date).toLocaleDateString('fr-FR')} ${reservation.time} • ${reservation.totalPrice}€`,
                metadata: {
                  services: services.join(', ') || 'Aucun service',
                  status: reservation.status,
                  paymentStatus: reservation.paymentStatus
                }
              });
            });
            break;

          case 'services':
            const serviceWhere = buildWhereClause(filter);
            const filteredServices = await prisma.service.findMany({
              where: {
                organizationId: user.organizationId ?? undefined,
                ...serviceWhere
              },
              take: 20
            });

            filteredServices.forEach(service => {
              filteredResults.push({
                type: 'service',
                id: service.id,
                title: service.name,
                subtitle: `${service.category} • ${service.price}€`,
                metadata: {
                  duration: service.duration
                }
              });
            });
            break;

          case 'products':
            const productWhere = buildWhereClause(filter);
            const filteredProducts = await prisma.product.findMany({
              where: {
                organizationId: user.organizationId ?? undefined,
                ...productWhere
              },
              take: 20
            });

            filteredProducts.forEach(product => {
              filteredResults.push({
                type: 'product',
                id: product.id,
                title: product.name,
                subtitle: `${product.brand || 'Sans marque'} • ${product.price}€`,
                metadata: {
                  category: product.category
                }
              });
            });
            break;
        }

        // Fusionner avec les résultats existants
        if (!query) {
          results.push(...filteredResults);
        } else {
          // Filtrer les résultats existants
          const filteredIds = new Set(filteredResults.map(r => r.id));
          results.filter(r => filteredIds.has(r.id));
        }
      }
    }

    // Dédupliquer et limiter les résultats
    const uniqueResults = Array.from(
      new Map(results.map(r => [`${r.type}-${r.id}`, r])).values()
    ).slice(0, 50);

    return NextResponse.json({ results: uniqueResults });
  } catch (error) {
    log.error('Erreur de recherche:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}

function buildWhereClause(filter: SearchFilter): any {
  const { field, operator, value } = filter;
  
  switch (operator) {
    case 'contains':
      return { [field]: { contains: value, mode: 'insensitive' } };
    
    case 'equals':
      return { [field]: value };
    
    case 'starts':
      return { [field]: { startsWith: value, mode: 'insensitive' } };
    
    case 'ends':
      return { [field]: { endsWith: value, mode: 'insensitive' } };
    
    case 'greater':
      return { [field]: { gt: parseFloat(value) } };
    
    case 'less':
      return { [field]: { lt: parseFloat(value) } };
    
    case 'between':
      const [min, max] = value.split(',').map((v: string) => v.trim());
      return { [field]: { gte: parseFloat(min), lte: parseFloat(max) } };
    
    case 'before':
      return { [field]: { lt: new Date(value) } };
    
    case 'after':
      return { [field]: { gt: new Date(value) } };
    
    case 'not':
      return { NOT: { [field]: value } };
    
    default:
      return { [field]: value };
  }
}