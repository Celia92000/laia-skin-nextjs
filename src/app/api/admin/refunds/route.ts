import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'
import Stripe from 'stripe'
import { createConnectedRefund } from '@/lib/stripe-connect-helper'
import { sendRefundConfirmationEmail } from '@/lib/payment-emails'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY manquant dans .env.local')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
})

/**
 * GET /api/admin/refunds
 * Récupère la liste des remboursements de l'organisation
 */
export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer l'utilisateur avec son organizationId
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        organizationId: true
      }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Récupérer les remboursements de l'organisation
    const refunds = await prisma.refund.findMany({
      where: {
        organizationId: user.organizationId
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            amount: true
          }
        },
        reservation: {
          select: {
            id: true,
            date: true,
            time: true,
            totalPrice: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculer les statistiques
    const stats = {
      total: refunds.length,
      pending: refunds.filter(r => r.status === 'PENDING').length,
      approved: refunds.filter(r => r.status === 'APPROVED').length,
      completed: refunds.filter(r => r.status === 'COMPLETED').length,
      rejected: refunds.filter(r => r.status === 'REJECTED').length,
      failed: refunds.filter(r => r.status === 'FAILED').length,
      totalAmount: refunds.reduce((sum, r) => sum + r.amount, 0),
      completedAmount: refunds.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.amount, 0)
    }

    return NextResponse.json({
      refunds,
      stats
    })

  } catch (error) {
    log.error('Erreur récupération remboursements:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/refunds
 * Crée une demande de remboursement
 */
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        organizationId: true
      }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Seuls les admins peuvent créer des remboursements
    if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 })
    }

    // Récupérer les paramètres
    const body = await request.json()
    const { invoiceId, reservationId, amount, reason, notes } = body

    // Validation: soit invoiceId soit reservationId (pas les deux)
    if ((!invoiceId && !reservationId) || (invoiceId && reservationId)) {
      return NextResponse.json(
        { error: 'Fournir soit invoiceId soit reservationId' },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      )
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Raison du remboursement requise' },
        { status: 400 }
      )
    }

    let stripePaymentId: string | null = null
    let refundType: 'invoice' | 'reservation'

    // Cas 1: Remboursement de facture (LAIA Connect)
    if (invoiceId) {
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          organizationId: user.organizationId
        }
      })

      if (!invoice) {
        return NextResponse.json(
          { error: 'Facture non trouvée' },
          { status: 404 }
        )
      }

      if (invoice.status !== 'PAID') {
        return NextResponse.json(
          { error: 'La facture doit être payée pour être remboursée' },
          { status: 400 }
        )
      }

      if (!invoice.stripePaymentIntentId) {
        return NextResponse.json(
          { error: 'ID de paiement Stripe introuvable' },
          { status: 400 }
        )
      }

      if (amount > invoice.amount) {
        return NextResponse.json(
          { error: 'Le montant du remboursement ne peut pas dépasser le montant de la facture' },
          { status: 400 }
        )
      }

      stripePaymentId = invoice.stripePaymentIntentId
      refundType = 'invoice'
    }

    // Cas 2: Remboursement de réservation (Institut)
    if (reservationId) {
      const reservation = await prisma.reservation.findFirst({
        where: {
          id: reservationId,
          organizationId: user.organizationId
        }
      })

      if (!reservation) {
        return NextResponse.json(
          { error: 'Réservation non trouvée' },
          { status: 404 }
        )
      }

      if (reservation.paymentStatus !== 'paid') {
        return NextResponse.json(
          { error: 'La réservation doit être payée pour être remboursée' },
          { status: 400 }
        )
      }

      if (!reservation.stripePaymentId) {
        return NextResponse.json(
          { error: 'ID de paiement Stripe introuvable' },
          { status: 400 }
        )
      }

      if (amount > reservation.totalPrice) {
        return NextResponse.json(
          { error: 'Le montant du remboursement ne peut pas dépasser le montant de la réservation' },
          { status: 400 }
        )
      }

      stripePaymentId = reservation.stripePaymentId
      refundType = 'reservation'
    }

    try {
      let stripeRefund: Stripe.Refund | { refundId: string; amount: number; status: string }

      // Créer le remboursement Stripe
      if (refundType === 'invoice') {
        // Remboursement direct (LAIA Connect)
        stripeRefund = await stripe.refunds.create({
          payment_intent: stripePaymentId!,
          amount: Math.round(amount * 100), // Convertir en centimes
          reason: 'requested_by_customer',
          metadata: {
            organizationId: user.organizationId,
            invoiceId: invoiceId || '',
            requestedBy: user.id
          }
        })
      } else {
        // Remboursement via Stripe Connect (Institut)
        stripeRefund = await createConnectedRefund({
          organizationId: user.organizationId,
          paymentIntentId: stripePaymentId!,
          amount: amount,
          reason: 'requested_by_customer'
        })
      }

      // Créer l'enregistrement de remboursement
      const refund = await prisma.refund.create({
        data: {
          organizationId: user.organizationId,
          invoiceId: invoiceId || null,
          reservationId: reservationId || null,
          amount: amount,
          reason: reason,
          status: 'COMPLETED', // Le remboursement Stripe est immédiat
          stripeRefundId: 'id' in stripeRefund ? stripeRefund.id : stripeRefund.refundId,
          requestedBy: user.id,
          approvedBy: user.id, // Auto-approuvé car admin
          processedAt: new Date(),
          notes: notes || null
        },
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              amount: true
            }
          },
          reservation: {
            select: {
              id: true,
              date: true,
              totalPrice: true
            }
          }
        }
      })

      // Mettre à jour le statut de la facture ou réservation
      if (invoiceId) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'REFUNDED' }
        })
      }

      if (reservationId) {
        await prisma.reservation.update({
          where: { id: reservationId },
          data: {
            status: 'refunded',
            paymentStatus: 'refunded'
          }
        })
      }

      log.info(`💸 Remboursement créé: ${refund.id} - ${amount}€ (${refundType})`)

      // Envoyer l'email de confirmation
      try {
        const org = await prisma.organization.findUnique({
          where: { id: user.organizationId },
          select: { name: true, ownerEmail: true }
        })

        let customerEmail: string | null = null
        let customerName: string | undefined

        if (refundType === 'invoice') {
          // Pour les factures LAIA Connect, envoyer à l'owner de l'organisation
          customerEmail = org?.ownerEmail || null
        } else if (refundType === 'reservation') {
          // Pour les réservations, envoyer au client
          const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId! },
            include: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          })
          customerEmail = reservation?.user?.email || null
          customerName = reservation?.user?.firstName
            ? `${reservation.user.firstName} ${reservation.user.lastName || ''}`
            : undefined
        }

        if (customerEmail) {
          await sendRefundConfirmationEmail({
            to: customerEmail,
            organizationName: org?.name,
            customerName: customerName,
            amount: amount,
            refundType: refundType,
            invoiceNumber: refund.invoice?.invoiceNumber,
            reservationDate: refund.reservation?.date,
            reason: reason
          })
          log.info(`📧 Email de remboursement envoyé à ${customerEmail}`)
        }
      } catch (emailError) {
        log.error('⚠️ Erreur envoi email remboursement:', emailError)
        // Ne pas bloquer la requête si l'email échoue
      }

      return NextResponse.json({
        success: true,
        refund
      })

    } catch (stripeError: unknown) {
      log.error('Erreur Stripe lors du remboursement:', stripeError)

      // Créer l'enregistrement même en cas d'échec Stripe
      const failedRefund = await prisma.refund.create({
        data: {
          organizationId: user.organizationId,
          invoiceId: invoiceId || null,
          reservationId: reservationId || null,
          amount: amount,
          reason: reason,
          status: 'FAILED',
          requestedBy: user.id,
          notes: notes ? `${notes}\n\nErreur Stripe: ${(stripeError as Error).message}` : `Erreur Stripe: ${(stripeError as Error).message}`
        }
      })

      return NextResponse.json(
        {
          error: 'Échec du remboursement Stripe',
          refund: failedRefund
        },
        { status: 500 }
      )
    }

  } catch (error) {
    log.error('Erreur création remboursement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
