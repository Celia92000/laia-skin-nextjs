import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, startOfDay, endOfDay, startOfWeek, endOfWeek, subMonths, subYears } from 'date-fns';

export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { organizationId: true, role: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    if (!['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT', 'ADMIN', 'admin', 'EMPLOYEE'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Filtre de base pour cette organisation
    const orgFilter = { user: { organizationId: user.organizationId } };

    const searchParams = request.nextUrl.searchParams;
    const viewMode = searchParams.get('viewMode') || 'month';
    const selectedDate = searchParams.get('selectedDate') || new Date().toISOString();
    const selectedMonth = searchParams.get('selectedMonth') || new Date().toISOString().slice(0, 7);
    const selectedYear = searchParams.get('selectedYear') || new Date().getFullYear().toString();

    // Données par défaut
    const defaultStats = {
      totalReservations: 0,
      todayReservations: 0,
      weekReservations: 0,
      monthReservations: 0,
      pendingReservations: 0,
      confirmedReservations: 0,
      cancelledReservations: 0,
      totalRevenue: 0,
      previousRevenue: 0,
      revenueGrowth: 0,
      averageTicket: 0,
      totalClients: 0,
      activeClients: 0,
      newClients: 0,
      averageRating: 0,
      popularServices: [],
      recentReviews: [],
      clientRetentionData: {
        loyalClients: 0,
        newClients: 0,
        returningClients: 0
      },
      reservationsByHour: Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 })),
      reservationTrend: []
    };

    try {
      // Essayer de se connecter à la base de données
      await prisma.$connect();
      
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      
      if (viewMode === 'day') {
        const date = new Date(selectedDate);
        startDate = startOfDay(date);
        endDate = endOfDay(date);
      } else if (viewMode === 'month') {
        const date = new Date(selectedMonth + '-01');
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
      } else {
        const date = new Date(selectedYear + '-01-01');
        startDate = startOfYear(date);
        endDate = endOfYear(date);
      }

      // Calculer les dates pour les comparaisons
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(lastWeekStart.getDate() - 14);
      const lastWeekEnd = new Date(now);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
      
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      // Récupérer toutes les données nécessaires DE CETTE ORGANISATION
      const [
        totalReservations,
        todayReservations,
        yesterdayReservations,
        weekReservations,
        lastWeekReservations,
        monthReservations,
        lastMonthReservations,
        currentReservations
      ] = await Promise.all([
        prisma.reservation.count({ where: orgFilter }).catch(() => 0),
        prisma.reservation.count({
          where: {
            ...orgFilter,
            date: {
              gte: startOfDay(now),
              lte: endOfDay(now)
            }
          }
        }).catch(() => 0),
        prisma.reservation.count({
          where: {
            ...orgFilter,
            date: {
              gte: startOfDay(yesterday),
              lte: endOfDay(yesterday)
            }
          }
        }).catch(() => 0),
        prisma.reservation.count({
          where: {
            ...orgFilter,
            date: {
              gte: startOfWeek(now, { weekStartsOn: 1 }),
              lte: endOfWeek(now, { weekStartsOn: 1 })
            }
          }
        }).catch(() => 0),
        prisma.reservation.count({
          where: {
            ...orgFilter,
            date: {
              gte: lastWeekStart,
              lte: lastWeekEnd
            }
          }
        }).catch(() => 0),
        prisma.reservation.count({
          where: {
            ...orgFilter,
            date: {
              gte: startOfMonth(now),
              lte: endOfMonth(now)
            }
          }
        }).catch(() => 0),
        prisma.reservation.count({
          where: {
            ...orgFilter,
            date: {
              gte: startOfMonth(lastMonth),
              lte: endOfMonth(lastMonth)
            }
          }
        }).catch(() => 0),
        prisma.reservation.findMany({
          where: {
            ...orgFilter,
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            service: true,
            user: true
          }
        }).catch(() => [])
      ]);

      // Récupérer toutes les réservations pour calculer les revenus DE CETTE ORGANISATION
      const [todayRevRes, yesterdayRevRes, weekRevRes, lastWeekRevRes, monthRevRes, lastMonthRevRes, yearRevRes] = await Promise.all([
        prisma.reservation.findMany({
          where: {
            ...orgFilter,
            date: { gte: startOfDay(now), lte: endOfDay(now) },
            status: { in: ['confirmed', 'completed'] }
          },
          include: { service: true }
        }).catch(() => []),
        prisma.reservation.findMany({
          where: {
            ...orgFilter,
            date: { gte: startOfDay(yesterday), lte: endOfDay(yesterday) },
            status: { in: ['confirmed', 'completed'] }
          },
          include: { service: true }
        }).catch(() => []),
        prisma.reservation.findMany({
          where: {
            ...orgFilter,
            date: { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) },
            status: { in: ['confirmed', 'completed'] }
          },
          include: { service: true }
        }).catch(() => []),
        prisma.reservation.findMany({
          where: {
            ...orgFilter,
            date: { gte: lastWeekStart, lte: lastWeekEnd },
            status: { in: ['confirmed', 'completed'] }
          },
          include: { service: true }
        }).catch(() => []),
        prisma.reservation.findMany({
          where: {
            ...orgFilter,
            date: { gte: startOfMonth(now), lte: endOfMonth(now) },
            status: { in: ['confirmed', 'completed'] }
          },
          include: { service: true }
        }).catch(() => []),
        prisma.reservation.findMany({
          where: {
            ...orgFilter,
            date: { gte: startOfMonth(lastMonth), lte: endOfMonth(lastMonth) },
            status: { in: ['confirmed', 'completed'] }
          },
          include: { service: true }
        }).catch(() => []),
        prisma.reservation.findMany({
          where: {
            ...orgFilter,
            date: { gte: startOfYear(now), lte: endOfYear(now) },
            status: { in: ['confirmed', 'completed'] }
          },
          include: { service: true }
        }).catch(() => [])
      ]);

      // Calculer les revenus pour chaque période
      const calcRevenue = (reservations: any[]) => 
        reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
      
      const todayRevenue = calcRevenue(todayRevRes);
      const yesterdayRevenue = calcRevenue(yesterdayRevRes);
      const weekRevenue = calcRevenue(weekRevRes);
      const lastWeekRevenue = calcRevenue(lastWeekRevRes);
      const monthRevenue = calcRevenue(monthRevRes);
      const lastMonthRevenue = calcRevenue(lastMonthRevRes);
      const yearRevenue = calcRevenue(yearRevRes);
      const totalRevenue = currentReservations.reduce((sum, r) => {
        const price = r.service?.price || r.totalPrice || 0;
        return sum + (typeof price === 'number' ? price : parseFloat(price) || 0);
      }, 0);

      // Ajouter les revenus des cartes cadeaux et commandes DE CETTE ORGANISATION
      const paidGiftCards = await prisma.giftCard.findMany({
        where: {
          organizationId: user.organizationId,
          paymentStatus: 'paid',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }).catch(() => []);

      const paidOrders = await prisma.order.findMany({
        where: {
          organizationId: user.organizationId,
          paymentStatus: 'paid',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }).catch(() => []);

      // Récupérer aussi les commandes en attente DE CETTE ORGANISATION
      const pendingGiftCards = await prisma.giftCard.findMany({
        where: {
          organizationId: user.organizationId,
          paymentStatus: 'pending',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }).catch(() => []);

      const pendingOrders = await prisma.order.findMany({
        where: {
          organizationId: user.organizationId,
          paymentStatus: 'pending',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }).catch(() => []);

      // Séparer produits et formations (payés)
      const productOrders = paidOrders.filter(o => o.orderType === 'product');
      const formationOrders = paidOrders.filter(o => o.orderType === 'formation');

      // Séparer produits et formations (en attente)
      const pendingProductOrders = pendingOrders.filter(o => o.orderType === 'product');
      const pendingFormationOrders = pendingOrders.filter(o => o.orderType === 'formation');

      // Compteurs
      const giftCardsPaidCount = paidGiftCards.length;
      const giftCardsPendingCount = pendingGiftCards.length;
      const productsPaidCount = productOrders.length;
      const productsPendingCount = pendingProductOrders.length;
      const formationsPaidCount = formationOrders.length;
      const formationsPendingCount = pendingFormationOrders.length;

      // Revenus
      const giftCardsRevenue = paidGiftCards.reduce((sum, gc) => sum + gc.amount, 0);
      const giftCardsPendingRevenue = pendingGiftCards.reduce((sum, gc) => sum + gc.amount, 0);
      const productsRevenue = productOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const productsPendingRevenue = pendingProductOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const formationsRevenue = formationOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const formationsPendingRevenue = pendingFormationOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const ordersRevenue = productsRevenue + formationsRevenue;

      // Détail des prestations de service par service
      const serviceRevenueDetail: Record<string, number> = {};
      currentReservations.forEach(r => {
        try {
          const services = typeof r.services === 'string' ? JSON.parse(r.services) : r.services;
          if (Array.isArray(services)) {
            services.forEach(serviceName => {
              if (!serviceRevenueDetail[serviceName]) {
                serviceRevenueDetail[serviceName] = 0;
              }
              serviceRevenueDetail[serviceName] += (r.totalPrice || 0) / services.length;
            });
          }
        } catch (e) {
          // Si erreur de parsing, ignorer
        }
      });

      const totalRevenueWithOrders = totalRevenue + giftCardsRevenue + ordersRevenue;

      const confirmedReservations = currentReservations.filter(r => r.status === 'confirmed').length;
      const pendingReservations = currentReservations.filter(r => r.status === 'pending').length;
      const cancelledReservations = currentReservations.filter(r => r.status === 'cancelled').length;

      // Récupérer les vraies notes clients DE CETTE ORGANISATION
      const reviews = await prisma.review.findMany({
        where: {
          organizationId: user.organizationId,
          approved: true
        },
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }).catch(() => []);

      // Calculer les statistiques de satisfaction
      const satisfactionStats = {
        total: reviews.length,
        average: reviews.length > 0 
          ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
          : 0,
        distribution: {
          '5': reviews.filter(r => r.rating === 5).length,
          '4': reviews.filter(r => r.rating === 4).length,
          '3': reviews.filter(r => r.rating === 3).length,
          '2': reviews.filter(r => r.rating === 2).length,
          '1': reviews.filter(r => r.rating === 1).length,
        },
        recentFeedback: reviews.slice(0, 5).map(r => ({
          clientName: r.user?.name || 'Anonyme',
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt,
          service: r.serviceName || 'Service'
        }))
      };

      // Calculer les revenus par service DE CETTE ORGANISATION
      const services = await prisma.service.findMany({
        where: { organizationId: user.organizationId }
      }).catch(() => []);
      const serviceRevenue: Record<string, { count: number; revenue: number }> = {};
      
      // Initialiser avec tous les services
      services.forEach(s => {
        serviceRevenue[s.name] = { count: 0, revenue: 0 };
      });
      
      // Calculer les revenus réels
      currentReservations.forEach(r => {
        const serviceName = r.service?.name || 'Service inconnu';
        if (!serviceRevenue[serviceName]) {
          serviceRevenue[serviceName] = { count: 0, revenue: 0 };
        }
        serviceRevenue[serviceName].count += 1;
        serviceRevenue[serviceName].revenue += r.totalPrice || 0;
      });

      const popularServices = Object.entries(serviceRevenue)
        .map(([name, data]) => ({ 
          name, 
          count: data.count,
          revenue: data.revenue 
        }))
        .sort((a, b) => b.revenue - a.revenue);
      
      // Calculer le total des revenus des services pour les pourcentages
      const totalServiceRevenue = popularServices.reduce((sum, s) => sum + s.revenue, 0);
      
      const revenueByService = popularServices.map(s => ({
        service: s.name,
        revenue: s.revenue,
        percentage: totalServiceRevenue > 0 ? Math.round((s.revenue / totalServiceRevenue) * 100) : 0
      }));
      
      // Calculer les revenus par mois pour 2025 DE CETTE ORGANISATION
      const monthlyRevenue = [];
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(2025, month, 1);
        const monthEnd = new Date(2025, month + 1, 0);

        const monthRes = await prisma.reservation.findMany({
          where: {
            ...orgFilter,
            date: { gte: monthStart, lte: monthEnd },
            status: { in: ['confirmed', 'completed'] }
          }
        }).catch(() => []);

        const monthTotal = monthRes.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
        monthlyRevenue.push({
          month: months[month],
          revenue: monthTotal,
          year: 2025
        });
      }

      // Réservations par heure
      const reservationsByHour = Array(24).fill(0).map((_, hour) => {
        const count = currentReservations.filter(r => {
          const resHour = parseInt(r.time?.split(':')[0] || '0');
          return resHour === hour;
        }).length;
        return { hour, count };
      });

      // Calculer les statistiques des rendez-vous
      const nextWeekStart = new Date(now);
      nextWeekStart.setDate(now.getDate() + 1);
      const nextWeekEnd = new Date(now);
      nextWeekEnd.setDate(now.getDate() + 7);
      
      const [nextWeekReservations, noShowReservations, lastMinuteReservations] = await Promise.all([
        // Réservations de la semaine prochaine DE CETTE ORGANISATION
        prisma.reservation.count({
          where: {
            ...orgFilter,
            date: {
              gte: nextWeekStart,
              lte: nextWeekEnd
            },
            status: { in: ['pending', 'confirmed'] }
          }
        }).catch(() => 0),

        // No-shows (réservations confirmées dans le passé mais marquées comme cancelled) DE CETTE ORGANISATION
        prisma.reservation.count({
          where: {
            ...orgFilter,
            date: { lt: now },
            status: 'cancelled'
          }
        }).catch(() => 0),

        // Réservations de dernière minute (créées moins de 24h avant) DE CETTE ORGANISATION
        prisma.reservation.count({
          where: {
            ...orgFilter,
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
            }
          }
        }).catch(() => 0)
      ]);
      
      // Calculer le taux d'occupation (basé sur 8h de travail par jour, 6 jours par semaine)
      const slotsPerWeek = 8 * 6 * 4; // 8h x 6 jours x 4 créneaux par heure = 192 créneaux
      const occupancyRate = Math.round((weekReservations / slotsPerWeek) * 100);
      
      // Calculer les vraies statistiques de produits et formations
      const productItemsMap: Record<string, { quantity: number; revenue: number }> = {};
      const formationItemsMap: Record<string, { quantity: number; revenue: number }> = {};

      productOrders.forEach(order => {
        try {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              const name = item.name || item.title || 'Produit';
              if (!productItemsMap[name]) {
                productItemsMap[name] = { quantity: 0, revenue: 0 };
              }
              const price = item.price || 0;
              const quantity = item.quantity || 1;
              productItemsMap[name].quantity += quantity;
              productItemsMap[name].revenue += price * quantity;
            });
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      });

      formationOrders.forEach(order => {
        try {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              const name = item.name || item.title || 'Formation';
              if (!formationItemsMap[name]) {
                formationItemsMap[name] = { quantity: 0, revenue: 0 };
              }
              const price = item.price || 0;
              const quantity = item.quantity || 1;
              formationItemsMap[name].quantity += quantity;
              formationItemsMap[name].revenue += price * quantity;
            });
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      });

      const topProducts = Object.entries(productItemsMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const topFormations = Object.entries(formationItemsMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const productStats = {
        totalSold: Object.values(productItemsMap).reduce((sum, p) => sum + p.quantity, 0),
        revenue: productsRevenue,
        topProducts,
        stockAlert: 0 // À implémenter si vous avez un système de stock
      };

      const formationStats = {
        totalSold: Object.values(formationItemsMap).reduce((sum, f) => sum + f.quantity, 0),
        revenue: formationsRevenue,
        topFormations
      };
      
      // Calculer les statistiques de fidélisation DE CETTE ORGANISATION
      const users = await prisma.user.findMany({
        where: {
          organizationId: user.organizationId,
          role: 'CLIENT'
        },
        include: {
          reservations: true
        }
      }).catch(() => []);
      
      const loyalClients = users.filter(u => u.reservations && u.reservations.length >= 2).length;
      const newClientsCount = users.filter(u => {
        const createdDate = new Date(u.createdAt);
        return createdDate >= startOfMonth(now);
      }).length;
      
      const avgVisitsPerClient = users.length > 0 
        ? Math.round(totalReservations / users.length * 10) / 10
        : 0;
      
      const clientRetention = {
        rate: users.length > 0 ? Math.round((loyalClients / users.length) * 100) : 0,
        newClients: newClientsCount,
        lostClients: users.filter(u => {
          const lastReservation = u.reservations?.sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          if (!lastReservation) return false;
          const daysSinceLastVisit = Math.floor(
            (now.getTime() - new Date(lastReservation.date).getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSinceLastVisit > 60; // Client perdu si pas de visite depuis 60 jours
        }).length,
        averageVisitsPerClient: avgVisitsPerClient,
        timeBetweenVisits: 30 // Moyenne de 30 jours entre les visites
      };
      
      // Calculer les statistiques de marketing
      const marketingPerformance = {
        emailOpenRate: 35, // Exemple: 35% d'ouverture
        emailClickRate: 12, // Exemple: 12% de clics
        whatsappReadRate: 85, // Exemple: 85% de lecture
        whatsappResponseRate: 45, // Exemple: 45% de réponses
        campaignConversion: 8 // Exemple: 8% de conversion
      };
      
      return NextResponse.json({
        totalReservations,
        todayReservations,
        yesterdayReservations,
        weekReservations,
        lastWeekReservations,
        monthReservations,
        lastMonthReservations,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        totalRevenue: totalRevenueWithOrders,
        todayRevenue,
        yesterdayRevenue,
        weekRevenue,
        lastWeekRevenue,
        monthRevenue,
        lastMonthRevenue,
        yearRevenue,
        previousRevenue: lastMonthRevenue,
        revenueGrowth: lastMonthRevenue > 0 ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0,
        averageTicket: confirmedReservations > 0 ? Math.round(totalRevenueWithOrders / confirmedReservations) : 0,
        giftCardsRevenue,
        ordersRevenue,
        productsRevenue,
        formationsRevenue,
        reservationsRevenue: totalRevenue,
        serviceRevenueDetail: Object.entries(serviceRevenueDetail).map(([name, revenue]) => ({
          service: name,
          revenue: Math.round(revenue * 100) / 100
        })),
        revenueBreakdown: {
          prestations: totalRevenue,
          cartesCadeaux: giftCardsRevenue,
          produits: productsRevenue,
          formations: formationsRevenue,
          total: totalRevenueWithOrders
        },
        ordersStats: {
          giftCards: {
            paid: { count: giftCardsPaidCount, revenue: giftCardsRevenue },
            pending: { count: giftCardsPendingCount, revenue: giftCardsPendingRevenue },
            total: { count: giftCardsPaidCount + giftCardsPendingCount, revenue: giftCardsRevenue + giftCardsPendingRevenue }
          },
          products: {
            paid: { count: productsPaidCount, revenue: productsRevenue },
            pending: { count: productsPendingCount, revenue: productsPendingRevenue },
            total: { count: productsPaidCount + productsPendingCount, revenue: productsRevenue + productsPendingRevenue }
          },
          formations: {
            paid: { count: formationsPaidCount, revenue: formationsRevenue },
            pending: { count: formationsPendingCount, revenue: formationsPendingRevenue },
            total: { count: formationsPaidCount + formationsPendingCount, revenue: formationsRevenue + formationsPendingRevenue }
          },
          prestations: {
            confirmed: { count: confirmedReservations, revenue: totalRevenue },
            pending: { count: pendingReservations, revenue: 0 },
            total: { count: confirmedReservations + pendingReservations, revenue: totalRevenue }
          }
        },
        appointments: {
          nextWeek: nextWeekReservations,
          occupancyRate,
          noShow: noShowReservations,
          lastMinuteBookings: lastMinuteReservations,
          averageDuration: 60,
          peakHours: reservationsByHour.filter(h => h.count > 0).map(h => ({
            hour: `${h.hour}h`,
            bookings: h.count
          }))
        },
        products: productStats,
        formations: formationStats,
        totalClients: 0,
        activeClients: 0,
        newClients: 0,
        averageRating: satisfactionStats.average,
        googleRating: 4.8, // Note Google simulée
        googleReviewsCount: 12, // Nombre d'avis Google simulé
        popularServices,
        revenueByService,
        revenueByMonth: monthlyRevenue,
        recentReviews: satisfactionStats.recentFeedback,
        satisfaction: satisfactionStats,
        clientRetention,
        marketingPerformance,
        clientRetentionData: {
          loyalClients,
          newClients: newClientsCount,
          returningClients: loyalClients
        },
        reservationsByHour,
        reservationTrend: []
      });

    } catch (dbError) {
      console.warn('Base de données non accessible, utilisation des données par défaut');
      return NextResponse.json(defaultStats);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }

  } catch (error) {
    console.error('Erreur dans la route statistiques:', error);
    return NextResponse.json({
      totalReservations: 0,
      todayReservations: 0,
      weekReservations: 0,
      monthReservations: 0,
      pendingReservations: 0,
      confirmedReservations: 0,
      cancelledReservations: 0,
      totalRevenue: 0,
      previousRevenue: 0,
      revenueGrowth: 0,
      averageTicket: 0,
      totalClients: 0,
      activeClients: 0,
      newClients: 0,
      averageRating: 0,
      popularServices: [],
      recentReviews: [],
      clientRetentionData: {
        loyalClients: 0,
        newClients: 0,
        returningClients: 0
      },
      reservationsByHour: Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 })),
      reservationTrend: []
    });
  }
}