import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    // Vérifier l'authentification
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Paramètres de pagination et filtres
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status'); // paid, pending, failed
    const organizationId = searchParams.get('organizationId');

    // Initialiser Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({
        error: 'Stripe non configuré'
      }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Récupérer les paiements depuis Stripe
    const payments = await stripe.paymentIntents.list({
      limit: limit || 50,
    });

    // Récupérer les factures depuis la base de données
    const invoicesWhere: any = {};
    if (status) {
      invoicesWhere.status = status.toUpperCase();
    }
    if (organizationId) {
      invoicesWhere.organizationId = organizationId;
    }

    const invoices = await prisma.invoice.findMany({
      where: invoicesWhere,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Combiner les données Stripe et DB
    const paymentsData = payments.data.map((payment) => {
      const invoice = invoices.find(inv => inv.stripeInvoiceId === payment.id);

      return {
        id: payment.id,
        amount: payment.amount / 100, // Convertir de centimes en euros
        currency: payment.currency.toUpperCase(),
        status: payment.status,
        created: new Date(payment.created * 1000),
        description: payment.description,
        customerEmail: payment.receipt_email,
        metadata: payment.metadata,
        invoice: invoice ? {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          organization: invoice.organization,
          paidAt: invoice.paidAt,
        } : null,
      };
    });

    // Calculer les statistiques
    const totalRevenue = paymentsData
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0);

    const thisMonthRevenue = paymentsData
      .filter(p => {
        const paymentDate = new Date(p.created);
        const now = new Date();
        return p.status === 'succeeded' &&
          paymentDate.getMonth() === now.getMonth() &&
          paymentDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const stats = {
      total: paymentsData.length,
      succeeded: paymentsData.filter(p => p.status === 'succeeded').length,
      pending: paymentsData.filter(p => p.status === 'processing' || p.status === 'requires_payment_method').length,
      failed: paymentsData.filter(p => p.status === 'failed').length,
      totalRevenue,
      thisMonthRevenue,
    };

    return NextResponse.json({
      payments: paymentsData,
      stats,
    });

  } catch (error: any) {
    console.error('Erreur récupération paiements Stripe:', error);
    return NextResponse.json({
      error: error.message || 'Erreur lors de la récupération des paiements',
    }, { status: 500 });
  }
}
