import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import jsPDF from 'jspdf';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const token = request.cookies.get('token')?.value ||
                 request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { organizationId: true, role: true, name: true }
    });

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const body = await request.json();
    const { metrics, period, format } = body;

    // Calculer les dates selon la période
    const now = new Date();
    let startDate = new Date();
    let periodLabel = '';

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        periodLabel = '7 derniers jours';
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        periodLabel = '30 derniers jours';
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        periodLabel = '90 derniers jours';
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        periodLabel = '1 an';
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        periodLabel = '30 derniers jours';
    }

    const orgFilter = { user: { organizationId: user.organizationId } };
    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    };

    // Récupérer les données selon les métriques sélectionnées
    const data: any = {};

    if (metrics.includes('revenue')) {
      const revenue = await prisma.reservation.findMany({
        where: {
          ...orgFilter,
          status: 'CONFIRMED',
          ...dateFilter
        },
        include: { service: true }
      });
      data.revenue = revenue.reduce((sum, r) => sum + (r.service?.price || r.totalPrice || 0), 0);
    }

    if (metrics.includes('clients_count')) {
      data.clientsCount = await prisma.user.count({
        where: {
          organizationId: user.organizationId,
          role: 'CLIENT'
        }
      });
    }

    if (metrics.includes('new_clients')) {
      data.newClients = await prisma.user.count({
        where: {
          organizationId: user.organizationId,
          role: 'CLIENT',
          ...dateFilter
        }
      });
    }

    if (metrics.includes('appointments')) {
      data.appointments = await prisma.reservation.count({
        where: {
          ...orgFilter,
          ...dateFilter
        }
      });
    }

    if (metrics.includes('completed_appointments')) {
      data.completedAppointments = await prisma.reservation.count({
        where: {
          ...orgFilter,
          status: 'CONFIRMED',
          ...dateFilter
        }
      });
    }

    if (metrics.includes('avg_ticket')) {
      const reservations = await prisma.reservation.findMany({
        where: {
          ...orgFilter,
          status: 'CONFIRMED',
          ...dateFilter
        },
        include: { service: true }
      });
      const total = reservations.reduce((sum, r) => sum + (r.service?.price || r.totalPrice || 0), 0);
      data.avgTicket = reservations.length > 0 ? total / reservations.length : 0;
    }

    if (metrics.includes('products_sold')) {
      // TODO: Implémenter quand le système de produits sera prêt
      data.productsSold = 0;
    }

    if (metrics.includes('top_services')) {
      const services = await (prisma.reservation.groupBy as any)({
        by: ['serviceId'],
        where: {
          user: { organizationId: user.organizationId },
          createdAt: {
            gte: startDate,
            lte: now
          },
          serviceId: { not: null }
        },
        _count: {
          _all: true
        }
      });

      const topServices = await Promise.all(
        services.slice(0, 5).map(async (s) => {
          const service = await prisma.service.findUnique({
            where: { id: s.serviceId! }
          });
          return {
            name: service?.name || 'N/A',
            count: s._count._all
          };
        })
      );
      data.topServices = topServices;
    }

    if (metrics.includes('client_retention')) {
      const totalClients = await prisma.user.count({
        where: {
          organizationId: user.organizationId,
          role: 'CLIENT',
          createdAt: { lt: startDate }
        }
      });

      const returningClients = await prisma.user.count({
        where: {
          organizationId: user.organizationId,
          role: 'CLIENT',
          createdAt: { lt: startDate },
          reservations: {
            some: {
              createdAt: dateFilter.createdAt
            }
          }
        }
      });

      data.clientRetention = totalClients > 0 ? (returningClients / totalClients) * 100 : 0;
    }

    if (metrics.includes('conversion_rate')) {
      // TODO: Implémenter un système de leads pour calculer le taux de conversion
      data.conversionRate = 0;
    }

    // Générer le PDF
    if (format === 'pdf') {
      const doc = new jsPDF();

      // En-tête
      doc.setFontSize(20);
      doc.setTextColor(126, 58, 237); // Purple
      doc.text('Rapport d\'activité', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(periodLabel, 105, 28, { align: 'center' });
      doc.text(`Généré le ${now.toLocaleDateString('fr-FR')}`, 105, 35, { align: 'center' });

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 40, 190, 40);

      let y = 50;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);

      // Afficher les métriques
      if (data.revenue !== undefined) {
        doc.setFont('helvetica', 'bold');
        doc.text('Revenus totaux', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(34, 197, 94); // Green
        doc.text(`${data.revenue.toFixed(2)} €`, 190, y, { align: 'right' });
        y += 10;
        doc.setTextColor(0, 0, 0);
      }

      if (data.clientsCount !== undefined) {
        doc.setFont('helvetica', 'bold');
        doc.text('Nombre de clients', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(data.clientsCount), 190, y, { align: 'right' });
        y += 10;
      }

      if (data.newClients !== undefined) {
        doc.setFont('helvetica', 'bold');
        doc.text('Nouveaux clients', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(59, 130, 246); // Blue
        doc.text(String(data.newClients), 190, y, { align: 'right' });
        y += 10;
        doc.setTextColor(0, 0, 0);
      }

      if (data.appointments !== undefined) {
        doc.setFont('helvetica', 'bold');
        doc.text('Rendez-vous', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(data.appointments), 190, y, { align: 'right' });
        y += 10;
      }

      if (data.completedAppointments !== undefined) {
        doc.setFont('helvetica', 'bold');
        doc.text('RDV complétés', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(data.completedAppointments), 190, y, { align: 'right' });
        y += 10;
      }

      if (data.avgTicket !== undefined) {
        doc.setFont('helvetica', 'bold');
        doc.text('Panier moyen', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${data.avgTicket.toFixed(2)} €`, 190, y, { align: 'right' });
        y += 10;
      }

      if (data.topServices && data.topServices.length > 0) {
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Services les plus populaires', 20, y);
        y += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        data.topServices.forEach((service: any, index: number) => {
          doc.text(`${index + 1}. ${service.name}`, 25, y);
          doc.text(`${service.count} réservations`, 190, y, { align: 'right' });
          y += 7;
        });
      }

      if (data.clientRetention !== undefined) {
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Taux de rétention', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${data.clientRetention.toFixed(1)}%`, 190, y, { align: 'right' });
        y += 10;
      }

      // Pied de page
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Généré par LAIA Skin Institut', 105, pageHeight - 10, { align: 'center' });

      // Générer le buffer PDF
      const pdfBuffer = doc.output('arraybuffer');

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="rapport-${now.toISOString().split('T')[0]}.pdf"`
        }
      });
    }

    // Si format preview, retourner les données JSON
    return NextResponse.json(data);

  } catch (error) {
    log.error('Erreur lors de la génération du rapport:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    );
  }
}
